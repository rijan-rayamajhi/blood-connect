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
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex gap-2 items-center font-bold text-xl">
            <span className="text-critical text-2xl">BloodConnect</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Network</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Impact</a>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" className="bg-critical hover:bg-critical/90" asChild>
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
