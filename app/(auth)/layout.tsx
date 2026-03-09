import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Visual (Hidden on mobile) */}
            <div className="hidden lg:block relative bg-zinc-900 overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&h=1600&fit=crop&q=80"
                    fill
                    className="object-cover opacity-60"
                    alt="Medical professional background"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-critical/20 via-blue-500/10 to-transparent mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                <div className="absolute top-12 left-12 z-20">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors group">
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </div>

                <div className="absolute bottom-12 left-12 right-12 z-10 space-y-4">
                    <div className="flex items-center gap-2 font-bold text-2xl text-white">
                        <div className="w-10 h-10 rounded-xl bg-critical flex items-center justify-center shadow-lg shadow-critical/20">
                            <span className="text-white">BC</span>
                        </div>
                        <span className="tracking-tight">BloodConnect</span>
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
                        Revolutionizing Emergency <br />
                        <span className="text-critical">Blood Logistics</span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
                        The intelligent infrastructure connecting hospitals and blood banks seamlessly in real-time.
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex items-center justify-center p-6 sm:p-12 bg-zinc-50 dark:bg-zinc-950">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    )
}
