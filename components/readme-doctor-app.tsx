"use client";

import { useSession } from "next-auth/react";
import { Footer } from "@/components/readme-doctor/Footer";
import { Header } from "@/components/readme-doctor/Header";
import { InputForm } from "@/components/readme-doctor/InputForm";
import { ResultDisplay } from "@/components/readme-doctor/ResultDisplay";
import { ToastRegion } from "@/components/readme-doctor/ToastRegion";
import { useReadmeGenerator } from "@/components/readme-doctor/hooks";

export function ReadmeDoctorApp() {
  const { data: session, status } = useSession();
  const {
    activityMessage,
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
  } = useReadmeGenerator(status);
  const isBusy = isLoading || isCreatingPr;

  return (
    <main className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-grid bg-[size:72px_72px] opacity-10" />

      <ToastRegion onDismiss={dismissToast} toasts={toasts} />

      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-7xl rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-glow backdrop-blur-xl sm:p-10">
          <Header isBusy={isBusy} session={session} status={status} />

          <InputForm
            canAnalyze={canAnalyze}
            isBusy={isBusy}
            isLoading={isLoading}
            onRepoUrlChange={handleRepoUrlChange}
            onSubmit={handleSubmit}
            repoUrl={repoUrl}
          />

          <ResultDisplay
            activityMessage={activityMessage}
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
      </section>
    </main>
  );
}
