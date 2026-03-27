"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useSession } from "next-auth/react";
import { Footer } from "@/components/readme-doctor/Footer";
import { Header } from "@/components/readme-doctor/Header";
import { InputForm } from "@/components/readme-doctor/InputForm";
import { ResultDisplay } from "@/components/readme-doctor/ResultDisplay";
import { ToastRegion } from "@/components/readme-doctor/ToastRegion";
import { RepoSelectionModal } from "@/components/repos/RepoSelectionModal";
import { RepoSidebar } from "@/components/repos/RepoSidebar";
import { useReadmeGenerator, useRepos } from "@/hooks";
import type { GitHubRepo, RepoSelectionMode } from "@/types/readme-doctor";

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

export function ReadmeDoctorApp() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  const mobileSidebarTitleId = useId();
  const mobileSidebarDescriptionId = useId();
  const {
    activeRepo,
    allFetchedRepos,
    clearSelectedRepo,
    confirmSelection,
    fetchReposWithVisibility,
    isLoadingRepos,
    refreshRepos,
    repos,
    reposError,
    selectedRepo,
    selectRepo: selectRepoRaw,
    selectedRepos,
    selectionComplete,
    showSelectionModal,
  } = useRepos(status);
  const {
    canAnalyze,
    canCopyReadme,
    canCreatePr,
    dismissToast,
    error,
    handleCopyReadme,
    handleCreatePullRequest,
    handleRepoUrlChange,
    handleSubmit,
    hasReadmeComparison,
    improvedReadme,
    isCopying,
    setImprovedReadme,
    isCreatingPr,
    isLoading,
    issues,
    originalReadme,
    prError,
    prUrl,
    repoUrl,
    score,
    setViewMode,
    suggestions,
    toasts,
    viewMode,
  } = useReadmeGenerator(status, selectedRepo?.htmlUrl);

  const isBusy = isLoading || isCreatingPr;
  const isAuthenticated = status === "authenticated";
  const canShowSidebar = isAuthenticated && selectionComplete;
  const isMobileSidebarOpen = canShowSidebar && isSidebarOpen;

  useEffect(() => {
    if (!canShowSidebar) {
      setIsSidebarOpen(false);
    }
  }, [canShowSidebar]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return undefined;
    }

    const panel = mobileSidebarRef.current;
    const content = contentRef.current as InertCapableElement | null;
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsSidebarOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = content?.getAttribute("aria-hidden") ?? null;
    const previousInert = content?.inert ?? false;

    document.body.style.overflow = "hidden";
    if (content) {
      content.inert = true;
      content.setAttribute("aria-hidden", "true");
    }

    const focusableElements = panel ? getFocusableElements(panel) : [];
    (focusableElements[0] ?? panel)?.focus();

    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (content) {
        content.inert = previousInert;
        if (previousAriaHidden === null) {
          content.removeAttribute("aria-hidden");
        } else {
          content.setAttribute("aria-hidden", previousAriaHidden);
        }
      }

      mediaQuery.removeEventListener("change", handleViewportChange);

      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isMobileSidebarOpen]);

  const handleSidebarKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsSidebarOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = mobileSidebarRef.current;
      if (!panel) {
        return;
      }

      const focusableElements = getFocusableElements(panel);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
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
    },
    [],
  );

  const handleSelectRepo = useCallback(
    (repo: GitHubRepo) => {
      setIsSidebarOpen(false);
      selectRepoRaw(repo);
    },
    [selectRepoRaw],
  );

  const handleModalConfirm = useCallback(
    (mode: RepoSelectionMode, specificIds?: Set<string>) => {
      void confirmSelection(mode, specificIds);
    },
    [confirmSelection],
  );

  const handleModalFetch = useCallback(
    async (visibility?: "all" | "public" | "private") => {
      return fetchReposWithVisibility(visibility);
    },
    [fetchReposWithVisibility],
  );

  return (
    <main className="relative isolate min-h-screen overflow-clip bg-[#07070E]">
      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/65"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div
            id="repo-sidebar"
            ref={mobileSidebarRef}
            aria-describedby={mobileSidebarDescriptionId}
            aria-labelledby={mobileSidebarTitleId}
            aria-modal="true"
            className="relative z-10 h-full w-80 max-w-[calc(100vw-1rem)] p-3"
            onKeyDown={handleSidebarKeyDown}
            role="dialog"
            tabIndex={-1}
          >
            <p className="sr-only" id={mobileSidebarDescriptionId}>
              Browse repositories, refresh the list, or select a repository. Press Escape to
              close this drawer.
            </p>
            <RepoSidebar
              activeRepo={activeRepo}
              error={reposError}
              isBusy={isLoadingRepos || isLoading || isCreatingPr}
              isLoading={isLoadingRepos}
              onClose={() => setIsSidebarOpen(false)}
              onRefresh={() => void refreshRepos()}
              onSelectRepo={handleSelectRepo}
              repos={repos}
              selectedRepos={selectedRepos}
              titleId={mobileSidebarTitleId}
            />
          </div>
        </div>
      ) : null}

      <div ref={contentRef}>
        {/* Ambient background orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-48 -top-48 h-[700px] w-[700px] rounded-full opacity-[0.06] blur-[140px]"
          style={{ background: "radial-gradient(circle, #7C6FE0, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full opacity-[0.05] blur-[140px]"
          style={{ background: "radial-gradient(circle, #2ECAD9, transparent 70%)" }}
        />

        {/* Grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid bg-[size:48px_48px] opacity-100"
        />

        <ToastRegion onDismiss={dismissToast} toasts={toasts} />

        {/* Repo selection modal shown after login, before any repos load */}
        {showSelectionModal && (
          <RepoSelectionModal
            allRepos={allFetchedRepos}
            isLoadingRepos={isLoadingRepos}
            reposError={reposError}
            onConfirm={handleModalConfirm}
            onFetchRepos={handleModalFetch}
          />
        )}

        <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-10 sm:px-6 lg:px-10">
          <div className={`flex w-full gap-6 ${isAuthenticated ? "items-start" : ""}`}>
            {canShowSidebar ? (
              <div className="hidden lg:block lg:w-72 lg:flex-shrink-0 xl:w-80">
                <div className="lg:sticky lg:top-10 lg:self-start">
                  <RepoSidebar
                    activeRepo={activeRepo}
                    error={reposError}
                    isBusy={isLoadingRepos || isLoading || isCreatingPr}
                    isLoading={isLoadingRepos}
                    onRefresh={() => void refreshRepos()}
                    onSelectRepo={handleSelectRepo}
                    repos={repos}
                    selectedRepos={selectedRepos}
                  />
                </div>
              </div>
            ) : null}

            {/* Main content */}
            <div className="min-w-0 flex-1">
              <div className="w-full rounded-3xl border border-[#1E1E35] bg-[#0E0E1A]/80 p-6 shadow-[0_0_80px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.03)_inset] backdrop-blur-xl sm:p-10">
                <Header
                  canToggleSidebar={canShowSidebar}
                  isBusy={isBusy}
                  isSidebarOpen={isMobileSidebarOpen}
                  onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
                  session={session}
                  status={status}
                />

                <InputForm
                  canAnalyze={canAnalyze}
                  isBusy={isBusy}
                  isLoading={isLoading}
                  onClearSelectedRepo={clearSelectedRepo}
                  onRepoUrlChange={handleRepoUrlChange}
                  onSubmit={handleSubmit}
                  repoUrl={repoUrl}
                  selectedRepoName={selectedRepo?.fullName ?? null}
                />

                <ResultDisplay
                  canCopyReadme={canCopyReadme}
                  canCreatePr={canCreatePr}
                  error={error}
                  improvedReadme={improvedReadme}
                  isCopying={isCopying}
                  isCreatingPr={isCreatingPr}
                  isLoading={isLoading}
                  issues={issues}
                  onCopyReadme={() => void handleCopyReadme()}
                  onCreatePullRequest={() => void handleCreatePullRequest()}
                  onImprovedReadmeChange={setImprovedReadme}
                  onViewModeChange={setViewMode}
                  originalReadme={originalReadme}
                  prError={prError}
                  prUrl={prUrl}
                  score={score}
                  suggestions={suggestions}
                  viewMode={viewMode}
                />

                <Footer isVisible={!hasReadmeComparison && !isLoading} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
