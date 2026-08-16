import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  BarChart3,
  BookOpen,
  UserCheck,
  LogOut,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/admin/dashboard" className="flex items-center space-x-2.5 font-bold text-xl tracking-tight text-white hover:text-blue-400 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span>PrepPulse <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">ADMIN</span></span>
            </Link>

            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
              <Link
                to="/admin/dashboard"
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/admin/tests/new"
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  location.pathname === '/admin/tests/new'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Test</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/test/join"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
              title="Switch to Candidate View to enter test codes"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Taker Portal</span>
            </Link>

            <div className="flex items-center space-x-3 border-l border-slate-800 pl-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">
                AD
              </div>
              <div className="hidden lg:flex flex-col text-xs">
                <span className="font-semibold text-slate-200">admin@preppulse.com</span>
                <span className="text-[10px] text-slate-400">Administrator</span>
              </div>
              <button
                onClick={() => {
                  import('../../services/auth').then(({ authService }) => {
                    authService.logout();
                    navigate('/admin/login');
                  });
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Logout Admin Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div>PrepPulse Assessment & Testing Suite &copy; 2026. All rights reserved.</div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Server Timing: <strong className="text-slate-600">Active</strong></span>
            <span>Storage: <strong className="text-slate-600">Ready</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
