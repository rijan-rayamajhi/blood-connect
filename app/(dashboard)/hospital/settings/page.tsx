"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Bell, ShieldAlert, SlidersHorizontal } from "lucide-react"

export default function SettingsPage() {
    const handleSave = (section: string) => {
        toast.success("Settings Saved", {
            description: `Your ${section} have been updated successfully.`,
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Page Header Area */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your hospital account preferences and system configurations.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

                {/* Column 1 */}
                <div className="space-y-6 lg:col-span-2">


                    {/* SECTION 2: Notification Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>
                                Choose what alerts you receive and how they are delivered.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1 text-sm">
                                    <Label htmlFor="emailAlerts" className="font-semibold text-base">Email Notifications</Label>
                                    <p className="text-muted-foreground">Receive daily summaries and alerts via email.</p>
                                </div>
                                <Switch id="emailAlerts" defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1 text-sm">
                                    <Label htmlFor="inAppAlerts" className="font-semibold text-base">In-app Notifications</Label>
                                    <p className="text-muted-foreground">Show notification badges within the hospital portal.</p>
                                </div>
                                <Switch id="inAppAlerts" defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1 text-sm">
                                    <Label htmlFor="criticalAlerts" className="font-semibold text-base">Critical Emergency Alerts</Label>
                                    <p className="text-muted-foreground">Get immediate high-priority alerts for critical shortages.</p>
                                </div>
                                <Switch id="criticalAlerts" defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1 text-sm">
                                    <Label htmlFor="soundAlerts" className="font-semibold text-base">Sound Alerts</Label>
                                    <p className="text-muted-foreground">Play a sound when a new critical notification arrives.</p>
                                </div>
                                <Switch id="soundAlerts" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4 flex justify-end">
                            <Button onClick={() => handleSave("notification settings")}>Save Preferences</Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Column 2 */}
                <div className="space-y-6">
                    {/* SECTION 3: Alert Threshold Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                Alert Thresholds
                            </CardTitle>
                            <CardDescription>
                                Set minimum unit warnings before triggering automated low-supply alerts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="redBloodCells">Packed RBC (Units)</Label>
                                <Input id="redBloodCells" type="number" defaultValue="20" min="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="platelets">Platelets (Units)</Label>
                                <Input id="platelets" type="number" defaultValue="10" min="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plasma">Plasma (Units)</Label>
                                <Input id="plasma" type="number" defaultValue="15" min="0" />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4 flex justify-end">
                            <Button onClick={() => handleSave("alert thresholds")}>Save Thresholds</Button>
                        </CardFooter>
                    </Card>

                    {/* SECTION 4: Default Request Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                Default Request Settings
                            </CardTitle>
                            <CardDescription>
                                Configure standard parameters for new blood requests to speed up data entry.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Default Urgency</Label>
                                <Select defaultValue="normal">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select urgency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="routine">Routine (24-48 hrs)</SelectItem>
                                        <SelectItem value="normal">Normal (12-24 hrs)</SelectItem>
                                        <SelectItem value="urgent">Urgent (2-4 hrs)</SelectItem>
                                        <SelectItem value="critical">Critical (Immediate)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Default Blood Component</Label>
                                <Select defaultValue="wholeBlood">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood component" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="wholeBlood">Whole Blood</SelectItem>
                                        <SelectItem value="packedRbc">Packed RBC</SelectItem>
                                        <SelectItem value="platelets">Platelets</SelectItem>
                                        <SelectItem value="plasma">Plasma</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between space-x-2 pt-2">
                                <div className="flex flex-col space-y-1 text-sm">
                                    <Label htmlFor="autoBroadcast" className="font-semibold text-base">Auto-broadcast Emergency Requests</Label>
                                    <p className="text-muted-foreground">Automatically send critical requests to all nearby blood banks.</p>
                                </div>
                                <Switch id="autoBroadcast" defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4 flex justify-end">
                            <Button onClick={() => handleSave("request defaults")}>Save Defaults</Button>
                        </CardFooter>
                    </Card>
                </div>

            </div>
        </div>
    )
}
