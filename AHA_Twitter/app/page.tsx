import Link from 'next/link';
import { AppShell } from '@/components/AppShell';

export default function HomePage() {
  return (
    <AppShell title="AHA Twitter">
      <p className="text-slate-300">Prosjektfundamentet er satt opp.</p>
      <Link className="mt-4 inline-block text-sky-400 hover:underline" href="/feed">
        Gå til FeedPage
      </Link>
    </AppShell>
  );
}
