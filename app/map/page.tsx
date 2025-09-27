"use client"

import { useState, useEffect } from "react"
import { MapPinIcon, FactoryIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapView } from "@/components/map-view"
import { FacilityPopup } from "@/components/facility-popup"
import type { FacilityWithReleases } from "@/lib/types"

export default function MapPage() {
  const [facilities, setFacilities] = useState<FacilityWithReleases[]>([])
  const [selectedFacility, setSelectedFacility] = useState<FacilityWithReleases | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState("2023")
  const [selectedChemical, setSelectedChemical] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      // Load sample data for Virginia area
      const response = await fetch("/api/facilities?state=VA")
      const result = await response.json()

      if (result.success) {
        setFacilities(result.data)
      }
    } catch (error) {
      console.error("Error loading facilities:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFacilities = facilities.filter((facility) => {
    if (!facility.reportingYear) return false // skip if missing year
    if (selectedYear !== "all" && facility.reportingYear?.toString() !== selectedYear) {
      return false
    }

    if (selectedChemical !== "all") {
      const hasChemical = facility.releases.some((r) => r.chemicalName === selectedChemical)
      if (!hasChemical) return false
    }

    if (riskFilter !== "all") {
      const riskLevel = facility.totalReleases < 1000 ? "low" : facility.totalReleases < 5000 ? "moderate" : "high"
      if (riskLevel !== riskFilter) return false
    }

    return true
  })

  const uniqueChemicals = Array.from(new Set(facilities.flatMap((f) => f.releases.map((r) => r.chemicalName)))).sort()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FactoryIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">ToxicWatch</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </a>
              <a href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                Search
              </a>
              <a href="/map" className="text-foreground font-medium">
                Map
              </a>
              <a href="/ai-assistant" className="text-muted-foreground hover:text-foreground transition-colors">
                AI Assistant
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Controls */}
        <div className="w-80 border-r border-border bg-card/30 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-primary" />
              Toxic Release Map
            </h2>

            <div className="space-y-6">
              {/* Stats */}
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{filteredFacilities.length}</div>
                      <div className="text-xs text-muted-foreground">Facilities</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">
                        {filteredFacilities.reduce((sum, f) => sum + f.totalReleases, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Total lbs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Reporting Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Chemical</label>
                  <Select value={selectedChemical} onValueChange={setSelectedChemical}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chemicals</SelectItem>
                      {uniqueChemicals.map((chemical) => (
                        <SelectItem key={chemical} value={chemical}>
                          {chemical}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Risk Level</label>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="moderate">Moderate Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Legend */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm">Risk Level Legend</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-muted-foreground">Low (&lt;1K lbs)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-muted-foreground">Moderate (1K-5K lbs)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-muted-foreground">High (&gt;5K lbs)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Facility List */}
              <div>
                <h3 className="text-sm font-medium mb-3">Facilities ({filteredFacilities.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredFacilities.map((facility) => {
                    const riskLevel =
                      facility.totalReleases < 1000 ? "low" : facility.totalReleases < 5000 ? "moderate" : "high"
                    const riskColor =
                      riskLevel === "low" ? "bg-green-500" : riskLevel === "moderate" ? "bg-yellow-500" : "bg-red-500"

                    return (
                      <div
                        key={facility.id}
                        className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedFacility(facility)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">{facility.facilityName}</div>
                            <div className="text-xs text-muted-foreground">
                              {facility.city}, {facility.state}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {facility.totalReleases.toLocaleString()} lbs
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${riskColor} flex-shrink-0 mt-1`}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapView
            facilities={filteredFacilities}
            selectedFacility={selectedFacility}
            onFacilitySelect={setSelectedFacility}
            loading={loading}
          />

          {/* Facility Popup */}
          {selectedFacility && <FacilityPopup facility={selectedFacility} onClose={() => setSelectedFacility(null)} />}
        </div>
      </div>
    </div>
  )
}
