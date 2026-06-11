'use client';

import { cn } from '@/lib/utils';

interface StageProps {
  className?: string;
  isHappy?: boolean;
  isSad?: boolean;
  isEvolving?: boolean;
  glowingEyes?: boolean;
  eyesSpinning?: boolean;
}

export function PetEgg({ className, isHappy, isSad }: StageProps) {
  return (
    <svg viewBox="0 0 80 90" className={cn('w-16 h-16', className)}>
      <defs>
        <radialGradient id="eggGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#C4B5FD" />
          <stop offset="100%" stopColor="#4C1D95" />
        </radialGradient>
      </defs>
      <ellipse
        cx="40"
        cy="50"
        rx="28"
        ry="36"
        fill="url(#eggGrad)"
        className={cn(isHappy && 'animate-pet-happy', !isHappy && !isSad && 'animate-pet-idle')}
      />
      <path d="M30 35 L35 45 M50 35 L45 45" stroke="#1E1E30" strokeWidth="1.5" fill="none" />
      <circle cx="33" cy="42" r="3" fill="#60A5FA" className="opacity-0 group-hover:opacity-100 transition-opacity" />
      <circle cx="47" cy="42" r="3" fill="#60A5FA" className="opacity-0 group-hover:opacity-100 transition-opacity" />
      {isSad && (
        <rect x="20" y="30" width="40" height="8" fill="#4C1D95" opacity="0.8" rx="2" />
      )}
    </svg>
  );
}

export function PetHatchling({ className, isHappy, isSad }: StageProps) {
  return (
    <svg viewBox="0 0 80 90" className={cn('w-16 h-16', className)}>
      <ellipse cx="40" cy="65" rx="18" ry="12" fill="#A78BFA" className={cn(!isHappy && !isSad && 'animate-pet-idle')} />
      <circle cx="40" cy="38" r="22" fill="#C4B5FD" />
      <ellipse cx="18" cy="50" rx="8" ry="12" fill="#DDD6FE" opacity="0.8" transform="rotate(-20 18 50)" />
      <ellipse cx="62" cy="50" rx="8" ry="12" fill="#DDD6FE" opacity="0.8" transform="rotate(20 62 50)" />
      <ellipse cx="32" cy="36" rx="7" ry="9" fill="white" />
      <ellipse cx="48" cy="36" rx="7" ry="9" fill="white" />
      <circle cx="33" cy="37" r="4" fill="#3B82F6" />
      <circle cx="49" cy="37" r="4" fill="#3B82F6" />
      {isHappy && <path d="M32 48 Q40 56 48 48" stroke="#7C3AED" strokeWidth="2" fill="none" className="animate-pet-happy" />}
      {isSad && <path d="M32 52 Q40 46 48 52" stroke="#7C3AED" strokeWidth="2" fill="none" />}
    </svg>
  );
}

export function PetCoderCat({ className, isHappy, isSad }: StageProps) {
  return (
    <svg viewBox="0 0 80 90" className={cn('w-16 h-16', className)}>
      <rect x="22" y="55" width="36" height="20" rx="6" fill="#7C3AED" />
      <rect x="25" y="72" width="30" height="4" rx="2" fill="#4C1D95" />
      <circle cx="40" cy="38" r="20" fill="#8B5CF6" className={cn(!isHappy && !isSad && 'animate-pet-idle')} />
      <polygon points="22,22 28,38 18,38" fill="#8B5CF6" />
      <polygon points="58,22 52,38 62,38" fill="#8B5CF6" />
      {isSad ? (
        <>
          <rect x="28" y="32" width="10" height="8" fill="#1E1E30" rx="1" />
          <rect x="42" y="32" width="10" height="8" fill="#1E1E30" rx="1" />
        </>
      ) : (
        <>
          <rect x="28" y="32" width="10" height="8" fill="#10B981" rx="1" />
          <rect x="42" y="32" width="10" height="8" fill="#10B981" rx="1" />
          <text x="30" y="39" fontSize="5" fill="#05050A" fontFamily="monospace">{'{}'}</text>
        </>
      )}
      <rect x="18" y="68" width="44" height="6" rx="2" fill="#1C1C2E" stroke="#6C55F5" strokeWidth="0.5" />
      {isHappy && <text x="40" y="90" textAnchor="middle" fontSize="8" className="animate-pet-happy">✨</text>}
    </svg>
  );
}

