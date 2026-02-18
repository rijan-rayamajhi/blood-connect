"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Siren, AlertTriangle, Clock, RadioTower, Store } from "lucide-react"
import { cn } from "@/lib/utils"

export type UrgencyLevel = "critical" | "moderate" | "normal"
export type RequestType = "broadcast" | "direct"

export interface Step3Data {
    urgency: UrgencyLevel
    requestType: RequestType
}

interface Step3Props {
    onNext: (data: Step3Data) => void
    defaultValues?: Partial<Step3Data>
}

export function Step3Urgency({ onNext, defaultValues }: Step3Props) {
    const [urgency, setUrgency] = useState<UrgencyLevel>(defaultValues?.urgency || "normal")
    const [requestType, setRequestType] = useState<RequestType>(defaultValues?.requestType || "broadcast")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({ urgency, requestType })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
                <Label className="text-base">Urgency Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        type="button"
                        onClick={() => setUrgency("critical")}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2",
                            urgency === "critical"
                                ? "border-red-500 bg-red-50 text-red-700 ring-red-500"
                                : "border-muted bg-card hover:border-red-200 hover:bg-red-50/50"
                        )}
                    >
                        <Siren className={cn("h-8 w-8 mb-3", urgency === "critical" ? "text-red-600 animate-pulse" : "text-muted-foreground")} />
                        <span className="font-bold">Critical</span>
                        <span className="text-xs text-center mt-1 opacity-80">Life Threatening</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setUrgency("moderate")}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2",
                            urgency === "moderate"
                                ? "border-orange-500 bg-orange-50 text-orange-700 ring-orange-500"
                                : "border-muted bg-card hover:border-orange-200 hover:bg-orange-50/50"
                        )}
                    >
                        <AlertTriangle className={cn("h-8 w-8 mb-3", urgency === "moderate" ? "text-orange-600" : "text-muted-foreground")} />
                        <span className="font-bold">Moderate</span>
                        <span className="text-xs text-center mt-1 opacity-80">Urgent but stable</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setUrgency("normal")}
                        className={cn(
                            "flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2",
                            urgency === "normal"
                                ? "border-blue-500 bg-blue-50 text-blue-700 ring-blue-500"
                                : "border-muted bg-card hover:border-blue-200 hover:bg-blue-50/50"
                        )}
                    >
                        <Clock className={cn("h-8 w-8 mb-3", urgency === "normal" ? "text-blue-600" : "text-muted-foreground")} />
                        <span className="font-bold">Normal</span>
                        <span className="text-xs text-center mt-1 opacity-80">Routine / Scheduled</span>
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <Label className="text-base">Request Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        onClick={() => setRequestType("broadcast")}
                        className={cn(
                            "relative flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all",
                            requestType === "broadcast"
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:bg-muted/50"
                        )}
                    >
                        <div className={cn("mt-1", requestType === "broadcast" ? "text-primary" : "text-muted-foreground")}>
                            <RadioTower className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Broadcast to Nearby</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Send request to all blood banks within 10km radius. Best for urgent needs.
                            </p>
                        </div>
                        {requestType === "broadcast" && (
                            <div className="absolute top-4 right-4 h-3 w-3 bg-primary rounded-full" />
                        )}
                    </div>

                    <div
                        onClick={() => setRequestType("direct")}
                        className={cn(
                            "relative flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all",
                            requestType === "direct"
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:bg-muted/50"
                        )}
                    >
                        <div className={cn("mt-1", requestType === "direct" ? "text-primary" : "text-muted-foreground")}>
                            <Store className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold">Single Blood Bank</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Select a specific blood bank from your favorites or search results.
                            </p>
                        </div>
                        {requestType === "direct" && (
                            <div className="absolute top-4 right-4 h-3 w-3 bg-primary rounded-full" />
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden submit trigger */}
            <Button type="submit" className="hidden" id="step-3-submit">Submit</Button>
        </form>
    )
}
