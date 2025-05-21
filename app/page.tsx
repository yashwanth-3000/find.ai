import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

import { CustomHero } from "@/components/custom-hero";
import { Navbar } from "@/components/navbar";

// Add this immediate redirect script for auth tokens to localhost
const REDIRECT_SCRIPT = `
  (function() {
    if (typeof window !== "undefined") {
      // Check if we're on localhost with auth tokens
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const hasToken = window.location.hash.includes("access_token=") || 
                       window.location.search.includes("access_token=") ||
                       window.location.hash.includes("refresh_token=");
      
      if (isLocalhost && hasToken) {
        console.log("CRITICAL: Detected auth tokens on localhost, redirecting to production");
        const prodUrl = "https://findr-ai.vercel.app";
        const fullUrl = prodUrl + window.location.pathname + window.location.search + window.location.hash;
        window.location.replace(fullUrl);
      }
    }
  })();
`;

export const metadata: Metadata = {
  title: "findr.ai | Your Portfolio is Your Resume",
  description: "Connect GitHub & LinkedIn, get matched by AI, and one-click apply to jobs. No more resumes, just results.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Inject the redirect script - runs immediately */}
      <script dangerouslySetInnerHTML={{ __html: REDIRECT_SCRIPT }} />
      
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="animate-fadeIn">
          <CustomHero />
        </section>
      </main>
    </div>
  );
} 