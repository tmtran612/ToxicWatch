"use client"

import { X, MapPinIcon, FactoryIcon, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { FacilityWithReleases } from "@/lib/types"
import { formatChemicalAmount, getRiskLevel } from "@/lib/tri-utils"

interface FacilityPopupProps {
  facility: FacilityWithReleases
  onClose: () => void
}

export function FacilityPopup({ facility, onClose }: FacilityPopupProps) {
  const riskLevel = getRiskLevel(facility.totalReleases)
  const riskColors = {
    low: "bg-green-500/10 text-green-400 border-green-500/20",
    moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    high: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <div className="absolute top-4 right-4 w-96 z-30">
      <Card className="bg-card border-border shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center space-x-2 text-foreground">
                <FactoryIcon className="h-5 w-5 text-primary" />
                <span className="text-lg">{facility.facilityName}</span>
              </CardTitle>
              <CardDescription className="flex items-center space-x-1 mt-2">
                <MapPinIcon className="h-4 w-4" />
                <span>
                  {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
                </span>
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2 mt-3">
            <Badge className={riskColors[riskLevel]} variant="outline">
              {riskLevel} risk
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {facility.industry}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-xl font-bold text-primary">
                {formatChemicalAmount(facility.totalReleases, "pounds")}
              </div>
              <div className="text-xs text-muted-foreground">Total Releases</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-xl font-bold text-accent">{facility.releases.length}</div>
              <div className="text-xs text-muted-foreground">Chemical Types</div>
            </div>
          </div>

          {/* Top Chemicals */}
          {facility.topChemicals.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Top Chemical Releases</h4>
              <div className="space-y-2">
                {facility.topChemicals.slice(0, 3).map((chemical, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{chemical.name}</span>
                    <span className="text-muted-foreground">
                      {formatChemicalAmount(chemical.amount, chemical.unit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            {facility.parentCompany && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Parent Company:</span>
                <span className="text-foreground">{facility.parentCompany}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">County:</span>
              <span className="text-foreground">{facility.county}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reporting Year:</span>
              <span className="text-foreground flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {facility.reportingYear}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              Health Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
