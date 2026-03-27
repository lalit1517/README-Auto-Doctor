import { memo } from "react";
import type { GitHubRepo } from "@/types/readme-doctor";
import { RepoItem } from "./RepoItem";

type RepoSidebarProps = {
  activeRepo: GitHubRepo | null;
  id?: string;
  repos: GitHubRepo[];
  isBusy: boolean;
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
  onSelectRepo: (repo: GitHubRepo) => void;
  onClose?: () => void;
  selectedRepos: Set<string>;
  titleId?: string;
};

export const RepoSidebar = memo(function RepoSidebar({
  activeRepo,
  id,
  repos,
  isBusy,
  isLoading,
  error,
  onRefresh,
  onSelectRepo,
  onClose,
  selectedRepos,
  titleId,
}: RepoSidebarProps) {
  return (
    <aside
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] lg:max-h-[calc(100vh-5rem)]"
      id={id}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1E1E35] bg-[#0E0E1A]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7C6FE0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
          <h2 className="text-sm font-semibold text-[#F2F2FF]" id={titleId}>
            Repositories
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Refresh repositories"
            className="rounded-lg p-1.5 text-[#5C5C7B] transition hover:bg-[#15152A] hover:text-[#9B9BB8] disabled:opacity-50"
            disabled={isBusy}
            onClick={onRefresh}
            title="Refresh repos"
            type="button"
          >
            <svg
              className={isLoading ? "animate-spin" : ""}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
          {onClose ? (
            <button
              aria-label="Close repositories sidebar"
              className="rounded-lg p-1.5 text-[#5C5C7B] transition hover:bg-[#15152A] hover:text-[#9B9BB8] lg:hidden"
              onClick={onClose}
              type="button"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Repo list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C6FE0]/30 border-t-[#7C6FE0]" />
            <p className="text-xs text-[#5C5C7B]">Loading repositories...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-red-400">{error}</p>
            <button
              className="mt-3 text-xs font-medium text-[#7C6FE0] hover:underline"
              onClick={onRefresh}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : repos.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-[#5C5C7B]">No repositories found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1E1E35]/50">
            {repos.map((repo) => {
              const isActive = activeRepo?.fullName === repo.fullName;
              return (
                <RepoItem
                  isActive={isActive}
                  isDisabled={!isActive && isBusy}
                  isSelected={selectedRepos.has(repo.fullName)}
                  key={repo.fullName}
                  onSelect={onSelectRepo}
                  repo={repo}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Footer count */}
      {!isLoading && !error && repos.length > 0 && (
        <div className="shrink-0 border-t border-[#1E1E35] px-4 py-2.5">
          <p className="text-[11px] text-[#5C5C7B]">
            {repos.length} repo{repos.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </aside>
  );
});
