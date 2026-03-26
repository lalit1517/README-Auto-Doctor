import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[#1E1E35] px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C6FE0] to-[#4F8EF7]">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 4h10M3 7h7M3 10h5"
                    stroke="#F2F2FF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="13" cy="10" r="2" fill="#2ECAD9" />
                </svg>
              </div>
              <span className="font-display font-semibold text-[#F2F2FF] text-sm">
                Readme Auto Doctor
              </span>
            </Link>
            <p className="text-sm text-[#5C5C7B] leading-relaxed">
              AI-powered tool to analyze, improve, and ship better README
              documentation instantly.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5C7B] mb-3">
                Product
              </p>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-[#9B9BB8] hover:text-[#F2F2FF] transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-sm text-[#9B9BB8] hover:text-[#F2F2FF] transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-sm text-[#9B9BB8] hover:text-[#F2F2FF] transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <Link
                    href="/app"
                    className="text-sm text-[#9B9BB8] hover:text-[#F2F2FF] transition-colors"
                  >
                    Try it out
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5C5C7B] mb-3">
                Links
              </p>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://github.com/lalit1517/README-Auto-Doctor"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[#9B9BB8] hover:text-[#F2F2FF] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-[#1E1E35] pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#5C5C7B]">
            © {new Date().getFullYear()} Readme Auto Doctor. All rights reserved.
          </p>
          <p className="text-xs text-[#5C5C7B]">
            Built by Lalit
          </p>
        </div>
      </div>
    </footer>
  );
}
