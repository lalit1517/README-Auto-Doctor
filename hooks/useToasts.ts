"use client";

import { useEffect, useRef, useState } from "react";
import type { Toast } from "@/types/readme-doctor";

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      for (const timeoutId of toastTimeoutsRef.current) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  function dismissToast(id: number) {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }

  function pushToast(toast: Omit<Toast, "id">) {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((currentToasts) => [...currentToasts, { ...toast, id }]);

    const timeoutId = window.setTimeout(() => {
      dismissToast(id);
      toastTimeoutsRef.current = toastTimeoutsRef.current.filter(
        (activeTimeoutId) => activeTimeoutId !== timeoutId,
      );
    }, 4500);

    toastTimeoutsRef.current.push(timeoutId);
  }

  return {
    dismissToast,
    pushToast,
    toasts,
  };
}
