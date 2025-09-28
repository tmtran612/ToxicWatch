"use client"

import type React from "react"

import { useState } from "react"
import { SearchIcon, MapPinIcon, AlertTriangleIcon, FactoryIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FacilityCard } from "@/components/facility-card"
import { SearchFilters } from "@/components/search-filters"
import type { FacilityWithReleases, ProcessedFacility } from "@/lib/types"
import { FacilityDetailsSheet } from "@/components/facility-details-sheet"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [facilities, setFacilities] = useState<FacilityWithReleases[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<ProcessedFacility | null>(null)

  const handleViewDetails = async (facilityId: string) => {
    try {
      const res = await fetch(`/api/facilities/${facilityId}`)
      const jsonResponse = await res.json()
      if (jsonResponse.success) {
        setSelectedFacility(jsonResponse.data)
      } else {
        console.error("Failed to fetch facility details:", jsonResponse.error)
        setSelectedFacility(null)
      }
    } catch (error) {
      console.error("Error fetching facility details:", error)
      setSelectedFacility(null)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      // Determine if search query is ZIP code or city name
      const isZipCode = /^\d{5}$/.test(searchQuery.trim())
      const params = new URLSearchParams()

      if (isZipCode) {
        params.append("zipCode", searchQuery.trim())
      } else {
        params.append("city", searchQuery.trim())
      }

      const response = await fetch(`/api/facilities?${params}`)
      const result = await response.json()

      if (result.success) {
        setFacilities(result.data)
        setHasSearched(true)
      } else {
        console.error("Search failed:", result.error)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const totalReleases = facilities.reduce((sum, f) => sum + f.totalReleases, 0)
  const uniqueChemicals = new Set(facilities.flatMap((f) => f.releases.map((r) => r.chemicalName))).size

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
              <a href="/search" className="text-foreground font-medium">
                Search
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Map
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                AI Assistant
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-bold text-center mb-6">Search Toxic Release Facilities</h2>
          <p className="text-muted-foreground text-center mb-8">
            Enter a ZIP code or city name to find EPA TRI facilities and their toxic chemical releases
          </p>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter ZIP code (e.g., 23185) or city name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading} size="lg" className="px-6">
              <SearchIcon className="h-4 w-4 mr-2" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        {hasSearched && <SearchFilters />}

        {/* Results Summary */}
        {hasSearched && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <FactoryIcon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold text-foreground">{facilities.length}</div>
                      <div className="text-sm text-muted-foreground">Facilities Found</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangleIcon className="h-5 w-5 text-accent" />
                    <div>
                      <div className="text-2xl font-bold text-foreground">{totalReleases.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Pounds Released</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5 text-chart-2" />
                    <div>
                      <div className="text-2xl font-bold text-foreground">{uniqueChemicals}</div>
                      <div className="text-sm text-muted-foreground">Unique Chemicals</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {facilities.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground mb-2">No facilities found</div>
                  <div className="text-sm text-muted-foreground">
                    Try searching with a different ZIP code or city name
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Facilities in your area</h3>
                {facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="cursor-pointer"
                  >
                    <FacilityCard facility={facility} onViewDetails={() => handleViewDetails(facility.id)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SearchIcon className="h-5 w-5 text-primary" />
                    <span>How to Search</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Enter a 5-digit ZIP code (e.g., 23185)</li>
                    <li>• Or enter a city name (e.g., Richmond)</li>
                    <li>• View facilities and their toxic releases</li>
                    <li>• Click on facilities for detailed information</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangleIcon className="h-5 w-5 text-accent" />
                    <span>What You'll Find</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• EPA TRI facility locations and details</li>
                    <li>• Chemical release amounts and types</li>
                    <li>• Health impact information</li>
                    <li>• Industry and company information</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <FacilityDetailsSheet
        facility={selectedFacility}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedFacility(null)
          }
        }}
      />
    </div>
  )
}
