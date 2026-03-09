"use client"

import Link from "next/link"
import { Droplet } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t border-border/30 bg-zinc-50 dark:bg-zinc-950">
            <div className="container px-4 md:px-6 py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
                    <div className="space-y-5 md:col-span-1">
                        <div className="flex items-center gap-2.5 font-bold text-xl tracking-tight">
                            <Droplet className="h-6 w-6 text-critical fill-critical" />
                            <span className="bg-gradient-to-r from-critical to-blue-600 bg-clip-text text-transparent">BloodConnect</span>
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
                            The national standard for emergency blood management and procurement — ensuring no life is lost due to unavailability.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-base mb-6 tracking-tight">Platform</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                            <li><a href="#network" className="hover:text-foreground transition-colors">Network</a></li>
                            <li><a href="#impact" className="hover:text-foreground transition-colors">Impact</a></li>
                            <li><Link href="/login" className="hover:text-foreground transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-base mb-6 tracking-tight">Portals</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-foreground transition-colors">Hospital Portal</Link></li>
                            <li><Link href="/login" className="hover:text-foreground transition-colors">Blood Bank Portal</Link></li>
                            <li><Link href="/login" className="hover:text-foreground transition-colors">Admin Portal</Link></li>
                            <li><Link href="/register" className="hover:text-foreground transition-colors">Register Organization</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-base mb-6 tracking-tight">Legal</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><span className="cursor-default">Privacy Policy</span></li>
                            <li><span className="cursor-default">Terms of Service</span></li>
                            <li><span className="cursor-default">Compliance</span></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
                    <p>© {new Date().getFullYear()} BloodConnect. All rights reserved.</p>
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-muted-foreground/60">
                        <p>Built for healthcare institutions worldwide</p>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border/50 transition-colors hover:border-orange-500/30">
                            <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                            <span>Maintained by <a href="https://spotwebs.in/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-500 font-bold hover:underline decoration-orange-500/30 underline-offset-4 transition-all">SPOTWEBS</a></span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
