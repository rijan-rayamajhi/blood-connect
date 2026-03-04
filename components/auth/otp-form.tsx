"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { useOtpStore } from "@/lib/store/otp-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useAdminRegistrationStore } from "@/lib/store/admin-registration-store"

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
import { Label } from "@/components/ui/label"

// ── Schemas ──────────────────────────────────────────────────────────────────

const emailSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

type EmailFormValues = z.infer<typeof emailSchema>

// ── Types ────────────────────────────────────────────────────────────────────

type OtpStep = "email" | "verify"

// ── Constants ────────────────────────────────────────────────────────────────

const OTP_LENGTH = 6
const OTP_EXPIRY_SECONDS = 120

// ── Component ────────────────────────────────────────────────────────────────

export function OtpForm() {
    const router = useRouter()

    // Stores
    const { generateOtp, verifyOtp, resetOtp, attempts } = useOtpStore()
    const { login } = useAuthStore()

    // Local state
    const [step, setStep] = React.useState<OtpStep>("email")
    const [isLoading, setIsLoading] = React.useState(false)
    const [otpValues, setOtpValues] = React.useState<string[]>(
        Array.from({ length: OTP_LENGTH }, () => "")
    )
    const [otpError, setOtpError] = React.useState<string | null>(null)
    const [countdown, setCountdown] = React.useState(OTP_EXPIRY_SECONDS)
    const [canResend, setCanResend] = React.useState(false)
    const [submittedEmail, setSubmittedEmail] = React.useState("")

    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

    // ── Email form ───────────────────────────────────────────────────────────

    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    })

    // ── Countdown timer ──────────────────────────────────────────────────────

    React.useEffect(() => {
        if (step !== "verify") return

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [step, submittedEmail]) // re-run when email changes (resend case)

    // ── Helpers ──────────────────────────────────────────────────────────────

    const formatCountdown = (seconds: number): string => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    const resolveRole = (
        email: string
    ): "admin" | "hospital" | "blood-bank" | null => {
        if (email.endsWith("@admin.com")) return "admin"
        if (email.endsWith("@hospital.com")) return "hospital"
        if (email.endsWith("@bloodbank.com")) return "blood-bank"
        return null
    }

    // ── Send OTP ─────────────────────────────────────────────────────────────

    function handleSendOtp(values: EmailFormValues) {
        const role = resolveRole(values.email)
        if (!role) {
            toast.error("Invalid domain for organizational login.")
            return
        }

        // Governance rules for non-admins (DRD 5.2)
        if (role !== "admin") {
            const registrations =
                useAdminRegistrationStore.getState().registrations
            const org = registrations.find((r) => r.email === values.email)

            if (!org || org.status === "pending") {
                toast.error(
                    "Your registration is pending approval. Please wait for the administrator to verify your account."
                )
                return
            }
            if (org.status === "rejected") {
                toast.error(
                    `Your registration was rejected. Reason: ${org.reviewRemarks || "Not specified"}`
                )
                return
            }
            if (org.status === "suspended") {
                toast.error(
                    "Your account has been suspended. Please contact the administrator."
                )
                return
            }
        }

        setIsLoading(true)

        // Simulate network delay
        setTimeout(() => {
            generateOtp(values.email)
            setSubmittedEmail(values.email)
            setStep("verify")
            setOtpValues(Array.from({ length: OTP_LENGTH }, () => ""))
            setOtpError(null)
            setCountdown(OTP_EXPIRY_SECONDS)
            setCanResend(false)
            setIsLoading(false)
            toast.success("OTP sent! Check your console for the code.")
        }, 800)
    }

    // ── Resend OTP ───────────────────────────────────────────────────────────

    function handleResend() {
        generateOtp(submittedEmail)
        setOtpValues(Array.from({ length: OTP_LENGTH }, () => ""))
        setOtpError(null)
        setCountdown(OTP_EXPIRY_SECONDS)
        setCanResend(false)
        toast.success("New OTP sent! Check your console.")
    }

    // ── OTP Input handlers ───────────────────────────────────────────────────

    function handleOtpChange(index: number, value: string) {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return

        const newValues = [...otpValues]
        newValues[index] = value
        setOtpValues(newValues)
        setOtpError(null)

        // Auto-focus next input
        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    function handleOtpKeyDown(
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
        e.preventDefault()
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
        if (!pasted) return

        const newValues = [...otpValues]
        for (let i = 0; i < pasted.length; i++) {
            newValues[i] = pasted[i]
        }
        setOtpValues(newValues)

        // Focus the next empty input or the last one
        const nextEmpty = newValues.findIndex((v) => !v)
        const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty
        inputRefs.current[focusIndex]?.focus()
    }

    // ── Verify OTP ───────────────────────────────────────────────────────────

    function handleVerify() {
        const code = otpValues.join("")
        if (code.length !== OTP_LENGTH) {
            setOtpError("Please enter all 6 digits.")
            return
        }

        setIsLoading(true)

        // Simulate verification delay
        setTimeout(() => {
            const result = verifyOtp(code)

            switch (result) {
                case "success": {
                    const role = resolveRole(submittedEmail)
                    if (!role) {
                        toast.error("Invalid domain.")
                        setIsLoading(false)
                        return
                    }

                    const registrations =
                        useAdminRegistrationStore.getState().registrations
                    const mockUser = {
                        id:
                            role === "admin"
                                ? "admin"
                                : registrations.find(
                                    (r) => r.email === submittedEmail
                                )?.id || "1",
                        name:
                            role === "admin"
                                ? "System Admin"
                                : "Organization User",
                        email: submittedEmail,
                        role,
                    }

                    login(mockUser)
                    toast.success("Login successful!")

                    if (role === "admin") router.push("/admin")
                    else if (role === "hospital") router.push("/hospital")
                    else if (role === "blood-bank") router.push("/blood-bank")

                    break
                }
                case "expired":
                    setOtpError("OTP has expired. Please resend.")
                    break
                case "max-attempts":
                    setOtpError("Too many failed attempts. Please resend a new OTP.")
                    break
                case "invalid":
                    setOtpError(
                        `Invalid OTP. ${Math.max(0, 5 - (attempts + 1))} attempts remaining.`
                    )
                    break
            }

            setIsLoading(false)
        }, 600)
    }

    // ── Back to email step ───────────────────────────────────────────────────

    function handleBack() {
        resetOtp()
        setStep("email")
        setOtpValues(Array.from({ length: OTP_LENGTH }, () => ""))
        setOtpError(null)
        setCountdown(OTP_EXPIRY_SECONDS)
        setCanResend(false)
    }

    // ── Render ───────────────────────────────────────────────────────────────

    if (step === "email") {
        return (
            <Form {...emailForm}>
                <form
                    onSubmit={emailForm.handleSubmit(handleSendOtp)}
                    className="space-y-6"
                >
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
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Send OTP
                    </Button>
                </form>
            </Form>
        )
    }

    // Step 2: OTP Verification
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>
                    OTP sent to <strong className="text-foreground">{submittedEmail}</strong>
                </span>
            </div>

            {/* OTP Input Boxes */}
            <div className="space-y-2">
                <Label>Enter verification code</Label>
                <div className="flex justify-center gap-2">
                    {otpValues.map((value, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={value}
                            onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            className="h-12 w-12 rounded-md border border-input bg-background text-center text-lg font-semibold shadow-sm transition-colors focus:border-critical focus:outline-none focus:ring-2 focus:ring-critical/20"
                            autoFocus={index === 0}
                        />
                    ))}
                </div>
                {otpError && (
                    <p className="text-sm font-medium text-destructive mt-1.5">
                        {otpError}
                    </p>
                )}
            </div>

            {/* Countdown + Resend */}
            <div className="flex items-center justify-between text-sm">
                {countdown > 0 ? (
                    <span className="text-muted-foreground">
                        Expires in{" "}
                        <span className="font-mono font-medium text-foreground">
                            {formatCountdown(countdown)}
                        </span>
                    </span>
                ) : (
                    <span className="text-destructive font-medium">
                        OTP expired
                    </span>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResend}
                    disabled={!canResend}
                    className="text-primary"
                >
                    Resend OTP
                </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBack}
                    disabled={isLoading}
                >
                    Back
                </Button>
                <Button
                    type="button"
                    className="flex-1 bg-critical hover:bg-critical/90"
                    onClick={handleVerify}
                    disabled={isLoading}
                >
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verify OTP
                </Button>
            </div>
        </div>
    )
}
