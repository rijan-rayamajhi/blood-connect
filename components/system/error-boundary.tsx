"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallbackTitle?: string
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("[ErrorBoundary]", error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="flex flex-col items-center justify-center gap-6 p-12 text-center min-h-[400px]"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="rounded-full bg-destructive/10 p-4">
                        <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h2 className="text-xl font-semibold">
                            {this.props.fallbackTitle ?? "Something went wrong"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            An unexpected error occurred. Please try again or contact support if the problem persists.
                        </p>
                        {this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                                    Error details
                                </summary>
                                <pre className="mt-2 overflow-auto rounded bg-muted p-3 text-xs max-h-40">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                    <Button
                        onClick={this.handleRetry}
                        variant="outline"
                        className="gap-2"
                        aria-label="Retry loading the page"
                    >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Try Again
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
