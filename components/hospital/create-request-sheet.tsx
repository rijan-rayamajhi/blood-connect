"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Droplet, FileText, Siren, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl sm:max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="px-6 pt-6 pb-2 border-b bg-muted/30">
                    <DialogTitle className="text-2xl font-bold">Create Blood Request</DialogTitle>
                    <DialogDescription>
                        Submit a new request for blood units to nearby blood banks.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 relative">
                    {/* Step Indicator */}
                    <div className="relative flex items-center justify-between w-full max-w-lg mx-auto mb-8 px-2">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-muted -z-10" />
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary -z-10 transition-all duration-500 ease-in-out"
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
                                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500 shadow-sm",
                                            isActive ? "border-primary bg-primary text-primary-foreground scale-110 shadow-primary/30" :
                                                isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                                    "border-muted text-muted-foreground bg-background"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold transition-all duration-500 absolute mt-12 w-24 text-center",
                                        isActive ? "text-primary tracking-wide drop-shadow-sm" :
                                            isCompleted ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Content Area with smooth transition */}
                    <div className="mt-10 min-h-[350px] animate-in fade-in slide-in-from-right-4 duration-500">
                        {renderStepContent()}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="border-t bg-muted/10 px-6 py-4 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-sm">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={cn("w-24 border bg-background/50", currentStep === 1 && "invisible")}
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <Button
                        onClick={handleNextClick}
                        className="w-32 shadow-md transition-all hover:scale-[1.02]"
                        size="lg"
                    >
                        {currentStep === steps.length ? "Submit Request" : "Next Step"}
                        {currentStep !== steps.length && <ChevronRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
