'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '../utils/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logError('ErrorBoundary', { error, componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 bg-[#071B33] px-6 text-center text-white">
            <p className="text-lg font-medium">Something went wrong.</p>
            <p className="text-sm text-white/60">Please refresh the page and try again.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
