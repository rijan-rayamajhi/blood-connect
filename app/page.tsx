import { Hero } from "@/components/landing/hero"
import { Problem } from "@/components/landing/problem"
import { Solution } from "@/components/landing/solution"
import { HowItWorks } from "@/components/landing/how-it-works"
import { PlatformModules } from "@/components/landing/platform-modules"
import { Performance } from "@/components/landing/performance"
import { Impact } from "@/components/landing/impact"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 transition-all border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl shadow-black/5 dark:shadow-black/40 rounded-full">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex gap-2 items-center font-bold text-lg tracking-tight">
            <span className="bg-gradient-to-r from-critical to-blue-600 bg-clip-text text-transparent">BloodConnect</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#network" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Network</a>
            <a href="#impact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Impact</a>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="rounded-full font-medium" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" className="rounded-full font-medium bg-critical hover:bg-critical/90 shadow-lg shadow-critical/20" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <PlatformModules />
        <Performance />
        <Impact />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
