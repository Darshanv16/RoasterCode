import { AdminGuard } from '@/components/admin/AdminGuard';
import { Navbar } from '@/components/layout/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen aurora-bg">
      <Navbar />
      <AdminGuard>{children}</AdminGuard>
    </div>
  );
}
