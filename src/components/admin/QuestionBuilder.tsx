import React, { useState } from 'react';
import { Question, QuestionType, Option, Passage } from '../../types/database';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  HelpCircle,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  BookOpen,
  FileText,
  Loader2,
} from 'lucide-react';

interface QuestionBuilderProps {
  question: Partial<Question>;
  passages: Passage[];
  defaultType?: QuestionType;
  onSave: (updatedQuestion: Question) => void;
  onCancel: () => void;
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function filterValidImages(urls: any): string[] {
  if (!urls) return [];
  let list: any[] = [];
  if (Array.isArray(urls)) {
    list = urls;
  } else if (typeof urls === 'string') {
    if (urls.includes('|||')) {
      list = urls.split('|||');
    } else if (urls.startsWith('[') && urls.endsWith(']')) {
      try {
        list = JSON.parse(urls);
      } catch (e) {
        list = [urls];
      }
    } else {
      list = [urls];
    }
  }
  return list
    .filter((u) => typeof u === 'string' && u.trim().length > 0 && u !== 'null' && u !== 'undefined')
    .map((u) => u.trim());
}

export const QuestionBuilder: React.FC<QuestionBuilderProps> = ({
  question = {},
  passages = [],
  defaultType,
  onSave,
  onCancel,
}) => {
  const [questionType, setQuestionType] = useState<QuestionType>(
    question.question_type || defaultType || 'MULTIPLE_CHOICE'
  );
  const [prompt, setPrompt] = useState(question.prompt || '');
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    return filterValidImages(question.image_urls || question.image_url);
  });
  const [quantityA, setQuantityA] = useState(question.quantity_a || '');
  const [quantityB, setQuantityB] = useState(question.quantity_b || '');
  const [quantityAImages, setQuantityAImages] = useState<string[]>(() => {
    return filterValidImages(question.quantity_a_images || question.quantity_a_image);
  });
  const [quantityBImages, setQuantityBImages] = useState<string[]>(() => {
    return filterValidImages(question.quantity_b_images || question.quantity_b_image);
  });
  const [numericAnswer, setNumericAnswer] = useState<number | string>(
    question.numeric_answer !== undefined ? question.numeric_answer : ''
  );
  const [acceptedNumericAnswers, setAcceptedNumericAnswers] = useState<(number | string)[]>(() => {
    if (question.accepted_numeric_answers && question.accepted_numeric_answers.length > 0) {
      return question.accepted_numeric_answers;
    }
    if (question.numeric_answer !== undefined && question.numeric_answer !== null) {
      return [question.numeric_answer];
    }
    return [''];
  });
  const [numericTolerance, setNumericTolerance] = useState<number | string>(
    question.numeric_tolerance !== undefined ? question.numeric_tolerance : 0
  );
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [points, setPoints] = useState<number>(() => {
    if (question.points !== undefined) return question.points;
    if (questionType === 'ANALYTICAL_WRITING') return 6.0;
    return 1.0;
  });
  const [passageId, setPassageId] = useState<string>(question.passage_id || '');

  // Default options setup according to question type
  const [options, setOptions] = useState<Partial<Option>[]>(() => {
    if (question.options && question.options.length > 0) {
      return question.options;
    }
    if (questionType === 'QUANTITATIVE_COMPARISON') {
      return [
        { option_text: 'Quantity A is greater.', is_correct: true, position: 1 },
        { option_text: 'Quantity B is greater.', is_correct: false, position: 2 },
        { option_text: 'The two quantities are equal.', is_correct: false, position: 3 },
        { option_text: 'The relationship cannot be determined from the information given.', is_correct: false, position: 4 },
      ];
    }
    if (questionType === 'SENTENCE_EQUIVALENCE') {
      return [
        { option_text: '', is_correct: true, position: 1 },
        { option_text: '', is_correct: true, position: 2 },
        { option_text: '', is_correct: false, position: 3 },
        { option_text: '', is_correct: false, position: 4 },
        { option_text: '', is_correct: false, position: 5 },
        { option_text: '', is_correct: false, position: 6 },
      ];
    }
    return [
      { option_text: '', is_correct: true, position: 1 },
      { option_text: '', is_correct: false, position: 2 },
      { option_text: '', is_correct: false, position: 3 },
      { option_text: '', is_correct: false, position: 4 },
    ];
  });

  const handleTypeChange = (newType: QuestionType) => {
    setQuestionType(newType);
    if (newType === 'QUANTITATIVE_COMPARISON') {
      setOptions([
        { option_text: 'Quantity A is greater.', is_correct: true, position: 1 },
        { option_text: 'Quantity B is greater.', is_correct: false, position: 2 },
        { option_text: 'The two quantities are equal.', is_correct: false, position: 3 },
        { option_text: 'The relationship cannot be determined from the information given.', is_correct: false, position: 4 },
      ]);
    } else if (newType === 'SENTENCE_EQUIVALENCE' && options.length !== 6) {
      setOptions([
        { option_text: '', is_correct: true, position: 1 },
        { option_text: '', is_correct: true, position: 2 },
        { option_text: '', is_correct: false, position: 3 },
        { option_text: '', is_correct: false, position: 4 },
        { option_text: '', is_correct: false, position: 5 },
        { option_text: '', is_correct: false, position: 6 },
      ]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    try {
      const fileList = Array.from(files);
      const compressedUrls: string[] = [];

      for (const file of fileList) {
        const compressed = await compressImageFile(file);
        compressedUrls.push(compressed);
      }

      setter((prev) => [...prev, ...compressedUrls]);
    } catch (err) {
      console.error('Error compressing image upload:', err);
      alert('Failed to process image file. Please try a different image.');
    } finally {
      setIsProcessingImages(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddOption = () => {
    if (options.length >= 10) return;
    setOptions([
      ...options,
      {
        option_text: '',
        is_correct: false,
        position: options.length + 1,
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleToggleCorrectOption = (index: number) => {
    if (questionType === 'MULTIPLE_CHOICE' || questionType === 'READING_COMPREHENSION' || questionType === 'QUANTITATIVE_COMPARISON') {
      // Single select toggle
      const updated = options.map((opt, i) => ({
        ...opt,
        is_correct: i === index,
      }));
      setOptions(updated);
    } else {
      // Multi select toggle
      const updated = [...options];
      updated[index] = { ...updated[index], is_correct: !updated[index].is_correct };
      setOptions(updated);
    }
  };

  const handleSave = () => {
    if (!prompt.trim()) {
      alert('Please enter a question prompt.');
      return;
    }

    const parsedAnswers = acceptedNumericAnswers
      .map((val) => parseFloat(String(val).trim()))
      .filter((val) => !isNaN(val));

    const validPromptImages = filterValidImages(imageUrls);
    const validQAImages = filterValidImages(quantityAImages);
    const validQBImages = filterValidImages(quantityBImages);

    const qId = question.id || generateUuid();

    const compiledQuestion: Question = {
      id: qId,
      section_id: question.section_id || '',
      passage_id: passageId || undefined,
      question_type: questionType,
      prompt,
      image_url: validPromptImages[0] || undefined,
      image_urls: validPromptImages.length > 0 ? validPromptImages : undefined,
      quantity_a: questionType === 'QUANTITATIVE_COMPARISON' ? quantityA : undefined,
      quantity_b: questionType === 'QUANTITATIVE_COMPARISON' ? quantityB : undefined,
      quantity_a_image: questionType === 'QUANTITATIVE_COMPARISON' ? validQAImages[0] || undefined : undefined,
      quantity_a_images: questionType === 'QUANTITATIVE_COMPARISON' && validQAImages.length > 0 ? validQAImages : undefined,
      quantity_b_image: questionType === 'QUANTITATIVE_COMPARISON' ? validQBImages[0] || undefined : undefined,
      quantity_b_images: questionType === 'QUANTITATIVE_COMPARISON' && validQBImages.length > 0 ? validQBImages : undefined,
      numeric_answer: questionType === 'NUMERIC_ENTRY' ? parsedAnswers[0] : undefined,
      accepted_numeric_answers: questionType === 'NUMERIC_ENTRY' ? parsedAnswers : undefined,
      numeric_tolerance: questionType === 'NUMERIC_ENTRY' ? Number(numericTolerance) : undefined,
      explanation,
      points,
      position: question.position || 1,
      created_at: question.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: (questionType === 'NUMERIC_ENTRY' || questionType === 'ANALYTICAL_WRITING') ? [] : options.map((opt, idx) => ({
        id: opt.id || generateUuid(),
        question_id: qId,
        option_text: opt.option_text || '',
        image_url: opt.image_url,
        is_correct: !!opt.is_correct,
        position: idx + 1,
      })),
    };

    onSave(compiledQuestion);
  };

  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {question.id ? 'Edit Question' : 'Create New Question'}
            </h3>
            <p className="text-xs text-slate-500">Configure prompt, options, correct answers, and explanations</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5">
            <span>Points:</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={points}
              onChange={(e) => setPoints(parseFloat(e.target.value) || 1)}
              className="w-16 px-2 py-1 border border-slate-300 rounded-lg text-center font-bold text-sm bg-slate-50"
            />
          </label>
        </div>
      </div>

      {/* 1. Question Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Question Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
          {[
            { id: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
            { id: 'QUANTITATIVE_COMPARISON', label: 'Quant Comparison' },
            { id: 'NUMERIC_ENTRY', label: 'Numeric Entry' },
            { id: 'SENTENCE_EQUIVALENCE', label: 'Sentence Equivalence' },
            { id: 'READING_COMPREHENSION', label: 'Reading Comp' },
            { id: 'TEXT_COMPLETION', label: 'Text Completion' },
            { id: 'ANALYTICAL_WRITING', label: 'GRE Essay (Writing)' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeChange(type.id as QuestionType)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                questionType === type.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reading Comprehension Passage Selector */}
      {questionType === 'READING_COMPREHENSION' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Associated Passage</span>
          </label>
          <select
            value={passageId}
            onChange={(e) => setPassageId(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white text-slate-800"
          >
            <option value="">-- Select Reading Passage --</option>
            {passages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || `Passage #${p.position}`} ({p.content.substring(0, 40)}...)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Analytical Writing Notice Banner */}
      {questionType === 'ANALYTICAL_WRITING' && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-center space-x-2 shadow-sm">
          <Sparkles className="w-4.5 h-4.5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>GRE Analytical Writing Task:</strong> Only enter the Essay Prompt statement below. Options, answer choices, and numeric keys are omitted. Gemini AI evaluates candidate essays automatically on the official 0.0–6.0 scale upon submission.
          </span>
        </div>
      )}

      {/* 2. Question Prompt */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {questionType === 'ANALYTICAL_WRITING' ? 'Essay Issue Prompt Statement' : 'Question Prompt / Text'}
          </label>
          {questionType !== 'ANALYTICAL_WRITING' && (
            <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1.5 border border-blue-200 bg-blue-50/50 px-3 py-1 rounded-lg">
              <ImageIcon className="w-4 h-4" />
              <span>+ Add Prompt Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleMultipleImagesUpload(e, setImageUrls)}
              />
            </label>
          )}
        </div>

        <textarea
          rows={questionType === 'ANALYTICAL_WRITING' ? 4 : 3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            questionType === 'ANALYTICAL_WRITING'
              ? 'Enter the GRE Essay Issue Prompt statement here (e.g., As people rely more and more on technology to solve problems, the ability of humans to think for themselves will surely deteriorate.)'
              : 'Enter or paste your question text here...'
          }
          className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />

        {/* Well-spaced Prompt Images Grid */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative group border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                <img src={url} alt={`Prompt visual ${idx + 1}`} className="w-full h-32 object-contain p-2" />
                <button
                  type="button"
                  onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                  className="absolute top-1.5 right-1.5 bg-slate-900/80 text-white rounded-full p-1 hover:bg-rose-600 transition-colors shadow-md"
                  title="Remove Image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Type-Specific Configurator */}
      {questionType === 'QUANTITATIVE_COMPARISON' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
          {/* Quantity A */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quantity A</label>
              <label className="cursor-pointer text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Add Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMultipleImagesUpload(e, setQuantityAImages)}
                />
              </label>
            </div>
            <textarea
              rows={2}
              value={quantityA}
              onChange={(e) => setQuantityA(e.target.value)}
              placeholder="e.g. (x + y)²"
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
            />
            {quantityAImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 bg-white p-3 border border-slate-200 rounded-xl">
                {quantityAImages.map((url, idx) => (
                  <div key={idx} className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <img src={url} alt={`Quantity A visual ${idx + 1}`} className="w-full h-24 object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => setQuantityAImages(quantityAImages.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-1 hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantity B */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quantity B</label>
              <label className="cursor-pointer text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Add Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMultipleImagesUpload(e, setQuantityBImages)}
                />
              </label>
            </div>
            <textarea
              rows={2}
              value={quantityB}
              onChange={(e) => setQuantityB(e.target.value)}
              placeholder="e.g. 49"
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white"
            />
            {quantityBImages.length > 0 && (
              <div className="grid grid-cols-2 gap-2 bg-white p-3 border border-slate-200 rounded-xl">
                {quantityBImages.map((url, idx) => (
                  <div key={idx} className="relative group border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <img src={url} alt={`Quantity B visual ${idx + 1}`} className="w-full h-24 object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => setQuantityBImages(quantityBImages.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-1 hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {questionType === 'NUMERIC_ENTRY' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Accepted Numeric Right Answers</label>
              <p className="text-[11px] text-slate-500">Input one or multiple acceptable correct numeric answers (e.g. 42, 42.0, 42.5)</p>
            </div>
            <button
              type="button"
              onClick={() => setAcceptedNumericAnswers([...acceptedNumericAnswers, ''])}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 border border-blue-200 bg-white px-3 py-1 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Answer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {acceptedNumericAnswers.map((ans, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-white p-2 border border-slate-300 rounded-lg">
                <span className="text-xs font-bold text-slate-400 pl-1">{idx + 1}.</span>
                <input
                  type="number"
                  step="any"
                  value={ans}
                  onChange={(e) => {
                    const updated = [...acceptedNumericAnswers];
                    updated[idx] = e.target.value;
                    setAcceptedNumericAnswers(updated);
                  }}
                  placeholder="e.g. 42"
                  className="flex-1 p-1 border-0 text-sm font-mono font-bold text-slate-900 focus:ring-0 outline-none"
                />
                {acceptedNumericAnswers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = acceptedNumericAnswers.filter((_, i) => i !== idx);
                      setAcceptedNumericAnswers(updated);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              Acceptable Tolerance (±):
            </label>
            <input
              type="number"
              step="any"
              value={numericTolerance}
              onChange={(e) => setNumericTolerance(e.target.value)}
              placeholder="e.g. 0.01"
              className="w-32 p-2 border border-slate-300 rounded-lg text-sm bg-white font-mono font-bold"
            />
            <span className="text-xs text-slate-500">Allows small rounding margins (e.g. ±0.01)</span>
          </div>
        </div>
      )}

      {/* 4. Options List (for MC / Quant Comparison / Sentence Eq) */}
      {questionType !== 'NUMERIC_ENTRY' && questionType !== 'ANALYTICAL_WRITING' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Answer Options {questionType === 'SENTENCE_EQUIVALENCE' && '(Select 2 Correct Answers)'}
            </label>

            {questionType === 'MULTIPLE_CHOICE' && options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                  opt.is_correct
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleCorrectOption(idx)}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                    opt.is_correct
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white hover:border-emerald-500'
                  }`}
                  title="Click to toggle as correct answer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <span className="font-bold text-sm text-slate-700 w-6 text-center">
                  {String.fromCharCode(65 + idx)}.
                </span>

                <input
                  type="text"
                  value={opt.option_text || ''}
                  onChange={(e) => {
                    const updated = [...options];
                    updated[idx].option_text = e.target.value;
                    setOptions(updated);
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)} content...`}
                  className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white"
                />

                {questionType === 'MULTIPLE_CHOICE' && options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Specific Directions / Explanation */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {questionType === 'ANALYTICAL_WRITING' ? 'Specific Task Directions (Optional)' : 'Answer Explanation'}
        </label>
        <textarea
          rows={questionType === 'ANALYTICAL_WRITING' ? 3 : 2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={
            questionType === 'ANALYTICAL_WRITING'
              ? 'e.g. Write a response in which you discuss the extent to which you agree or disagree with the statement and explain your reasoning for the position you take...'
              : 'Provide step-by-step solution or explanation for candidate review...'
          }
          className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isProcessingImages}
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center space-x-2 ${
            isProcessingImages
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20 active:scale-95'
          }`}
        >
          {isProcessingImages ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Images...</span>
            </>
          ) : (
            <span>Save Question</span>
          )}
        </button>
      </div>
    </div>
  );
};
