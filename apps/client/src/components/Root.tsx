import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { publicUrl } from '@/helpers/publicUrl.ts';

function ErrorBoundaryError({ error }: { error: unknown }) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : 'An unknown error occurred';

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6">
      <div className="glass-card max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-white/50 text-sm mb-4">
          The application encountered an unexpected error. Please refresh the page to try again.
        </p>
        <code className="block p-3 rounded-lg bg-black/30 text-red-300 text-xs break-all">
          {errorMessage}
        </code>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-[#276bf5] hover:bg-[#276bf5]/80 text-white rounded-xl font-medium transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <TonConnectUIProvider
        manifestUrl={publicUrl('tonconnect-manifest.json')}
      >
        <App />
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}
