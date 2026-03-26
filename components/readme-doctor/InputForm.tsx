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
      className="mx-auto mt-10 flex max-w-5xl flex-col gap-4 rounded-[28px] border border-white/10 bg-ink/60 p-4 sm:flex-row sm:items-center"
      onSubmit={onSubmit}
    >
      <input
        aria-label="GitHub repository URL"
        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-mint/70 focus:ring-2 focus:ring-mint/30 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isBusy}
        onChange={(event) => onRepoUrlChange(event.target.value)}
        placeholder="https://github.com/owner/repository"
        type="url"
        value={repoUrl}
      />
      <button
        className="inline-flex min-w-44 items-center justify-center gap-2 rounded-2xl bg-mint px-6 py-4 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={!canAnalyze}
        type="submit"
      >
        {isLoading ? (
          <>
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-ink" />
            Analyzing...
          </>
        ) : (
          "Analyze README"
        )}
      </button>
    </form>
  );
});
