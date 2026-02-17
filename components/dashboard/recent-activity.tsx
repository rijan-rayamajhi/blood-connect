"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentActivity() {
    // Mock data for demonstration. 
    // In a real application, this would fetch from a system audit log or notifications endpoint.
    const activities = [
        {
            user: "City Hospital",
            action: "Requested 5 units of O-",
            time: "2 mins ago",
            initials: "CH",
            type: "request"
        },
        {
            user: "Admin",
            action: "Added 10 units of A+",
            time: "15 mins ago",
            initials: "AD",
            type: "add"
        },
        {
            user: "St. Mary's Clinic",
            action: "Requested 2 units of B+",
            time: "1 hour ago",
            initials: "SM",
            type: "request"
        },
        {
            user: "System",
            action: "Alert: O- stock critical",
            time: "2 hours ago",
            initials: "SY",
            type: "alert"
        },
        {
            user: "John Doe",
            action: "Registered as new donor",
            time: "3 hours ago",
            initials: "JD",
            type: "donor"
        }
    ]

    return (
        <Card className="col-span-full lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                    Latest actions and requests from the system.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {activities.map((activity, index) => (
                        <div className="flex items-center" key={index}>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                <AvatarFallback>{activity.initials}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.user}</p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.action}
                                </p>
                            </div>
                            <div className="ml-auto font-medium text-xs text-muted-foreground">
                                {activity.time}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
