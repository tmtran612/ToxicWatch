"use client"

import React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FactoryIcon,
  MapPinIcon,
  BuildingIcon,
  GlobeIcon,
  InfoIcon,
} from "lucide-react"
import type { FacilityWithReleases } from "@/lib/types"
import { formatNumber } from "@/lib/utils"
import { MapView } from "@/components/map-view"

interface FacilityDetailsSheetProps {
  facility: FacilityWithReleases | null
  onOpenChange: (isOpen: boolean) => void
}

export function FacilityDetailsSheet({
  facility,
  onOpenChange,
}: FacilityDetailsSheetProps) {
  const isOpen = facility !== null
  const mapCenter = facility
    ? { lat: facility.latitude, lng: facility.longitude }
    : undefined

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95vw] max-w-[640px] sm:w-full bg-card border-l border-border p-0 flex flex-col">
        {facility && (
          <>
            <SheetHeader className="p-6 pb-4">
              <SheetTitle className="text-2xl font-bold text-primary flex items-start gap-3">
                <FactoryIcon className="h-7 w-7 mt-1 shrink-0" />
                <span className="flex-1">{facility.facilityName}</span>
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 text-muted-foreground pt-2">
                <MapPinIcon className="h-4 w-4" />
                {facility.address}, {facility.city}, {facility.state}{" "}
                {facility.zipCode}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics{facility.reportingYear ? ` (${facility.reportingYear})` : ''}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        Total On-Site Releases
                      </div>
                      <div className="text-3xl font-bold text-accent">
                        {formatNumber(facility.totalReleases)}
                        <span className="text-lg ml-1 font-medium text-muted-foreground">lbs</span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4 text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        Chemicals Reported
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {facility.releases.length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>



              {/* Chemical Releases Table */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Chemical Releases{facility.reportingYear ? ` (${facility.reportingYear})` : ''}
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of reported on-site chemical releases.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-6">Chemical</TableHead>
                          <TableHead>CAS #</TableHead>
                          <TableHead className="text-right pr-6">
                            Total Releases
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facility.releases.length > 0 ? (
                          facility.releases.map((release) => (
                            <TableRow key={release.id}>
                              <TableCell className="font-medium pl-6">{release.chemicalName}</TableCell>
                              <TableCell className="text-muted-foreground">{release.casNumber || 'N/A'}</TableCell>
                              <TableCell className="text-right pr-6">
                                {formatNumber(release.totalReleases)} lbs
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-muted-foreground py-8"
                            >
                              No individual chemical release data available.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Facility Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Facility Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <BuildingIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Parent Company</h4>
                      <p className="text-muted-foreground">
                        {facility.parentCompany || "Not Reported"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <InfoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-semibold">
                        Industry Classification (NAICS)
                      </h4>
                      <p className="text-muted-foreground">
                        {facility.naicsCode}: {facility.naicsDescription}
                      </p>
                    </div>
                  </div>
                   <div className="flex items-start gap-3">
                    <GlobeIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Geo-Coordinates</h4>
                      <p className="text-muted-foreground">
                        Lat: {facility.latitude.toFixed(4)}, Lng: {facility.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mini Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Facility Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full rounded-lg overflow-hidden border">
                    {mapCenter && (
                      <MapView
                        facilities={[facility]}
                        center={mapCenter}
                        zoom={14}
                        interactive={false}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
