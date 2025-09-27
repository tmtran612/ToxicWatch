import { LayersIcon, FilterIcon, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function MapControls() {
  return (
    <div className="absolute top-4 left-4 space-y-2">
      <Card className="bg-card/90 backdrop-blur-sm border-border">
        <CardContent className="p-2">
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              <LayersIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <FilterIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
