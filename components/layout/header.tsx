import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="h-16 border-b bg-background flex items-center px-6 justify-between">
            <div className="font-semibold">Dashboard</div>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">SOS</Button>
                <div className="h-8 w-8 rounded-full bg-muted" />
            </div>
        </header>
    )
}
