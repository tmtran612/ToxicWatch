import React from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FactoryIcon, MapPinIcon, AlertTriangleIcon, BarChartIcon } from "lucide-react"
import type { FacilityWithReleases } from "@/lib/types"

interface FacilityDetailsSheetProps {
  facility: FacilityWithReleases | null
  onOpenChange: (isOpen: boolean) => void
}

export function FacilityDetailsSheet({ facility, onOpenChange }: FacilityDetailsSheetProps) {
  const isOpen = facility !== null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-card border-l border-border">
        {facility && (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-bold text-primary flex items-center gap-3">
                <FactoryIcon className="h-6 w-6" />
                {facility.facilityName}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 text-muted-foreground pt-2">
                <MapPinIcon className="h-4 w-4" />
                {facility.city}, {facility.state} {facility.zipCode}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Releases</div>
                  <div className="text-2xl font-bold text-accent">
                    {facility.totalReleases.toLocaleString()} lbs
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Reporting Year</div>
                  <div className="text-2xl font-bold text-foreground">
                    {facility.reportingYear || "N/A"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
                  Top Released Chemicals
                </h3>
                {facility.topChemicals && facility.topChemicals.length > 0 ? (
                  <ul className="space-y-2">
                    {facility.topChemicals.map((chem) => (
                      <li key={chem.name} className="flex justify-between items-center p-3 rounded-md bg-muted/50">
                        <span className="font-medium text-foreground">{chem.name}</span>
                        <span className="text-muted-foreground">{chem.amount.toLocaleString()} {chem.unit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific chemical release data available.</p>
                )}
              </div>
              
              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChartIcon className="h-5 w-5 text-sky-500" />
                  Industry
                </h3>
                <div className="text-sm text-foreground">
                  <span className="font-medium">NAICS Code:</span> {facility.naicsCode || "Not Available"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {facility.naicsDescription || "No description provided."}
                </div>
              </div>

            </div>

            <div className="mt-8">
              <Link href={`/facilities/${facility.id}`} passHref>
                <Button className="w-full" size="lg">
                  View Full Facility Details
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
