import { type NextRequest, NextResponse } from "next/server"

// NOTE: A lot of this is duplicated from `app/api/facilities/route.ts`.
// In a real-world scenario, this would be refactored into shared utility files.

// --- TYPES ---

interface EPAFacility {
  tri_facility_id: string
  facility_name: string
  street_address: string
  city_name: string
  state_abbr: string
  zip_code: string
  county_name: string
  fac_latitude: string
  fac_longitude: string
  pref_latitude?: string
  pref_longitude?: string
  primary_naics_desc?: string
  parent_co_name?: string
  reporting_year: string
}

interface EPARelease {
  tri_facility_id: string
  reporting_year: string
  doc_ctrl_num: string
  chemical: string
  total_air_emissions: number
  total_releases: number
}

interface ProcessedFacility {
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

// --- CONSTANTS ---
const EPA_BASE_URL = "https://data.epa.gov/efservice"
const REPORTING_YEARS = ["2022", "2021", "2020", "2019"] as const
const REQUEST_TIMEOUT_MS = 15000

// --- UTILITY FUNCTIONS ---

const fetchWithTimeout = async (url: string, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json', 'User-Agent': 'ToxicReleaseMapper/1.0' }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

const isValidNumericCoordinate = (latitude: number, longitude: number): boolean => {
  if (!isFinite(latitude) || !isFinite(longitude)) return false
  if (latitude === 0 && longitude === 0) return false
  if (latitude < -90 || latitude > 90) return false
  if (longitude < -180 || longitude > 180) return false
  return true
}

const looksLikeDmsInt = (dmsStr: string): boolean => {
  const dmsNum = parseInt(dmsStr, 10)
  if (isNaN(dmsNum) || dmsNum < 10000) return false
  const minutes = Math.floor((dmsNum % 10000) / 100)
  const seconds = dmsNum % 100
  return minutes < 60 && seconds < 60
}

const dmsIntToDecimal = (dmsStr: string): number => {
  const dmsNum = parseInt(dmsStr, 10)
  if (isNaN(dmsNum)) return 0
  const degrees = Math.floor(dmsNum / 10000)
  const minutes = Math.floor((dmsNum % 10000) / 100)
  const seconds = dmsNum % 100
  if (minutes >= 60 || seconds >= 60) {
    console.warn(`[Coord Conversion] Invalid DMS value: ${dmsStr}`)
    return dmsNum / 10000
  }
  return degrees + minutes / 60 + seconds / 3600
}

const convertCoordinates = (lat: string, lng: string): { latitude: number; longitude: number } => {
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)
  if (!isNaN(latNum) && !isNaN(lngNum) && Math.abs(latNum) <= 90 && Math.abs(lngNum) <= 180) {
    return { latitude: latNum, longitude: lngNum > 0 ? -lngNum : lngNum }
  }
  if (looksLikeDmsInt(lat) && looksLikeDmsInt(lng)) {
    return { latitude: dmsIntToDecimal(lat), longitude: -Math.abs(dmsIntToDecimal(lng)) }
  }
  return { latitude: latNum / 10000, longitude: -Math.abs(lngNum / 10000) }
}

const getBestCoordinates = (facility: EPAFacility): { latitude: number; longitude: number; valid: boolean } => {
  if (facility.pref_latitude && facility.pref_longitude) {
    const lat = parseFloat(facility.pref_latitude)
    const lng = parseFloat(facility.pref_longitude)
    if (isValidNumericCoordinate(lat, lng)) return { latitude: lat, longitude: lng, valid: true }
  }
  if (facility.fac_latitude && facility.fac_longitude) {
    const { latitude, longitude } = convertCoordinates(facility.fac_latitude, facility.fac_longitude)
    return { latitude, longitude, valid: isValidNumericCoordinate(latitude, longitude) }
  }
  return { latitude: 0, longitude: 0, valid: false }
}

const processFacilityData = (facility: EPAFacility, releases: EPARelease[]): ProcessedFacility => {
  const coords = getBestCoordinates(facility)
  const totalReleases = releases.reduce((sum, r) => sum + (r.total_releases || 0), 0)
  
  const chemicalMap = new Map<string, number>()
  releases.forEach(release => {
    if (release.chemical && release.total_releases) {
      chemicalMap.set(release.chemical, (chemicalMap.get(release.chemical) || 0) + release.total_releases)
    }
  })
  
  const topChemicals = Array.from(chemicalMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({
      name,
      amount: Math.round(amount * 100) / 100,
      unit: "lbs" as const
    }))

  const reportingYear = releases.length > 0 ? parseInt(releases[0].reporting_year, 10) : (facility.reporting_year ? parseInt(facility.reporting_year, 10) : null)
  
  return {
    id: facility.tri_facility_id,
    facilityName: facility.facility_name,
    address: facility.street_address,
    city: facility.city_name,
    state: facility.state_abbr,
    zipCode: facility.zip_code,
    county: facility.county_name,
    latitude: coords.latitude,
    longitude: coords.longitude,
    industry: facility.primary_naics_desc || "Unknown",
    parentCompany: facility.parent_co_name || undefined,
    reportingYear,
    releases: releases.map(r => ({
      id: r.doc_ctrl_num,
      chemicalName: r.chemical,
      totalAirEmissions: r.total_air_emissions || 0,
      totalReleases: r.total_releases || 0,
      healthImpacts: []
    })),
    totalReleases,
    topChemicals
  }
}

// --- MAIN HANDLER ---

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const startTime = Date.now()
  const facilityId = params.id

