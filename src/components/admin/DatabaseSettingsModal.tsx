import React, { useState } from 'react';
import { Database, CheckCircle, Save, X, Server, Code2, Copy, Check } from 'lucide-react';

interface DatabaseSettingsModalProps {
  onClose: () => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({ onClose }) => {
  const [url, setUrl] = useState(() => localStorage.getItem('preppulse_supabase_url') || '');
  const [anonKey, setAnonKey] = useState(() => localStorage.getItem('preppulse_supabase_key') || '');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (url.trim()) localStorage.setItem('preppulse_supabase_url', url.trim());
    if (anonKey.trim()) localStorage.setItem('preppulse_supabase_key', anonKey.trim());
    if (geminiKey.trim()) localStorage.setItem('gemini_api_key', geminiKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Database Connection & Persistence Settings</h3>
            <p className="text-xs text-slate-500">
              Configured for Supabase PostgreSQL database tables.
            </p>
          </div>
        </div>

        {/* Database Status Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 text-emerald-900 text-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Database Persistence Engine: Active</span>
            <p className="text-emerald-700 mt-0.5">
              Every created, published, and active test is saved to database tables (`tests`, `sections`, `questions`, `options`, `attempts`).
            </p>
          </div>
        </div>

        {/* Supabase Credentials Form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm font-mono bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Supabase Anon API Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm font-mono bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
              <span>Gemini AI Evaluator API Key (Sole Essay Evaluator)</span>
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-xl text-sm font-mono bg-amber-50/30 focus:bg-white outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-500">
              Gemini AI is configured as the sole evaluator and scorer for GRE Analytical Writing essays.
            </p>
          </div>
        </div>

        {/* Schema Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="flex items-center space-x-1.5">
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>PostgreSQL Schema File Location</span>
            </div>
            <span className="font-mono text-slate-500 text-[11px]">supabase/schema.sql</span>
          </div>
          <p className="text-xs text-slate-500">
            The database schema file [`supabase/schema.sql`](file:///c:/Users/RUBBY/Desktop/amooli/supabase/schema.sql) contains all table definitions, foreign keys, indexes, and row-level policies.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved & Reloading...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Database Credentials</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
