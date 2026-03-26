import { memo } from "react";

type ErrorDisplayProps = {
  message: string;
};

export const ErrorDisplay = memo(function ErrorDisplay({
  message,
}: ErrorDisplayProps) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4">
      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 3v3M5 7.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-red-300 leading-relaxed">{message}</p>
    </div>
  );
});
