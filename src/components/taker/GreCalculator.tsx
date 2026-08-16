import React, { useState, useEffect, useCallback } from 'react';
import { X, Calculator as CalcIcon, Move } from 'lucide-react';

interface GreCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferDisplay?: (value: string) => void;
}

export const GreCalculator: React.FC<GreCalculatorProps> = ({
  isOpen,
  onClose,
  onTransferDisplay,
}) => {
  const [display, setDisplay] = useState<string>('0.');
  const [expression, setExpression] = useState<string>('');
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);
  const [isNewInput, setIsNewInput] = useState<boolean>(true);

  // Position state for dragging
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Safe expression evaluator
  const evaluateExpression = (expr: string): string => {
    try {
      // Replace symbols with JavaScript math operators
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-');

      // Basic security check: only allow digits, decimal, operators, parens, spaces
      if (/[^0-9.+\-*/() ]/.test(sanitized)) {
        return 'Error';
      }

      // Evaluate math expression
      // eslint-disable-next-line no-new-func
      const result = new Function(`return (${sanitized})`)();

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        return 'Error';
      }

      // Format clean number string
      let resStr = String(result);
      if (resStr.length > 12) {
        resStr = result.toPrecision(10).replace(/\.?0+$/, '');
      }
      if (!resStr.includes('.')) {
        resStr += '.';
      }
      return resStr;
    } catch (e) {
      return 'Error';
    }
  };

  const handleDigit = useCallback((digit: string) => {
    setDisplay((prev) => {
      let raw = prev.replace(/\.$/, '');
      if (prev === '0.' || isNewInput || prev === 'Error') {
        raw = '';
      }
      if (raw.replace('-', '').length >= 10) return prev; // max 10 digits
      const nextRaw = raw + digit;
      return nextRaw + (nextRaw.includes('.') ? '' : '.');
    });
    setIsNewInput(false);
  }, [isNewInput]);

  const handleDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (isNewInput || prev === 'Error') {
        return '0.';
      }
      if (prev.includes('.')) {
        return prev;
      }
      return prev + '.';
    });
    setIsNewInput(false);
  }, [isNewInput]);

  const handleOperator = useCallback((op: string) => {
    const currentVal = display.endsWith('.') ? display.slice(0, -1) : display;
    if (display === 'Error') return;

    setExpression((prevExpr) => {
      if (isNewInput && ['+', '-', '*', '/', '×', '÷', '−'].includes(prevExpr.trim().slice(-1))) {
        return prevExpr.trim().slice(0, -1) + ' ' + op + ' ';
      }
      return (prevExpr ? prevExpr + ' ' : '') + currentVal + ' ' + op + ' ';
    });
    setIsNewInput(true);
  }, [display, isNewInput]);

  const handleParen = useCallback((paren: '(' | ')') => {
    if (paren === '(') {
      setExpression((prev) => prev + ' ( ');
      setIsNewInput(true);
    } else {
      const currentVal = display.endsWith('.') ? display.slice(0, -1) : display;
      setExpression((prev) => prev + ' ' + currentVal + ' ) ');
      setIsNewInput(true);
    }
  }, [display]);

  const handleEquals = useCallback(() => {
    if (display === 'Error') return;
    const currentVal = display.endsWith('.') ? display.slice(0, -1) : display;
    const fullExpr = expression + currentVal;
    const result = evaluateExpression(fullExpr);
    setDisplay(result);
    setExpression('');
    setIsNewInput(true);
  }, [display, expression]);

  const handleClear = useCallback(() => {
    setDisplay('0.');
    setExpression('');
    setIsNewInput(true);
  }, []);

  const handleClearEntry = useCallback(() => {
    setDisplay('0.');
    setIsNewInput(true);
  }, []);

  const handleSquareRoot = useCallback(() => {
    const num = parseFloat(display);
    if (isNaN(num) || num < 0) {
      setDisplay('Error');
      return;
    }
    const res = Math.sqrt(num);
    let resStr = String(res);
    if (!resStr.includes('.')) resStr += '.';
    setDisplay(resStr);
    setIsNewInput(true);
  }, [display]);

  const handleToggleSign = useCallback(() => {
    if (display === '0.' || display === 'Error') return;
    setDisplay((prev) => {
      if (prev.startsWith('-')) {
        return prev.substring(1);
      }
      return '-' + prev;
    });
  }, [display]);

  // Memory Operations
  const handleMemoryAdd = useCallback(() => {
    const num = parseFloat(display);
    if (!isNaN(num)) {
      setMemory((prev) => prev + num);
      setHasMemory(true);
      setIsNewInput(true);
    }
  }, [display]);

  const handleMemoryRecall = useCallback(() => {
    let resStr = String(memory);
    if (!resStr.includes('.')) resStr += '.';
    setDisplay(resStr);
    setIsNewInput(true);
  }, [memory]);

  const handleMemoryClear = useCallback(() => {
    setMemory(0);
    setHasMemory(false);
  }, []);

  const handleTransfer = () => {
    let val = display;
    if (val.endsWith('.')) val = val.slice(0, -1);
    if (val === 'Error') return;
    if (onTransferDisplay) {
      onTransferDisplay(val);
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keyboard input if user is actively typing in a text input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '(' || e.key === ')') {
        e.preventDefault();
        handleParen(e.key as '(' | ')');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleClearEntry();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSquareRoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    handleDigit,
    handleDecimal,
    handleOperator,
    handleParen,
    handleEquals,
    handleClear,
    handleClearEntry,
    handleSquareRoot,
  ]);

  // Dragging Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-50 bg-[#c8cacb] p-3.5 rounded-2xl shadow-2xl border-2 border-[#a3a6a9] w-[270px] select-none font-sans"
    >
      {/* Top Drag & Window Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between pb-2 cursor-move border-b border-[#a3a6a9]/50 mb-2.5"
      >
        <div className="flex items-center space-x-1.5 text-slate-800 text-xs font-bold uppercase tracking-wider">
          <CalcIcon className="w-3.5 h-3.5 text-slate-700" />
          <span>GRE Calculator</span>
          {hasMemory && (
            <span className="ml-1 px-1 py-0.2 bg-slate-800 text-white text-[9px] font-bold rounded">M</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Move className="w-3.5 h-3.5 text-slate-500 cursor-move" />
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-300 text-slate-700 transition-colors"
            title="Close Calculator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Display Box */}
      <div className="bg-white border-2 border-[#94989b] rounded-lg p-2.5 mb-3 text-right shadow-inner">
        <div className="text-[10px] text-slate-400 font-mono h-3.5 overflow-hidden truncate">
          {expression}
        </div>
        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight leading-none overflow-hidden truncate">
          {display}
        </div>
      </div>

      {/* Keypad Grid (5 Cols x 5 Rows) */}
      <div className="grid grid-cols-5 gap-1.5 text-sm font-bold">
        {/* Row 1: Memory & Parens */}
        <button
          onClick={handleMemoryRecall}
          className="h-10 rounded-md bg-[#1d4264] hover:bg-[#163450] text-white shadow active:scale-95 transition-all text-xs font-bold"
        >
          MR
        </button>
        <button
          onClick={handleMemoryClear}
          className="h-10 rounded-md bg-[#1d4264] hover:bg-[#163450] text-white shadow active:scale-95 transition-all text-xs font-bold"
        >
          MC
        </button>
        <button
          onClick={handleMemoryAdd}
          className="h-10 rounded-md bg-[#1d4264] hover:bg-[#163450] text-white shadow active:scale-95 transition-all text-xs font-bold"
        >
          M+
        </button>
        <button
          onClick={() => handleParen('(')}
          className="h-10 rounded-md bg-[#3e7da3] hover:bg-[#346b8d] text-white shadow active:scale-95 transition-all text-sm font-bold"
        >
          (
        </button>
        <button
          onClick={() => handleParen(')')}
          className="h-10 rounded-md bg-[#9cb4c5] hover:bg-[#8aa4b7] text-white shadow active:scale-95 transition-all text-sm font-bold"
        >
          )
        </button>

        {/* Row 2: 7 8 9 ÷ C */}
        <button
          onClick={() => handleDigit('7')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="h-10 rounded-md bg-[#3e7da3] hover:bg-[#346b8d] text-white shadow active:scale-95 transition-all text-base font-bold"
        >
          ÷
        </button>
        <button
          onClick={handleClear}
          className="h-10 rounded-md bg-[#d36725] hover:bg-[#b8571c] text-white shadow active:scale-95 transition-all text-sm font-bold"
        >
          C
        </button>

        {/* Row 3: 4 5 6 × CE */}
        <button
          onClick={() => handleDigit('4')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('×')}
          className="h-10 rounded-md bg-[#3e7da3] hover:bg-[#346b8d] text-white shadow active:scale-95 transition-all text-base font-bold"
        >
          ×
        </button>
        <button
          onClick={handleClearEntry}
          className="h-10 rounded-md bg-[#d36725] hover:bg-[#b8571c] text-white shadow active:scale-95 transition-all text-xs font-bold"
        >
          CE
        </button>

        {/* Row 4: 1 2 3 − √ */}
        <button
          onClick={() => handleDigit('1')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('−')}
          className="h-10 rounded-md bg-[#3e7da3] hover:bg-[#346b8d] text-white shadow active:scale-95 transition-all text-base font-bold"
        >
          −
        </button>
        <button
          onClick={handleSquareRoot}
          className="h-10 rounded-md bg-[#3e7da3] hover:bg-[#346b8d] text-white shadow active:scale-95 transition-all text-base font-bold"
        >
          √
        </button>

        {/* Row 5: ± 0 . + = */}
        <button
          onClick={handleToggleSign}
          className="h-10 rounded-md bg-[#3e7da3] hover:bg-[#346b8d] text-white shadow active:scale-95 transition-all text-base font-bold"
        >
          ±
        </button>
        <button
          onClick={() => handleDigit('0')}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="h-10 rounded-md bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow active:scale-95 transition-all text-base font-bold"
        >
          .
        </button>
        <button
          onClick={() => handleOperator('+')}
          className="h-10 rounded-md bg-[#3e7da3] hover:bg-[#346b8d] text-white shadow active:scale-95 transition-all text-base font-bold"
        >
          +
        </button>
        <button
          onClick={handleEquals}
          className="h-10 rounded-md bg-[#1d4264] hover:bg-[#163450] text-white shadow active:scale-95 transition-all text-base font-bold"
        >
          =
        </button>
      </div>

      {/* Transfer Display Button */}
      <button
        onClick={handleTransfer}
        className="w-full mt-2.5 py-2.5 rounded-lg bg-[#686b6e] hover:bg-[#57595c] text-white font-bold text-sm shadow-md active:scale-95 transition-all border border-[#525457]"
      >
        Transfer Display
      </button>
    </div>
  );
};
