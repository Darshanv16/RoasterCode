'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { usePetStore } from '@/stores/petStore';
import { useUserStore } from '@/stores/userStore';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, LogOut, Menu, Settings, Shield, Trophy, User, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PetStageRenderer } from '../pet/PetStages';
import { CreditsChip } from './CreditsChip';

const navLinks = [
  { href: '/problems', label: 'Problems' },
  { href: '/learn', label: 'Learn' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, initializeAuth } = useUserStore();
  const { petName, stage } = usePetStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [spark, setSpark] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleLogoClick = () => {
    setSpark(true);
    setTimeout(() => setSpark(false), 600);
  };

  return (
    <header className="sticky top-0 z-50 h-16 glass border-b border-border/50">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 group">
          <motion.span
            animate={spark ? { scale: [1, 1.4, 1], rotate: [0, 15, 0] } : {}}
            className="text-xl text-accent animate-pulse-glow"
          >
            ⚡
          </motion.span>
          <span className="text-lg font-bold text-text-primary group-hover:text-gradient transition-all">
            RoastCoder
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors neon-underline',
                pathname.startsWith(link.href)
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <button className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors">
                <Zap className="h-3.5 w-3.5" />
                {user.xp.toLocaleString()} XP
              </button>

              <CreditsChip />

              <Badge
                variant="warning"
                className={cn((user.streak ?? 0) > 5 && 'shadow-gold animate-pulse-glow')}
              >
                <Flame className="h-3 w-3" />
                {user.streak ?? 0}
              </Badge>

              <button
                title={petName}
                className="rounded-xl border border-border bg-surface-2 p-1 hover:border-accent/30 transition-colors"
              >
                <PetStageRenderer stage={stage} className="w-8 h-8" />
              </button>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button>
                    <Avatar name={user.username} src={user.avatarUrl} size="sm" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[180px] glass rounded-xl border border-border p-1 shadow-card z-50 animate-fade-in-down"
                    sideOffset={8}
                    align="end"
                  >
                    <DropdownMenu.Item
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-2 cursor-pointer outline-none"
                      onSelect={() => router.push(`/profile/${user.username}`)}
                    >
                      <User className="h-4 w-4" /> Profile
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-2 cursor-pointer outline-none"
                      onSelect={() => router.push('/achievements')}
                    >
                      <Trophy className="h-4 w-4" /> Achievements
                    </DropdownMenu.Item>
                    {user.role === 'ADMIN' && (
                      <DropdownMenu.Item
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface-2 cursor-pointer outline-none"
                        onSelect={() => router.push('/admin')}
                      >
                        <Shield className="h-4 w-4" /> Admin Panel
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Separator className="my-1 h-px bg-border" />
                    <DropdownMenu.Item
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10 cursor-pointer outline-none"
                      onSelect={handleLogout}
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" magnetic={false}>
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button>Start Coding →</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-text-primary"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 glass-strong border-l border-border p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-gradient">Menu</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </div>

              <nav className="space-y-4 mb-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block text-base font-medium py-2',
                      pathname.startsWith(link.href) ? 'text-accent' : 'text-text-muted'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-surface-2 border border-border">
                <PetStageRenderer stage={stage} className="w-10 h-10" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{petName}</p>
                  <p className="text-xs text-text-muted">Your code pet</p>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="space-y-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Start Coding →</Button>
                  </Link>
                </div>
              ) : (
                <Button variant="danger" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
