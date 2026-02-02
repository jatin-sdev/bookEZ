import type { Metadata } from 'next';
import { Inter, Calistoga } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import ConditionalLayout from '@/components/ConditionalLayout';
// Import these to ensure Authentication and Data Fetching work
import QueryProvider from '@/providers/QueryProvider'; 
import { AuthProvider } from '@/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const calistoga = Calistoga({ weight: '400', subsets: ['latin'], variable: '--font-calistoga' });

export const metadata: Metadata = {
  title: 'TicketForge AI',
  description: 'Next-gen Event Ticketing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${calistoga.variable} font-sans`}>
        {/* 1. Data Layer */}
        <QueryProvider>
          {/* 2. Auth Layer */}
          <AuthProvider>
            {/* 3. Feedback Layer (Your Custom Toaster) */}
            <ToastProvider>
              {/* 4. Navigation & Layout */}
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}