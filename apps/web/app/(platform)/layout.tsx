import { Navbar } from '@/components/layout/Navbar';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen aurora-bg">
      <Navbar />
      <main className="relative">{children}</main>
    </div>
  );
}
