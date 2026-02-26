"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarClock, Droplets } from "lucide-react"

// Zod schema for pre-booking form validation
const preBookingSchema = z.object({
    bloodGroup: z.string().min(1, "Please select a blood group."),
    componentType: z.string().min(1, "Please select a component type."),
    quantity: z.number().min(1, "Quantity must be at least 1 unit."),
    scheduledDate: z.string().min(1, "Scheduled date and time is required."),
    notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
})

export type PreBookingFormValues = z.infer<typeof preBookingSchema>

interface CreatePreBookingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: PreBookingFormValues) => void
}

export function CreatePreBookingModal({ open, onOpenChange, onSubmit }: CreatePreBookingModalProps) {
    // Initialize form
    const form = useForm<PreBookingFormValues>({
        resolver: zodResolver(preBookingSchema),
        defaultValues: {
            bloodGroup: "",
            componentType: "",
            quantity: 1,
            scheduledDate: "",
            notes: "",
        },
    })

    const handleSubmit = (data: PreBookingFormValues) => {
        onSubmit(data)
        // Reset form after successful submission
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            onOpenChange(newOpen)
            if (!newOpen) {
                form.reset() // Reset form when modal is closed without submitting
            }
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        Create Pre-Booking
                    </DialogTitle>
                    <DialogDescription>
                        Schedule a future blood delivery requirement.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Blood Group */}
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
                                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
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

                            {/* Component Type */}
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
                                                {["Whole Blood", "Packed RBC", "Platelets", "Plasma", "Cryoprecipitate", "Granulocytes"].map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Quantity */}
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (Units)</FormLabel>
                                        <div className="relative">
                                            <Droplets className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    className="pl-9"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Scheduled Date/Time - Using native datetime-local for simplicity as requested */}
                            <FormField
                                control={form.control}
                                name="scheduledDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scheduled For</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any specific requirements or delivery instructions..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Actions */}
                        <div className="pt-4 flex justify-end gap-2 border-t mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create Booking
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
