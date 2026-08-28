import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbService } from '../../services/db';
import { OFFICIAL_GRE_ISSUE_POOL } from '../../services/greIssuePool';
import { BookOpen, KeyRound, User, ArrowRight, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const TestJoin: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accessCode.trim()) {
      setError('Please enter a valid test access code.');
      return;
    }
    if (!candidateName.trim()) {
      setError('Please enter your full name or candidate ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await dbService.getTestByAccessCode(accessCode);

      if (res.error || !res.bundle) {
        setError(res.error || 'Invalid access code or test is not currently active. Please verify your code and try again.');
        setLoading(false);
        return;
      }

      const testBundle = res.bundle;

      // Check max attempts limit
      const existingAttempts = await dbService.getTestAttempts(testBundle.test.id);
      const userAttempts = existingAttempts.filter(
        (a) => a.candidate_name.toLowerCase() === candidateName.trim().toLowerCase()
      );

      if (userAttempts.length >= testBundle.test.max_attempts) {
        const activeOne = userAttempts.find((a) => a.status === 'IN_PROGRESS');
        if (activeOne) {
          navigate(`/test/session/${activeOne.id}`);
          return;
        }
        setError(`Maximum attempt limit (${testBundle.test.max_attempts}) reached for candidate "${candidateName}".`);
        setLoading(false);
        return;
      }

      // Create new candidate attempt
      const attempt = await dbService.startAttempt(
        testBundle.test.id,
        candidateName.trim(),
        candidateEmail.trim() || undefined
      );

      navigate(`/test/instructions/${attempt.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while joining the test session.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 font-bold text-xl text-white">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <span>PrepPulse <span className="text-xs font-semibold text-slate-400 pl-1">ASSESSMENT PORTAL</span></span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Enter Test Access Code</h2>
          <p className="text-sm text-slate-400">
            Enter the access code provided by your administrator to launch your assessment.
          </p>
        </div>

        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-5">
            {/* Access Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Test Access Code</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="e.g. Q7K4P9"
                  maxLength={10}
                  className="w-full pl-4 pr-10 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-white font-mono font-bold text-lg tracking-widest uppercase placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <div className="absolute right-3.5 top-3.5 text-slate-500">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Candidate Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Candidate Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-4 pr-10 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <div className="absolute right-3.5 top-3.5 text-slate-500">
                  <User className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Optional Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address (Optional)</label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Quick Demo & GRE Writing Access Buttons */}
            <div className="pt-2 border-t border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setAccessCode('Q7K4P9');
                    setCandidateName('Candidate Demo User');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
                >
                  Quant Demo (Q7K4P9)
                </button>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>GRE Writing Topics Pool:</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setAccessCode('WRITING1');
                    setCandidateName('GRE Writing Candidate');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                >
                  WRITING1 (Sample Issue)
                </button>
                {OFFICIAL_GRE_ISSUE_POOL.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={`Topic #${t.id}: ${t.prompt}`}
                    onClick={() => {
                      setAccessCode(t.accessCode);
                      setCandidateName(`GRE Candidate (Topic #${t.id})`);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors"
                  >
                    {t.accessCode}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Join Assessment</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure exam session with server-side time tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};
