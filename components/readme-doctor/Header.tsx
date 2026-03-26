import { memo } from "react";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import type { HeaderSession, SessionStatus } from "@/types/readme-doctor";

type HeaderProps = {
  isBusy: boolean;
  session: HeaderSession;
  status: SessionStatus;
};

export const Header = memo(function Header({
  isBusy,
  session,
  status,
}: HeaderProps) {
  return (
    <>
      {/* Top nav bar */}
      <nav className="flex flex-col gap-4 border-b border-[#1E1E35] pb-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo / back link */}
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C6FE0] to-[#4F8EF7] shadow-[0_0_12px_rgba(124,111,224,0.35)] transition-shadow group-hover:shadow-[0_0_20px_rgba(124,111,224,0.5)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 4h10M3 7h7M3 10h5"
                stroke="#F2F2FF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="13" cy="10" r="2" fill="#2ECAD9" />
            </svg>
          </div>
          <span className="font-display text-sm font-semibold text-[#F2F2FF]">
            Readme Auto Doctor
          </span>
        </Link>

        {/* Auth section */}
        <div className="flex flex-wrap items-center gap-3">
          {status === "authenticated" ? (
            <>
              <div className="inline-flex items-center gap-3 rounded-xl border border-[#1E1E35] bg-[#0E0E1A] px-3 py-2">
                {session?.user?.image ? (
                  <img
                    alt={session.user?.name ?? "GitHub avatar"}
                    className="h-8 w-8 rounded-full border border-[#2A2A48] object-cover"
                    referrerPolicy="no-referrer"
                    src={session.user.image}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2A2A48] bg-[#7C6FE0]/10 text-sm font-semibold text-[#7C6FE0]">
                    {(session?.user?.name ?? session?.user?.email ?? "G")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#F2F2FF]">
                    {session?.user?.name ?? "GitHub user"}
                  </p>
                  <p className="truncate text-xs text-[#5C5C7B]">
                    {session?.user?.email ?? "Authenticated with GitHub"}
                  </p>
                </div>
              </div>

              <button
                className="inline-flex items-center justify-center rounded-xl border border-[#1E1E35] bg-[#0E0E1A] px-4 py-2 text-sm font-medium text-[#9B9BB8] transition-all hover:border-[#2A2A48] hover:text-[#F2F2FF] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isBusy}
                onClick={() => signOut()}
                type="button"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C6FE0] to-[#4F8EF7] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,111,224,0.25)] transition-all hover:shadow-[0_0_30px_rgba(124,111,224,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={status === "loading" || isBusy}
              onClick={() => signIn("github")}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {status === "loading" ? "Loading..." : "Login with GitHub"}
            </button>
          )}
        </div>
      </nav>

      {/* Hero heading */}
      <div className="mx-auto mt-10 max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2A2A48] bg-[#0E0E1A] px-3.5 py-1 text-xs font-medium text-[#9B9BB8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7C6FE0] animate-pulse" />
          AI-powered README improvement
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-[#F2F2FF] sm:text-4xl">
          Analyze &amp; improve your{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #7C6FE0, #4F8EF7, #2ECAD9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            README
          </span>
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#9B9BB8]">
          Paste a repository URL to fetch, rewrite, and preview your README with
          AI — then ship it as a pull request.
        </p>
      </div>
    </>
  );
});
