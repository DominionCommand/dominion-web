import './globals.css';
import type { Metadata } from 'next';
import { Footer } from '../components/Footer';
import { Nav } from '../components/Nav';

export const metadata: Metadata = {
  metadataBase: new URL('https://playdominionnexus.com'),
  title: {
    default: 'Dominion Nexus',
    template: '%s | Dominion Nexus',
  },
  description: 'Command the war. Rule the Dominion.',
  applicationName: 'Dominion Nexus',
  keywords: ['Dominion Nexus', '4X strategy', 'mobile war game', 'alliance warfare', 'iPhone strategy game'],
  openGraph: {
    title: 'Dominion Nexus',
    description: 'Command the war. Rule the Dominion.',
    url: 'https://playdominionnexus.com',
    siteName: 'Dominion Nexus',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dominion Nexus',
    description: 'Command the war. Rule the Dominion.',
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
