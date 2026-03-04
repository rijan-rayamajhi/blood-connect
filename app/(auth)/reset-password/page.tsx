"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Lock, ShieldAlert, CheckCircle2, Clock } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { usePasswordResetStore } from "@/lib/store/password-reset-store"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

// ── Schema ───────────────────────────────────────────────────────────────────

const passwordSchema = z
    .object({
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters.")
            .regex(/[A-Z]/, "Must contain at least 1 uppercase letter.")
            .regex(/[a-z]/, "Must contain at least 1 lowercase letter.")
            .regex(/[0-9]/, "Must contain at least 1 number.")
            .regex(
                /[^A-Za-z0-9]/,
                "Must contain at least 1 special character."
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    })

type PasswordFormValues = z.infer<typeof passwordSchema>

type TokenStatus = "valid" | "invalid" | "expired" | "loading"

// ── Component ────────────────────────────────────────────────────────────────

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const { validateToken, clearReset, expiresAt } = usePasswordResetStore()

    const [tokenStatus, setTokenStatus] = React.useState<TokenStatus>("loading")
    const [isLoading, setIsLoading] = React.useState(false)
    const [countdown, setCountdown] = React.useState(0)

    // ── Validate token on mount ──────────────────────────────────────────────

    React.useEffect(() => {
        if (!token) {
            setTokenStatus("invalid")
            return
        }

        const result = validateToken(token)
        if (result === "valid") {
            setTokenStatus("valid")
        } else if (result === "expired") {
            setTokenStatus("expired")
        } else {
            setTokenStatus("invalid")
        }
    }, [token, validateToken])

    // ── Countdown timer ──────────────────────────────────────────────────────

    React.useEffect(() => {
        if (tokenStatus !== "valid" || !expiresAt) return

        function tick() {
            const remaining = Math.max(
                0,
                Math.ceil(((expiresAt as number) - Date.now()) / 1000)
            )
            setCountdown(remaining)

            if (remaining <= 0) {
                setTokenStatus("expired")
            }
        }

        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [tokenStatus, expiresAt])

    // ── Helpers ──────────────────────────────────────────────────────────────

    const formatCountdown = (seconds: number): string => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    // ── Form ─────────────────────────────────────────────────────────────────

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    })

    function onSubmit(_values: PasswordFormValues) {
        if (tokenStatus !== "valid") return

        setIsLoading(true)

        setTimeout(() => {
            clearReset()
            toast.success("Password has been reset successfully!")
            setIsLoading(false)
            router.push("/login")
        }, 800)
    }

    // ── Loading state ────────────────────────────────────────────────────────

    if (tokenStatus === "loading") {
        return (
            <Card className="w-full max-w-md shadow-lg border-muted/40">
                <CardContent className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    // ── Invalid / Expired ────────────────────────────────────────────────────

    if (tokenStatus === "invalid" || tokenStatus === "expired") {
        return (
            <Card className="w-full max-w-md shadow-lg border-muted/40">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {tokenStatus === "expired"
                            ? "Link Expired"
                            : "Invalid Link"}
                    </CardTitle>
                    <CardDescription>
                        {tokenStatus === "expired"
                            ? "This password reset link has expired. Please request a new one."
                            : "This password reset link is invalid or has already been used."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full bg-critical hover:bg-critical/90"
                        onClick={() => router.push("/forgot-password")}
                    >
                        Request New Link
                    </Button>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    // ── Valid — show reset form ──────────────────────────────────────────────

    return (
        <Card className="w-full max-w-md shadow-lg border-muted/40">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-critical">
                    Reset Password
                </CardTitle>
                <CardDescription>
                    Enter your new password below
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Expiry countdown */}
                <div className="flex items-center justify-center gap-2 rounded-md border border-muted bg-muted/30 px-3 py-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                        Link expires in{" "}
                        <span className="font-mono font-medium text-foreground">
                            {formatCountdown(countdown)}
                        </span>
                    </span>
                </div>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-9"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-9"
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password requirements hint */}
                        <ul className="space-y-1 text-xs text-muted-foreground" aria-label="Password requirements">
                            <PasswordRule
                                met={form.watch("newPassword").length >= 8}
                                label="At least 8 characters"
                            />
                            <PasswordRule
                                met={/[A-Z]/.test(form.watch("newPassword"))}
                                label="1 uppercase letter"
                            />
                            <PasswordRule
                                met={/[a-z]/.test(form.watch("newPassword"))}
                                label="1 lowercase letter"
                            />
                            <PasswordRule
                                met={/[0-9]/.test(form.watch("newPassword"))}
                                label="1 number"
                            />
                            <PasswordRule
                                met={/[^A-Za-z0-9]/.test(
                                    form.watch("newPassword")
                                )}
                                label="1 special character"
                            />
                        </ul>

                        <Button
                            type="submit"
                            className="w-full bg-critical hover:bg-critical/90"
                            disabled={isLoading || tokenStatus !== "valid"}
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Reset Password
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <Link
                    href="/login"
                    className="text-sm font-medium text-primary hover:underline"
                >
                    Back to Login
                </Link>
            </CardFooter>
        </Card>
    )
}

// ── Password rule indicator ──────────────────────────────────────────────────

function PasswordRule({ met, label }: { met: boolean; label: string }) {
    return (
        <li className="flex items-center gap-1.5">
            <CheckCircle2
                className={`h-3.5 w-3.5 shrink-0 transition-colors ${met
                        ? "text-green-500"
                        : "text-muted-foreground/40"
                    }`}
            />
            <span className={met ? "text-foreground" : ""}>{label}</span>
        </li>
    )
}

// ── Page (Suspense boundary for useSearchParams) ─────────────────────────────

export default function ResetPasswordPage() {
    return (
        <React.Suspense
            fallback={
                <Card className="w-full max-w-md shadow-lg border-muted/40">
                    <CardContent className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            }
        >
            <ResetPasswordContent />
        </React.Suspense>
    )
}
