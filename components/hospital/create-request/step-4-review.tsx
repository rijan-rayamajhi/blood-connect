"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Step1Data } from "./step-1-blood-details"
import { Step2Data } from "./step-2-prescription"
import { Step3Data } from "./step-3-urgency"
import { cn } from "@/lib/utils"
import { Droplet, FileText, Siren, Calendar } from "lucide-react"

interface Step4Props {
    step1: Step1Data
    step2: Step2Data
    step3: Step3Data
    onSubmit: () => void
}

export function Step4Review({ step1, step2, step3, onSubmit }: Step4Props) {
    const [confirmed, setConfirmed] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (confirmed) {
            onSubmit()
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A"
        return new Date(dateString).toLocaleString()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                    {/* Urgency Banner */}
                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border",
                        step3.urgency === "critical" ? "bg-red-50 border-red-200 text-red-900" :
                            step3.urgency === "moderate" ? "bg-orange-50 border-orange-200 text-orange-900" :
                                "bg-blue-50 border-blue-200 text-blue-900"
                    )}>
                        <Siren className="h-5 w-5" />
                        <div>
                            <p className="font-bold capitalize">{step3.urgency} Priority</p>
                            <p className="text-sm opacity-90">
                                {step3.requestType === "broadcast" ? "Broadcasting to all nearby banks" : "Direct request to specific bank"}
                            </p>
                        </div>
                    </div>

                    {/* Blood Details */}
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                                <Droplet className="h-4 w-4 text-primary" />
                                <h3>Blood Requirements</h3>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Blood Group</p>
                                    <p className="font-medium">{step1.bloodGroup}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Component</p>
                                    <p className="font-medium">{step1.componentType}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Quantity</p>
                                    <p className="font-medium">{step1.quantity} Unit(s)</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Required By</p>
                                    <div className="flex items-center gap-1 font-medium">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(step1.requiredDate)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prescription / Notes */}
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-2 font-semibold text-foreground">
                                <FileText className="h-4 w-4 text-primary" />
                                <h3>Documentation</h3>
                            </div>
                            <Separator />
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground mb-1">Prescription File</p>
                                    {step2.file ? (
                                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md w-fit">
                                            <FileText className="h-4 w-4" />
                                            <span className="font-medium">{step2.file.name}</span>
                                            <span className="text-xs text-muted-foreground">({(step2.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No file uploaded</p>
                                    )}
                                </div>
                                {step2.note && (
                                    <div>
                                        <p className="text-muted-foreground mb-1">Additional Notes</p>
                                        <p className="p-2 bg-muted/50 rounded-md text-foreground">
                                            {step2.note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>

            <div className="space-y-4 pt-2">
                <div className="flex items-start gap-2">
                    <Checkbox
                        id="confirm"
                        checked={confirmed}
                        onCheckedChange={(c) => setConfirmed(c === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                        <Label
                            htmlFor="confirm"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I confirm that the details provided are accurate.
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            False requests may lead to suspension of hospital privileges.
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden submit trigger */}
            <Button type="submit" className="hidden" id="step-4-submit" disabled={!confirmed}>Submit Application</Button>
        </form>
    )
}
