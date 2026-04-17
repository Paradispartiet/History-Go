import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AHA Twitter',
  description: 'Project foundation for AHA Twitter'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
