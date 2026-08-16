import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DatabaseSettingsModal } from '../../components/admin/DatabaseSettingsModal';
import { AdminAccountsModal } from '../../components/admin/AdminAccountsModal';
import { dbService } from '../../services/db';
import { Test, TestStatus } from '../../types/database';
import {
  PlusCircle,
  Clock,
  HelpCircle,
  Users,
  Eye,
  Edit,
  Activity,
  BarChart2,
  Copy,
  Check,
  Trash2,
  Play,
  FileCheck,
  Database,
  ShieldCheck,
  RotateCcw,
  Archive,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showDbModal, setShowDbModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const navigate = useNavigate();

  const loadTests = async () => {
    setLoading(true);
    const data = await dbService.getTests();
    setTests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleInvalidateCode = async (testId: string) => {
    if (window.confirm('Are you sure you want to invalidate this access code? Candidates will no longer be able to join using this code.')) {
      await dbService.invalidateAccessCode(testId);
      loadTests();
    }
  };

  const handleRegenerateCode = async (testId: string) => {
    const newCode = await dbService.regenerateAccessCode(testId);
    alert(`New Access Code Generated: ${newCode}`);
    loadTests();
  };

  const handleStatusToggle = async (testId: string, currentStatus: TestStatus) => {
    let nextStatus: TestStatus = 'ACTIVE';
    if (currentStatus === 'DRAFT' || currentStatus === 'REVIEW') nextStatus = 'PUBLISHED';
    else if (currentStatus === 'PUBLISHED') nextStatus = 'ACTIVE';
    else if (currentStatus === 'ACTIVE') nextStatus = 'CLOSED';
    else if (currentStatus === 'CLOSED') nextStatus = 'ACTIVE';

    await dbService.updateTestStatus(testId, nextStatus);
    loadTests();
  };

  const handleDeleteTest = async (testId: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}" and all its questions/attempts from the database?`)) {
      setTests((prev) => prev.filter((t) => t.id !== testId));
      await dbService.deleteTest(testId);
      loadTests();
    }
  };

  const activeTests = tests.filter((t) => t.status === 'ACTIVE' || t.status === 'PUBLISHED');
  const draftTests = tests.filter((t) => t.status === 'DRAFT' || t.status === 'REVIEW');
  const closedTests = tests.filter((t) => t.status === 'CLOSED');

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 rounded-2xl text-white shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Test Administration Dashboard</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Create, edit, publish, monitor live test sessions, and inspect candidate score analytics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAccountsModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 shadow-sm"
              title="Admin Accounts & Credentials Management"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Admin Logins</span>
            </button>

            <button
              onClick={() => setShowDbModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 shadow-sm"
              title="Database & Supabase Connection Settings"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Sync</span>
            </button>

            <Link
              to="/admin/tests/new"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Create New Test</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tests</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{tests.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active / Published</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{activeTests.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Draft Tests</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{draftTests.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Edit className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Candidates</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {tests.reduce((acc, t) => acc + (t.active_candidates_count || 0), 0)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Section 1: Active Tests */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span>Active & Published Tests</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Candidates can join active tests using access codes</span>
          </div>

          {activeTests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">No active tests currently running.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Publish a draft test below to generate a candidate access code.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTests.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                        t.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {t.status}
                      </span>

                      {t.access_code && (
                        <div className="flex items-center space-x-1.5 bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg">
                          <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">
                            {t.access_code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(t.access_code!)}
                            className="text-slate-500 hover:text-slate-800 transition-colors"
                            title="Copy Code"
                          >
                            {copiedCode === t.access_code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2">{t.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{t.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.questions_count || 0} Qs</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.active_candidates_count || 0} Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="bg-slate-50 border-t border-slate-100 p-3 px-6 flex items-center justify-between gap-2 text-xs">
                    <Link
                      to={`/admin/tests/${t.id}/monitor`}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Monitor Live</span>
                    </Link>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/tests/${t.id}/results`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium transition-colors flex items-center space-x-1"
                        title="View Results & Analytics"
                      >
                        <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Results</span>
                      </Link>

                      <Link
                        to={`/admin/tests/${t.id}/preview`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium transition-colors flex items-center space-x-1"
                        title="Preview Candidate Experience"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview</span>
                      </Link>

                      <button
                        onClick={() => handleStatusToggle(t.id, t.status)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 font-medium transition-colors"
                        title="Close Test"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Drafts */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Draft & In-Progress Tests</h2>
            <span className="text-xs text-slate-500">Tests under construction</span>
          </div>

          {draftTests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs">
              No draft tests available. Click "Create New Test" to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftTests.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {t.status}
                      </span>
                      <span className="text-xs text-slate-400">{t.questions_count || 0} Questions</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{t.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/admin/tests/${t.id}/edit`}
                      className="flex-1 text-center py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit & Add Questions</span>
                    </Link>

                    <button
                      onClick={() => handleStatusToggle(t.id, t.status)}
                      className="py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors flex items-center space-x-1"
                      title="Publish Test to Make it Active"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTest(t.id, t.title)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Closed & Archived Tests */}
        {closedTests.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Archive className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-bold text-slate-900">Closed & Archived Tests ({closedTests.length})</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Deactivated tests can be reactivated or permanently deleted</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedTests.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        CLOSED / ARCHIVED
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{t.questions_count || 0} Questions</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{t.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <Link
                      to={`/admin/tests/${t.id}/results`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center space-x-1 transition-colors"
                      title="View Final Analytics"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Results</span>
                    </Link>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStatusToggle(t.id, t.status)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-bold transition-colors flex items-center space-x-1"
                        title="Reactivate test back to active published state"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reactivate</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTest(t.id, t.title)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Permanently Delete Test from Database"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showDbModal && <DatabaseSettingsModal onClose={() => setShowDbModal(false)} />}
      {showAccountsModal && <AdminAccountsModal onClose={() => setShowAccountsModal(false)} />}
    </AdminLayout>
  );
};
