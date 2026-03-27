import { memo, type FormEventHandler } from "react";

type InputFormProps = {
  canAnalyze: boolean;
  isBusy: boolean;
  isLoading: boolean;
  onClearSelectedRepo?: () => void;
  onRepoUrlChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  repoUrl: string;
  selectedRepoName?: string | null;
};

export const InputForm = memo(function InputForm({
  canAnalyze,
  isBusy,
  isLoading,
  onClearSelectedRepo,
  onRepoUrlChange,
  onSubmit,
  repoUrl,
  selectedRepoName,
}: InputFormProps) {
  return (
    <form
      className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] p-3 sm:flex-row sm:items-center"
      onSubmit={onSubmit}
    >
      <div className="flex flex-1 flex-col gap-2">
        {selectedRepoName ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2A2A48] bg-[#15152A]/80 px-3 py-2">
            <p className="text-xs text-[#9B9BB8]">
              Selected repository:{" "}
              <span className="font-medium text-[#F2F2FF]">{selectedRepoName}</span>
            </p>
            {onClearSelectedRepo ? (
              <button
                className="text-xs font-medium text-[#7C6FE0] transition hover:text-[#9B9BFF] disabled:cursor-not-allowed disabled:text-[#5C5C7B] disabled:opacity-60"
                disabled={isBusy}
                onClick={() => {
                  if (!isBusy) {
                    onClearSelectedRepo();
                  }
                }}
                type="button"
              >
                Use typed URL instead
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <svg
              role="presentation"
              aria-hidden="true"
              focusable="false"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5C5C7B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <input
            aria-label="GitHub repository URL"
            className="w-full rounded-xl border border-[#1E1E35] bg-[#15152A] py-3.5 pl-10 pr-4 text-sm text-[#F2F2FF] outline-none transition placeholder:text-[#5C5C7B] focus:border-[#7C6FE0]/60 focus:ring-2 focus:ring-[#7C6FE0]/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy || !!selectedRepoName}
            onChange={(event) => onRepoUrlChange(event.target.value)}
            placeholder="https://github.com/owner/repository"
            type="url"
            value={repoUrl}
          />
        </div>
      </div>

      <button
        className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,111,224,0.25)] transition-all hover:shadow-[0_0_30px_rgba(124,111,224,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canAnalyze}
        type="submit"
      >
        {isLoading ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-white/60" />
            Analyzing...
          </>
        ) : (
          <>
            <svg
              role="presentation"
              aria-hidden="true"
              focusable="false"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Analyze README
          </>
        )}
      </button>
    </form>
  );
});
