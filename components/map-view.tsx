"use client"

import { Map, Marker } from "pigeon-maps"
import { LoaderIcon, FactoryIcon } from "lucide-react"
import type { FacilityWithReleases } from "@/lib/types"

interface MapViewProps {
  facilities: FacilityWithReleases[]
  onFacilitySelect?: (facility: FacilityWithReleases | null) => void
  loading?: boolean
  center?: { lat: number; lng: number }
  zoom?: number
  interactive?: boolean
  selectedYear?: string
}

// Virginia coordinates and bounds
const VIRGINIA_BOUNDS = {
  north: 39.466,
  south: 36.5407,
  east: -75.2417,
  west: -83.6753,
  center: { lat: 37.4316, lng: -78.6569 },
}

export function MapView({
  facilities,
  onFacilitySelect = () => {},
  loading = false,
  center,
  zoom,
  interactive = true,
  selectedYear,
}: MapViewProps) {
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <LoaderIcon className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <div className="text-muted-foreground">Loading map...</div>
        </div>
      </div>
    )
  }

  if (facilities.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <FactoryIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <div className="text-muted-foreground">No facilities found for the selected criteria.</div>
        </div>
      </div>
    )
  }

  // Use provided center/zoom or default to Virginia
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : [37.4316, -78.6569]
  const mapZoom = zoom ?? 7

  return (
    <div className="w-full flex items-center justify-center bg-background py-8">
      <div className="w-full max-w-7xl px-4">
        <Map
          center={mapCenter}
          zoom={mapZoom}
          width={1200}
          height={700}
          boxClassname="rounded-2xl shadow-2xl border border-border bg-[#18181b]"
          defaultCenter={mapCenter}
          defaultZoom={mapZoom}
          mouseEvents={interactive}
          touchEvents={interactive}
        >
          {/* First render grey markers (no data) - they go in the back */}
          {facilities
            .filter((facility) => {
              const hasDataForYear = selectedYear === "all" 
                ? facility.totalReleases > 0 
                : facility.reportingYear?.toString() === selectedYear && facility.totalReleases > 0
              return !hasDataForYear
            })
            .map((facility) => (
              <Marker
                key={facility.id}
                width={30}
                anchor={[facility.latitude, facility.longitude]}
                onClick={() => onFacilitySelect(facility)}
                color="#6b7280"
              />
            ))}
          
          {/* Then render colored markers (with data) - they go on top */}
          {facilities
            .filter((facility) => {
              const hasDataForYear = selectedYear === "all" 
                ? facility.totalReleases > 0 
                : facility.reportingYear?.toString() === selectedYear && facility.totalReleases > 0
              return hasDataForYear
            })
            .map((facility) => {
              // Determine marker color for facilities with data
              let markerColor: string
              if (facility.totalReleases > 2000) {
                markerColor = '#ef4444' // Red for high releases
              } else if (facility.totalReleases > 1000) {
                markerColor = '#f59e0b' // Yellow for moderate releases
              } else {
                markerColor = '#10b981' // Green for low releases
              }

              return (
                <Marker
                  key={facility.id}
                  width={40}
                  anchor={[facility.latitude, facility.longitude]}
                  onClick={() => onFacilitySelect(facility)}
                  color={markerColor}
                />
              )
            })}
        </Map>
      </div>
    </div>
  )
}
