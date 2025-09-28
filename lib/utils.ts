import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { FacilityWithReleases } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) {
    return "0"
  }
  return new Intl.NumberFormat("en-US").format(num)
}

type ReleaseMediaData = {
  name: string
  total: number
}

// Helper function to process release data
export function getReleaseBreakdown(releases: FacilityWithReleases["releases"]): ReleaseMediaData[] {
  const mediaTotals = {
    Air: 0,
    Water: 0,
    Land: 0,
    Underground: 0,
  }

  releases.forEach(release => {
    // These properties might not exist on the summarized release data,
    // so we need to check for them. This is a limitation of the current API data structure.
    // For now, we'll simulate a breakdown based on total releases.
    // A more robust solution would involve fetching detailed release records.
    if (release.totalAirEmissions) {
      mediaTotals.Air += release.totalAirEmissions
    }
    // The following is a mock breakdown as the detailed data is not available
    const remaining = release.totalReleases - (release.totalAirEmissions || 0)
    mediaTotals.Water += remaining * 0.3
    mediaTotals.Land += remaining * 0.6
    mediaTotals.Underground += remaining * 0.1
  })

  return [
    { name: "Air", total: mediaTotals.Air },
    { name: "Water", total: mediaTotals.Water },
    { name: "Land", total: mediaTotals.Land },
    { name: "Underground", total: mediaTotals.Underground },
  ].filter(d => d.total > 0)
}
