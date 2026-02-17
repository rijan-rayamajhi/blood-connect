import Link from "next/link"
import { Droplet } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="container px-4 md:px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <Droplet className="h-6 w-6 text-critical fill-critical" />
                            <span>BloodConnect</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The national standard for emergency blood management and procurement. ensuring no life is lost due to unavailability.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-6">Platform</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="/login" className="hover:text-primary transition-colors">Hospital Portal</Link></li>
                            <li><Link href="/login" className="hover:text-primary transition-colors">Blood Bank Portal</Link></li>
                            <li><Link href="/login" className="hover:text-primary transition-colors">Government Portal</Link></li>
                            <li><Link href="/login" className="hover:text-primary transition-colors">Admin Access</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-6">Resources</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">API Status</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-6">Legal</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Compliance</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} BloodConnect. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
                        <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
                        <Link href="#" className="hover:text-primary transition-colors">GitHub</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
