import React, { useEffect, useState } from 'react';
import { authService, AdminAccount } from '../../services/auth';
import { ShieldCheck, UserPlus, KeyRound, Check, X, Lock, Mail, User } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AdminAccountsModal: React.FC<Props> = ({ onClose }) => {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Password change state
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [updatedPassInput, setUpdatedPassInput] = useState('');

  const loadAccounts = async () => {
    setLoading(true);
    const data = await authService.getAdminAccounts();
    setAccounts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    await authService.createAdminAccount(newName, newEmail, newPassword);
    setToast(`Admin account "${newEmail}" created successfully!`);
    setNewName('');
    setNewEmail('');
    setNewPassword('');
    setShowAddForm(false);
    loadAccounts();
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdatePassword = async (email: string) => {
    if (!updatedPassInput.trim()) return;
    await authService.updateAdminPassword(email, updatedPassInput);
    setToast(`Password updated for ${email}`);
    setEditingEmail(null);
    setUpdatedPassInput('');
    loadAccounts();
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-fade-in space-y-0 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Accounts & Credentials</h2>
              <p className="text-xs text-slate-400">Manage administrator logins and access keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {toast && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Active Administrator Accounts ({accounts.length})
            </h3>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Cancel' : '+ New Admin Account'}</span>
            </button>
          </div>

          {/* Add Admin Form */}
          {showAddForm && (
            <form onSubmit={handleCreateAdmin} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create Administrator Credential</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Full Name</label>
                  <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-slate-300 rounded-xl">
                    <User className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-xs outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Admin Email / Username</label>
                  <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-slate-300 rounded-xl">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. sarah@preppulse.com or sarah"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full text-xs outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <div className="flex items-center space-x-2 bg-white px-3 py-2 border border-slate-300 rounded-xl">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="Enter secure admin password..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          )}

          {/* Accounts List */}
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading accounts...</div>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{acc.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{acc.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingEmail(editingEmail === acc.email ? null : acc.email);
                        setUpdatedPassInput('');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center space-x-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  {editingEmail === acc.email && (
                    <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                      <input
                        type="password"
                        placeholder="New password..."
                        value={updatedPassInput}
                        onChange={(e) => setUpdatedPassInput(e.target.value)}
                        className="p-2 border border-slate-300 rounded-xl text-xs font-mono flex-1 bg-white"
                      />
                      <button
                        onClick={() => handleUpdatePassword(acc.email)}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setEditingEmail(null)}
                        className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
