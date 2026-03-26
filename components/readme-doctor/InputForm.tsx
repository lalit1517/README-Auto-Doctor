import { memo, type FormEventHandler } from "react";

type InputFormProps = {
  canAnalyze: boolean;
  isBusy: boolean;
  isLoading: boolean;
  onRepoUrlChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  repoUrl: string;
};

export const InputForm = memo(function InputForm({
  canAnalyze,
  isBusy,
  isLoading,
  onRepoUrlChange,
  onSubmit,
  repoUrl,
}: InputFormProps) {
  return (
    <form
      className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] p-3 sm:flex-row sm:items-center"
      onSubmit={onSubmit}
    >
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <svg
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
          className="w-full rounded-xl border border-[#1E1E35] bg-[#15152A] pl-10 pr-4 py-3.5 text-sm text-[#F2F2FF] outline-none transition placeholder:text-[#5C5C7B] focus:border-[#7C6FE0]/60 focus:ring-2 focus:ring-[#7C6FE0]/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isBusy}
          onChange={(event) => onRepoUrlChange(event.target.value)}
          placeholder="https://github.com/owner/repository"
          type="url"
          value={repoUrl}
        />
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
