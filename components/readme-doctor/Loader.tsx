import { memo } from "react";

const previewLabels = ["Original README", "Improved README"] as const;

export const Loader = memo(function Loader() {
  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#7C6FE0]/20 bg-[#7C6FE0]/[0.06] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-[#F2F2FF]">
            Building your README comparison
          </p>
          <p className="mt-1 text-xs text-[#9B9BB8]">
            Fetching the repository README and rewriting it with AI.
          </p>
        </div>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="inline-flex items-center gap-2.5 rounded-full border border-[#2A2A48] bg-[#0E0E1A] px-4 py-2 text-xs font-medium text-[#7C6FE0]"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#7C6FE0]" />
          In progress
        </div>
      </div>

      {/* Skeleton panels */}
      <div className="grid gap-4 lg:grid-cols-2">
        {previewLabels.map((label, index) => (
          <section
            className="overflow-hidden rounded-2xl border border-[#1E1E35] bg-[#0E0E1A]"
            key={label}
          >
            <div className="flex items-center justify-between border-b border-[#1E1E35] px-5 py-3.5">
              <p className="text-xs font-medium uppercase tracking-widest text-[#5C5C7B]">
                {label}
              </p>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  index === 0
                    ? "bg-[#1E1E35] text-[#9B9BB8]"
                    : "bg-[#7C6FE0]/10 text-[#7C6FE0] border border-[#7C6FE0]/20"
                }`}
              >
                {index === 0 ? "Fetching" : "Generating"}
              </span>
            </div>
            <div className="space-y-3 p-6">
              <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-[#1E1E35]" />
              <div className="h-3 w-full animate-pulse rounded-full bg-[#15152A]" />
              <div className="h-3 w-5/6 animate-pulse rounded-full bg-[#15152A]" />
              <div className="h-3 w-4/6 animate-pulse rounded-full bg-[#15152A]" />
              <div className="mt-6 h-3 w-3/4 animate-pulse rounded-full bg-[#1E1E35]" />
              <div className="h-3 w-full animate-pulse rounded-full bg-[#15152A]" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#15152A]" />
              <div className="mt-6 h-20 animate-pulse rounded-xl bg-[#15152A]" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
});
