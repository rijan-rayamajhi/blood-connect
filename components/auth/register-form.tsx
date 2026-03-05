"use client"

import * as React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock, Building2, UserCircle, CheckCircle2 } from "lucide-react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const formSchema = z.object({
    orgName: z.string().min(2, {
        message: "Organization name must be at least 2 characters.",
    }),
    role: z.enum(["hospital", "blood-bank"]),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export function RegisterForm() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [licenseFile, setLicenseFile] = React.useState<File | null>(null)
    const [certificationFile, setCertificationFile] = React.useState<File | null>(null)

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            orgName: "",
            role: undefined,
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        if (!licenseFile) {
            toast.error("Please upload an operating license.")
            setIsLoading(false)
            return
        }

        const formData = new FormData()
        formData.append('orgName', values.orgName)
        formData.append('role', values.role)
        formData.append('email', values.email)
        formData.append('password', values.password)
        formData.append('licenseFile', licenseFile)

        if (certificationFile) {
            formData.append('certificationFile', certificationFile)
        }

        try {
            const response = await fetch('/api/registrations', {
                method: 'POST',
                body: formData
            })

            const result = await response.json()
            if (!response.ok || !result.success) {
                toast.error(result.error || "Registration failed. Please try again.")
                setIsLoading(false)
                return
            }

            setIsSuccess(true)
            toast.success("Registration submitted successfully!")
        } catch {
            toast.error("An unexpected error occurred.")
        }
        setIsLoading(false)
    }

    if (isSuccess) {
        return (
            <Card className="w-full max-w-md shadow-lg border-muted/40">
                <CardContent className="pt-8 pb-8 text-center space-y-4">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold">Registration Submitted</h2>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                        Your organization registration is pending admin approval.
                        You will be able to log in once your account has been verified.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="mt-4">
                            Back to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md shadow-lg border-muted/40">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-critical">Create Account</CardTitle>
                <CardDescription>
                    Register your organization to join the network
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="orgName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="City Hospital / Central Blood Bank" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="pl-9 relative">
                                                <UserCircle className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="hospital">Hospital</SelectItem>
                                            <SelectItem value="blood-bank">Blood Bank</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input placeholder="admin@organization.com" className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
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
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm</FormLabel>
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
                        </div>

                        <div className="space-y-4 pt-2 border-t mt-4">
                            <div className="space-y-2">
                                <FormLabel className="flex items-center gap-1">Operating License <span className="text-destructive">*</span></FormLabel>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer file:cursor-pointer file:bg-muted file:text-muted-foreground file:border-0 hover:file:bg-muted/80 file:rounded-md file:px-2 file:py-1 file:-ml-1"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">Please upload your official registration document.</p>
                            </div>
                            <div className="space-y-2">
                                <FormLabel>Special Certification (Optional)</FormLabel>
                                <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setCertificationFile(e.target.files?.[0] || null)}
                                    className="cursor-pointer file:cursor-pointer file:bg-muted file:text-muted-foreground file:border-0 hover:file:bg-muted/80 file:rounded-md file:px-2 file:py-1 file:-ml-1"
                                />
                                <p className="text-[0.8rem] text-muted-foreground">Upload any additional certifications (e.g., AABB compliance).</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-critical hover:bg-critical/90 mt-2" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Register Organization
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
                <div>
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Login here
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
