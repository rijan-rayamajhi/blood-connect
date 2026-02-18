import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Map, List } from "lucide-react"

export function ViewToggle() {
    return (
        <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
            <TabsTrigger
                value="list"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
                <List className="mr-2 h-4 w-4" />
                List View
            </TabsTrigger>
            <TabsTrigger
                value="map"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
                <Map className="mr-2 h-4 w-4" />
                Map View
            </TabsTrigger>
        </TabsList>
    )
}
