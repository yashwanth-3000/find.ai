import Link from "next/link";
import { Metadata } from "next";

import { CustomHero } from "@/components/custom-hero";
import { Navbar } from "@/components/navbar";
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: "findr.ai | Your Portfolio is Your Resume",
  description: "Connect GitHub & LinkedIn, get matched by AI, and one-click apply to jobs. No more resumes, just results.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <section className="animate-fadeIn">
          <CustomHero />
        </section>
      </main>
    </div>
  );
} 