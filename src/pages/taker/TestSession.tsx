import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { calculateTimerStatus, TimerStatus } from '../../services/timer';
import { Attempt, TestFullDetails, Question, Answer } from '../../types/database';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  BookOpen,
  Menu,
  FileCheck,
} from 'lucide-react';

export const TestSession: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);

  // Active section tracking & section-scoped question index
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Section-level timing & intermission break states
  const [sectionStartedAt, setSectionStartedAt] = useState<string>('');
  const [isIntermission, setIsIntermission] = useState(false);
  const [breakSecondsRemaining, setBreakSecondsRemaining] = useState(120);

  // Timer state
  const [timer, setTimer] = useState<TimerStatus | null>(null);

  // Autosave feedback state ('saved' | 'saving' | 'idle')
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
      setSectionStartedAt(attData.started_at);
      setLoading(false);
    };

    load();
  }, [attemptId]);

  // Section Timer Tick & Intermission Break Loop
  useEffect(() => {
    if (!attempt || !bundle || attempt.status !== 'IN_PROGRESS' || !sectionStartedAt) return;

    if (isIntermission) {
      const breakInterval = setInterval(() => {
        setBreakSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(breakInterval);
            startNextSection();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(breakInterval);
    }

    const currentSection = (bundle.sections || [])[currentSectionIdx];
    const sectionDuration = currentSection?.duration_minutes || bundle.test.duration_minutes;

    const tick = async () => {
      const status = calculateTimerStatus(sectionStartedAt, sectionDuration);
      setTimer(status);

      if (status.isExpired) {
        // Section timer expired — auto-save & transition
        dbService.logEvent(attempt.id, 'SECTION_TIMEOUT' as any, { section_idx: currentSectionIdx });

        if (currentSectionIdx < (bundle.sections || []).length - 1) {
          setIsIntermission(true);
          setBreakSecondsRemaining(120);
        } else {
          // Final section expired — submit attempt
          await dbService.submitAttempt(attempt.id, true);
          navigate(`/test/submitted/${attempt.id}`);
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attempt, bundle, currentSectionIdx, sectionStartedAt, isIntermission]);

  const startNextSection = () => {
    if (!bundle) return;
    const nextIdx = currentSectionIdx + 1;
    if (nextIdx < (bundle.sections || []).length) {
      setCurrentSectionIdx(nextIdx);
      setActiveQuestionIdx(0);
      setSectionStartedAt(new Date().toISOString());
      setIsIntermission(false);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    if (!attempt) return;
    await dbService.submitAttempt(attempt.id, false);
    navigate(`/test/submitted/${attempt.id}`);
  };

  if (loading || !attempt || !bundle) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-slate-400 font-medium">Loading Assessment Session...</p>
        </div>
      </div>
    );
  }

  // 2-Minute Intermission Break Render Screen
  if (isIntermission) {
    const nextSection = (bundle.sections || [])[currentSectionIdx + 1];
    const breakMins = Math.floor(breakSecondsRemaining / 60);
    const breakSecs = breakSecondsRemaining % 60;
    const formattedBreak = `${String(breakMins).padStart(2, '0')}:${String(breakSecs).padStart(2, '0')}`;

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 select-none">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl text-center">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              Section {currentSectionIdx + 1} Answers Saved Automatically
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">2-Minute Scheduled Intermission</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
              Take a short rest. Rest your eyes and stretch before beginning Section {currentSectionIdx + 2}.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-2 shadow-inner">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Intermission Time Remaining</div>
            <div className="text-4xl sm:text-5xl font-mono font-extrabold text-blue-400 tracking-wider">
              {formattedBreak}
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-blue-500 h-full transition-all duration-1000"
                style={{ width: `${(breakSecondsRemaining / 120) * 100}%` }}
              />
            </div>
          </div>

          {nextSection && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-left space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Up Next</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">{nextSection.title}</span>
                <span className="text-xs font-bold bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-lg border border-blue-500/30">
                  {nextSection.duration_minutes || bundle.test.duration_minutes} Mins • {(nextSection.questions || []).length} Qs
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={startNextSection}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-2xl transition-all shadow-xl hover:shadow-blue-600/25 flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              <span>Start Section {currentSectionIdx + 2} Now</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-xs text-slate-500">Section {currentSectionIdx + 2} will automatically begin when the break timer reaches 00:00.</p>
          </div>
        </div>
      </div>
    );
  }

  // Active Section & Section-SOLEY Questions List
  const activeSection = (bundle.sections || [])[currentSectionIdx] || (bundle.sections || [])[0];
  const sectionQuestions: Question[] = (activeSection?.questions || []).map((q) => ({
    ...q,
    passage: (activeSection?.passages || []).find((p) => p.id === q.passage_id),
  }));

  // Compile total test questions for final submit modal stats
  const totalTestQuestions: Question[] = [];
  (bundle.sections || []).forEach((s) => {
    (s.questions || []).forEach((q) => totalTestQuestions.push(q));
  });

  if (sectionQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No Questions in Section {currentSectionIdx + 1}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              This section contains no active questions.
            </p>
          </div>
          <button
            onClick={() => {
              if (currentSectionIdx < (bundle.sections || []).length - 1) {
                startNextSection();
              } else {
                handleFinalSubmit();
              }
            }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg"
          >
            {currentSectionIdx < (bundle.sections || []).length - 1 ? 'Proceed to Next Section' : 'Submit Exam'}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = sectionQuestions[activeQuestionIdx] || sectionQuestions[0];
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

    const newAnswersMap = { ...answersMap, [currentQ.id]: updatedAns };
    setAnswersMap(newAnswersMap);

    await dbService.saveAnswer(attempt.id, currentQ.id, payload);
    setSaveStatus('saved');
  };

  const handleSelectOption = (optionId: string) => {
    if (currentQ.question_type === 'SENTENCE_EQUIVALENCE') {
      let selected = [...currentAnswer.selected_option_ids];
      if (selected.includes(optionId)) {
        selected = selected.filter((id) => id !== optionId);
      } else {
        if (selected.length >= 2) selected.shift();
        selected.push(optionId);
      }
      handleAnswerChange({ selectedOptionIds: selected });
    } else {
      handleAnswerChange({ selectedOptionIds: [optionId] });
    }
  };

  const totalAnsweredCount = Object.values(answersMap).filter(
    (a) => (a.selected_option_ids && a.selected_option_ids.length > 0) || (a.text_answer && a.text_answer.trim() !== '')
  ).length;

  const totalMarkedCount = Object.values(answersMap).filter((a) => a.is_marked_for_review).length;

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
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold uppercase tracking-wide">
                  Section {currentSectionIdx + 1} of {(bundle.sections || []).length}: {activeSection?.title || `Section ${currentSectionIdx + 1}`}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Candidate: <strong className="text-slate-200">{attempt.candidate_name}</strong></span>
              </div>
            </div>
          </div>

          {/* Countdown Timer Badge & Actions */}
          <div className="flex items-center space-x-3">
            {timer && (
              <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-colors ${
                timer.remainingSeconds < 300
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-emerald-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{timer.formattedTime}</span>
              </div>
            )}

            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit Test</span>
            </button>
          </div>
        </div>

        {/* Section Question Progress Bar Line */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-blue-500 h-full transition-all duration-300"
            style={{ width: `${((activeQuestionIdx + 1) / sectionQuestions.length) * 100}%` }}
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
                  {(currentQ?.question_type || 'MULTIPLE_CHOICE').replace('_', ' ')}
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
                        {(currentQ.quantity_a_images?.length || currentQ.quantity_a_image) ? (
                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {(currentQ.quantity_a_images && currentQ.quantity_a_images.length > 0 ? currentQ.quantity_a_images : [currentQ.quantity_a_image!]).map((url, idx) => (
                              <img key={idx} src={url} alt={`Quantity A ${idx + 1}`} className="max-h-52 object-contain rounded-xl border border-slate-200 p-1.5 bg-white shadow-sm" />
                            ))}
                          </div>
                        ) : null}
                        {!currentQ.quantity_a && !currentQ.quantity_a_image && (!currentQ.quantity_a_images || currentQ.quantity_a_images.length === 0) && <div>—</div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity B</span>
                      <div className="p-4 rounded-xl bg-white border border-slate-300 text-base font-bold text-slate-900 shadow-sm space-y-3">
                        {currentQ.quantity_b && <div>{currentQ.quantity_b}</div>}
                        {(currentQ.quantity_b_images?.length || currentQ.quantity_b_image) ? (
                          <div className="grid grid-cols-1 gap-2 pt-1">
                            {(currentQ.quantity_b_images && currentQ.quantity_b_images.length > 0 ? currentQ.quantity_b_images : [currentQ.quantity_b_image!]).map((url, idx) => (
                              <img key={idx} src={url} alt={`Quantity B ${idx + 1}`} className="max-h-52 object-contain rounded-xl border border-slate-200 p-1.5 bg-white shadow-sm" />
                            ))}
                          </div>
                        ) : null}
                        {!currentQ.quantity_b && !currentQ.quantity_b_image && (!currentQ.quantity_b_images || currentQ.quantity_b_images.length === 0) && <div>—</div>}
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
              Section {currentSectionIdx + 1} Question {activeQuestionIdx + 1} of {sectionQuestions.length}
            </span>

            {activeQuestionIdx < sectionQuestions.length - 1 ? (
              <button
                onClick={() => setActiveQuestionIdx(activeQuestionIdx + 1)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 flex items-center space-x-1.5 shadow-md"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : currentSectionIdx < (bundle.sections || []).length - 1 ? (
              <button
                onClick={() => {
                  setIsIntermission(true);
                  setBreakSecondsRemaining(120);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center space-x-1.5 shadow-md"
              >
                <span>Finish Section {currentSectionIdx + 1} & Start 2-Min Break</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center space-x-1.5 shadow-md"
              >
                <span>Submit Final Exam</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Section Question Palette Grid (Desktop) */}
        <div className={`md:block ${showPalette ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Section {currentSectionIdx + 1} Palette</h3>
                <p className="text-[11px] text-slate-400">{activeSection?.title}</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {sectionQuestions.filter((q) => {
                  const a = answersMap[q.id];
                  return (a?.selected_option_ids && a.selected_option_ids.length > 0) || (a?.text_answer && a.text_answer.trim() !== '');
                }).length}/{sectionQuestions.length} Answered
              </span>
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

            {/* Section Questions Buttons Grid ONLY */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {sectionQuestions.map((q, idx) => {
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
              <h3 className="text-xl font-bold text-slate-900">Submit Entire Assessment?</h3>
              <p className="text-xs text-slate-500">
                You have answered <strong>{totalAnsweredCount}</strong> of <strong>{totalTestQuestions.length}</strong> questions across all sections.
                {totalMarkedCount > 0 && ` (${totalMarkedCount} marked for review)`}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 text-left space-y-1">
              <div>• Total Answered: <strong>{totalAnsweredCount}</strong></div>
              <div>• Unanswered: <strong>{totalTestQuestions.length - totalAnsweredCount}</strong></div>
              <div>• Marked for review: <strong>{totalMarkedCount}</strong></div>
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
