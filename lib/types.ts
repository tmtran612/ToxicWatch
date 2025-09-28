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
  parentCompany?: string
  reportingYear: number
  naicsCode?: string
  naicsDescription?: string
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
    casNumber?: string
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
