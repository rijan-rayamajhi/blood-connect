"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


const formSchema = z.object({
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
    componentType: z.enum(["Whole Blood", "PRBC", "Platelets", "Plasma", "Cryo"]),
    quantity: z.coerce.number().min(1, {
        message: "Quantity must be at least 1 unit.",
    }).max(20, {
        message: "For large quantities (>20), please contact blood bank directly.",
    }),
    requiredDate: z.string().refine((val) => new Date(val) > new Date(), {
        message: "Required date must be in the future.",
    }),
})

export type Step1Data = z.infer<typeof formSchema>

interface Step1Props {
    onNext: (data: Step1Data) => void
    defaultValues?: Partial<Step1Data>
}

export function Step1BloodDetails({ onNext, defaultValues }: Step1Props) {
    const form = useForm<Step1Data>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            bloodGroup: defaultValues?.bloodGroup,
            componentType: defaultValues?.componentType,
            quantity: defaultValues?.quantity || 1,
            requiredDate: defaultValues?.requiredDate || "",
        },
    })

    function onSubmit(values: Step1Data) {
        onNext(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Blood Group</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
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
                                        {["Whole Blood", "PRBC", "Platelets", "Plasma", "Cryo"].map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="hidden" id="step-1-submit">Submit</Button>
            </form>
        </Form>
    )
}
