"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplet, FileText, Siren, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Step1BloodDetails, Step1Data } from "@/components/hospital/create-request/step-1-blood-details"
import { Step2Prescription, Step2Data } from "@/components/hospital/create-request/step-2-prescription"
import { Step3Urgency, Step3Data } from "@/components/hospital/create-request/step-3-urgency"
import { Step4Review } from "@/components/hospital/create-request/step-4-review"
import { useCreateRequestStore } from "@/lib/modal-store"
import { toast } from "sonner"

const steps = [
    { id: 1, label: "Blood Details", icon: Droplet },
    { id: 2, label: "Prescription", icon: FileText },
    { id: 3, label: "Urgency", icon: Siren },
    { id: 4, label: "Review", icon: CheckCircle },
]

export function CreateRequestSheet() {
    const { isOpen, onClose } = useCreateRequestStore()
    const [currentStep, setCurrentStep] = useState(1)
    const [step1Data, setStep1Data] = useState<Partial<Step1Data>>({})
    const [step2Data, setStep2Data] = useState<Partial<Step2Data>>({})
    const [step3Data, setStep3Data] = useState<Partial<Step3Data>>({})

    // Reset step when closed
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose()
            // Optional: reset step after a delay or immediately
            setTimeout(() => setCurrentStep(1), 300)
        }
    }

    const handleStep1Next = (data: Step1Data) => {
        setStep1Data(prev => ({ ...prev, ...data }))
        setCurrentStep(prev => prev + 1)
    }

    const handleStep2Next = (data: Step2Data) => {
        setStep2Data(prev => ({ ...prev, ...data }))
        setCurrentStep(prev => prev + 1)
    }

    const handleStep3Next = (data: Step3Data) => {
        setStep3Data(prev => ({ ...prev, ...data }))
        setCurrentStep(prev => prev + 1)
    }

    const handleFinalSubmit = () => {
        // Here you would normally make an API call
        console.log("Submitting Request:", {
            ...step1Data,
            ...step2Data,
            ...step3Data
        })

        toast.success("Blood Request Submitted", {
            description: "Your request has been broadcasted to nearby blood banks.",
        })

        onClose()
        // Reset state
        setTimeout(() => {
            setCurrentStep(1)
            setStep1Data({})
            setStep2Data({})
            setStep3Data({})
        }, 300)
    }

    const handleNextClick = () => {
        if (currentStep === 1) {
            // Trigger form submission for Step 1
            document.getElementById("step-1-submit")?.click()
        } else if (currentStep === 2) {
            document.getElementById("step-2-submit")?.click()
        } else if (currentStep === 3) {
            document.getElementById("step-3-submit")?.click()
        } else if (currentStep === 4) {
            document.getElementById("step-4-submit")?.click()
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1BloodDetails
                        onNext={handleStep1Next}
                        defaultValues={step1Data}
                    />
                )
            case 2:
                // Cast step2Data explicitly since File is not serializable usually but fine in client state
                return (
                    <Step2Prescription
                        onNext={handleStep2Next}
                        defaultValues={step2Data as Step2Data}
                    />
                )
            case 3:
                return (
                    <Step3Urgency
                        onNext={handleStep3Next}
                        defaultValues={step3Data as Step3Data} // Cast ensuring default handling inside component is robust
                    />
                )
            case 4:
                return (
                    <Step4Review
                        step1={step1Data as Step1Data}
                        step2={step2Data as Step2Data}
                        step3={step3Data as Step3Data}
                        onSubmit={handleFinalSubmit}
                    />
                )
            default:
                return null
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Create Blood Request</SheetTitle>
                    <SheetDescription>
                        Submit a new request for blood units to nearby blood banks.
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-8">
                    {/* Step Indicator */}
                    <div className="relative flex items-center justify-between w-full px-2">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((step) => {
                            const isActive = step.id === currentStep
                            const isCompleted = step.id < currentStep
                            const Icon = step.icon

                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                                            isActive ? "border-primary bg-primary text-primary-foreground scale-110" :
                                                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                                    "border-muted-foreground/30 text-muted-foreground bg-background"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-medium transition-colors duration-300 absolute mt-9 w-20 text-center",
                                        isActive ? "text-primary font-bold" :
                                            isCompleted ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Content Card */}
                    <Card className="mt-8 border-t-4 border-t-primary shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">
                                {steps[currentStep - 1].label}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Step {currentStep} of {steps.length}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderStepContent()}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-4">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={cn("w-24", currentStep === 1 && "opacity-0")}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>

                            <Button
                                onClick={handleNextClick}
                                className="w-24"
                            >
                                {currentStep === steps.length ? "Submit" : "Next"}
                                {currentStep !== steps.length && <ChevronRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </SheetContent>
        </Sheet>
    )
}
