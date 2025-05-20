// This file contains the static metadata for the app
// It must be a server component, so no 'use client' directive

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'findr.ai - Let Your Portfolio Speak',
  description: 'Connect GitHub and LinkedIn, get matched with jobs, and apply with one click. No more resumes.',
  openGraph: {
    title: 'findr.ai - Let Your Portfolio Speak',
    description: 'Connect GitHub and LinkedIn, get matched with jobs, and apply with one click. No more resumes.',
    url: 'https://findr.ai',
    siteName: 'findr.ai',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'findr.ai - Let Your Portfolio Speak',
    description: 'Connect GitHub and LinkedIn, get matched with jobs, and apply with one click. No more resumes.',
  },
};

export const viewport: Viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
}; 