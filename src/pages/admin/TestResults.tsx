import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { dbService } from '../../services/db';
import { evaluateQuestionAnswer } from '../../services/scoring';
import { TestFullDetails, Attempt, Question } from '../../types/database';
import { BarChart3, Award, Users, CheckCircle2, XCircle, ArrowLeft, Download } from 'lucide-react';

export const TestResults: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      const tData = await dbService.getTestFullDetails(testId);
      const aData = await dbService.getTestAttempts(testId);
      setBundle(tData);
      setAttempts(aData);
      setLoading(false);
    };
    load();
  }, [testId]);

  if (loading || !bundle) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const completedAttempts = attempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'EXPIRED');

  const avgPercentage =
    completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / completedAttempts.length
        )
      : 0;

  const passCount = completedAttempts.filter((a) => a.percentage >= 70).length;

  const allQuestions: Question[] = [];
  bundle.sections.forEach((s) => allQuestions.push(...s.questions));

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Test Results & Analytics</h1>
              <p className="text-xs text-slate-500">{bundle.test.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Submissions</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{completedAttempts.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Average Score</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{avgPercentage}%</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase">Pass Rate (≥70%)</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {completedAttempts.length > 0 ? Math.round((passCount / completedAttempts.length) * 100) : 0}%
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Candidate Results Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Candidate Performance Breakdown</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Raw Score</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                      No candidate submissions yet.
                    </td>
                  </tr>
                ) : (
                  completedAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold text-slate-900">{att.candidate_name}</td>
                      <td className="p-4 text-xs text-slate-500">
                        {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 font-bold">{att.score} / {att.max_score}</td>
                      <td className="p-4 font-bold text-blue-600">{att.percentage}%</td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          att.percentage >= 70
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {att.percentage >= 70 ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Question-by-Question Accuracy Item Analysis */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Question Item Accuracy Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allQuestions.map((q, idx) => {
              let correctCount = 0;
              let totalAnswered = 0;

              completedAttempts.forEach((att) => {
                const ans = att.answers?.[q.id];
                if (ans) {
                  totalAnswered++;
                  const evalRes = evaluateQuestionAnswer(q, ans);
                  if (evalRes.isCorrect) correctCount++;
                }
              });

              const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

              return (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-500 uppercase">Question {idx + 1}</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      accuracy >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {accuracy}% Accuracy
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 line-clamp-2">{q.prompt}</p>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all" style={{ width: `${accuracy}%` }} />
                  </div>

                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{correctCount} correct of {totalAnswered} attempts</span>
                    <span>Type: {q.question_type.replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
