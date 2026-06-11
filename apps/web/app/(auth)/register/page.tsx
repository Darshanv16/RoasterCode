'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { authApi, usersApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { usePetStore } from '@/stores/petStore';
import { useUserStore } from '@/stores/userStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Check, Eye, EyeOff, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z
  .object({
    username: z
      .string()
      .min(3, 'At least 3 characters')
      .max(20, 'Max 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
    petName: z.string().min(1, 'Choose a pet name'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

const STARTER_PETS = ['Byte', 'Pixel', 'Chip'];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-success'];

  return (
    <div className="flex gap-1 mt-2">
      {checks.map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i < score ? colors[score - 1] : 'bg-surface-3'
          )}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);
  const setPetName = usePetStore((s) => s.setPetName);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { petName: 'Byte' },
  });

  const username = watch('username');
  const password = watch('password');
  const petName = watch('petName');

  const checkUsername = useCallback(async (name: string) => {
    if (name.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const available = await usersApi.checkUsername(name);
    setUsernameStatus(available ? 'available' : 'taken');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => checkUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setPetName(data.petName);
      login(res.data.user, res.data.accessToken);
      toast.success(`Welcome to RoastCoder, ${res.data.user.username}!`);
      router.push('/problems');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Begin your coding journey">
      <div className="glass rounded-2xl border border-border p-8 shadow-card">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Create account</h1>
        <p className="text-text-muted text-sm mb-8">Choose your starter pet and enter the arena.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <input
              {...register('username')}
              id="username"
              placeholder=" "
              className={cn(
                'peer w-full rounded-lg bg-surface-2 border px-4 pt-5 pb-2 pr-10 text-text-primary outline-none transition-colors focus:border-accent/50',
                errors.username ? 'border-danger' : 'border-border'
              )}
            />
            <label htmlFor="username" className="absolute left-4 top-1 text-xs text-text-muted peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-accent">
              Username
            </label>
            <span className="absolute right-3 top-3.5">
              {usernameStatus === 'checking' && <span className="text-text-dim text-xs">...</span>}
              {usernameStatus === 'available' && <Check className="h-4 w-4 text-success" />}
              {usernameStatus === 'taken' && <X className="h-4 w-4 text-danger" />}
            </span>
            {errors.username && <p className="text-danger text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div className="relative">
            <input
              {...register('email')}
              type="email"
              id="reg-email"
              placeholder=" "
              className={cn(
                'peer w-full rounded-lg bg-surface-2 border px-4 pt-5 pb-2 text-text-primary outline-none focus:border-accent/50',
                errors.email ? 'border-danger' : 'border-border'
              )}
            />
            <label htmlFor="reg-email" className="absolute left-4 top-1 text-xs text-text-muted peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-accent">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="reg-password"
              placeholder=" "
              className={cn(
                'peer w-full rounded-lg bg-surface-2 border px-4 pt-5 pb-2 pr-10 text-text-primary outline-none focus:border-accent/50',
                errors.password ? 'border-danger' : 'border-border'
              )}
            />
            <label htmlFor="reg-password" className="absolute left-4 top-1 text-xs text-text-muted peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-accent">
              Password
            </label>
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-3.5 text-text-muted">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <PasswordStrength password={password ?? ''} />
          </div>

          <div className="relative">
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirm-password"
              placeholder=" "
              className={cn(
                'peer w-full rounded-lg bg-surface-2 border px-4 pt-5 pb-2 text-text-primary outline-none focus:border-accent/50',
                errors.confirmPassword ? 'border-danger' : 'border-border'
              )}
            />
            <label htmlFor="confirm-password" className="absolute left-4 top-1 text-xs text-text-muted peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-accent">
              Confirm Password
            </label>
            {errors.confirmPassword && (
              <p className="text-danger text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-text-primary mb-3">Choose your starter pet name!</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {STARTER_PETS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValue('petName', name)}
                  className={cn(
                    'rounded-lg border p-3 text-sm font-medium transition-all',
                    petName === name
                      ? 'border-accent bg-accent/10 text-accent shadow-accent-sm'
                      : 'border-border bg-surface-2 text-text-muted hover:border-accent/30'
                  )}
                >
                  🥚 {name}
                </button>
              ))}
            </div>
            <input
              {...register('petName')}
              placeholder="Or type a custom name..."
              className="w-full rounded-lg bg-surface-2 border border-border px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent/50"
            />
          </div>

          {error && (
            <motion.p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </motion.p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
