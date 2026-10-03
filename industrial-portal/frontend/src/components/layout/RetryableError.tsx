import React from 'react';

interface RetryableErrorProps {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
  title?: string;
}

export const RetryableError: React.FC<RetryableErrorProps> = ({
  message,
  onRetry,
  retrying = false,
  title = 'Unable to load this section',
}) => (
  <div
    role="alert"
    className="bg-[#450a0a]/80 border border-[#dc2626] rounded p-4 text-xs text-red-200 flex flex-wrap items-center justify-between gap-3"
  >
    <div>
      <p className="font-bold text-red-300">{title}</p>
      <p className="mt-1">{message}</p>
    </div>
    <button
      type="button"
      onClick={onRetry}
      disabled={retrying}
      className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 text-white rounded text-[11px] font-semibold tracking-wider uppercase transition-colors"
    >
      {retrying ? 'Retrying...' : 'Retry'}
    </button>
  </div>
);
