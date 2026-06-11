'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn('relative rounded-full', sizes[size], className)}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-accent p-[2px] animate-spin-slow opacity-80" />
      <div className="relative h-full w-full rounded-full overflow-hidden bg-surface-2 flex items-center justify-center">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" />
        ) : (
          <span className="font-bold text-gradient">{initial}</span>
        )}
      </div>
    </motion.div>
  );
}
