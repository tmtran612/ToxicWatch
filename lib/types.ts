export interface TRIFacility {
  id: string
  facilityName: string
  address: string
  city: string
  state: string
  zipCode: string
  county: string
  latitude: number
  longitude: number
  industry: string
  parentCompany?: string
  reportingYear: number | null
}

export interface ChemicalRelease {
  id: string
  facilityId: string
  chemicalName: string
  casNumber: string
  releaseType: "air" | "water" | "land" | "underground"
  amount: number
  unit: string
  reportingYear: number
  mediaType: string
}

export interface HealthImpact {
  casNumber: string
  chemicalName: string
  healthEffects: string[]
  carcinogen: boolean
  acuteToxicity: "low" | "moderate" | "high"
  chronicToxicity: "low" | "moderate" | "high"
  description: string
}

export interface SearchParams {
  zipCode?: string
  city?: string
  state?: string
  county?: string
  radius?: number
  chemicals?: string[]
  year?: number
}

export interface FacilityWithReleases extends TRIFacility {
  releases: Array<{
    id: string
    chemicalName: string
    totalAirEmissions: number
    totalReleases: number
    healthImpacts: never[]
  }>
  totalReleases: number
  topChemicals: Array<{
    name: string
    amount: number
    unit: string
  }>
}

export interface ProcessedFacility extends FacilityWithReleases {
  // This can extend FacilityWithReleases if the detailed view has everything the card has, plus more.
  // Or it can be a separate type if the structures are very different.
  // For now, let's assume it's the same for simplicity, but you can add more fields.
}

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  count?: number
  error?: string
  metadata?: {
    state?: string
    processingTimeMs: number
    totalFacilities?: number
    validFacilities?: number
    includeReleaseData?: boolean
    batchesProcessed?: number
  }
}

export interface ComparisonData {
  location: string
  averageReleases: number
  topChemicals: string[]
  comparisonText: string
  riskLevel: "low" | "moderate" | "high"
}
