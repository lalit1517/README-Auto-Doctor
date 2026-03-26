import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative py-24 px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-3xl border border-[#2A2A48] bg-[#0E0E1A] px-8 py-16 text-center overflow-hidden">
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(124,111,224,0.3) 0%, transparent 65%)",
            }}
          />

          {/* Top gradient border shimmer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #7C6FE0, #4F8EF7, #2ECAD9, transparent)",
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A48] bg-[#15152A] px-4 py-1.5 text-xs font-medium text-[#9B9BB8] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2ECAD9] animate-pulse" />
              Free to use · No credit card required
            </div>

            <h2 className="font-display text-4xl font-bold tracking-tight text-[#F2F2FF] sm:text-5xl mb-5">
              Start improving your{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #7C6FE0, #4F8EF7, #2ECAD9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                README
              </span>{" "}
              today
            </h2>

            <p className="mx-auto mb-10 max-w-lg text-lg text-[#9B9BB8] leading-relaxed">
              Join developers who ship better-documented projects. One click from
              a messy README to a pull request.
            </p>

            <Link
              href="/app"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_rgba(124,111,224,0.4)] transition-all duration-200 hover:shadow-[0_0_60px_rgba(124,111,224,0.6)] hover:scale-[1.02] active:scale-[0.98]"
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
          </div>
        </div>
      </div>
    </section>
  );
}
