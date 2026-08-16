import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { QuestionBuilder } from '../../components/admin/QuestionBuilder';
import { dbService } from '../../services/db';
import { generateAccessCode } from '../../services/timer';
import {
  TestFullDetails,
  Section,
  Question,
  Passage,
  TestStatus,
  ResultVisibility,
} from '../../types/database';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Eye,
  CheckCircle,
  BookOpen,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  KeyRound,
  RefreshCw,
  Ban,
  ShieldAlert,
} from 'lucide-react';

export const TestEditor: React.FC = () => {
  const { testId } = useParams<{ testId?: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<TestFullDetails | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Active section tab index
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);

  const fallbackSec: Section & { questions: Question[]; passages: Passage[] } = {
    id: `sec-${Date.now()}-1`,
    test_id: bundle?.test?.id || 'new',
    title: 'Section 1: General Assessment',
    description: '',
    position: 1,
    created_at: new Date().toISOString(),
    passages: [],
    questions: [],
  };

  const activeSection = bundle?.sections?.[activeSectionIdx] || bundle?.sections?.[0] || fallbackSec;

  // Currently editing question state
  const [editingQuestion, setEditingQuestion] = useState<Partial<Question> | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // New passage modal state
  const [showPassageModal, setShowPassageModal] = useState(false);
  const [passageTitle, setPassageTitle] = useState('');
  const [passageContent, setPassageContent] = useState('');

  // Section Rename & Delete state
  const [isEditingSectionTitle, setIsEditingSectionTitle] = useState(false);
  const [sectionTitleInput, setSectionTitleInput] = useState('');

  const handleStartRenameSection = () => {
    if (!activeSection) return;
    setSectionTitleInput(activeSection.title);
    setIsEditingSectionTitle(true);
  };

  const handleSaveRenameSection = () => {
    if (!bundle || !sectionTitleInput.trim()) return;
    const updatedSections = [...bundle.sections];
    updatedSections[activeSectionIdx] = {
      ...activeSection,
      title: sectionTitleInput.trim(),
    };
    const newBundle = { ...bundle, sections: updatedSections };
    setBundle(newBundle);
    dbService.saveTestBundle(newBundle);
    setIsEditingSectionTitle(false);
  };

  const handleDeleteSection = async () => {
    if (!bundle) return;
    if (bundle.sections.length <= 1) {
      alert('A test must contain at least 1 section.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete section "${activeSection.title}" and all its questions?`)) {
      const sectionToDeleteId = activeSection.id;
      const updatedSections = bundle.sections.filter((_, idx) => idx !== activeSectionIdx);
      const newBundle = { ...bundle, sections: updatedSections };
      setBundle(newBundle);
      setActiveSectionIdx(0);
      await dbService.deleteSection(bundle.test.id, sectionToDeleteId);
    }
  };

  useEffect(() => {
    const loadOrCreate = async () => {
      setLoading(true);
      try {
        if (testId && testId !== 'new') {
          const data = await dbService.getTestFullDetails(testId);
          if (data) {
            setBundle(data);
          } else {
            alert('Test not found.');
            navigate('/admin/dashboard');
          }
        } else {
          // Create new draft test default template
          const newId = `test-${Date.now()}`;
          const newBundle: TestFullDetails = {
            test: {
              id: newId,
              title: 'Untitled Practice Test',
              description: 'Provide candidate test description here...',
              instructions: 'Answer all questions. Progress is autosaved automatically.',
              access_code: generateAccessCode(),
              is_code_active: true,
              duration_minutes: 30,
              status: 'DRAFT',
              max_attempts: 1,
              result_visibility: 'AFTER_SUBMISSION',
              randomize_questions: false,
              randomize_options: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            sections: [
              {
                id: `sec-${Date.now()}-1`,
                test_id: newId,
                title: 'Section 1: General Assessment',
                description: 'Primary assessment section',
                position: 1,
                created_at: new Date().toISOString(),
                passages: [],
                questions: [],
              },
            ],
          };
          setBundle(newBundle);
          dbService.saveTestBundle(newBundle).catch((err) => {
            console.warn('Initial background save notice:', err);
          });
        }
      } catch (err: any) {
        console.error('Error loading test editor:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrCreate();
  }, [testId]);

  const handleRegenerateCode = async () => {
    if (!bundle) return;
    const newCode = await dbService.regenerateAccessCode(bundle.test.id);
    setBundle({
      ...bundle,
      test: { ...bundle.test, access_code: newCode, is_code_active: true },
    });
    alert(`New Access Code Generated: ${newCode}`);
  };

  const handleInvalidateCode = async () => {
    if (!bundle) return;
    if (window.confirm('Are you sure you want to invalidate this access code? Candidates will no longer be able to join using this code.')) {
      await dbService.invalidateAccessCode(bundle.test.id);
      setBundle({
        ...bundle,
        test: { ...bundle.test, is_code_active: false },
      });
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

  const handleSaveTestMeta = async () => {
    if (!bundle.test.title.trim()) {
      alert('Please enter a test title.');
      return;
    }
    await dbService.saveTestBundle(bundle);
    alert('Test details saved successfully!');
  };

  const handleAddSection = () => {
    const newSec: Section & { questions: Question[]; passages: Passage[] } = {
      id: `sec-${Date.now()}-${bundle.sections.length + 1}`,
      test_id: bundle.test.id,
      title: `Section ${bundle.sections.length + 1}`,
      description: '',
      position: bundle.sections.length + 1,
      created_at: new Date().toISOString(),
      passages: [],
      questions: [],
    };
    const updatedSections = [...bundle.sections, newSec];
    setBundle({ ...bundle, sections: updatedSections });
    setActiveSectionIdx(updatedSections.length - 1);
  };

  const handleSaveQuestion = async (q: Question) => {
    q.section_id = activeSection.id;
    const existingIdx = activeSection.questions.findIndex((item) => item.id === q.id);

    let updatedQs = [...activeSection.questions];
    if (existingIdx >= 0) {
      updatedQs[existingIdx] = q;
    } else {
      q.position = updatedQs.length + 1;
      updatedQs.push(q);
    }

    const updatedSections = [...bundle.sections];
    updatedSections[activeSectionIdx] = {
      ...activeSection,
      questions: updatedQs,
    };

    const newBundle = { ...bundle, sections: updatedSections };
    setBundle(newBundle);
    setEditingQuestion(null);
    setIsAddingQuestion(false);

    setSaveToast('Syncing question with Supabase Database...');
    try {
      await dbService.saveTestBundle(newBundle);
      setSaveToast('Question updated and saved to Supabase successfully!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err: any) {
      setSaveToast(`Database Sync Alert: ${err.message}`);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQs = activeSection.questions
        .filter((q) => q.id !== qId)
        .map((q, idx) => ({ ...q, position: idx + 1 }));

      const updatedSections = [...bundle.sections];
      updatedSections[activeSectionIdx] = {
        ...activeSection,
        questions: updatedQs,
      };

      const newBundle = { ...bundle, sections: updatedSections };
      setBundle(newBundle);

      setSaveToast('Deleting question from Supabase Database...');
      try {
        await dbService.deleteQuestion(qId);
        await dbService.saveTestBundle(newBundle);
        setSaveToast('Question deleted and test updated in Supabase!');
        setTimeout(() => setSaveToast(null), 3000);
      } catch (err: any) {
        setSaveToast(`Database Prune Alert: ${err.message}`);
      }
    }
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activeSection.questions.length) return;

    const qs = [...activeSection.questions];
    const temp = qs[index];
    qs[index] = qs[targetIdx];
    qs[targetIdx] = temp;

    // Update position indexes
    qs.forEach((q, idx) => (q.position = idx + 1));

    const updatedSections = [...bundle.sections];
    updatedSections[activeSectionIdx] = {
      ...activeSection,
      questions: qs,
    };

    const newBundle = { ...bundle, sections: updatedSections };
    setBundle(newBundle);
    dbService.saveTestBundle(newBundle);
  };

  const handleSavePassage = () => {
    if (!passageContent.trim()) return;
    const newPassage: Passage = {
      id: `pass-${Date.now()}`,
      section_id: activeSection.id,
      title: passageTitle || `Passage ${activeSection.passages.length + 1}`,
      content: passageContent,
      position: activeSection.passages.length + 1,
      created_at: new Date().toISOString(),
    };

    const updatedSections = [...bundle.sections];
    updatedSections[activeSectionIdx] = {
      ...activeSection,
      passages: [...activeSection.passages, newPassage],
    };

    const newBundle = { ...bundle, sections: updatedSections };
    setBundle(newBundle);
    dbService.saveTestBundle(newBundle);

    setPassageTitle('');
    setPassageContent('');
    setShowPassageModal(false);
  };

  const handlePublish = async () => {
    let totalQs = 0;
    bundle.sections.forEach((s) => (totalQs += s.questions.length));
    if (totalQs === 0) {
      alert('Cannot publish a test with 0 questions. Please add questions first.');
      return;
    }
    await dbService.updateTestStatus(bundle.test.id, 'PUBLISHED');
    const updated = await dbService.getTestFullDetails(bundle.test.id);
    if (updated) setBundle(updated);
    alert('Test successfully published!');
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-16">
        {saveToast && (
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between text-xs font-semibold animate-fade-in border border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{saveToast}</span>
            </div>
            <button onClick={() => setSaveToast(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Top Sticky Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:px-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">{bundle.test.title}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {bundle.test.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">Test ID: {bundle.test.id}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/admin/tests/${bundle.test.id}/preview`)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Preview</span>
            </button>

            <button
              onClick={handleSaveTestMeta}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={handlePublish}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Publish</span>
            </button>
          </div>
        </div>

        {/* Test Settings Configuration Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Test Settings & Metadata</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Test Title</label>
              <input
                type="text"
                value={bundle.test.title}
                onChange={(e) =>
                  setBundle({ ...bundle, test: { ...bundle.test, title: e.target.value } })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Duration (Minutes)</label>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={bundle.test.duration_minutes}
                  onChange={(e) =>
                    setBundle({
                      ...bundle,
                      test: { ...bundle.test, duration_minutes: parseInt(e.target.value) || 30 },
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Result Visibility</label>
              <select
                value={bundle.test.result_visibility}
                onChange={(e) =>
                  setBundle({
                    ...bundle,
                    test: { ...bundle.test, result_visibility: e.target.value as ResultVisibility },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
              >
                <option value="AFTER_SUBMISSION">Show immediately after test submission</option>
                <option value="ADMIN_ONLY">Admin review only (Hide from candidate)</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={bundle.test.description}
                onChange={(e) =>
                  setBundle({ ...bundle, test: { ...bundle.test, description: e.target.value } })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Allowed Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bundle.test.max_attempts}
                onChange={(e) =>
                  setBundle({
                    ...bundle,
                    test: { ...bundle.test, max_attempts: parseInt(e.target.value) || 1 },
                  })
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          {/* Access Code Bounding & Admin Invalidation Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Test Access Code & Bounding Settings</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  bundle.test.is_code_active !== false
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {bundle.test.is_code_active !== false ? 'Code Active' : 'Code Invalidated'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center space-x-1"
                  title="Generate new fresh 6-character code"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Code</span>
                </button>

                {bundle.test.is_code_active !== false && (
                  <button
                    type="button"
                    onClick={handleInvalidateCode}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center space-x-1"
                    title="Invalidate access code so candidates can no longer join"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Invalidate Code</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Access Code</label>
                <div className="p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-lg text-slate-900 text-center tracking-widest">
                  {bundle.test.access_code || 'Auto-generated'}
                </div>
              </div>

              {/* Time Bounded Expiration */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Time Bounded Expiration (Optional)</label>
                <input
                  type="datetime-local"
                  value={(() => {
                    if (!bundle.test.code_expires_at) return '';
                    try {
                      const d = new Date(bundle.test.code_expires_at);
                      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
                    } catch (err) {
                      return '';
                    }
                  })()}
                  onChange={(e) => {
                    let parsedIso: string | undefined = undefined;
                    if (e.target.value) {
                      try {
                        const d = new Date(e.target.value);
                        if (!isNaN(d.getTime())) parsedIso = d.toISOString();
                      } catch (err) {}
                    }
                    setBundle({
                      ...bundle,
                      test: { ...bundle.test, code_expires_at: parsedIso },
                    });
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                />
              </div>

              {/* Number of Uses Bounded Limit */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Number of Uses Limit (Optional)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited (e.g. 50)"
                  value={bundle.test.code_max_uses !== undefined && bundle.test.code_max_uses !== null ? bundle.test.code_max_uses : ''}
                  onChange={(e) =>
                    setBundle({
                      ...bundle,
                      test: { ...bundle.test, code_max_uses: e.target.value ? parseInt(e.target.value) : undefined },
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
                />
                <div className="text-[11px] text-slate-500 text-right">
                  Current Joins: <strong>{bundle.test.code_current_uses || 0}</strong> {bundle.test.code_max_uses ? `/ ${bundle.test.code_max_uses}` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections Tabs & Management */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Test Sections</h2>
            </div>

            <button
              onClick={handleAddSection}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Section</span>
            </button>
          </div>

          <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
            {bundle.sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSectionIdx(idx);
                  setEditingQuestion(null);
                  setIsAddingQuestion(false);
                }}
                className={`px-4 py-2.5 rounded-t-xl text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  idx === activeSectionIdx
                    ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {sec.title} ({(sec.questions || []).length} Qs)
              </button>
            ))}
          </div>

          {/* Active Section Content Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-100 p-4 rounded-xl">
            <div className="flex items-center space-x-3">
              {isEditingSectionTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={sectionTitleInput}
                    onChange={(e) => setSectionTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameSection()}
                    className="px-3 py-1.5 border border-blue-500 rounded-lg text-sm font-bold bg-white text-slate-900 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveRenameSection}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingSectionTitle(false)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-base">{activeSection.title}</h3>
                    <button
                      onClick={handleStartRenameSection}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200 transition-colors"
                      title="Rename Section"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {bundle.sections.length > 1 && (
                      <button
                        onClick={handleDeleteSection}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-200 transition-colors"
                        title="Delete Section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {(activeSection.questions || []).length} questions, {(activeSection.passages || []).length} passages
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPassageModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>+ Reading Passage</span>
              </button>

              <button
                onClick={() => {
                  setEditingQuestion({});
                  setIsAddingQuestion(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Question</span>
              </button>
            </div>
          </div>

          {/* Passage Modal */}
          {showPassageModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Add Reading Comprehension Passage</h3>
                <input
                  type="text"
                  placeholder="Passage Title (e.g. Paleoclimatology & Deep Ocean Circulation)"
                  value={passageTitle}
                  onChange={(e) => setPassageTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-semibold"
                />
                <textarea
                  rows={8}
                  placeholder="Enter passage text content..."
                  value={passageContent}
                  onChange={(e) => setPassageContent(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-sans"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPassageModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePassage}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Save Passage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Question Editor vs Questions List */}
          {(isAddingQuestion || editingQuestion) ? (
            <QuestionBuilder
              question={editingQuestion || {}}
              passages={activeSection.passages || []}
              onSave={handleSaveQuestion}
              onCancel={() => {
                setEditingQuestion(null);
                setIsAddingQuestion(false);
              }}
            />
          ) : (
            <div className="space-y-4">
              {(activeSection.questions || []).length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                  <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No questions in this section yet.</p>
                  <button
                    onClick={() => {
                      setEditingQuestion({});
                      setIsAddingQuestion(true);
                    }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add First Question</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(activeSection.questions || []).map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 flex-shrink-0">
                          Q{idx + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                              {q.question_type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">({q.points} pt)</span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 line-clamp-2">{q.prompt}</p>
                          {q.options && q.options.length > 0 && (
                            <div className="text-xs text-slate-500 font-medium pt-1">
                              {q.options.length} Answer Choices • Correct: {q.options.filter((o) => o.is_correct).map((o) => o.option_text).join(', ') || 'Configured'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => handleMoveQuestion(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveQuestion(idx, 'down')}
                          disabled={idx === activeSection.questions.length - 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
