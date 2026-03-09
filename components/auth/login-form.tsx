"use client"

import { useRouter } from "next/navigation"
import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
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
    const { loginWithPassword, isLocked, lockUntil, checkLockStatus } = useAuthStore()
    const [timeLeft, setTimeLeft] = React.useState(0)

    React.useEffect(() => {
        let interval: NodeJS.Timeout
        if (isLocked && lockUntil) {
            interval = setInterval(() => {
                const now = Date.now()
                if (now >= lockUntil) {
                    checkLockStatus()
                    setTimeLeft(0)
                } else {
                    setTimeLeft(Math.ceil((lockUntil - now) / 1000))
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isLocked, lockUntil, checkLockStatus])

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

        const result = await loginWithPassword(values.email, values.password)

        if (!result.success) {
            toast.error(result.error || "Invalid credentials.")
            setIsLoading(false)
            return
        }

        // Get user from store after successful login
        const user = useAuthStore.getState().user
        if (!user) {
            toast.error("Login failed. Please try again.")
            setIsLoading(false)
            return
        }

        toast.success("Login successful!")

        // Redirect based on role
        if (user.role === 'admin') router.push('/admin')
        else if (user.role === 'hospital') router.push('/hospital')
        else if (user.role === 'blood-bank') router.push('/blood-bank')

        setIsLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center mb-4 lg:hidden">
                <div className="w-12 h-12 rounded-2xl bg-critical flex items-center justify-center shadow-lg shadow-critical/20 mb-4">
                    <span className="text-white font-bold text-xl">BC</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">BloodConnect</h1>
            </div>

            <Card className="w-full max-w-md shadow-2xl border-border/40 bg-background/80 backdrop-blur-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-critical" />
                <CardHeader className="space-y-2 text-center pt-8">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome Back</CardTitle>
                    <CardDescription className="text-base">
                        Access your coordination dashboard
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
        </div>
    )
}
