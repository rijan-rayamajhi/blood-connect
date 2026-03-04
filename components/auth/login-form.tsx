"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useAdminRegistrationStore } from "@/lib/store/admin-registration-store"
import { toast } from "sonner"

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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OtpForm } from "@/components/auth/otp-form"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    rememberMe: z.boolean().default(false),
})

export function LoginForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const { login, isLocked, lockUntil, incrementFailedAttempt, resetFailedAttempts, checkLockAndSession } = useAuthStore()
    const [timeLeft, setTimeLeft] = React.useState(0)

    React.useEffect(() => {
        let interval: NodeJS.Timeout
        if (isLocked && lockUntil) {
            interval = setInterval(() => {
                const now = Date.now()
                if (now >= lockUntil) {
                    checkLockAndSession()
                    setTimeLeft(0)
                } else {
                    setTimeLeft(Math.ceil((lockUntil - now) / 1000))
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isLocked, lockUntil, checkLockAndSession])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isLocked) return;

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            if (values.password !== "Password@123") {
                incrementFailedAttempt()
                toast.error("Invalid credentials.")
                setIsLoading(false)
                return
            }

            // Mock user determination logic based on domain
            let role: "admin" | "hospital" | "blood-bank"
            if (values.email.endsWith("@hospital.com")) role = "hospital"
            else if (values.email.endsWith("@bloodbank.com")) role = "blood-bank"
            else if (values.email.endsWith("@admin.com")) role = "admin"
            else {
                toast.error("Invalid domain for organizational login.")
                setIsLoading(false)
                return
            }

            // Governance Rules (DRD 5.2): Check registration status for non-admins
            if (role !== "admin") {
                const registrations = useAdminRegistrationStore.getState().registrations
                const org = registrations.find(r => r.email === values.email)

                if (!org || org.status === "pending") {
                    toast.error("Your registration is pending approval. Please wait for the administrator to verify your account.")
                    setIsLoading(false)
                    return
                }

                if (org.status === "rejected") {
                    toast.error(`Your registration was rejected. Reason: ${org.reviewRemarks || "Not specified"}`)
                    setIsLoading(false)
                    return
                }

                if (org.status === "suspended") {
                    toast.error("Your account has been suspended. Please contact the administrator.")
                    setIsLoading(false)
                    return
                }
            }

            const registrationsAtLogin = useAdminRegistrationStore.getState().registrations
            const mockUser = {
                id: role === "admin" ? "admin" : (registrationsAtLogin.find(r => r.email === values.email)?.id || "1"),
                name: role === "admin" ? "System Admin" : "Organization User",
                email: values.email,
                role: role
            }

            resetFailedAttempts()
            login(mockUser)

            // Redirect based on role
            if (role === 'admin') router.push('/admin')
            else if (role === 'hospital') router.push('/hospital')
            else if (role === 'blood-bank') router.push('/blood-bank')

            setIsLoading(false)
        }, 1000)
    }

    return (
        <Card className="w-full max-w-md shadow-lg border-muted/40">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-critical">BloodConnect</CardTitle>
                <CardDescription>
                    Enter your credentials to access the portal
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="password" className="w-full">
                    <TabsList className="w-full mb-4">
                        <TabsTrigger value="password" className="flex-1">
                            Password
                        </TabsTrigger>
                        <TabsTrigger value="otp" className="flex-1">
                            OTP
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="password">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input placeholder="name@example.com" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center justify-between">
                                    <FormField
                                        control={form.control}
                                        name="rememberMe"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="font-normal text-muted-foreground">
                                                        Remember me
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Button type="submit" className="w-full bg-critical hover:bg-critical/90" disabled={isLoading || isLocked}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLocked ? `Account Locked (${formatTime(timeLeft)})` : 'Sign In'}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="otp">
                        <OtpForm />
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                <div>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-medium text-primary hover:underline">
                        Register for access
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
