interface AppShellProps {
  title: string;
  children: React.ReactNode;
}

export function AppShell({ title, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      </header>
      <main className="mx-auto w-full max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