export function PetHackerCat({ className, isHappy, isSad, glowingEyes, eyesSpinning }: StageProps) {
  return (
    <svg viewBox="0 0 80 90" className={cn('w-16 h-16', className)}>
      <rect x="20" y="52" width="40" height="24" rx="8" fill="#4C1D95" />
      <text x="40" y="66" textAnchor="middle" fontSize="6" fill="#6C55F5" fontFamily="monospace">{'>'}_</text>
      <circle cx="40" cy="36" r="20" fill="#5B21B6" className={cn(!isHappy && !isSad && 'animate-pet-idle')} />
      <polygon points="20,20 27,36 15,36" fill="#5B21B6" />
      <polygon points="60,20 53,36 65,36" fill="#5B21B6" />
      {glowingEyes ? (
        <>
          <circle cx="32" cy="36" r="5" fill="#10B981" className={cn('animate-pulse-glow', eyesSpinning && 'animate-spin')} style={{ transformOrigin: '32px 36px' }} />
          <circle cx="48" cy="36" r="5" fill="#10B981" className={cn('animate-pulse-glow', eyesSpinning && 'animate-spin')} style={{ transformOrigin: '48px 36px' }} />
        </>
      ) : (
        <>
          <rect x="26" y="32" width="28" height="8" fill="#1E1E30" rx="2" />
          <rect x="28" y="34" width="8" height="2" fill="#6C55F5" />
          <rect x="38" y="34" width="8" height="2" fill="#6C55F5" />
          <rect x="48" y="34" width="4" height="2" fill="#6C55F5" />
        </>
      )}
      {isSad && <rect x="24" y="28" width="32" height="12" fill="#4C1D95" opacity="0.9" rx="2" />}
      <text x="15" y="25" fontSize="5" fill="#6C55F5" opacity="0.6" fontFamily="monospace">01</text>
      <text x="60" y="70" fontSize="5" fill="#A855F7" opacity="0.6" fontFamily="monospace">10</text>
    </svg>
  );
}

export function PetWizard({ className, isHappy, isSad }: StageProps) {
  return (
    <svg viewBox="0 0 80 100" className={cn('w-16 h-18', className)}>
      <polygon points="40,5 55,35 25,35" fill="#6366F1" />
      <circle cx="40" cy="20" r="2" fill="#FFD700" className="animate-pulse-glow" />
      <circle cx="35" cy="28" r="1.5" fill="#FFD700" />
      <circle cx="45" cy="25" r="1.5" fill="#FFD700" />
      <rect x="28" y="35" width="24" height="30" rx="12" fill="#4F46E5" className={cn(!isHappy && !isSad && 'animate-pet-idle')} />
      <ellipse cx="40" cy="48" rx="10" ry="8" fill="#C4B5FD" />
      <circle cx="35" cy="46" r="3" fill="#1E1E30" />
      <circle cx="45" cy="46" r="3" fill="#1E1E30" />
      <path d="M30 58 Q40 52 50 58" stroke="#A78BFA" strokeWidth="1" fill="none" />
      <path d="M28 62 Q32 70 30 78 Q34 72 38 80" stroke="#6C55F5" strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M52 62 Q48 70 50 78 Q46 72 42 80" stroke="#A855F7" strokeWidth="1.5" fill="none" opacity="0.7" />
      <line x1="58" y1="30" x2="58" y2="75" stroke="#8B5CF6" strokeWidth="2" />
      <circle cx="58" cy="28" r="6" fill="#6C55F5" className="animate-pulse-glow" />
      {isSad && <rect x="26" y="42" width="28" height="10" fill="#4F46E5" opacity="0.8" rx="2" />}
    </svg>
  );
}

export function PetDragon({ className, isHappy, isSad, isEvolving }: StageProps) {
  return (
    <svg viewBox="0 0 90 90" className={cn('w-16 h-16', isEvolving && 'animate-pet-evolve', className)}>
      <defs>
        <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <ellipse cx="45" cy="55" rx="25" ry="20" fill="url(#dragonGrad)" className={cn(!isHappy && !isSad && 'animate-pet-idle')} />
      <ellipse cx="45" cy="35" rx="18" ry="16" fill="url(#dragonGrad)" />
      <polygon points="15,45 5,25 20,40" fill="#FFD700" opacity="0.8" />
      <polygon points="75,45 85,25 70,40" fill="#FFD700" opacity="0.8" />
      <text x="35" y="22" fontSize="8" fill="#FFA500" fontFamily="monospace">{'{'}</text>
      <text x="48" y="22" fontSize="8" fill="#FFA500" fontFamily="monospace">{'}'}</text>
      <circle cx="38" cy="33" r="4" fill="#05050A" />
      <circle cx="52" cy="33" r="4" fill="#05050A" />
      <circle cx="39" cy="32" r="2" fill="#FFD700" className="animate-pulse-glow" />
      <circle cx="53" cy="32" r="2" fill="#FFD700" className="animate-pulse-glow" />
      <path d="M55 42 Q70 38 80 45 Q70 50 55 48" fill="#FF6B35" opacity="0.8" />
      <text x="62" y="46" fontSize="4" fill="#05050A" fontFamily="monospace">if()</text>
      {isSad && <rect x="30" y="28" width="30" height="12" fill="#FFA500" opacity="0.7" rx="2" />}
      {isHappy && <text x="45" y="85" textAnchor="middle" fontSize="10" className="animate-pet-happy">🔥</text>}
    </svg>
  );
}

export function PetStageRenderer({ stage, glowingEyes, eyesSpinning, ...props }: StageProps & { stage: number }) {
  const aiProps = stage >= 3 ? { glowingEyes, eyesSpinning } : {};
  switch (stage) {
    case 0:
      return <PetEgg {...props} />;
    case 1:
      return <PetHatchling {...props} />;
    case 2:
      return <PetCoderCat {...props} />;
    case 3:
      return <PetHackerCat {...props} {...aiProps} />;
    case 4:
      return <PetWizard {...props} {...aiProps} />;
    case 5:
      return <PetDragon {...props} {...aiProps} />;
    default:
      return <PetEgg {...props} />;
  }
}
