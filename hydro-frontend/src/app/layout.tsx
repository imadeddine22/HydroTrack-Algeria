import type { Metadata } from 'next';
import { Inter, Changa } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const inter  = Inter({ subsets: ['latin'], variable: '--font-inter' });
const changa = Changa({ subsets: ['arabic', 'latin'], weight: ['400', '600', '700', '800'], variable: '--font-changa' });

export const metadata: Metadata = {
  title: 'HydroTrack Algeria',
  description: 'Monitoring and managing hydraulic infrastructures across Algeria',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="overflow-x-hidden" suppressHydrationWarning>
      <body className={`${inter.variable} ${changa.variable} font-sans bg-[#fdfdfd] text-[#112347] overflow-x-hidden w-full`} suppressHydrationWarning>
        <LanguageProvider>
          <div className="w-full overflow-x-hidden">
            <Navbar />
            {children}
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
