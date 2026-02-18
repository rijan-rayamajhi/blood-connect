import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Phone, Navigation, ShieldCheck, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface BloodBankCardProps {
    name: string
    distance: string
    time: string
    phone: string
    availableGroups: string[]
    type: string
    reliability: number
    isBestMatch?: boolean
}

export function BloodBankCard({ name, distance, time, phone, availableGroups, type, reliability, isBestMatch }: BloodBankCardProps) {
    return (
        <Card className={cn(
            "flex flex-col h-full hover:shadow-md transition-all relative overflow-hidden",
            isBestMatch ? "border-primary ring-1 ring-primary shadow-primary/10" : "hover:border-primary/50"
        )}>
            {isBestMatch && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                    <Star className="h-3 w-3 fill-current" />
                    BEST MATCH
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1 w-full pr-16"> {/* pr-16 for badge space */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base font-bold line-clamp-1">{name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5 font-normal">{type}</Badge>
                        <CardDescription className="flex items-center text-xs mt-1">
                            <MapPin className="mr-1 h-3 w-3 shrink-0" /> {distance}
                            <span className="mx-2 text-muted-foreground/50">•</span>
                            <Clock className="mr-1 h-3 w-3 shrink-0" /> {time}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3 flex-1 space-y-4">
                {/* Reliability Score */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center text-xs font-medium text-muted-foreground">
                        <ShieldCheck className={cn("mr-1.5 h-3.5 w-3.5", reliability > 90 ? "text-emerald-500" : "text-amber-500")} />
                        Reliability Score
                    </div>
                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden max-w-[100px]">
                        <div
                            className={cn("h-full rounded-full", reliability > 90 ? "bg-emerald-500" : "bg-amber-500")}
                            style={{ width: `${reliability}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold">{reliability}%</span>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Available Groups</p>
                    <div className="flex flex-wrap gap-1.5">
                        {availableGroups.length > 0 ? availableGroups.map((group) => (
                            <Badge key={group} variant="outline" className={cn(
                                "text-xs font-medium px-1.5 h-6",
                                isBestMatch ? "bg-primary/5 border-primary/20 text-primary" : ""
                            )}>
                                {group}
                            </Badge>
                        )) : (
                            <span className="text-xs text-muted-foreground italic">No availability data</span>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0 gap-2">
                <Button size="sm" className={cn("flex-1", isBestMatch ? "default" : "secondary")}>
                    Request Blood
                </Button>
                <Button size="sm" variant="outline" className="px-3" title={`Call ${phone}`}>
                    <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="px-3" title="Navigate">
                    <Navigation className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
