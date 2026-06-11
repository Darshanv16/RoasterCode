'use client';

import { useEffect, useState } from 'react';

interface TypingTextProps {
  texts: string[];
  speed?: number;
  pause?: number;
  className?: string;
}

export function TypingText({ texts, speed = 60, pause = 2000, className }: TypingTextProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIndex] ?? '';

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (charIndex < current.length) {
            setCharIndex((c) => c + 1);
          } else {
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          if (charIndex > 0) {
            setCharIndex((c) => c - 1);
          } else {
            setIsDeleting(false);
            setTextIndex((i) => (i + 1) % texts.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  const display = (texts[textIndex] ?? '').slice(0, charIndex);

  return (
    <span className={className}>
      {display}
      <span className="typewriter-cursor" />
    </span>
  );
}
