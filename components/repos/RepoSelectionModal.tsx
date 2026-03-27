"use client";

import { memo, useEffect, useId, useRef, useState, type RefObject } from "react";
import type {
  FetchReposResult,
  GitHubRepo,
  RepoSelectionMode,
} from "@/types/readme-doctor";

type RepoSelectionModalProps = {
  allRepos: GitHubRepo[];
  isLoadingRepos: boolean;
  reposError: string;
  onConfirm: (mode: RepoSelectionMode, selectedIds?: Set<string>) => void;
  onFetchRepos: (
    visibility?: "all" | "public" | "private",
  ) => Promise<FetchReposResult>;
};

const modeOptions: { value: RepoSelectionMode; label: string; description: string }[] = [
  { value: "all", label: "All Repositories", description: "Load all your public and private repos" },
  { value: "public", label: "Public Only", description: "Load only your public repositories" },
  { value: "private", label: "Private Only", description: "Load only your private repositories" },
  { value: "specific", label: "Select Specific", description: "Pick individual repositories to load" },
];

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

type InertCapableElement = HTMLElement & {
  inert?: boolean;
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1,
  );
}

function useModalA11y(panelRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const overlay = panel.parentElement;
    const siblings = overlay?.parentElement
      ? Array.from(overlay.parentElement.children).filter((element) => element !== overlay)
      : [];
    const siblingState = siblings.map((element) => {
      const htmlElement = element as InertCapableElement;
      const previousAriaHidden = htmlElement.getAttribute("aria-hidden");
      const previousInert = htmlElement.inert;
      htmlElement.inert = true;
      htmlElement.setAttribute("aria-hidden", "true");
      return { element: htmlElement, previousAriaHidden, previousInert };
    });

    const focusableElements = getFocusableElements(panel);
    (focusableElements[0] ?? panel).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const elements = getFocusableElements(panel);
      if (elements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (activeElement === first || !panel.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (activeElement === last || !panel.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      siblingState.forEach(({ element, previousAriaHidden, previousInert }) => {
        element.inert = previousInert;
        if (previousAriaHidden === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", previousAriaHidden);
        }
      });

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [panelRef]);
}

export const RepoSelectionModal = memo(function RepoSelectionModal({
  allRepos,
  isLoadingRepos,
  reposError,
  onConfirm,
  onFetchRepos,
}: RepoSelectionModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [mode, setMode] = useState<RepoSelectionMode | null>(null);
  const [specificSelected, setSpecificSelected] = useState<Set<string>>(new Set());
  const [showSpecificPicker, setShowSpecificPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useModalA11y(panelRef);

  function handleModeSelect(selected: RepoSelectionMode) {
    setMode(selected);

    if (selected === "specific") {
      setShowSpecificPicker(true);
      void onFetchRepos("all");
    } else {
      setShowSpecificPicker(false);
    }
  }

  function handleConfirm() {
    if (!mode) return;

    if (mode === "specific") {
      onConfirm(mode, specificSelected);
    } else {
      onConfirm(mode);
    }
  }

  function toggleSpecificRepo(fullName: string) {
    setSpecificSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fullName)) {
        next.delete(fullName);
      } else {
        next.add(fullName);
      }
      return next;
    });
  }

  const filteredRepos = searchQuery
    ? allRepos.filter((r) =>
        r.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allRepos;

  const canConfirm =
    mode !== null && (mode !== "specific" || specificSelected.size > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        ref={panelRef}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        className="mx-4 w-full max-w-lg rounded-2xl border border-[#1E1E35] bg-[#0E0E1A] shadow-[0_0_80px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="border-b border-[#1E1E35] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C6FE0]/10">
              <svg
                width="20"
                height="20"
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
            </div>
            <div>
              <h2 id={titleId} className="text-base font-semibold text-[#F2F2FF]">
                Choose Repositories
              </h2>
              <p className="mt-0.5 text-xs text-[#5C5C7B]">
                Select which repositories to load into your workspace
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {isLoadingRepos && !showSpecificPicker ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7C6FE0]/30 border-t-[#7C6FE0]" />
              <p className="text-xs text-[#5C5C7B]">
                Loading {mode === "public" ? "public" : mode === "private" ? "private" : ""} repositories...
              </p>
            </div>
          ) : !showSpecificPicker ? (
            <div className="grid gap-2.5">
              {modeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleModeSelect(option.value)}
                  className={`group flex items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-200 ${
                    mode === option.value
                      ? "border-[#7C6FE0] bg-[#7C6FE0]/[0.08] shadow-[0_0_16px_rgba(124,111,224,0.12)]"
                      : "border-[#1E1E35] bg-[#07070E] hover:border-[#2A2A48] hover:bg-[#15152A]/60"
                  }`}
                >
                  {/* Radio indicator */}
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      mode === option.value
                        ? "border-[#7C6FE0]"
                        : "border-[#2A2A48] group-hover:border-[#5C5C7B]"
                    }`}
                  >
                    {mode === option.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-[#7C6FE0]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        mode === option.value
                          ? "text-[#F2F2FF]"
                          : "text-[#9B9BB8] group-hover:text-[#F2F2FF]"
                      }`}
                    >
                      {option.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[#5C5C7B]">
                      {option.description}
                    </p>
                  </div>
                </button>
              ))}
              {reposError && (
                <div className="px-4 py-2">
                  <p className="text-xs text-red-400">{reposError}</p>
                </div>
              )}
            </div>
          ) : (
            /* Specific repo picker */
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowSpecificPicker(false);
                  setMode(null);
                }}
                className="mb-4 flex items-center gap-1.5 text-xs font-medium text-[#7C6FE0] hover:text-[#9B8FFF] transition-colors"
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back to options
              </button>

              {/* Search */}
              <div className="relative mb-3">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5C7B]"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  placeholder="Search repositories..."
                  aria-label="Search repositories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#1E1E35] bg-[#07070E] py-2 pl-9 pr-3 text-xs text-[#F2F2FF] placeholder-[#5C5C7B] outline-none transition-colors focus:border-[#7C6FE0]"
                />
              </div>

              {/* Repo list */}
              <div className="max-h-64 overflow-y-auto rounded-xl border border-[#1E1E35] bg-[#07070E]">
                {isLoadingRepos ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#7C6FE0]/30 border-t-[#7C6FE0]" />
                    <p className="text-xs text-[#5C5C7B]">
                      Loading repositories...
                    </p>
                  </div>
                ) : reposError ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-red-400">{reposError}</p>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-[#5C5C7B]">
                      {searchQuery
                        ? "No repositories match your search."
                        : "No repositories found."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1E1E35]/50">
                    {filteredRepos.map((repo) => (
                      <label
                        key={repo.fullName}
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#15152A]/60"
                      >
                        <input
                          type="checkbox"
                          checked={specificSelected.has(repo.fullName)}
                          onChange={() => toggleSpecificRepo(repo.fullName)}
                          className="h-3.5 w-3.5 flex-shrink-0 rounded border-[#2A2A48] bg-[#07070E] text-[#7C6FE0] accent-[#7C6FE0] cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#9B9BB8]">
                            {repo.name}
                          </p>
                          <p className="truncate text-[11px] text-[#5C5C7B]">
                            {repo.fullName}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            repo.isPrivate
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}
                        >
                          {repo.isPrivate ? "Private" : "Public"}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {specificSelected.size > 0 && (
                <p className="mt-2 text-[11px] text-[#7C6FE0]">
                  {specificSelected.size}{" "}
                  {specificSelected.size === 1 ? "repository" : "repositories"}{" "}
                  selected
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#1E1E35] px-6 py-4">
          <button
            type="button"
            disabled={!canConfirm || isLoadingRepos || !!reposError}
            onClick={handleConfirm}
            className="rounded-xl bg-[#7C6FE0] px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_16px_rgba(124,111,224,0.25)] transition-all hover:bg-[#6B5ED0] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            {mode === "specific"
              ? `Load ${specificSelected.size} Repo${specificSelected.size !== 1 ? "s" : ""}`
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
});
