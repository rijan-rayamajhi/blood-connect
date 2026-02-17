"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Upload, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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

// --- Contact Info Form ---

const contactSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    website: z.string().url().optional().or(z.literal("")),
})

export function ContactInfoForm() {
    const form = useForm<z.infer<typeof contactSchema>>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: "City Central Blood Bank",
            email: "contact@citybloodbank.com",
            phone: "+1 (555) 123-4567",
            address: "123 Healthcare Ave, Metro City",
            website: "https://citybloodbank.com",
        },
    })

    function onSubmit(values: z.infer<typeof contactSchema>) {
        console.log(values)
        // toast.success("Profile updated")
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Blood Bank Profile</CardTitle>
                <CardDescription>Manage your public contact information and location.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="https://" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit">Save Changes</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}

// --- Operating Hours Form ---

export function OperatingHoursForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>Set regular opening hours for donors and hospitals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center justify-between">
                        <Label className="w-24 font-medium">{day}</Label>
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <Select defaultValue="09:00">
                                <SelectTrigger>
                                    <SelectValue placeholder="Open" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="08:00">08:00 AM</SelectItem>
                                    <SelectItem value="09:00">09:00 AM</SelectItem>
                                    <SelectItem value="10:00">10:00 AM</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">-</span>
                            <Select defaultValue={day === "Saturday" || day === "Sunday" ? "14:00" : "17:00"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Close" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="14:00">02:00 PM</SelectItem>
                                    <SelectItem value="17:00">05:00 PM</SelectItem>
                                    <SelectItem value="18:00">06:00 PM</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-20 text-right">
                            <Switch defaultChecked={day !== "Sunday"} />
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button>Save Hours</Button>
            </CardFooter>
        </Card>
    )
}

// --- Notification Settings ---

export function NotificationSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you want to be alerted for urgent events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="email-alerts" className="flex flex-col space-y-1">
                        <span>Email Alerts</span>
                        <span className="font-normal text-xs text-muted-foreground">Receive critical alerts via email.</span>
                    </Label>
                    <Switch id="email-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="sms-alerts" className="flex flex-col space-y-1">
                        <span>SMS Alerts</span>
                        <span className="font-normal text-xs text-muted-foreground">Receive urgent SOS requests via SMS.</span>
                    </Label>
                    <Switch id="sms-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="marketing-emails" className="flex flex-col space-y-1">
                        <span>Donor Camp Reminders</span>
                        <span className="font-normal text-xs text-muted-foreground">Automated reminders for upcoming camps.</span>
                    </Label>
                    <Switch id="marketing-emails" defaultChecked />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button>Update Preferences</Button>
            </CardFooter>
        </Card>
    )
}

// --- Threshold Settings ---

export function ThresholdSettings() {
    const [lowStock, setLowStock] = useState([10])
    const [expiry, setExpiry] = useState([7])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>Set triggers for stock and expiry warnings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Low Stock Alert (Units)</Label>
                        <span className="text-sm font-medium border px-2 py-1 rounded bg-muted">{lowStock} units</span>
                    </div>
                    <Slider
                        defaultValue={[10]}
                        max={50}
                        step={1}
                        onValueChange={setLowStock}
                    />
                    <p className="text-xs text-muted-foreground">
                        Trigger a warning when any blood group drops below this number.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Expiry Warning (Days)</Label>
                        <span className="text-sm font-medium border px-2 py-1 rounded bg-muted">{expiry} days</span>
                    </div>
                    <Slider
                        defaultValue={[7]}
                        max={30}
                        step={1}
                        onValueChange={setExpiry}
                    />
                    <p className="text-xs text-muted-foreground">
                        Flag units that are approaching expiry within this timeframe.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button>Save Thresholds</Button>
            </CardFooter>
        </Card>
    )
}

// --- Compliance Upload ---

export function ComplianceUpload() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Compliance Documents</CardTitle>
                <CardDescription>Upload necessary licenses and certifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center space-y-2 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">
                            PDF, PNG or JPG (max. 10MB)
                        </p>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium">Uploaded Documents</h4>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Shield className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Operating License.pdf</p>
                                <p className="text-xs text-muted-foreground">Added on Jan 15, 2024</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
