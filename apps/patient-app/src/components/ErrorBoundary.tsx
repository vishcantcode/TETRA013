import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error Boundary caught UI exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-primary text-white">
          <div className="card max-w-md w-full p-8 text-center space-y-4 border-danger/40">
            <AlertOctagon className="w-12 h-12 text-danger mx-auto" />
            <h2 className="text-xl font-bold text-white">Application Exception Recovered</h2>
            <p className="text-xs text-secondary">
              HealthSense AI encountered an isolated UI rendering issue. Clinical data integrity and backend services remain intact.
            </p>
            <div className="bg-tertiary p-3 rounded-md text-2xs font-mono text-danger text-left overflow-x-auto">
              {this.state.error?.message || 'Unknown Error'}
            </div>
            <button className="btn btn-primary btn-md w-full flex items-center justify-center gap-2" onClick={this.handleReset}>
              <RotateCcw className="w-4 h-4" /> Reset & Reload Workstation
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
