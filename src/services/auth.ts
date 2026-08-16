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

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
   * Async Login — Authenticates against Official Supabase Auth, Supabase PostgreSQL admin_users table, & Local accounts
   */
  async login(email: string, pass: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
    const cleanEmail = email.trim().toLowerCase();
    const fullEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@preppulse.com`;
    const cleanPass = pass.trim();
    const client = getSupabaseClient();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please provide both email/username and password.' };
    }

    // 1. Try Official Supabase Auth
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

    // 2. Check Supabase PostgreSQL admin_users table
    try {
      const { data, error } = await client
        .from('admin_users')
        .select('*');

      if (error) {
        console.warn('Supabase admin_users select notice:', error);
      }

      if (data && data.length > 0) {
        const found = data.find((u) => {
          const uEmail = (u.email || '').toLowerCase().trim();
          const uName = (u.name || '').toLowerCase().trim();
          const emailMatch =
            uEmail === cleanEmail ||
            uEmail === fullEmail ||
            uEmail.startsWith(cleanEmail + '@') ||
            cleanEmail.startsWith(uEmail.split('@')[0]);
          const nameMatch = uName === cleanEmail;
          const passMatch = (u.password_hash || '').trim() === cleanPass;
          return (emailMatch || nameMatch) && passMatch;
        });

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

    // 3. Check Local Accounts store
    const localAccounts = getStoredAdminAccounts();
    const match = localAccounts.find((a) => {
      const aEmail = (a.email || '').toLowerCase().trim();
      const emailMatch =
        aEmail === cleanEmail ||
        aEmail === fullEmail ||
        aEmail.startsWith(cleanEmail + '@') ||
        cleanEmail.startsWith(aEmail.split('@')[0]);
      const passMatch = (a.password_hash || '').trim() === cleanPass;
      return emailMatch && passMatch;
    });

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

    // 4. Master Emergency Provisioning Fallbacks
    if (
      (cleanEmail === 'amooli@preppulse.com' || cleanEmail === 'amooli') &&
      (cleanPass === 'Amooli1234' || cleanPass === 'amooli1234')
    ) {
      const amooliUser: AdminUser = {
        email: 'amooli@preppulse.com',
        name: 'Super Administrator',
        role: 'ADMINISTRATOR',
        loggedInAt: new Date().toISOString(),
      };

      (async () => {
        try {
          await client.from('admin_users').upsert(
            {
              id: generateUuid(),
              email: 'amooli@preppulse.com',
              password_hash: 'Amooli1234',
              name: 'Super Administrator',
              role: 'ADMINISTRATOR',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
        } catch (e) {}
      })();

      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(amooliUser));
      return { success: true, user: amooliUser };
    }

    if (
      (cleanEmail === 'superadmin@preppulse.com' || cleanEmail === 'superadmin') &&
      (cleanPass === 'SuperAdminPass123!' || cleanPass === 'superadminpass123!')
    ) {
      const superUser: AdminUser = {
        email: 'superadmin@preppulse.com',
        name: 'Super Administrator',
        role: 'ADMINISTRATOR',
        loggedInAt: new Date().toISOString(),
      };

      (async () => {
        try {
          await client.auth.signUp({
            email: 'superadmin@preppulse.com',
            password: 'SuperAdminPass123!',
            options: { data: { full_name: 'Super Administrator' } },
          });
        } catch (e) {}

        try {
          await client.from('admin_users').upsert(
            {
              id: generateUuid(),
              email: 'superadmin@preppulse.com',
              password_hash: 'SuperAdminPass123!',
              name: 'Super Administrator',
              role: 'ADMINISTRATOR',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
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
   * Create a new Admin Account — Registers in valid UUID format for PostgreSQL admin_users table & Supabase Auth
   */
  async createAdminAccount(name: string, email: string, password: string): Promise<AdminAccount> {
    const client = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    const fullEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@preppulse.com`;
    const cleanPass = password.trim();

    const newAcc: AdminAccount = {
      id: generateUuid(),
      email: fullEmail,
      name: name.trim(),
      password_hash: cleanPass,
      role: 'ADMINISTRATOR',
      created_at: new Date().toISOString(),
    };

    // Save to local accounts
    const local = getStoredAdminAccounts();
    local.push(newAcc);
    saveStoredAdminAccounts(local);

    // 1. Save to public.admin_users table (valid UUID format)
    try {
      const { error: dbErr } = await client.from('admin_users').upsert(
        {
          id: newAcc.id,
          email: newAcc.email,
          name: newAcc.name,
          password_hash: newAcc.password_hash,
          role: 'ADMINISTRATOR',
          created_at: newAcc.created_at,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

      if (dbErr) {
        console.error('Supabase admin_users table insert error:', dbErr.message);
      }
    } catch (err) {
      console.warn('Supabase admin_users table insert exception:', err);
    }

    // 2. Register in Official Supabase Auth
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
      await client
        .from('admin_users')
        .update({ password_hash: cleanPass, updated_at: new Date().toISOString() })
        .eq('email', fullEmail);
    } catch (err) {}

    return true;
  },
};
