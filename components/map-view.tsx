"use client"

import { Map, Marker, Overlay } from "pigeon-maps"
import { LoaderIcon, FactoryIcon } from "lucide-react"
import type { FacilityWithReleases } from "@/lib/types"

interface MapViewProps {
  facilities: FacilityWithReleases[]
  selectedFacility: FacilityWithReleases | null
  onFacilitySelect: (facility: FacilityWithReleases) => void
  loading: boolean
}

// Virginia coordinates and bounds
const VIRGINIA_BOUNDS = {
  north: 39.466,
  south: 36.5407,
  east: -75.2417,
  west: -83.6753,
  center: { lat: 37.4316, lng: -78.6569 },
}

export function MapView({ facilities, selectedFacility, onFacilitySelect, loading }: MapViewProps) {
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

  // Calculate center based on selected facility or default to Virginia center
  let center: [number, number] = [37.4316, -78.6569]
  let zoom = 7
  
  if (selectedFacility) {
    center = [Number(selectedFacility.latitude), Number(selectedFacility.longitude)]
    zoom = 12
  } else if (facilities.length > 0) {
    // Center on facilities if available
    const avgLat = facilities.reduce((sum, f) => sum + Number(f.latitude), 0) / facilities.length
    const avgLng = facilities.reduce((sum, f) => sum + Number(f.longitude), 0) / facilities.length
    center = [avgLat, avgLng]
    zoom = 8
  }

  return (
    <div className="w-full h-full relative">
      <Map
        center={center}
        zoom={zoom}
        width={800}
        height={600}
        dprs={[1, 2]}
        animate={true}
      >
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            width={40}
            anchor={[Number(facility.latitude), Number(facility.longitude)]}
            onClick={() => onFacilitySelect(facility)}
            color={facility.totalReleases > 2000 ? '#ef4444' : facility.totalReleases > 1000 ? '#f59e0b' : '#10b981'}
          />
        ))}
      </Map>
    </div>
  )
}
