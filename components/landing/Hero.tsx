import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24 pb-16 lg:px-8">
      {/* Ambient glow orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #7C6FE0, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px]"
        style={{ background: "radial-gradient(circle, #2ECAD9, transparent 70%)" }}
      />

      {/* Grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid bg-[size:48px_48px] opacity-100"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A48] bg-[#0E0E1A] px-4 py-1.5 text-xs font-medium text-[#9B9BB8] mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7C6FE0] animate-pulse" />
          AI-powered documentation improvement
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl font-bold tracking-tight text-[#F2F2FF] sm:text-6xl lg:text-7xl leading-[1.08] mb-6">
          Fix Your README{" "}
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(90deg, #7C6FE0, #4F8EF7, #2ECAD9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            in Seconds
          </span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto max-w-2xl text-lg text-[#9B9BB8] leading-relaxed mb-10">
          AI-powered tool to analyze, improve, and ship better documentation
          instantly. Preview changes, inspect diffs, and create pull requests in
          one click.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/app"
            className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-7 py-3.5 text-base font-semibold text-white shadow-[0_0_30px_rgba(124,111,224,0.35)] transition-all duration-200 hover:shadow-[0_0_45px_rgba(124,111,224,0.5)] hover:scale-[1.02] active:scale-[0.98]"
          >
            Try it out — it&apos;s free
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition-transform group-hover:translate-x-0.5"
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <a
            href="https://github.com/lalit1517/README-Auto-Doctor"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl border border-[#2A2A48] bg-[#0E0E1A] px-7 py-3.5 text-base font-medium text-[#F2F2FF] transition-all duration-200 hover:border-[#7C6FE0]/50 hover:bg-[#15152A]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Mock UI Preview */}
        <div className="mt-16 mx-auto max-w-3xl">
          <div className="relative rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] p-1 shadow-[0_32px_64px_rgba(0,0,0,0.6)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E1E35]">
              <div className="h-2.5 w-2.5 rounded-full bg-[#2A2A48]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#2A2A48]" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#2A2A48]" />
              <div className="ml-4 flex-1 rounded-md bg-[#15152A] border border-[#1E1E35] px-3 py-1 text-xs text-[#5C5C7B]">
                https://github.com/owner/repository
              </div>
              <div className="rounded-md bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-3 py-1 text-xs font-medium text-white">
                Analyze
              </div>
            </div>

            {/* Mock content */}
            <div className="grid grid-cols-2 gap-px bg-[#1E1E35] p-0 rounded-xl overflow-hidden mt-px">
              {/* Left panel */}
              <div className="bg-[#0E0E1A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-[#5C5C7B] uppercase tracking-wider">
                    Original
                  </span>
                  <span className="rounded-full bg-[#1E1E35] px-2.5 py-0.5 text-xs text-[#9B9BB8]">
                    Score: 42
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-2/3 rounded-full bg-[#1E1E35]" />
                  <div className="h-2.5 w-full rounded-full bg-[#15152A]" />
                  <div className="h-2.5 w-5/6 rounded-full bg-[#15152A]" />
                  <div className="h-2.5 w-4/6 rounded-full bg-[#15152A]" />
                  <div className="mt-4 h-2.5 w-3/4 rounded-full bg-[#1E1E35]" />
                  <div className="h-2.5 w-full rounded-full bg-[#15152A]" />
                  <div className="h-2.5 w-2/3 rounded-full bg-[#15152A]" />
                </div>
              </div>

              {/* Right panel */}
              <div className="bg-[#0E0E1A] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-[#7C6FE0] uppercase tracking-wider">
                    Improved
                  </span>
                  <span className="rounded-full bg-[#7C6FE0]/10 border border-[#7C6FE0]/20 px-2.5 py-0.5 text-xs text-[#7C6FE0]">
                    Score: 94
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-[#7C6FE0]/40 to-[#4F8EF7]/40" />
                  <div className="h-2.5 w-full rounded-full bg-[#15152A]" />
                  <div className="h-2.5 w-5/6 rounded-full bg-[#15152A]" />
                  <div className="h-2.5 w-full rounded-full bg-[#15152A]" />
                  <div className="mt-4 h-2.5 w-4/5 rounded-full bg-[#1E1E35]" />
                  <div className="h-2.5 w-full rounded-full bg-[#15152A]" />
                  <div className="h-2.5 w-3/4 rounded-full bg-[#15152A]" />
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E35]">
              <div className="flex gap-2">
                <span className="rounded-lg bg-[#15152A] border border-[#1E1E35] px-3 py-1.5 text-xs text-[#9B9BB8]">
                  Preview
                </span>
                <span className="rounded-lg bg-[#7C6FE0]/10 border border-[#7C6FE0]/25 px-3 py-1.5 text-xs text-[#7C6FE0]">
                  Diff
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#2ECAD9] animate-pulse" />
                <span className="rounded-lg bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-3 py-1.5 text-xs font-medium text-white">
                  Create PR
                </span>
              </div>
            </div>
          </div>

          {/* Reflection / glow under card */}
          <div
            aria-hidden
            className="mx-8 h-8 rounded-b-2xl blur-xl opacity-30"
            style={{
              background: "linear-gradient(90deg, #7C6FE0, #4F8EF7, #2ECAD9)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
