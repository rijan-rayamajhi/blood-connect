"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { UploadCloud, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step2Data {
    file: File | null
    note: string
}

interface Step2Props {
    onNext: (data: Step2Data) => void
    defaultValues?: Partial<Step2Data>
}

export function Step2Prescription({ onNext, defaultValues }: Step2Props) {
    const [file, setFile] = useState<File | null>(defaultValues?.file || null)
    const [note, setNote] = useState(defaultValues?.note || "")
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleRemoveFile = () => {
        setFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext({ file, note })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Upload Prescription / Doctor&apos;s Note (Optional)</Label>
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                        file ? "bg-muted/30" : ""
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                >
                    <Input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                    />

                    {file ? (
                        <div className="flex items-center gap-4 w-full max-w-sm bg-background p-3 rounded-md border shadow-sm relative z-10">
                            <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveFile()
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Click to upload or drag and drop</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">
                                SVG, PNG, JPG or PDF (max. 5MB)
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="note">Additional Notes</Label>
                <Textarea
                    id="note"
                    placeholder="Enter any specific requirements or patient details..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="h-32 resize-none"
                    maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                    {note.length}/500 characters
                </p>
            </div>

            {/* Hidden submit trigger */}
            <Button type="submit" className="hidden" id="step-2-submit">Submit</Button>
        </form>
    )
}
