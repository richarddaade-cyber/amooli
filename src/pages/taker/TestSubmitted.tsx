import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { evaluateQuestionAnswer } from '../../services/scoring';
import { Attempt, TestFullDetails, Question } from '../../types/database';
import { CheckCircle2, Award, BookOpen, ArrowRight, HelpCircle, FileText } from 'lucide-react';

export const TestSubmitted: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!attemptId) return;
      const attData = await dbService.getAttempt(attemptId);
      if (!attData) {
        navigate('/test/join');
        return;
      }
      const tData = await dbService.getTestFullDetails(attData.test_id);
      setAttempt(attData);
      setBundle(tData);
      setLoading(false);
    };
    load();
  }, [attemptId]);

  if (loading || !attempt || !bundle) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const showResults = bundle.test.result_visibility === 'AFTER_SUBMISSION';

  const allQuestions: Question[] = [];
  bundle.sections.forEach((s) => allQuestions.push(...s.questions));

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full bg-slate-800 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Test Successfully Submitted</h1>
          <p className="text-sm text-slate-300">
            Thank you, <strong className="text-white">{attempt.candidate_name}</strong>. Your responses have been recorded.
          </p>
        </div>

        {showResults ? (
          <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Final Score</div>
            <div className="text-4xl font-extrabold text-white">
              {attempt.score} <span className="text-lg text-slate-400 font-normal">/ {attempt.max_score}</span>
            </div>

            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {attempt.percentage}% Overall Score
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 text-slate-300 text-xs">
            Your results are under review by the test administrator.
          </div>
        )}

        {showResults && (
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Answer Review & Solutions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {allQuestions.map((q, idx) => {
                const ans = attempt.answers?.[q.id];
                const res = evaluateQuestionAnswer(q, ans);

                return (
                  <div key={q.id} className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Q{idx + 1}. {q.prompt}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {res.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    {q.explanation && (
                      <p className="text-xs text-slate-300 bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                        <strong className="text-blue-400">Solution:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-700 flex justify-center">
          <button
            onClick={() => navigate('/test/join')}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl flex items-center space-x-2"
          >
            <span>Take Another Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
