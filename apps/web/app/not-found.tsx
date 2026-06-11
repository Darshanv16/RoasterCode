import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const ASCII_404 = `
 ██████╗  ██████╗ ██╗  ██╗
██╔═══██╗██╔═══██╗██║  ██║
██║   ██║██║   ██║███████║
██║   ██║██║   ██║╚════██║
╚██████╔╝╚██████╔╝     ██║
 ╚═════╝  ╚═════╝      ╚═╝
`.trim();

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background aurora-bg flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 grid-bg animate-grid-drift opacity-40" />

      <div className="relative z-10 text-center max-w-lg">
        <pre className="font-mono text-xs sm:text-sm text-accent/60 mb-8 leading-tight whitespace-pre overflow-x-auto">
          {ASCII_404}
        </pre>

        <h1 className="text-6xl sm:text-8xl font-bold font-mono text-gradient mb-4">404</h1>

        <p className="text-xl text-text-primary font-semibold mb-2">
          This problem doesn&apos;t exist yet
        </p>
        <p className="text-text-muted mb-8">
          The page you&apos;re looking for was deleted, moved, or never compiled in the first place.
        </p>

        <Link href="/problems">
          <Button className="text-base px-8">
            ← Back to Problems
          </Button>
        </Link>
      </div>
    </div>
  );
}
