import { memo } from "react";

const previewLabels = ["Original README", "Improved README"] as const;

export const Loader = memo(function Loader() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-mint/15 bg-mint/5 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">
            Building your README comparison
          </p>
          <p className="mt-1 text-sm text-slate-300">
            We are fetching the repository README, then rewriting it into a cleaner version.
          </p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-mint">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-mint" />
          In progress
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {previewLabels.map((label, index) => (
          <section
            className="overflow-hidden rounded-[24px] border border-white/10 bg-black/25"
            key={label}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                {label}
              </p>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  index === 0
                    ? "bg-white/10 text-slate-300"
                    : "bg-mint/10 text-mint"
                }`}
              >
                {index === 0 ? "Fetching" : "Generating"}
              </span>
            </div>
            <div className="space-y-4 p-6">
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded-full bg-white/5" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/5" />
              <div className="h-4 w-4/6 animate-pulse rounded-full bg-white/5" />
              <div className="mt-8 h-24 animate-pulse rounded-2xl bg-slate-900/70" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
});
