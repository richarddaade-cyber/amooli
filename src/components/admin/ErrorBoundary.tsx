import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error captured by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('preppulse_test_bundles');
    } catch (e) {}
    window.location.href = '/admin/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 select-none">
          <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-xl shadow-rose-500/10">
              <AlertTriangle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Application Error Encountered</h1>
              <p className="text-xs text-slate-400">
                An unexpected rendering issue occurred. Details are captured below:
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-rose-900/50 text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-48">
                <strong>{this.state.error.name}:</strong> {this.state.error.message}
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[11px] text-slate-500 mt-2 whitespace-pre-wrap font-mono">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => (window.location.href = '/admin/dashboard')}
                className="px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Storage & Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