  if (!facilityId) {
    return NextResponse.json({ success: false, error: "Facility ID is required" }, { status: 400 })
  }

  try {
    // 1. Fetch base facility details
    const facilityUrl = `${EPA_BASE_URL}/tri.tri_facility/tri_facility_id/equals/${facilityId}`
    const facilityResponse = await fetchWithTimeout(facilityUrl)
    if (!facilityResponse.ok) {
      throw new Error(`EPA API returned ${facilityResponse.status} for facility details`)
    }
    const facilityData: EPAFacility[] = await facilityResponse.json()
    if (!Array.isArray(facilityData) || facilityData.length === 0) {
      return NextResponse.json({ success: false, error: "Facility not found" }, { status: 404 })
    }
    const facility = facilityData[0]

    // 2. Fetch release data
    let allReleases: EPARelease[] = []
    let selectedReportingYear: string | null = null

    for (const year of REPORTING_YEARS) {
      const reportingUrl = `${EPA_BASE_URL}/tri.tri_reporting_form/tri_facility_id/equals/${facilityId}/and/reporting_year/equals/${year}/1:1000`
      const reportingResponse = await fetchWithTimeout(reportingUrl)

      if (reportingResponse.ok) {
        const reportingData = await reportingResponse.json()
        if (Array.isArray(reportingData) && reportingData.length > 0) {
          const docCtrlNums = reportingData.map(r => r.doc_ctrl_num)
          const formRUrl = `${EPA_BASE_URL}/tri.tri_form_r/doc_ctrl_num/in/${docCtrlNums.join(',')}`
          const formRResponse = await fetchWithTimeout(formRUrl)

          if (formRResponse.ok) {
            const formRData = await formRResponse.json()
            if (Array.isArray(formRData) && formRData.length > 0) {
              const formRByDocCtrl = new Map(formRData.map(r => [r.doc_ctrl_num, r]))
              
              allReleases = reportingData.map(reporting => {
                const formR = formRByDocCtrl.get(reporting.doc_ctrl_num)
                const airTotal = formR?.air_total_release || 0
                const waterTotal = formR?.water_total_release || 0
                const landTotal = formR?.land_total_release || 0
                const totalReleases = airTotal + waterTotal + landTotal + (formR?.uninj_total_release || 0)
                
                return {
                  tri_facility_id: facilityId,
                  reporting_year: year,
                  doc_ctrl_num: reporting.doc_ctrl_num,
                  chemical: reporting.cas_chem_name || 'Mixed Chemicals',
                  total_air_emissions: airTotal,
                  total_releases: totalReleases
                }
              })
              selectedReportingYear = year
              break // Found data, stop searching older years
            }
          }
        }
      }
    }

    // 3. Process and combine data
    const processedFacility = processFacilityData(facility, allReleases)

    return NextResponse.json({
      success: true,
      data: processedFacility,
      metadata: {
        processingTimeMs: Date.now() - startTime,
        selectedReportingYear,
      }
    })

  } catch (error) {
    console.error(`[Facility Detail API] Request failed for ID ${facilityId}:`, error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    const statusCode = errorMessage.includes("EPA API") ? 502 : 500
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    )
  }
}
