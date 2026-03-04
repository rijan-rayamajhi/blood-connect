"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { useInventoryStore } from "@/lib/store/inventory-store"
import { useMasterDataStore } from "@/lib/store/master-data-store"

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

// Blood groups and component types are sourced from master-data-store at runtime

const formSchema = z.object({
    bloodGroup: z.string().min(1, "Please select a blood group."),
    componentType: z.string().min(1, "Please select a component type."),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1ml."),
    collectionDate: z.string().refine((date) => new Date(date) <= new Date(), {
        message: "Collection date cannot be in the future.",
    }),
    expiryDate: z.string(),
}).refine((data) => new Date(data.expiryDate) > new Date(data.collectionDate), {
    message: "Expiry date must be after collection date.",
    path: ["expiryDate"],
})

type FormValues = z.infer<typeof formSchema>

export function AddInventoryModal() {
    const [open, setOpen] = useState(false)
    const bloodGroups = useMasterDataStore((s) => s.bloodGroups)
    const componentTypes = useMasterDataStore((s) => s.componentTypes)

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            quantity: 450,
            bloodGroup: "A+", // Default to avoid controlled/uncontrolled warning
            componentType: "Whole Blood",
            collectionDate: new Date().toISOString().split('T')[0],
            expiryDate: "",
        },
    })

    const addItem = useInventoryStore((state) => state.addItem)

    function onSubmit(values: FormValues) {
        addItem({
            bloodGroup: values.bloodGroup as import("@/lib/store/inventory-store").BloodGroup,
            componentType: values.componentType as import("@/lib/store/inventory-store").ComponentType,
            quantity: values.quantity,
            collectionDate: values.collectionDate,
            expiryDate: values.expiryDate
        })
        setOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Inventory
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Inventory Unit</DialogTitle>
                    <DialogDescription>
                        Enter details for the new blood unit. Click save when done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {bloodGroups.map((bg) => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="componentType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Component</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {componentTypes.map((c) => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Volume (ml)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="collectionDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Collection Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expiryDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Expiry Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit">Save Unit</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
