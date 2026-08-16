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
   * Async Login — Authenticates against Official Supabase Auth & Supabase PostgreSQL admin_users table
   */
  async login(email: string, pass: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanEmail = email.trim().toLowerCase();
    const fullEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@preppulse.com`;
    const cleanPass = pass.trim();
    const client = getSupabaseClient();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please provide both email/username and password.' };
    }

    // 1. First Try Official Supabase Auth (Supabase Dashboard -> Authentication tab)
    try {
      const { data: authData, error: authErr } = await client.auth.signInWithPassword({
        email: fullEmail,
        password: cleanPass,
      });

      if (authData && authData.user) {
        const user: AdminUser = {
          email: authData.user.email || fullEmail,
          name: authData.user.user_metadata?.full_name || 'Administrator',
          role: 'ADMINISTRATOR',
          loggedInAt: new Date().toISOString(),
        };
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
        return { success: true, user };
      }
    } catch (authException) {}

    // 2. Check Supabase PostgreSQL admin_users table (Table Editor)
    try {
      const { data } = await client
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

          // Also sync to Supabase Auth if missing
          (async () => {
            try {
              await client.auth.signUp({
                email: found.email,
                password: cleanPass,
                options: { data: { full_name: found.name } },
              });
            } catch (e) {}
          })();

          return { success: true, user };
        }
      }
    } catch (dbErr) {
      console.warn('Supabase auth query notice:', dbErr);
    }

    // 3. Check Local Accounts store
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

      // Sync to Supabase Auth
      (async () => {
        try {
          await client.auth.signUp({
            email: match.email,
            password: cleanPass,
            options: { data: { full_name: match.name } },
          });
        } catch (e) {}
      })();

      return { success: true, user };
    }

    // 4. Master Emergency Provisioning Fallback (Auto-registers Super Admin in Supabase Auth & DB)
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

      // Auto provision in Supabase Auth and Database
      (async () => {
        try {
          await client.auth.signUp({
            email: 'superadmin@preppulse.com',
            password: 'SuperAdminPass123!',
            options: { data: { full_name: 'Super Administrator' } },
          });
        } catch (e) {}

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
    const client = getSupabaseClient();
    try {
      client.auth.signOut();
    } catch (e) {}
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
   * Create a new Admin Account — Registers in official Supabase Auth AND public.admin_users table
   */
  async createAdminAccount(name: string, email: string, password: string): Promise<AdminAccount> {
    const client = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    const fullEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@preppulse.com`;
    const cleanPass = password.trim();

    const newAcc: AdminAccount = {
      id: `admin-${Date.now()}`,
      email: fullEmail,
      name: name.trim(),
      password_hash: cleanPass,
      role: 'ADMINISTRATOR',
      created_at: new Date().toISOString(),
    };

    const local = getStoredAdminAccounts();
    local.push(newAcc);
    saveStoredAdminAccounts(local);

    // 1. Register in Official Supabase Auth (So user appears under Supabase Dashboard -> Authentication tab)
    try {
      await client.auth.signUp({
        email: fullEmail,
        password: cleanPass,
        options: {
          data: { full_name: name.trim() },
        },
      });
    } catch (err) {
      console.warn('Supabase auth.signUp notice:', err);
    }

    // 2. Also save to public.admin_users table (Table Editor)
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
      console.warn('Supabase admin_users table insert notice:', err);
    }

    return newAcc;
  },

  /**
   * Change Password for an Admin Account
   */
  async updateAdminPassword(email: string, newPassword: string): Promise<boolean> {
    const client = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    const fullEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@preppulse.com`;
    const cleanPass = newPassword.trim();

    const local = getStoredAdminAccounts();
    const found = local.find((a) => a.email.toLowerCase() === cleanEmail || a.email.toLowerCase() === fullEmail);
    if (found) {
      found.password_hash = cleanPass;
      saveStoredAdminAccounts(local);
    }

    try {
      await client.from('admin_users').update({ password_hash: cleanPass }).eq('email', fullEmail);
    } catch (err) {}

    return true;
  },
};
