import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { dbService } from '../../services/db';
import { TestFullDetails, Question } from '../../types/database';
import { ArrowLeft, Clock, Eye, AlertCircle, BookOpen } from 'lucide-react';
import { filterValidImages } from '../../components/admin/QuestionBuilder';

export const TestPreview: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!testId) return;
      const data = await dbService.getTestFullDetails(testId);
      setBundle(data);
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

  const allQuestions: Question[] = [];
  bundle.sections.forEach((s) => allQuestions.push(...s.questions));
  const currentQ = allQuestions[activeQuestionIdx];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Preview Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-amber-700" />
            <div>
              <span className="font-bold text-sm">Administrator Test Preview Mode</span>
              <p className="text-xs text-amber-700">
                Simulating the candidate test-taking experience. No response data or attempt records will be created.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/admin/tests/${testId}/edit`)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors whitespace-nowrap"
          >
            Return to Editor
          </button>
        </div>

        {/* Exam Simulation Shell */}
        {allQuestions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            No questions available to preview.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col min-h-[600px]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <span className="font-bold text-base">{bundle.test.title}</span>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded text-slate-300">
                  Question {activeQuestionIdx + 1} of {allQuestions.length}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-400 font-mono font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>{bundle.test.duration_minutes}:00 (Simulated)</span>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-8 flex-1 space-y-6">
              {/* Question Header & Prompt */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {(currentQ?.question_type || 'MULTIPLE_CHOICE').replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-400">Points: {currentQ.points}</span>
                </div>

                <h2 className="text-lg font-semibold text-slate-900 leading-relaxed">{currentQ.prompt}</h2>

                {/* Multiple Prompt Images Grid */}
                {(currentQ.image_urls || (currentQ.image_url ? [currentQ.image_url] : []))?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {(currentQ.image_urls || [currentQ.image_url!]).map((url, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white p-2 shadow-sm flex items-center justify-center">
                        <img src={url} alt={`Question visual ${idx + 1}`} className="max-h-56 object-contain rounded-xl" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quant Comparison View */}
              {currentQ.question_type === 'QUANTITATIVE_COMPARISON' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity A</span>
                    <div className="text-base font-bold text-slate-900 bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
                      {currentQ.quantity_a && <div>{currentQ.quantity_a}</div>}
                      {filterValidImages(currentQ.quantity_a_images || currentQ.quantity_a_image).length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {filterValidImages(currentQ.quantity_a_images || currentQ.quantity_a_image).map((url, idx) => (
                            <img key={idx} src={url} alt={`Quantity A Visual ${idx + 1}`} className="max-h-56 object-contain rounded-xl border border-slate-200 p-2 bg-white shadow-sm" />
                          ))}
                        </div>
                      )}
                      {!currentQ.quantity_a && filterValidImages(currentQ.quantity_a_images || currentQ.quantity_a_image).length === 0 && <div>—</div>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity B</span>
                    <div className="text-base font-bold text-slate-900 bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
                      {currentQ.quantity_b && <div>{currentQ.quantity_b}</div>}
                      {filterValidImages(currentQ.quantity_b_images || currentQ.quantity_b_image).length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {filterValidImages(currentQ.quantity_b_images || currentQ.quantity_b_image).map((url, idx) => (
                            <img key={idx} src={url} alt={`Quantity B Visual ${idx + 1}`} className="max-h-56 object-contain rounded-xl border border-slate-200 p-2 bg-white shadow-sm" />
                          ))}
                        </div>
                      )}
                      {!currentQ.quantity_b && filterValidImages(currentQ.quantity_b_images || currentQ.quantity_b_image).length === 0 && <div>—</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Numeric Entry View */}
              {currentQ.question_type === 'NUMERIC_ENTRY' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 max-w-md">
                  <label className="text-xs font-bold text-slate-700 uppercase">Enter Numeric Answer (Candidate View)</label>
                  <input
                    type="number"
                    disabled
                    placeholder="Candidate numeric input field..."
                    className="w-full p-3 border border-slate-300 rounded-lg text-base font-mono bg-white text-slate-400"
                  />
                  <div className="text-xs text-emerald-700 font-semibold pt-1 space-y-1">
                    <div>
                      Accepted Correct Answers:{' '}
                      <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                        {currentQ.accepted_numeric_answers && currentQ.accepted_numeric_answers.length > 0
                          ? currentQ.accepted_numeric_answers.join(', ')
                          : currentQ.numeric_answer !== undefined
                          ? String(currentQ.numeric_answer)
                          : 'Not specified'}
                      </strong>
                    </div>
                    {currentQ.numeric_tolerance !== undefined && (
                      <div className="text-slate-500">Tolerance: ±{currentQ.numeric_tolerance}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Options List (for MC / Sentence Eq / Quant Comp) */}
              {currentQ.question_type !== 'NUMERIC_ENTRY' && currentQ.options && currentQ.options.length > 0 && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-xl border flex items-center space-x-3 transition-all ${
                        opt.is_correct
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt.option_text}</span>
                      {opt.is_correct && (
                        <span className="ml-auto text-xs bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full">
                          Correct Answer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation Box */}
              {currentQ.explanation && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">Explanation / Solution</span>
                  <p className="text-xs text-blue-800 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>

            {/* Preview Footer Navigator */}
            <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex items-center justify-between">
              <button
                onClick={() => setActiveQuestionIdx(Math.max(0, activeQuestionIdx - 1))}
                disabled={activeQuestionIdx === 0}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold disabled:opacity-40"
              >
                Previous Question
              </button>

              <div className="flex space-x-1.5 overflow-x-auto max-w-md px-2">
                {allQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      idx === activeQuestionIdx
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActiveQuestionIdx(Math.min(allQuestions.length - 1, activeQuestionIdx + 1))}
                disabled={activeQuestionIdx === allQuestions.length - 1}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold disabled:opacity-40"
              >
                Next Question
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
