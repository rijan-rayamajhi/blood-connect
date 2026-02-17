export function Sidebar() {
    return (
        <div className="w-64 border-r bg-card h-full hidden md:block">
            <div className="p-6">
                <h2 className="text-lg font-semibold tracking-tight text-primary">BloodConnect</h2>
            </div>
            <nav className="px-4 space-y-2">
                {/* Navigation items will go here */}
                <div className="h-9 w-full rounded-md bg-muted/50" />
                <div className="h-9 w-full rounded-md bg-muted/50" />
                <div className="h-9 w-full rounded-md bg-muted/50" />
            </nav>
        </div>
    )
}
