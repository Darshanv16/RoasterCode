'use client';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(data);
      login(res.data.user, res.data.accessToken);
      toast.success(`Welcome back, ${res.data.user.username}!`);
      router.push('/problems');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout tagline="Welcome back, coder">
      <div className="glass rounded-2xl border border-border p-8 shadow-card">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Sign in</h1>
        <p className="text-text-muted text-sm mb-8">Enter the arena. Your pet missed you.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="relative">
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder=" "
              className={cn(
                'peer w-full rounded-lg bg-surface-2 border px-4 pt-5 pb-2 text-text-primary outline-none transition-colors',
                'focus:border-accent/50 focus:shadow-accent-sm',
                errors.email || error ? 'border-danger' : 'border-border'
              )}
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-1 text-xs text-text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-accent"
            >
              Email
            </label>
            {errors.email && (
              <p className="text-danger text-xs mt-1 animate-slide-in-up">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder=" "
              className={cn(
                'peer w-full rounded-lg bg-surface-2 border px-4 pt-5 pb-2 pr-10 text-text-primary outline-none transition-colors',
                'focus:border-accent/50 focus:shadow-accent-sm',
                errors.password || error ? 'border-danger' : 'border-border'
              )}
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-1 text-xs text-text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-accent"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-3.5 text-text-muted hover:text-text-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <motion.p className="text-danger text-sm animate-slide-in-up bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </motion.p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-text-dim text-xs">— or —</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <p className="text-center text-sm text-text-muted">
          New here?{' '}
          <Link href="/register" className="text-accent hover:text-accent-hover transition-colors">
            Start coding →
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
