import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // @ts-ignore
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught React error caught by ErrorBoundary:', error, errorInfo);
    // @ts-ignore
    this.setState({ error, errorInfo });
  }

  private handleReset = (): void => {
    // @ts-ignore
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-900/90 text-white rounded-3xl border border-red-500/30 shadow-2xl backdrop-blur-md">
          <div className="max-w-lg text-center space-y-5">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/40 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                {/* @ts-ignore */}
                <span>{this.props.fallbackTitle || 'Component Execution Recovered'}</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                An isolated runtime issue was intercepted by HealthSense CDSS Safety Shield. The application prevented a blank screen crash.
              </p>
            </div>

            {/* @ts-ignore */}
            {this.state.error && (
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-red-950/80 text-left font-mono text-[11px] text-red-300 max-h-36 overflow-y-auto space-y-1">
                <span className="font-bold text-red-400 block">Error Trace:</span>
                {/* @ts-ignore */}
                <span>{this.state.error.toString()}</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Module
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
