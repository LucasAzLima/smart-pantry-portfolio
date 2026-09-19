import type { ReactNode } from "react";

function SkeletonBlock({ className }: { className: string }): ReactNode {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-zinc-200/80 ${className}`}
      aria-hidden
    />
  );
}

/**
 * Route-level loading UI while the home dashboard streams in.
 * Mirrors the light gray shell without duplicating inventory chrome.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-full flex-1 flex-col bg-[#f4f6f8] font-sans text-zinc-900"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading…</span>
      <div className="border-b border-zinc-200/80 bg-white/90">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <SkeletonBlock className="h-5 w-36 rounded-md" />
          <SkeletonBlock className="h-9 w-24 rounded-lg" />
        </div>
      </div>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-3">
          <SkeletonBlock className="h-9 w-48 sm:w-64" />
          <SkeletonBlock className="h-4 w-full max-w-xl" />
        </div>
        <SkeletonBlock className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-40 w-full" />
          <SkeletonBlock className="h-40 w-full hidden sm:block" />
        </div>
      </main>
    </div>
  );
}
