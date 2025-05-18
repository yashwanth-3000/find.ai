"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow" | "shine";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image: {
    light: string;
    dark: string;
    alt: string;
  };
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
}: HeroProps) {
  const { resolvedTheme } = useTheme();
  const imageSrc = resolvedTheme === "light" ? image.light : image.dark;

  return (
    <section className="relative py-12 md:py-24 lg:py-32 px-4 overflow-hidden">
      {/* Decorative elements with red accents */}
      <div className="absolute top-0 left-[5%] w-64 h-64 bg-destructive/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[30%] right-[10%] w-96 h-96 bg-destructive/3 rounded-full blur-3xl animate-float" 
           style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-[10%] left-[20%] w-48 h-48 bg-destructive/4 rounded-full blur-3xl animate-pulse-slow" 
           style={{ animationDelay: "2s" }} />

      <div className="mx-auto max-w-container flex flex-col gap-12">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Badge */}
          {badge && (
            <Badge 
              variant="outline" 
              className="animate-appear gap-2 hover-scale py-2 px-4 border-destructive/20 text-destructive"
              style={{ animationDelay: '100ms' }}
            >
              <span className="text-muted-foreground">{badge.text}</span>
              <a href={badge.action.href} className="flex items-center gap-1 group text-destructive">
                {badge.action.text}
                <ArrowRightIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </Badge>
          )}

          {/* Title */}
          <h1 
            className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight relative z-10 animate-appear"
            style={{ animationDelay: '300ms' }}
          >
            <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          {/* Description */}
          <p 
            className="text-md sm:text-lg md:text-xl relative z-10 max-w-[550px] font-medium text-muted-foreground animate-appear"
            style={{ animationDelay: '500ms' }}
          >
            {description}
          </p>

          {/* Actions */}
          <div 
            className="relative z-10 flex flex-wrap justify-center gap-4 animate-appear"
            style={{ animationDelay: '700ms' }}
          >
            {actions.map((action, index) => (
              <Button 
                key={index} 
                variant={action.variant || "default"} 
                size="lg" 
                asChild
                className={cn(
                  index === 0 && "hover-lift",
                  index === 1 && "hover-scale border-destructive/20 hover:text-destructive"
                )}
              >
                <a href={action.href} className="flex items-center gap-2 group">
                  <span className="flex items-center transition-transform duration-300">
                    {action.icon}
                    <span className="ml-1">{action.text}</span>
                  </span>
                </a>
              </Button>
            ))}
          </div>

          {/* Image with Glow */}
          <div 
            className="relative z-0 w-full max-w-[1000px] mx-auto mt-12 animate-appear"
            style={{ animationDelay: '900ms' }}
          >
            <MockupFrame
              className="hover-rotate hover:shadow-xl hover:shadow-destructive/10 transition-all duration-500"
              size="small"
            >
              <Mockup type="responsive">
                <div className="relative overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={image.alt}
                    width={1248}
                    height={765}
                    priority
                    className="transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Mockup>
            </MockupFrame>
            
            <Glow
              variant="top"
              className="animate-glow"
              intensity="high"
              size="xl"
              color="rgba(220, 38, 38, 0.1)" /* Using destructive (red) color */
            />
            
            {/* Additional floating elements with red accents */}
            <div className="absolute top-[20%] left-[10%] w-12 h-12 rounded-full bg-destructive/10 blur-xl animate-float opacity-40"
                 style={{ animationDelay: '0s' }} />
            <div className="absolute top-[60%] right-[15%] w-10 h-10 rounded-full bg-destructive/15 blur-xl animate-float opacity-30"
                 style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[20%] left-[20%] w-8 h-8 rounded-full bg-destructive/20 blur-lg animate-float opacity-25"
                 style={{ animationDelay: '4s' }} />
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
} 