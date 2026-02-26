"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Building2 } from "lucide-react"

const profileSchema = z.object({
    hospitalName: z.string().min(2, "Hospital name must be at least 2 characters."),
    registrationId: z.string().min(2, "Registration ID is required."),
    contactPerson: z.string().min(2, "Contact person name is required."),
    phoneNumber: z.string().min(10, "Valid phone number is required."),
    email: z.string().email("Please enter a valid email address."),
    address: z.string().min(5, "Address must be at least 5 characters."),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "State is required."),
    pincode: z.string().min(5, "Valid pincode is required."),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// Default mock values
const defaultValues: Partial<ProfileFormValues> = {
    hospitalName: "City General Hospital",
    registrationId: "HOSP-NY-990812",
    contactPerson: "Dr. Sarah Jenkins",
    phoneNumber: "+1 (555) 123-4567",
    email: "admin@citygeneral.com",
    address: "123 Health Ave, Medical District",
    city: "Metropolis",
    state: "NY",
    pincode: "10001",
}

export default function ProfilePage() {
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues,
    })

    function onSubmit(data: ProfileFormValues) {
        toast.success("Profile Updated", {
            description: "Your hospital profile has been successfully saved.",
        })
        console.log("Profile Data:", data)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Page Header Area */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hospital Profile</h1>
                <p className="text-muted-foreground">
                    Manage your institution&apos;s public details, contact interfaces, and licensing.
                </p>
            </div>

            <div className="mx-auto max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Hospital Information
                        </CardTitle>
                        <CardDescription>
                            Update your hospital&apos;s profile details and contact information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="hospitalName"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Hospital Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter hospital name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="registrationId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registration ID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. HOSP-12345" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="contactPerson"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Person</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter contact person name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="email@hospital.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Street Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter street address" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter city" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter state" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="pincode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pincode</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter pincode/zipcode" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end border-t pt-6">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
