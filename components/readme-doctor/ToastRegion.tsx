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
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${
            toast.kind === "success"
              ? "border-mint/30 bg-slate-950/90 text-mint"
              : "border-red-400/30 bg-slate-950/90 text-red-200"
          }`}
          key={toast.id}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{toast.message}</p>
              {toast.actionHref ? (
                <a
                  className="inline-flex text-sm font-semibold underline underline-offset-4 hover:text-white"
                  href={toast.actionHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  {toast.actionLabel ?? "Open"}
                </a>
              ) : null}
            </div>

            <button
              aria-label="Dismiss notification"
              className="text-sm text-slate-400 transition hover:text-white"
              onClick={() => onDismiss(toast.id)}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});
