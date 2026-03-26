"use client";

import { useSession } from "next-auth/react";
import { Footer } from "@/components/readme-doctor/Footer";
import { Header } from "@/components/readme-doctor/Header";
import { InputForm } from "@/components/readme-doctor/InputForm";
import { ResultDisplay } from "@/components/readme-doctor/ResultDisplay";
import { ToastRegion } from "@/components/readme-doctor/ToastRegion";
import { useReadmeGenerator } from "@/hooks";

export function ReadmeDoctorApp() {
  const { data: session, status } = useSession();
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
    <main className="relative isolate min-h-screen bg-[#07070E] overflow-hidden">
      {/* Ambient background orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -left-48 h-[700px] w-[700px] rounded-full opacity-[0.06] blur-[140px]"
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

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 sm:px-10">
        <div className="w-full rounded-3xl border border-[#1E1E35] bg-[#0E0E1A]/80 p-6 shadow-[0_0_80px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.03)_inset] backdrop-blur-xl sm:p-10">
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
