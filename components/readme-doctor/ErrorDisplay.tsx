import { memo } from "react";

type ErrorDisplayProps = {
  message: string;
};

export const ErrorDisplay = memo(function ErrorDisplay({
  message,
}: ErrorDisplayProps) {
  return (
    <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {message}
    </p>
  );
});
