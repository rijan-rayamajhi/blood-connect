"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

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

const emailSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

type EmailFormValues = z.infer<typeof emailSchema>

type PageStep = "form" | "sent"

function ForgotPasswordContent() {
    const router = useRouter()
    const { requestReset, resetToken } = usePasswordResetStore()
    const [step, setStep] = React.useState<PageStep>("form")
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    })

    function onSubmit(values: EmailFormValues) {
        setIsLoading(true)

        // Simulate network delay
        setTimeout(() => {
            requestReset(values.email)
            setStep("sent")
            setIsLoading(false)
            toast.success("Reset link generated successfully.")
        }, 800)
    }

    function handleProceedToReset() {
        if (resetToken) {
            router.push(`/reset-password?token=${resetToken}`)
        }
    }

    if (step === "sent") {
        return (
            <Card className="w-full max-w-md shadow-lg border-muted/40">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        Reset Link Sent
                    </CardTitle>
                    <CardDescription>
                        If an account exists with that email, a reset link has
                        been sent. Check your inbox.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Since this is a simulated flow, use the button below to
                        proceed directly.
                    </p>
                    <Button
                        className="w-full bg-critical hover:bg-critical/90"
                        onClick={handleProceedToReset}
                    >
                        Proceed to Reset
                    </Button>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md shadow-lg border-muted/40">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-critical">
                    Forgot Password
                </CardTitle>
                <CardDescription>
                    Enter your email to receive a password reset link
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="name@example.com"
                                                className="pl-9"
                                                autoComplete="email"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-critical hover:bg-critical/90"
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Send Reset Link
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Login
                </Link>
            </CardFooter>
        </Card>
    )
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordContent />
}
