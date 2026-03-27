"use client";

import { useCallback, useEffect, useState } from "react";
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

export function ReadmeDoctorApp() {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  useEffect(() => {
    if (!canShowSidebar) {
      setIsSidebarOpen(false);
    }
  }, [canShowSidebar]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsSidebarOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSidebarOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mediaQuery.addEventListener("change", handleViewportChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      mediaQuery.removeEventListener("change", handleViewportChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen]);

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
          {/* Sidebar shown only when authenticated and selection is complete */}
          {canShowSidebar && (
            <>
              <div
                aria-hidden={!isSidebarOpen}
                className={`fixed inset-0 z-40 bg-black/65 transition-opacity duration-300 lg:hidden ${
                  isSidebarOpen
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
                onClick={() => setIsSidebarOpen(false)}
              />

              <div
                className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[calc(100vw-1rem)] p-3 transition-transform duration-300 ease-out will-change-transform lg:sticky lg:top-10 lg:z-auto lg:w-72 lg:max-w-none lg:flex-shrink-0 lg:self-start lg:translate-x-0 lg:p-0 xl:w-80 ${
                  isSidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-[105%] pointer-events-none lg:pointer-events-auto"
                }`}
              >
                <RepoSidebar
                  activeRepo={activeRepo}
                  error={reposError}
                  id="repo-sidebar"
                  isBusy={isLoadingRepos || isLoading || isCreatingPr}
                  isLoading={isLoadingRepos}
                  onClose={() => setIsSidebarOpen(false)}
                  onRefresh={() => void refreshRepos()}
                  onSelectRepo={handleSelectRepo}
                  repos={repos}
                  selectedRepos={selectedRepos}
                />
              </div>
            </>
          )}

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="w-full rounded-3xl border border-[#1E1E35] bg-[#0E0E1A]/80 p-6 shadow-[0_0_80px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.03)_inset] backdrop-blur-xl sm:p-10">
              <Header
                canToggleSidebar={canShowSidebar}
                isBusy={isBusy}
                isSidebarOpen={isSidebarOpen}
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
    </main>
  );
}
