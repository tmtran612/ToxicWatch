"use client"

import { Map, Marker, Overlay } from "pigeon-maps"
import { LoaderIcon, FactoryIcon } from "lucide-react"
import type { FacilityWithReleases } from "@/lib/types"

interface MapViewProps {
  facilities: FacilityWithReleases[]
  selectedFacility?: FacilityWithReleases | null
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
  selectedFacility = null,
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
          {selectedFacility && (
            <Overlay anchor={[selectedFacility.latitude, selectedFacility.longitude]} offset={[120, 79]}>
              <div className="bg-white p-4 rounded-xl shadow-2xl border border-primary w-72 animate-fade-in">
                <div className="font-bold text-lg text-primary mb-1 flex items-center gap-2">
                  <FactoryIcon className="inline w-5 h-5 text-accent" />
                  {selectedFacility.facilityName}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {selectedFacility.city}, {selectedFacility.state} • {selectedFacility.zipCode}
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-sm">Total Releases:</span>
                  <span className="ml-2 text-sm text-foreground">{selectedFacility.totalReleases.toLocaleString()} lbs</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-sm">Top Chemicals:</span>
                  <ul className="ml-4 list-disc text-xs text-foreground">
                    {selectedFacility.topChemicals?.map((chem) => (
                      <li key={chem.name}>
                        {chem.name} ({chem.amount.toLocaleString()} {chem.unit})
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="mt-2 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90 transition-colors"
                  onClick={() => onFacilitySelect(null)}
                >
                  Close
                </button>
              </div>
            </Overlay>
          )}
        </Map>
      </div>
    </div>
  )
}
