import { MapPinIcon, FactoryIcon, AlertTriangleIcon, ChevronRightIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FacilityWithReleases } from "@/lib/types"
import { formatChemicalAmount, getRiskLevel } from "@/lib/tri-utils"
import { WatchlistButton } from "@/components/watchlist-button"

interface FacilityCardProps {
  facility: FacilityWithReleases
}

export function FacilityCard({ facility }: FacilityCardProps) {
  const riskLevel = getRiskLevel(facility.totalReleases)
  const riskColors = {
    low: "bg-green-500/10 text-green-400 border-green-500/20",
    moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <FactoryIcon className="h-5 w-5 text-primary" />
              <span>{facility.facilityName}</span>
            </CardTitle>
            <CardDescription className="flex items-center space-x-1 mt-2">
              <MapPinIcon className="h-4 w-4" />
              <span>
                {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
              </span>
            </CardDescription>
          </div>
          <Badge className={riskColors[riskLevel]} variant="outline">
            {riskLevel} risk
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-muted-foreground">Industry</div>
            <div className="font-medium text-foreground">{facility.industry}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Releases</div>
            <div className="font-medium text-foreground">{formatChemicalAmount(facility.totalReleases, "pounds")}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Chemicals</div>
            <div className="font-medium text-foreground">{facility.releases.length} types</div>
          </div>
        </div>

        {facility.topChemicals.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">Top Chemicals Released</div>
            <div className="flex flex-wrap gap-2">
              {facility.topChemicals.slice(0, 3).map((chemical, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {chemical.name}: {formatChemicalAmount(chemical.amount, chemical.unit)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <AlertTriangleIcon className="h-4 w-4" />
            <span>Reporting Year: {facility.reportingYear}</span>
          </div>
          <div className="flex items-center gap-2">
            <WatchlistButton
              item={{
                type: "facility",
                name: facility.facilityName,
                data: facility,
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="text-primary border-primary/20 hover:bg-primary/10 bg-transparent"
            >
              View Details
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
