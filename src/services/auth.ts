import { getSupabaseClient } from '../lib/supabase';

const ADMIN_AUTH_KEY = 'preppulse_admin_auth';
const ADMIN_ACCOUNTS_KEY = 'preppulse_admin_accounts';

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: 'ADMINISTRATOR';
  created_at: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'ADMINISTRATOR';
  loggedInAt: string;
}

function getStoredAdminAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveStoredAdminAccounts(accounts: AdminAccount[]): void {
  try {
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {}
}

export const authService = {
  /**
   * Async Login — Authenticates against Supabase PostgreSQL admin_users table & local accounts
   */
  async login(email: string, pass: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const client = getSupabaseClient();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please provide both email/username and password.' };
    }

    // 1. Check Supabase PostgreSQL admin_users table
    try {
      const { data, error } = await client
        .from('admin_users')
        .select('*');

      if (data && data.length > 0) {
        const found = data.find(
          (u) =>
            (u.email.toLowerCase() === cleanEmail ||
              u.email.toLowerCase().startsWith(cleanEmail + '@') ||
              cleanEmail.startsWith(u.email.toLowerCase().split('@')[0])) &&
            u.password_hash.trim() === cleanPass
        );

        if (found) {
          const user: AdminUser = {
            email: found.email,
            name: found.name || 'Administrator',
            role: 'ADMINISTRATOR',
            loggedInAt: new Date().toISOString(),
          };
          localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
          return { success: true, user };
        }
      }
    } catch (dbErr) {
      console.warn('Supabase auth query notice:', dbErr);
    }

    // 2. Check Local Accounts store
    const localAccounts = getStoredAdminAccounts();
    const match = localAccounts.find(
      (a) =>
        (a.email.toLowerCase() === cleanEmail || a.email.toLowerCase().startsWith(cleanEmail + '@')) &&
        a.password_hash.trim() === cleanPass
    );

    if (match) {
      const user: AdminUser = {
        email: match.email,
        name: match.name,
        role: 'ADMINISTRATOR',
        loggedInAt: new Date().toISOString(),
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
      return { success: true, user };
    }

    // 3. Master Emergency Provisioning Fallback (Auto-registers Super Admin in Supabase DB if matching SuperAdminPass123!)
    if (
      (cleanEmail === 'superadmin@preppulse.com' || cleanEmail === 'superadmin') &&
      cleanPass === 'SuperAdminPass123!'
    ) {
      const superUser: AdminUser = {
        email: 'superadmin@preppulse.com',
        name: 'Super Administrator',
        role: 'ADMINISTRATOR',
        loggedInAt: new Date().toISOString(),
      };

      // Auto insert into Supabase admin_users table in background
      (async () => {
        try {
          await client.from('admin_users').upsert({
            email: 'superadmin@preppulse.com',
            password_hash: 'SuperAdminPass123!',
            name: 'Super Administrator',
            role: 'ADMINISTRATOR',
            updated_at: new Date().toISOString(),
          });
        } catch (e) {}
      })();

      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(superUser));
      return { success: true, user: superUser };
    }

    return { success: false, error: 'Invalid administrator email/username or password.' };
  },

  /**
   * Check if admin is currently authenticated
   */
  isAuthenticated(): boolean {
    try {
      const raw = localStorage.getItem(ADMIN_AUTH_KEY);
      return !!raw;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get current authenticated admin user
   */
  getUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(ADMIN_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Logout admin session
   */
  logout(): void {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  },

  /**
   * Fetch all Admin Accounts (from Supabase & Local Cache)
   */
  async getAdminAccounts(): Promise<AdminAccount[]> {
    const client = getSupabaseClient();
    try {
      const { data } = await client.from('admin_users').select('*');
      if (data && data.length > 0) {
        return data as AdminAccount[];
      }
    } catch (err) {}
    return getStoredAdminAccounts();
  },

  /**
   * Create a new Admin Account
   */
  async createAdminAccount(name: string, email: string, password: string): Promise<AdminAccount> {
    const client = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    const newAcc: AdminAccount = {
      id: `admin-${Date.now()}`,
      email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@preppulse.com`,
      name: name.trim(),
      password_hash: password.trim(),
      role: 'ADMINISTRATOR',
      created_at: new Date().toISOString(),
    };

    const local = getStoredAdminAccounts();
    local.push(newAcc);
    saveStoredAdminAccounts(local);

    try {
      await client.from('admin_users').upsert({
        id: newAcc.id,
        email: newAcc.email,
        name: newAcc.name,
        password_hash: newAcc.password_hash,
        role: 'ADMINISTRATOR',
        created_at: newAcc.created_at,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase admin create notice:', err);
    }

    return newAcc;
  },

  /**
   * Change Password for an Admin Account
   */
  async updateAdminPassword(email: string, newPassword: string): Promise<boolean> {
    const client = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    const local = getStoredAdminAccounts();
    const found = local.find((a) => a.email.toLowerCase() === cleanEmail);
    if (found) {
      found.password_hash = newPassword.trim();
      saveStoredAdminAccounts(local);
    }
    try {
      await client.from('admin_users').update({ password_hash: newPassword.trim() }).eq('email', cleanEmail);
    } catch (err) {}
    return true;
  },
};
