"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ContactInfoForm,
    OperatingHoursForm,
    NotificationSettings,
    ThresholdSettings,
    ComplianceUpload
} from "@/components/dashboard/settings/settings-forms"

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your blood bank profile, preferences, and configurations.
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <ContactInfoForm />
                </TabsContent>

                <TabsContent value="operations" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <OperatingHoursForm />
                        <ThresholdSettings />
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <NotificationSettings />
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                    <ComplianceUpload />
                </TabsContent>
            </Tabs>
        </div>
    )
}
