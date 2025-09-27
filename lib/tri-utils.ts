import type { FacilityWithReleases, SearchParams } from "./types"
import { sampleFacilities, sampleReleases, healthImpacts } from "./sample-data"

export function searchFacilities(params: SearchParams): FacilityWithReleases[] {
  let filteredFacilities = sampleFacilities

  // Filter by location
  if (params.zipCode) {
    filteredFacilities = filteredFacilities.filter((f) => f.zipCode === params.zipCode)
  }
  if (params.city) {
    filteredFacilities = filteredFacilities.filter((f) => f.city.toLowerCase().includes(params.city!.toLowerCase()))
  }
  if (params.state) {
    filteredFacilities = filteredFacilities.filter((f) => f.state === params.state)
  }
  if (params.county) {
    filteredFacilities = filteredFacilities.filter((f) => f.county.toLowerCase().includes(params.county!.toLowerCase()))
  }

  // Add releases data to facilities
  return filteredFacilities.map((facility) => {
    const releases = sampleReleases.filter((r) => r.facilityId === facility.id)
    const totalReleases = releases.reduce((sum, r) => sum + r.amount, 0)

    // Get top chemicals by amount
    const chemicalTotals = releases.reduce(
      (acc, release) => {
        if (!acc[release.chemicalName]) {
          acc[release.chemicalName] = { amount: 0, unit: release.unit }
        }
        acc[release.chemicalName].amount += release.amount
        return acc
      },
      {} as Record<string, { amount: number; unit: string }>,
    )

    const topChemicals = Object.entries(chemicalTotals)
      .map(([name, data]) => ({ name, amount: data.amount, unit: data.unit }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    return {
      ...facility,
      releases,
      totalReleases,
      topChemicals,
    }
  })
}

export function getHealthImpact(casNumber: string) {
  return healthImpacts.find((h) => h.casNumber === casNumber)
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatChemicalAmount(amount: number, unit: string): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${unit}`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${unit}`
  }
  return `${amount.toLocaleString()} ${unit}`
}

export function getRiskLevel(totalReleases: number): "low" | "moderate" | "high" {
  if (totalReleases < 1000) return "low"
  if (totalReleases < 5000) return "moderate"
  return "high"
}

export function generateComparisonText(facilityCount: number, totalReleases: number, location: string): string {
  const avgPerFacility = facilityCount > 0 ? totalReleases / facilityCount : 0

  if (facilityCount === 0) {
    return `No TRI facilities found in ${location}. This area has minimal reported toxic releases.`
  }

  if (avgPerFacility < 1000) {
    return `${location} has ${facilityCount} TRI facilities with relatively low toxic releases averaging ${formatChemicalAmount(avgPerFacility, "pounds")} per facility.`
  } else if (avgPerFacility < 5000) {
    return `${location} has ${facilityCount} TRI facilities with moderate toxic releases averaging ${formatChemicalAmount(avgPerFacility, "pounds")} per facility.`
  } else {
    return `${location} has ${facilityCount} TRI facilities with high toxic releases averaging ${formatChemicalAmount(avgPerFacility, "pounds")} per facility. This is above the national average.`
  }
}
