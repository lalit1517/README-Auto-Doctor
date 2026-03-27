import { memo } from "react";
import type { GitHubRepo } from "@/types/readme-doctor";

type RepoItemProps = {
  isActive: boolean;
  isDisabled: boolean;
  isSelected: boolean;
  onSelect: (repo: GitHubRepo) => void;
  repo: GitHubRepo;
};

export const RepoItem = memo(function RepoItem({
  isActive,
  isDisabled,
  isSelected,
  onSelect,
  repo,
}: RepoItemProps) {
  return (
    <div
      aria-disabled={isDisabled}
      className={`group flex items-center gap-3 px-4 py-2.5 transition-all duration-200 border-l-2 ${
        isActive
          ? "border-l-[#7C6FE0] bg-[#7C6FE0]/[0.08] cursor-default"
          : isDisabled
            ? "border-l-transparent opacity-40 cursor-not-allowed"
            : "border-l-transparent hover:bg-[#15152A]/60 hover:border-l-[#2A2A48] cursor-pointer"
      }`}
      onClick={() => {
        if (!isDisabled) onSelect(repo);
      }}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => {
        if (isDisabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(repo);
        }
      }}
    >
      {/* Repo info */}
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium transition-colors ${
            isActive
              ? "text-[#F2F2FF]"
              : isDisabled
                ? "text-[#5C5C7B]"
                : "text-[#9B9BB8] group-hover:text-[#F2F2FF]"
          }`}
          title={repo.fullName}
        >
          {repo.name}
        </p>
        <p className="truncate text-[11px] text-[#5C5C7B]" title={repo.fullName}>
          {repo.fullName}
        </p>
      </div>

      {/* Visibility badge */}
      <span
        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
          repo.isPrivate
            ? "bg-amber-500/10 text-amber-400"
            : "bg-emerald-500/10 text-emerald-400"
        }`}
      >
        {repo.isPrivate ? "Private" : "Public"}
      </span>
    </div>
  );
});
