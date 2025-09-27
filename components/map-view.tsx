"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Map, Marker, Overlay } from "pigeon-maps"
import { LoaderIcon, ZoomInIcon, ZoomOutIcon, LocateIcon, FactoryIcon } from "lucide-react"
import type { FacilityWithReleases } from "@/lib/types"

import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix default marker icon issue in Leaflet
if (typeof window !== "undefined" && L && L.Icon && L.Icon.Default) {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  })
}

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

  // Default to Virginia center
  const center: [number, number] = [37.4316, -78.6569]
  const zoom = 7

  return (
    <div className="w-full flex items-center justify-center bg-background py-8">
      <div className="w-full max-w-7xl px-4">
        <Map
          center={center}
          zoom={zoom}
          width={1200}
          height={700}
          boxClassname="rounded-2xl shadow-2xl border border-border bg-[#18181b]"
          defaultCenter={center}
          defaultZoom={zoom}
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
                      <li key={chem.name}>{chem.name} ({chem.amount.toLocaleString()} {chem.unit})</li>
                    ))}
                  </ul>
                </div>
                <button
                  className="mt-2 px-3 py-1 rounded bg-primary text-white text-xs hover:bg-primary/90 transition-colors"
                  onClick={() => onFacilitySelect(undefined as any)}
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
