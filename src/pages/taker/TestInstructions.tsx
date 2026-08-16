import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../../services/db';
import { Attempt, TestFullDetails } from '../../types/database';
import { Clock, HelpCircle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export const TestInstructions: React.FC = () => {
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
        alert('Invalid attempt session.');
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  let totalQs = 0;
  bundle.sections.forEach((s) => (totalQs += s.questions.length));

  const handleStartSession = () => {
    navigate(`/test/session/${attempt.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full bg-slate-800 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-8">
        {/* Candidate Welcome */}
        <div className="border-b border-slate-700 pb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Candidate Session Confirmed</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{bundle.test.title}</h1>
          <p className="text-sm text-slate-300">Welcome, <strong className="text-white">{attempt.candidate_name}</strong></p>
        </div>

        {/* Quick Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex items-center space-x-3">
            <Clock className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Duration</div>
              <div className="text-sm font-bold text-white">{bundle.test.duration_minutes} Minutes</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Questions</div>
              <div className="text-sm font-bold text-white">{totalQs} Questions</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl flex items-center space-x-3 col-span-2 sm:col-span-1">
            <CheckCircle2 className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Autosave</div>
              <div className="text-sm font-bold text-white">Real-Time</div>
            </div>
          </div>
        </div>

        {/* Test Rules & Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Test Instructions & Policy</h3>
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 text-xs text-slate-300 space-y-3 leading-relaxed">
            <p className="whitespace-pre-line">{bundle.test.instructions || 'Answer all questions before submitting.'}</p>

            <ul className="space-y-2 border-t border-slate-800 pt-3 text-slate-400">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Timer begins immediately once you click "Start Assessment".</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>You can navigate freely between questions and mark items for review.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>All answer changes are automatically saved to the server.</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>When the timer reaches 00:00, your test will submit automatically.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={() => navigate('/test/join')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel / Back
          </button>

          <button
            onClick={handleStartSession}
            className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition-all flex items-center space-x-2"
          >
            <span>Start Assessment</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
