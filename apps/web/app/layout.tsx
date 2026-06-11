import { AuthProvider } from '@/components/providers/AuthProvider';
import { CodePet } from '@/components/pet/CodePet';
import { ReactQueryProvider } from '@/lib/queryClient';
import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'RoastCoder ⚡',
  description:
    'Competitive programming with AI-powered Gordon Ramsay style roasts. Code, compete, evolve your pet.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ReactQueryProvider>
          <AuthProvider>
            {children}
            <CodePet />
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: '#0D0D14',
                  border: '1px solid rgba(108,85,245,0.2)',
                  color: '#E8E8FF',
                },
              }}
            />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
