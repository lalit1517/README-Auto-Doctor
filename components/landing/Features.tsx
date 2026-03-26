const features = [
  {
    icon: "🤖",
    title: "AI-Powered Generation",
    description:
      "Multi-provider AI fallback rewrites your README into a polished, professional document automatically.",
    gradient: "from-[#7C6FE0] to-[#4F8EF7]",
  },
  {
    icon: "🔍",
    title: "Smart Issue Detection",
    description:
      "Scans your README for structural gaps, missing sections, and quality issues with actionable suggestions.",
    gradient: "from-[#4F8EF7] to-[#2ECAD9]",
  },
  {
    icon: "🔁",
    title: "Diff & Preview",
    description:
      "Side-by-side comparison of original vs. improved README with full diff view and live markdown preview.",
    gradient: "from-[#2ECAD9] to-[#7C6FE0]",
  },
  {
    icon: "🚀",
    title: "One-Click PR",
    description:
      "Create a pull request directly to your repository with the improved README, no manual steps needed.",
    gradient: "from-[#7C6FE0] to-[#2ECAD9]",
  },
  {
    icon: "🔐",
    title: "GitHub Integration",
    description:
      "Secure OAuth login with GitHub. Works with any public repository you have access to.",
    gradient: "from-[#4F8EF7] to-[#7C6FE0]",
  },
  {
    icon: "⚡",
    title: "Fast & Reliable",
    description:
      "AI fallback chain ensures generation succeeds even when a single provider is unavailable.",
    gradient: "from-[#2ECAD9] to-[#4F8EF7]",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 px-6 lg:px-8">
      {/* Section header */}
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2A48] bg-[#0E0E1A] px-4 py-1.5 text-xs font-medium text-[#9B9BB8] mb-5">
            Everything you need
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight text-[#F2F2FF] sm:text-5xl mb-4">
            Built for developers who ship
          </h2>
          <p className="mx-auto max-w-xl text-[#9B9BB8] text-lg leading-relaxed">
            Every feature is designed to reduce friction between writing code and
            documenting it properly.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] p-6 transition-all duration-300 hover:border-[#2A2A48] hover:bg-[#0E0E1A] hover:shadow-[0_0_40px_rgba(124,111,224,0.08)]"
            >
              {/* Subtle top-edge gradient on hover */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, #7C6FE0, transparent)`,
                }}
              />

              {/* Icon */}
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)]`}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-display text-base font-semibold text-[#F2F2FF] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#9B9BB8] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
