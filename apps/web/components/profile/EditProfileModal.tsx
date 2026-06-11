'use client';

import { Button } from '@/components/ui/Button';
import { usersApi } from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bio: string;
  avatarUrl: string;
  onSaved: () => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  bio: initialBio,
  avatarUrl: initialAvatar,
  onSaved,
}: EditProfileModalProps) {
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: { bio?: string; avatarUrl?: string } = { bio };
      if (avatarUrl.trim()) payload.avatarUrl = avatarUrl.trim();
      const { data } = await usersApi.updateProfile(payload);
      setUser(data.user);
      toast.success('Profile updated');
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Edit Profile
            </Dialog.Title>
            <Dialog.Close className="text-text-muted hover:text-text-primary">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-muted mb-1 block">Username</label>
              <p className="font-mono text-text-primary">{user?.username}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1 block">Bio (max 200 chars)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                rows={3}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-accent/50"
              />
              <p className="text-xs text-text-dim mt-1 text-right">{bio.length}/200</p>
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1 block">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" magnetic={false} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button loading={loading} magnetic={false} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
