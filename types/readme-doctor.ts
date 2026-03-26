import type { Session } from "next-auth";

export type AnalyzeResponse = {
  error?: string;
  improved?: string;
  issues?: string[];
  original?: string | null;
  score?: number;
  structureExplanation?: string;
  suggestions?: string[];
};

export type CreatePrResponse = {
  error?: string;
  prUrl?: string;
};

export type Toast = {
  actionHref?: string;
  actionLabel?: string;
  id: number;
  kind: "error" | "success";
  message: string;
};

export type ViewMode = "preview" | "diff";

export type SessionStatus = "authenticated" | "loading" | "unauthenticated";

export type HeaderSession = Session | null;
