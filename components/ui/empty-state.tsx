import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg animate-in fade-in zoom-in-95 duration-500">
            {Icon && (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
            )}
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </div>
    )
}
