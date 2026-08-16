import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { calculateTimerStatus, TimerStatus } from '../../services/timer';
import { Attempt, TestFullDetails, Question, Answer, Passage } from '../../types/database';
import {
  Clock,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Menu,
  X,
  FileCheck,
  Shield,
  Lock,
} from 'lucide-react';

export const TestSession: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);

  // Active question navigation index
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Timer state
  const [timer, setTimer] = useState<TimerStatus | null>(null);

  // Autosave feedback state ('saved' | 'saving' | 'error')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');

  // Question Navigator Drawer state for mobile/desktop
  const [showPalette, setShowPalette] = useState(false);

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Local answers buffer map for immediate UI responsiveness
  const [answersMap, setAnswersMap] = useState<Record<string, Answer>>({});

  useEffect(() => {
    const load = async () => {
      if (!attemptId) return;
      const attData = await dbService.getAttempt(attemptId);
      if (!attData) {
        alert('Attempt not found.');
        navigate('/test/join');
        return;
      }

      if (attData.status === 'SUBMITTED' || attData.status === 'EXPIRED') {
        navigate(`/test/submitted/${attData.id}`);
        return;
      }

      const tData = await dbService.getTestFullDetails(attData.test_id);
      setAttempt(attData);
      setBundle(tData);
      setAnswersMap(attData.answers || {});
      setLoading(false);
    };

    load();
  }, [attemptId]);

  // Timer Tick & Expiry Check Loop
  useEffect(() => {
    if (!attempt || !bundle || attempt.status !== 'IN_PROGRESS') return;

    const tick = async () => {
      const status = calculateTimerStatus(attempt.started_at, bundle.test.duration_minutes);
      setTimer(status);

      if (status.isExpired) {
        // Auto-submit when time expires
        await dbService.submitAttempt(attempt.id, true);
        navigate(`/test/submitted/${attempt.id}`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attempt, bundle]);

  if (loading || !attempt || !bundle || !timer) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-slate-400 font-medium">Loading Assessment Session...</p>
        </div>
      </div>
    );
  }

  // Compile all test questions in sequence across sections
  const allQuestions: Question[] = [];
  bundle.sections.forEach((s) => {
    s.questions.forEach((q) => {
      allQuestions.push({
        ...q,
        passage: s.passages?.find((p) => p.id === q.passage_id),
      });
    });
  });

  const currentQ = allQuestions[activeQuestionIdx] || allQuestions[0];
  const currentAnswer = answersMap[currentQ?.id] || {
    id: '',
    attempt_id: attempt.id,
    question_id: currentQ?.id,
    selected_option_ids: [],
    text_answer: '',
    is_marked_for_review: false,
    updated_at: new Date().toISOString(),
  };

  // Helper to persist answer to local state & database autosave
  const handleAnswerChange = async (payload: {
    selectedOptionIds?: string[];
    textAnswer?: string;
    isMarkedForReview?: boolean;
  }) => {
    if (!currentQ) return;
    setSaveStatus('saving');

    const updatedAns: Answer = {
      ...currentAnswer,
      selected_option_ids: payload.selectedOptionIds !== undefined ? payload.selectedOptionIds : currentAnswer.selected_option_ids,
      text_answer: payload.textAnswer !== undefined ? payload.textAnswer : currentAnswer.text_answer,
      is_marked_for_review: payload.isMarkedForReview !== undefined ? payload.isMarkedForReview : currentAnswer.is_marked_for_review,
      updated_at: new Date().toISOString(),
    };

    // Update local state map immediately for instant feedback
    const newAnswersMap = { ...answersMap, [currentQ.id]: updatedAns };
    setAnswersMap(newAnswersMap);

    // Save to Database Layer
    await dbService.saveAnswer(attempt.id, currentQ.id, payload);
    setSaveStatus('saved');
  };

  const handleSelectOption = (optionId: string) => {
    if (currentQ.question_type === 'SENTENCE_EQUIVALENCE') {
      // Multi select (up to 2 options)
      let selected = [...currentAnswer.selected_option_ids];
      if (selected.includes(optionId)) {
        selected = selected.filter((id) => id !== optionId);
      } else {
        if (selected.length >= 2) selected.shift();
        selected.push(optionId);
      }
      handleAnswerChange({ selectedOptionIds: selected });
    } else {
      // Single select toggle
      handleAnswerChange({ selectedOptionIds: [optionId] });
    }
  };

  const handleFinalSubmit = async () => {
    await dbService.submitAttempt(attempt.id, false);
    navigate(`/test/submitted/${attempt.id}`);
  };

  const answeredCount = Object.values(answersMap).filter(
    (a) => (a.selected_option_ids && a.selected_option_ids.length > 0) || (a.text_answer && a.text_answer.trim() !== '')
  ).length;

  const markedCount = Object.values(answersMap).filter((a) => a.is_marked_for_review).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* 1. Exam Top Control Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPalette(!showPalette)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 md:hidden"
              title="Toggle Question Palette"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {bundle.test.title}
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>Candidate: <strong className="text-slate-200">{attempt.candidate_name}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Autosave: {saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Countdown Timer Badge & Actions */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-colors ${
              timer.remainingSeconds < 300
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-emerald-400'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{timer.formattedTime}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Test</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${((activeQuestionIdx + 1) / allQuestions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* 2. Main Exam Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left / Center Area: Question Content View */}
        <div className="md:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 flex-1">
            {/* Question Top Sub-header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                  Q{activeQuestionIdx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {currentQ.question_type.replace('_', ' ')}
                </span>
              </div>

              <button
                onClick={() => handleAnswerChange({ isMarkedForReview: !currentAnswer.is_marked_for_review })}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  currentAnswer.is_marked_for_review
                    ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${currentAnswer.is_marked_for_review ? 'fill-amber-600 text-amber-600' : ''}`} />
                <span>{currentAnswer.is_marked_for_review ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>
            </div>

            {/* Reading Comprehension Split View */}
            {currentQ.question_type === 'READING_COMPREHENSION' && currentQ.passage ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 max-h-[450px] overflow-y-auto">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>{currentQ.passage.title || 'Reading Passage'}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                    {currentQ.passage.content}
                  </p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-slate-900 leading-snug">{currentQ.prompt}</h2>
                  {currentQ.options && (
                    <div className="space-y-2.5">
                      {currentQ.options.map((opt, idx) => {
                        const isSelected = currentAnswer.selected_option_ids.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(opt.id)}
                            className={`w-full p-3.5 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold ring-1 ring-blue-500'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-600'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-xs">{opt.option_text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Standard Question Prompt & Layout */}
                <h2 className="text-lg font-semibold text-slate-900 leading-relaxed">{currentQ.prompt}</h2>

                {/* Multiple Prompt Images Grid */}
                {(currentQ.image_urls || (currentQ.image_url ? [currentQ.image_url] : []))?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {(currentQ.image_urls || [currentQ.image_url!]).map((url, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white p-2 shadow-sm hover:shadow-md transition-all flex items-center justify-center">
                        <img src={url} alt={`Question visual ${idx + 1}`} className="max-h-56 object-contain rounded-xl" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantitative Comparison Layout */}
                {currentQ.question_type === 'QUANTITATIVE_COMPARISON' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity A</span>
                      <div className="p-4 rounded-xl bg-white border border-slate-300 text-base font-bold text-slate-900 shadow-sm space-y-3">
                        {currentQ.quantity_a && <div>{currentQ.quantity_a}</div>}
                        {(currentQ.quantity_a_images || (currentQ.quantity_a_image ? [currentQ.quantity_a_image] : []))?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(currentQ.quantity_a_images || [currentQ.quantity_a_image!]).map((url, idx) => (
                              <img key={idx} src={url} alt={`Quantity A ${idx + 1}`} className="max-h-40 object-contain rounded-lg border border-slate-200 p-1 bg-slate-50" />
                            ))}
                          </div>
                        )}
                        {!currentQ.quantity_a && !(currentQ.quantity_a_images?.length || currentQ.quantity_a_image) && <div>—</div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity B</span>
                      <div className="p-4 rounded-xl bg-white border border-slate-300 text-base font-bold text-slate-900 shadow-sm space-y-3">
                        {currentQ.quantity_b && <div>{currentQ.quantity_b}</div>}
                        {(currentQ.quantity_b_images || (currentQ.quantity_b_image ? [currentQ.quantity_b_image] : []))?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(currentQ.quantity_b_images || [currentQ.quantity_b_image!]).map((url, idx) => (
                              <img key={idx} src={url} alt={`Quantity B ${idx + 1}`} className="max-h-40 object-contain rounded-lg border border-slate-200 p-1 bg-slate-50" />
                            ))}
                          </div>
                        )}
                        {!currentQ.quantity_b && !(currentQ.quantity_b_images?.length || currentQ.quantity_b_image) && <div>—</div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Numeric Entry Input */}
                {currentQ.question_type === 'NUMERIC_ENTRY' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2 max-w-md">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Numeric Answer</label>
                    <input
                      type="number"
                      step="any"
                      value={currentAnswer.text_answer || ''}
                      onChange={(e) => handleAnswerChange({ textAnswer: e.target.value })}
                      placeholder="Type number..."
                      className="w-full p-3.5 border border-slate-300 rounded-xl text-lg font-mono font-bold bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                {/* Answer Options Grid (MC / Sentence Eq / Quant Comp) */}
                {currentQ.question_type !== 'NUMERIC_ENTRY' && currentQ.options && currentQ.options.length > 0 && (
                  <div className="space-y-3">
                    {currentQ.question_type === 'SENTENCE_EQUIVALENCE' && (
                      <p className="text-xs font-semibold text-blue-700 bg-blue-50 p-2.5 rounded-lg">
                        Instruction: Select the TWO answer choices that best complete the sentence.
                      </p>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {currentQ.options.map((opt, idx) => {
                        const isSelected = currentAnswer.selected_option_ids.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(opt.id)}
                            className={`p-4 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold ring-1 ring-blue-500 shadow-sm'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-700'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-sm">{opt.option_text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Pagination Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 px-6 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setActiveQuestionIdx(Math.max(0, activeQuestionIdx - 1))}
              disabled={activeQuestionIdx === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center space-x-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Question {activeQuestionIdx + 1} of {allQuestions.length}
            </span>

            <button
              onClick={() => setActiveQuestionIdx(Math.min(allQuestions.length - 1, activeQuestionIdx + 1))}
              disabled={activeQuestionIdx === allQuestions.length - 1}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-40 flex items-center space-x-1.5 shadow-md"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Question Palette Grid (Desktop) */}
        <div className={`md:block ${showPalette ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Question Palette</h3>
              <span className="text-xs font-semibold text-slate-500">{answeredCount}/{allQuestions.length} Answered</span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span>Marked</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span>Current</span>
              </div>
            </div>

            {/* Question Buttons Grid */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {allQuestions.map((q, idx) => {
                const ans = answersMap[q.id];
                const isAnswered = (ans?.selected_option_ids && ans.selected_option_ids.length > 0) || (ans?.text_answer && ans.text_answer.trim() !== '');
                const isMarked = ans?.is_marked_for_review;
                const isCurrent = idx === activeQuestionIdx;

                let bgClass = 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200';
                if (isCurrent) {
                  bgClass = 'bg-blue-600 text-white font-bold ring-2 ring-blue-300 border-blue-600 shadow-md';
                } else if (isMarked) {
                  bgClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-500 text-white font-bold border-emerald-500';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setActiveQuestionIdx(idx);
                      setShowPalette(false);
                    }}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Submit Assessment?</h3>
              <p className="text-xs text-slate-500">
                You have answered <strong>{answeredCount}</strong> of <strong>{allQuestions.length}</strong> questions.
                {markedCount > 0 && ` (${markedCount} marked for review)`}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 text-left space-y-1">
              <div>• Answered: <strong>{answeredCount}</strong></div>
              <div>• Unanswered: <strong>{allQuestions.length - answeredCount}</strong></div>
              <div>• Marked for review: <strong>{markedCount}</strong></div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Back to Test
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
