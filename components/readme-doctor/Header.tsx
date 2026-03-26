import { memo } from "react";
import { signIn, signOut } from "next-auth/react";
import type { HeaderSession, SessionStatus } from "./types";

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
      <nav className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-200/80">
            README Auto Doctor
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Sign in with GitHub to connect your account before repository write features land.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {status === "authenticated" ? (
            <>
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2">
                {session?.user?.image ? (
                  <img
                    alt={session.user?.name ?? "GitHub avatar"}
                    className="h-10 w-10 rounded-full border border-white/10 object-cover"
                    referrerPolicy="no-referrer"
                    src={session.user.image}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-sky-300/10 text-sm font-semibold text-sky-100">
                    {(session?.user?.name ?? session?.user?.email ?? "G")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {session?.user?.name ?? "GitHub user"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {session?.user?.email ?? "Authenticated with GitHub"}
                  </p>
                </div>
              </div>

              <button
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isBusy}
                onClick={() => signOut()}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={status === "loading" || isBusy}
              onClick={() => signIn("github")}
              type="button"
            >
              {status === "loading" ? "Loading..." : "Login with GitHub"}
            </button>
          )}
        </div>
      </nav>

      <div className="mx-auto mt-10 max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-1 text-sm font-medium text-sky-100">
          README Auto Doctor
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Compare the original README against an AI-improved rewrite.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
          Fetch a repository README, improve it with a multi-provider AI fallback, then inspect the polished version in preview or diff mode.
        </p>
      </div>
    </>
  );
});
