"use client"

import * as React from "react"
import { Mail, ShieldOff } from "lucide-react"

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

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

// ── Schemas ──────────────────────────────────────────────────────────────────

const emailSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

type EmailFormValues = z.infer<typeof emailSchema>

// ── Component ────────────────────────────────────────────────────────────────

/**
 * OTP login is disabled until Supabase email provider is configured.
 * The form shell is preserved for future integration with
 * supabase.auth.signInWithOtp().
 */
export function OtpForm() {
    const [showForm, setShowForm] = React.useState(false)

    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    })

    if (!showForm) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <ShieldOff className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">OTP Login Unavailable</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                        OTP login requires email provider configuration in Supabase.
                        Please use password login or contact your administrator.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => setShowForm(true)}
                >
                    Show form anyway (dev)
                </Button>
            </div>
        )
    }

    return (
        <Form {...emailForm}>
            <form
                onSubmit={emailForm.handleSubmit(() => {
                    // Future: supabase.auth.signInWithOtp({ email })
                })}
                className="space-y-6"
            >
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    OTP login requires Supabase email provider configuration.
                    This form is for development preview only.
                </div>
                <FormField
                    control={emailForm.control}
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
                    disabled
                >
                    Send OTP (Disabled)
                </Button>
            </form>
        </Form>
    )
}
