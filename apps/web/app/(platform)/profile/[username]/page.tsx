import { ProfileClient } from './ProfileClient';
import type { UserProfile } from '@/lib/api';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

async function getProfile(username: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_URL}/users/${username}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getProfile(params.username);
  if (!profile) notFound();
  return <ProfileClient profile={profile} />;
}
