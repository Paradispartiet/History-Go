import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-aha-bg text-aha-text">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl px-4 py-8">
        <main className="w-full rounded-xl border border-white/10 bg-aha-surface p-6 shadow-lg shadow-black/30">
          {children}
        </main>
      </div>
    </div>
  );
}
