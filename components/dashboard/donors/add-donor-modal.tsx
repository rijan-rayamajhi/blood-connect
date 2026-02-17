"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import { useDonorStore } from "@/lib/store/donor-store"

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const

const formSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters."),
    bloodGroup: z.enum(BLOOD_GROUPS),
    age: z.coerce.number().min(18, "Donor must be at least 18 years old.").max(65, "Donor must be under 65."),
    contactNumber: z.string().min(10, "Invalid contact number."),
    email: z.string().email("Invalid email address."),
    lastDonationDate: z.string().refine((date) => new Date(date) <= new Date(), {
        message: "Date cannot be in the future.",
    }),
})

type FormValues = z.infer<typeof formSchema>

export function AddDonorModal() {
    const [open, setOpen] = useState(false)
    const addDonor = useDonorStore((state) => state.addDonor)

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            fullName: "",
            bloodGroup: "O+",
            age: 25,
            contactNumber: "",
            email: "",
            lastDonationDate: new Date().toISOString().split('T')[0],
        },
    })

    function onSubmit(values: FormValues) {
        addDonor({
            fullName: values.fullName,
            bloodGroup: values.bloodGroup,
            age: values.age,
            contactNumber: values.contactNumber,
            email: values.email,
            lastDonationDate: values.lastDonationDate,
        })
        setOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Register Donor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Register New Donor</DialogTitle>
                    <DialogDescription>
                        detailed profile for the new blood donor.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="bloodGroup"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Blood Group</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select group" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {BLOOD_GROUPS.map((bg) => (
                                                    <SelectItem key={bg} value={bg}>
                                                        {bg}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234..." {...field} />
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="lastDonationDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Donation Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit">Register Donor</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
