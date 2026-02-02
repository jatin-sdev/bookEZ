'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-red-50 rounded-xl border border-red-100 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6 max-w-md">
        We encountered an unexpected error. Our team has been notified.
      </p>
      <div className="p-4 bg-white rounded border border-red-100 w-full max-w-md mb-6 overflow-auto text-left">
        <code className="text-xs text-red-500 font-mono">{error.message}</code>
      </div>
      <Button onClick={resetErrorBoundary} variant="outline" className="bg-white border-red-200 text-red-700 hover:bg-red-50">
        Try Again
      </Button>
    </div>
  );
}

export const GlobalErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      {children}
    </ReactErrorBoundary>
  );
};