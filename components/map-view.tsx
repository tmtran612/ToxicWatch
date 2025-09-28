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
          {facilities.map((facility) => (
            <Marker
              key={facility.id}
              width={40}
              anchor={[facility.latitude, facility.longitude]}
              onClick={() => onFacilitySelect(facility)}
              color={facility.totalReleases > 2000 ? '#ef4444' : facility.totalReleases > 1000 ? '#f59e0b' : '#10b981'}
            />
          ))}
        </Map>
      </div>
    </div>
  )
}
