const steps = [
  {
    number: "01",
    title: "Login with GitHub",
    description:
      "Authenticate securely via GitHub OAuth. Your credentials are never stored — we only use your session to create pull requests on your behalf.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Paste Repository URL",
    description:
      "Drop in any GitHub repository URL. We fetch the existing README, project files, and context to understand what your project does.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Generate & Preview",
    description:
      "AI rewrites your README and gives it a quality score. Preview the result, inspect the diff, and make any edits before shipping.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Create PR Instantly",
    description:
      "With one click, we open a pull request on your repository with the improved README. Review, merge, and you're done.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M6 21V9a9 9 0 009 9" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-6 lg:px-8 overflow-hidden">
      {/* Background accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-[0.04] blur-[100px]"
        style={{ background: "radial-gradient(circle, #7C6FE0, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A48] bg-[#0E0E1A] px-4 py-1.5 text-xs font-medium text-[#9B9BB8] mb-5">
            Simple process
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-[#F2F2FF] sm:text-5xl mb-4">
            From URL to PR in 4 steps
          </h2>
          <p className="mx-auto max-w-xl text-[#9B9BB8] text-lg leading-relaxed">
            No configuration. No learning curve. Just paste your repo URL and let
            the AI handle the rest.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Connector line for desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-8 left-0 right-0 hidden lg:block"
            style={{ height: "1px" }}
          >
            <div
              className="h-full mx-[12.5%]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #1E1E35 15%, #1E1E35 85%, transparent)",
              }}
            />
          </div>

          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-start lg:items-center lg:text-center">
              {/* Step badge */}
              <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2A2A48] bg-[#0E0E1A] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div
                  className="absolute inset-0 rounded-2xl opacity-20"
                  style={{
                    background: `linear-gradient(135deg, #7C6FE0, #4F8EF7)`,
                  }}
                />
                <span className="relative text-[#7C6FE0]">{step.icon}</span>
              </div>

              {/* Number tag */}
              <span
                className="absolute -top-2 -right-2 lg:static lg:mb-2 inline-flex h-5 w-5 lg:h-auto lg:w-auto items-center justify-center rounded-full bg-[#7C6FE0]/10 border border-[#7C6FE0]/25 px-0 lg:px-2 py-0 lg:py-0.5 text-[10px] font-bold text-[#7C6FE0] font-mono lg:text-xs"
                style={index === 0 ? {} : {}}
              >
                {step.number}
              </span>

              <h3 className="font-display text-base font-semibold text-[#F2F2FF] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#9B9BB8] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
