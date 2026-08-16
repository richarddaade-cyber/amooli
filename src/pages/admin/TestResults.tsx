import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { dbService } from '../../services/db';
import { evaluateQuestionAnswer } from '../../services/scoring';
import { TestFullDetails, Attempt, Question, Answer } from '../../types/database';
import {
  BarChart3,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Download,
  Eye,
  X,
  FileText,
  Check,
  AlertCircle,
  BookOpen,
  Printer,
} from 'lucide-react';

export const TestResults: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);

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
      {/* Print Style Overrides to ensure images & full detailed reports render high quality on PDF export */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, sidebar, .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-card {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
          }
        }
      `}</style>

      <div className="space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm no-print">
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
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Summary</span>
            </button>
          </div>
        </div>

        {/* Analytics Summary Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 no-print">
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

        {/* Candidate Performance Breakdown Table */}
        <div className="space-y-4 no-print">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Candidate Submissions Breakdown</h2>
            <span className="text-xs text-slate-500">Click any candidate to inspect itemized right/wrong answers & images</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                      No candidate submissions yet.
                    </td>
                  </tr>
                ) : (
                  completedAttempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{att.candidate_name}</div>
                        {att.candidate_email && <div className="text-xs text-slate-400">{att.candidate_email}</div>}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {att.submitted_at ? new Date(att.submitted_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 font-bold">{att.score} / {att.max_score}</td>
                      <td className="p-4 font-bold text-blue-600">{att.percentage}%</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          att.percentage >= 70
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {att.percentage >= 70 ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedAttempt(att)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors inline-flex items-center space-x-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Report</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overall Question Accuracy Analysis Grid */}
        <div className="space-y-4 no-print">
          <h2 className="text-lg font-bold text-slate-900">Overall Item Accuracy Rate</h2>
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
                    <span>Type: {(q?.question_type || 'MULTIPLE_CHOICE').replace('_', ' ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMPREHENSIVE CANDIDATE ITEM ANALYSIS & PDF EXPORT MODAL */}
        {selectedAttempt && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
              
              {/* Modal Top Control Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between no-print">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Itemized Candidate Score & Analysis Report</h3>
                    <p className="text-xs text-slate-400">Candidate: {selectedAttempt.candidate_name} • {bundle.test.title}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Full PDF Report</span>
                  </button>
                  <button
                    onClick={() => setSelectedAttempt(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Report Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50">
                
                {/* Candidate Performance Metric Header */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 print-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedAttempt.candidate_name}</h2>
                      <p className="text-xs text-slate-500">{selectedAttempt.candidate_email || 'No email provided'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Submitted: {selectedAttempt.submitted_at ? new Date(selectedAttempt.submitted_at).toLocaleString() : 'N/A'}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-3xl font-extrabold text-blue-600">{selectedAttempt.score} / {selectedAttempt.max_score}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedAttempt.percentage}% Total Score</div>
                      </div>
                      <div className={`px-4 py-2 rounded-2xl font-bold text-sm border ${
                        selectedAttempt.percentage >= 70
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {selectedAttempt.percentage >= 70 ? 'PASS' : 'FAIL'}
                      </div>
                    </div>
                  </div>

                  {/* Summary Counts Grid */}
                  {(() => {
                    let correctCount = 0;
                    let incorrectCount = 0;
                    let unansweredCount = 0;

                    allQuestions.forEach((q) => {
                      const ans = selectedAttempt.answers?.[q.id];
                      if (!ans || ((!ans.selected_option_ids || ans.selected_option_ids.length === 0) && (!ans.text_answer || ans.text_answer.trim() === ''))) {
                        unansweredCount++;
                      } else {
                        const ev = evaluateQuestionAnswer(q, ans);
                        if (ev.isCorrect) correctCount++;
                        else incorrectCount++;
                      }
                    });

                    return (
                      <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                          <div className="text-lg font-bold text-emerald-700">{correctCount}</div>
                          <div className="text-[11px] font-semibold text-emerald-600 uppercase">Correct</div>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                          <div className="text-lg font-bold text-rose-700">{incorrectCount}</div>
                          <div className="text-[11px] font-semibold text-rose-600 uppercase">Incorrect</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <div className="text-lg font-bold text-amber-700">{unansweredCount}</div>
                          <div className="text-[11px] font-semibold text-amber-600 uppercase">Unanswered</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* ITEM-BY-ITEM QUESTION ANALYSIS & IMAGE DISPLAY */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">
                    Itemized Question Analysis & Candidate Responses
                  </h3>

                  {allQuestions.map((q, qIdx) => {
                    const ans = selectedAttempt.answers?.[q.id];
                    const isUnanswered = !ans || ((!ans.selected_option_ids || ans.selected_option_ids.length === 0) && (!ans.text_answer || ans.text_answer.trim() === ''));
                    const evalRes = evaluateQuestionAnswer(q, ans);
                    const isCorrect = !isUnanswered && evalRes.isCorrect;

                    return (
                      <div
                        key={q.id}
                        className={`bg-white rounded-2xl border p-6 space-y-5 shadow-sm print-card ${
                          isUnanswered
                            ? 'border-amber-200 bg-amber-50/10'
                            : isCorrect
                            ? 'border-emerald-200 bg-emerald-50/10'
                            : 'border-rose-200 bg-rose-50/10'
                        }`}
                      >
                        {/* Question Top Header Tag */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                              Q{qIdx + 1}
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                              {(q?.question_type || 'MULTIPLE_CHOICE').replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-400">({q.points} pt)</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {isUnanswered ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>UNANSWERED (0.0 pt)</span>
                              </span>
                            ) : isCorrect ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>CORRECT (+{evalRes.scoreAwarded} pt)</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>INCORRECT (0.0 pt)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Reading Comprehension Passage */}
                        {q.question_type === 'READING_COMPREHENSION' && q.passage && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 uppercase">
                              <BookOpen className="w-4 h-4 text-amber-700" />
                              <span>{q.passage.title || 'Reading Comprehension Passage'}</span>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed font-sans">{q.passage.content}</p>
                          </div>
                        )}

                        {/* Question Prompt */}
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.prompt}</p>

                          {/* Render Question Prompt Images (Full Support for Export) */}
                          {(q.image_urls || (q.image_url ? [q.image_url] : []))?.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                              {(q.image_urls || [q.image_url!]).map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2 shadow-sm">
                                  <img src={imgUrl} alt={`Question Diagram ${imgIdx + 1}`} className="max-h-48 object-contain rounded-lg mx-auto" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Quantitative Comparison Layout & Images */}
                          {q.question_type === 'QUANTITATIVE_COMPARISON' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Quantity A</span>
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 space-y-2">
                                  {q.quantity_a && <div>{q.quantity_a}</div>}
                                  {(q.quantity_a_images || (q.quantity_a_image ? [q.quantity_a_image] : []))?.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2">
                                      {(q.quantity_a_images || [q.quantity_a_image!]).map((url, idx) => (
                                        <img key={idx} src={url} alt={`Quantity A ${idx + 1}`} className="max-h-36 object-contain rounded border p-1" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Quantity B</span>
                                <div className="p-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 space-y-2">
                                  {q.quantity_b && <div>{q.quantity_b}</div>}
                                  {(q.quantity_b_images || (q.quantity_b_image ? [q.quantity_b_image] : []))?.length > 0 && (
                                    <div className="grid grid-cols-1 gap-2">
                                      {(q.quantity_b_images || [q.quantity_b_image!]).map((url, idx) => (
                                        <img key={idx} src={url} alt={`Quantity B ${idx + 1}`} className="max-h-36 object-contain rounded border p-1" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ANSWER CHOICES / NUMERIC ANALYSIS */}
                        <div className="space-y-2 pt-1">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer Choice Breakdown</div>

                          {q.question_type === 'NUMERIC_ENTRY' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold">
                              <div>
                                <span className="text-slate-500 block">Candidate Entry:</span>
                                <span className={`font-mono text-sm font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {ans?.text_answer || '(No answer provided)'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Accepted Right Answer:</span>
                                <span className="font-mono text-sm font-bold text-emerald-700">
                                  {q.accepted_numeric_answers?.join(', ') || q.numeric_answer || 'N/A'}
                                  {q.numeric_tolerance ? ` (±${q.numeric_tolerance})` : ''}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {(q.options || []).map((opt, optIdx) => {
                                const isCandidateChoice = ans?.selected_option_ids?.includes(opt.id);
                                const isCorrectChoice = opt.is_correct;

                                let borderClass = 'border-slate-200 bg-white';
                                if (isCandidateChoice && isCorrectChoice) {
                                  borderClass = 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500';
                                } else if (isCandidateChoice && !isCorrectChoice) {
                                  borderClass = 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500';
                                } else if (isCorrectChoice) {
                                  borderClass = 'border-emerald-300 bg-emerald-50/20';
                                }

                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${borderClass}`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[11px] ${
                                        isCandidateChoice
                                          ? isCorrectChoice ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600'
                                          : isCorrectChoice ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'border-slate-300 text-slate-600'
                                      }`}>
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span className="font-medium text-slate-900">{opt.option_text}</span>
                                    </div>

                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                      {isCandidateChoice && (
                                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                          isCorrectChoice ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                                        }`}>
                                          Candidate Chose
                                        </span>
                                      )}
                                      {isCorrectChoice && (
                                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center space-x-1">
                                          <Check className="w-3 h-3" />
                                          <span>Correct Answer</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* EXPLANATION */}
                        {q.explanation && (
                          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-1">
                            <div className="text-[11px] font-bold text-blue-900 uppercase">💡 Explanation</div>
                            <p className="text-xs text-blue-950 font-sans leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
