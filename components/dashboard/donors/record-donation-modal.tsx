"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Syringe } from "lucide-react"

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
import { useDonorStore, Donor } from "@/lib/store/donor-store"
import { toast } from "sonner"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

const formSchema = z.object({
    donationDate: z.string().refine((date) => new Date(date) <= new Date(), {
        message: "Date cannot be in the future.",
    }),
    componentType: z.string().min(1, "Component type is required."),
    quantity: z.coerce.number().min(50, "Quantity must be at least 50ml.").max(1000, "Quantity too high."),
    notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function RecordDonationModal({ donor, asDropdownItem = false }: { donor: Donor, asDropdownItem?: boolean }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const recordDonation = useDonorStore((state) => state.recordDonation)

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            donationDate: new Date().toISOString().split('T')[0],
            componentType: "Whole Blood",
            quantity: 350,
            notes: "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            await recordDonation(donor.id, {
                donationDate: values.donationDate,
                componentType: values.componentType,
                quantity: values.quantity,
                notes: values.notes,
            })
            toast.success("Donation recorded successfully")
            setOpen(false)
            form.reset()
        } catch (error) {
            toast.error("Failed to record donation")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {asDropdownItem ? (
                    <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault()
                        setOpen(true)
                    }}>
                        <Syringe className="mr-2 h-4 w-4" />
                        Record Donation
                    </DropdownMenuItem>
                ) : (
                    <Button variant="outline" size="sm">
                        <Syringe className="mr-2 h-4 w-4" />
                        Record
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Donation</DialogTitle>
                    <DialogDescription>
                        Record a new blood donation for {donor.fullName} ({donor.bloodGroup}).
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="donationDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Donation Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="componentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Component Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Whole Blood">Whole Blood</SelectItem>
                                                <SelectItem value="Packed RBC">Packed RBC</SelectItem>
                                                <SelectItem value="Platelets">Platelets</SelectItem>
                                                <SelectItem value="Plasma">Plasma</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (ml)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Any observations during donation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Recording..." : "Record Donation"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
