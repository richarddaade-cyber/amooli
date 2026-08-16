import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { dbService } from '../../services/db';
import { calculateTimerStatus } from '../../services/timer';
import { Attempt, TestFullDetails } from '../../types/database';
import { Activity, Clock, Users, RefreshCw, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export const TestMonitor: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = async () => {
    if (!testId) return;
    const testData = await dbService.getTestFullDetails(testId);
    const attemptData = await dbService.getTestAttempts(testId);
    setBundle(testData);
    setAttempts(attemptData);
    setLastRefreshed(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Poll every 3 seconds to reflect real-time candidate autosaves
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [testId]);

  const handleForceSubmit = async (attemptId: string, candidateName: string) => {
    if (window.confirm(`Force submit attempt for candidate "${candidateName}"?`)) {
      await dbService.submitAttempt(attemptId, true);
      loadData();
    }
  };

  if (loading || !bundle) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const activeAttempts = attempts.filter((a) => a.status === 'IN_PROGRESS');
  const completedAttempts = attempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'EXPIRED');

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Monitor Header */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="text-2xl font-bold">Real-time Test Session Monitor</h1>
            </div>
            <p className="text-slate-400 text-xs">
              Live tracking for: <strong className="text-white">{bundle.test.title}</strong> (Code: <span className="text-blue-400 font-mono font-bold">{bundle.test.access_code || 'N/A'}</span>)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400">Refreshed: {lastRefreshed}</span>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
              title="Refresh Now"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Active Live Sessions</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{activeAttempts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Completed Submissions</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{completedAttempts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Candidates</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{attempts.length}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Section 1: Active In-Progress Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>In-Progress Candidate Sessions</span>
            </h2>
            <span className="text-xs text-slate-500">Autosaving active</span>
          </div>

          {activeAttempts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
              No candidates are actively taking this test right now. Share the code{' '}
              <strong className="font-mono text-slate-700">{bundle.test.access_code}</strong> for candidates to join.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeAttempts.map((att) => {
                const timer = calculateTimerStatus(att.started_at, bundle.test.duration_minutes);
                const answeredCount = Object.keys(att.answers || {}).length;

                return (
                  <div key={att.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{att.candidate_name}</h3>
                        <p className="text-xs text-slate-400">Started: {new Date(att.started_at).toLocaleTimeString()}</p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>LIVE</span>
                      </span>
                    </div>

                    {/* Progress Bar & Timer */}
                    <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Remaining Time:</span>
                        <span className="font-mono text-emerald-700 font-bold">{timer.formattedTime}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-1000"
                          style={{ width: `${timer.percentRemaining}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                        <span>Answered: {answeredCount} Questions</span>
                        <span>Session Valid</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        onClick={() => handleForceSubmit(att.id, att.candidate_name)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors flex items-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Force Submit</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Completed Attempts */}
        {completedAttempts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">Completed Attempts</h2>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Candidate</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Percentage</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{att.candidate_name}</td>
                      <td className="p-4 text-xs text-slate-500">
                        {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{att.score} / {att.max_score}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          att.percentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="p-4 text-right text-xs font-bold text-slate-500">{att.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
