import { memo } from "react";
import type { Toast } from "@/types/readme-doctor";

type ToastRegionProps = {
  onDismiss: (id: number) => void;
  toasts: Toast[];
};

export const ToastRegion = memo(function ToastRegion({
  onDismiss,
  toasts,
}: ToastRegionProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-2.5">
      {toasts.map((toast) => (
        <div
          className={`pointer-events-auto overflow-hidden rounded-2xl border shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl ${
            toast.kind === "success"
              ? "border-[#7C6FE0]/30 bg-[#0E0E1A]/95"
              : "border-red-500/30 bg-[#0E0E1A]/95"
          }`}
          key={toast.id}
        >
          {/* Gradient top accent line */}
          <div
            className="h-0.5 w-full"
            style={{
              background:
                toast.kind === "success"
                  ? "linear-gradient(90deg, #7C6FE0, #4F8EF7, #2ECAD9)"
                  : "linear-gradient(90deg, #EF4444, #F97316)",
            }}
          />
          <div className="flex items-start justify-between gap-4 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                  toast.kind === "success"
                    ? "bg-[#7C6FE0]/15"
                    : "bg-red-500/15"
                }`}
              >
                {toast.kind === "success" ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="#7C6FE0"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M5 3v2.5M5 7h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div className="space-y-1.5">
                <p
                  className={`text-sm font-medium ${
                    toast.kind === "success" ? "text-[#F2F2FF]" : "text-red-200"
                  }`}
                >
                  {toast.message}
                </p>
                {toast.actionHref ? (
                  <a
                    className={`inline-flex text-xs font-semibold underline underline-offset-4 transition hover:opacity-80 ${
                      toast.kind === "success" ? "text-[#7C6FE0]" : "text-red-400"
                    }`}
                    href={toast.actionHref}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {toast.actionLabel ?? "Open"}
                  </a>
                ) : null}
              </div>
            </div>

            <button
              aria-label="Dismiss notification"
              className="mt-0.5 flex-shrink-0 text-xs text-[#5C5C7B] transition hover:text-[#F2F2FF]"
              onClick={() => onDismiss(toast.id)}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});
