import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Types and Validation Schemas
const QueryParamsSchema = z.object({
  state: z.string().length(2).optional(),
  zipCode: z.string().min(5).optional(),
  county: z.string().min(3).optional(),
  limit: z.coerce.number().min(1).max(5000).default(1000),
  includeReleaseData: z.coerce.boolean().default(true)
})

// EPA Envirofacts API data structure for a facility
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
  // Prefer these when present (decimal degrees)
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

interface EPAFormRData {
  // Facility fields
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
  
  // Form R release data fields
  doc_ctrl_num: string
  air_total_release: number
  water_total_release: number
  land_total_release: number
  uninj_total_release: number
  fugitive_tot_rel: number
  stack_tot_rel: number
  potw_tot_transfer: number
  off_site_total_transfers: number
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

// Constants
const EPA_BASE_URL = "https://data.epa.gov/efservice"
const REPORTING_YEARS = ["2022", "2021", "2020", "2019"] as const
const BATCH_SIZE = 25
const BATCH_DELAY_MS = 150
const REQUEST_TIMEOUT_MS = 10000

// Utility Functions
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms))

// Validate numeric coordinates are reasonable (not (0,0) and within bounds)
const isValidNumericCoordinate = (latitude: number, longitude: number): boolean => {
  if (!isFinite(latitude) || !isFinite(longitude)) return false
  if (latitude === 0 && longitude === 0) return false
  if (latitude < -90 || latitude > 90) return false
  if (longitude < -180 || longitude > 180) return false
  return true
}

const isValidCoordinate = (lat: string, lng: string): boolean => {
  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)
  return isValidNumericCoordinate(latitude, longitude)
}

/**
 * Checks if a string looks like a packed DMS integer (e.g., "383148").
 */
const looksLikeDmsInt = (dmsStr: string): boolean => {
  const dmsNum = parseInt(dmsStr, 10)
  if (isNaN(dmsNum) || dmsNum < 10000) return false // Must be at least DDMMSS

  const minutes = Math.floor((dmsNum % 10000) / 100)
  const seconds = dmsNum % 100

  return minutes < 60 && seconds < 60
}

/**
 * Converts an integer-like string representation of Degrees-Minutes-Seconds (DMS)
 * into decimal degrees.
 * Example: "383148" -> 38° 31' 48" -> 38.53
 * @param dmsStr The DMS string (e.g., "383148" for latitude or "774830" for longitude)
 */
const dmsIntToDecimal = (dmsStr: string): number => {
  const dmsNum = parseInt(dmsStr, 10)
  if (isNaN(dmsNum)) return 0

  // Assumes format is (D)DDMMSS
  const degrees = Math.floor(dmsNum / 10000)
  const minutes = Math.floor((dmsNum % 10000) / 100)
  const seconds = dmsNum % 100

  if (minutes >= 60 || seconds >= 60) {
    // This function should only be called on what looks like a DMS int.
    // The fallback is for safety but should ideally not be reached.
    console.warn(`[Coord Conversion] Invalid DMS value passed to dmsIntToDecimal: ${dmsStr}`)
    return dmsNum / 10000
  }

  return degrees + minutes / 60 + seconds / 3600
}

const convertCoordinates = (lat: string, lng: string): { latitude: number; longitude: number } => {
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  // 1. Check for standard decimal degrees
  if (!isNaN(latNum) && !isNaN(lngNum) && Math.abs(latNum) <= 90 && Math.abs(lngNum) <= 180) {
    return { latitude: latNum, longitude: lngNum > 0 ? -lngNum : lngNum }
  }

  // 2. Check for DMS format (e.g., 383148)
  if (looksLikeDmsInt(lat) && looksLikeDmsInt(lng)) {
    const latitude = dmsIntToDecimal(lat)
    const longitude = -Math.abs(dmsIntToDecimal(lng))
    return { latitude, longitude }
  }

  // 3. Fallback for other integer formats (scaled by 10000)
  const latitude = latNum / 10000
  const longitude = -Math.abs(lngNum / 10000)
  
  return { latitude, longitude }
}

// Get best coordinates from facility, preferring preferred coordinates when present
const getBestCoordinates = (facility: EPAFacility): { latitude: number; longitude: number; valid: boolean } => {
  // Prefer preferred (decimal) coordinates
  if (facility.pref_latitude && facility.pref_longitude) {
    const lat = parseFloat(facility.pref_latitude)
    const lng = parseFloat(facility.pref_longitude)
    if (isValidNumericCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, valid: true }
    }
  }
  // Fallback to raw facility coords (may be packed DMS or scaled ints)
  if (facility.fac_latitude && facility.fac_longitude) {
    const { latitude, longitude } = convertCoordinates(facility.fac_latitude, facility.fac_longitude)
    return { latitude, longitude, valid: isValidNumericCoordinate(latitude, longitude) }
  }
  return { latitude: 0, longitude: 0, valid: false }
}

const fetchWithTimeout = async (url: string, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ToxicReleaseMapper/1.0'
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

const fetchWithRetry = async (url: string, maxRetries: number = 3, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<Response> => {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, timeoutMs)
      
      // If we get a 5xx error, retry. For other errors, fail immediately
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`[Fetch Retry] Attempt ${attempt}/${maxRetries} failed with ${response.status}, retrying...`)
        await sleep(Math.pow(2, attempt - 1) * 1000) // Exponential backoff: 1s, 2s, 4s
        continue
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        console.warn(`[Fetch Retry] Attempt ${attempt}/${maxRetries} failed, retrying...`, error)
        await sleep(Math.pow(2, attempt - 1) * 1000)
        continue
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed')
}

const processFacilityData = (facility: EPAFacility, releases: EPARelease[]): ProcessedFacility => {
  const coords = getBestCoordinates(facility)
  const latitude = coords.latitude
  const longitude = coords.longitude
  
  const totalReleases = releases.reduce((sum, r) => sum + (r.total_releases || 0), 0)
  
  const chemicalMap = new Map<string, number>()
  releases.forEach(release => {
    if (release.chemical && release.total_releases) {
      const currentAmount = chemicalMap.get(release.chemical) || 0
      chemicalMap.set(release.chemical, currentAmount + release.total_releases)
    }
  })
  
  const topChemicals = Array.from(chemicalMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, amount]) => ({
      name,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
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
    latitude,
    longitude,
    industry: facility.primary_naics_desc || "Unknown",
    parentCompany: facility.parent_co_name || undefined,
    reportingYear: reportingYear,
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

// Main Handler
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  let queryParams
  
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    queryParams = QueryParamsSchema.parse({
      state: searchParams.get("state") ?? undefined,
      zipCode: searchParams.get("zipCode") ?? undefined,
      county: searchParams.get("county") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      includeReleaseData: searchParams.get("includeReleaseData") ?? undefined
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid query parameters",
        details: error instanceof z.ZodError ? error.errors : "Unknown validation error",
        metadata: {
          processingTimeMs: Date.now() - startTime
        }
      },
      { status: 400 }
    )
  }

  try {
    const state = queryParams.state?.toUpperCase()
    const county = queryParams.county?.toUpperCase()
    const zip = queryParams.zipCode?.trim()
    const limit = queryParams.limit

    // Build EPA Envirofacts URL
    let facilitiesUrl: string
    let filterKind: 'zip' | 'county' | 'state'

    if (zip) {
      filterKind = 'zip'
      facilitiesUrl = `${EPA_BASE_URL}/tri.tri_facility/zip_code/equals/${encodeURIComponent(zip)}`
    } else if (county && state) {
      filterKind = 'county'
      facilitiesUrl = `${EPA_BASE_URL}/tri.tri_facility/county_name/equals/${encodeURIComponent(county)}/and/state_abbr/equals/${encodeURIComponent(state)}`
    } else if (state) {
      filterKind = 'state'
      facilitiesUrl = `${EPA_BASE_URL}/tri.tri_facility/state_abbr/equals/${encodeURIComponent(state)}`
    } else {
      throw new Error('You must provide either state, zipCode, or county+state')
    }

    // Add limit to the URL if not ZIP (ZIP typically returns fewer results)
    if (filterKind !== 'zip') {
      facilitiesUrl += `/1:${limit}`
    }

    console.log(`[Facilities API] Fetching facilities via ${filterKind} with URL: ${facilitiesUrl}`)

    const facilitiesResponse = await fetchWithTimeout(facilitiesUrl)
    
    if (!facilitiesResponse.ok) {
      throw new Error(`EPA API returned ${facilitiesResponse.status}: ${facilitiesResponse.statusText} for facilities`)
    }

    const allFacilities: EPAFacility[] = await facilitiesResponse.json()
    
    if (!Array.isArray(allFacilities)) {
      throw new Error("Invalid response format from EPA facilities API")
    }

    // Filter and validate facilities
    const validFacilities = allFacilities
      .filter(f => 
        f.tri_facility_id && 
        f.facility_name && 
        getBestCoordinates(f).valid
      )
      // The limit is applied in the API call, so no need to slice here

    console.log(`[Facilities API] Found ${allFacilities.length} total facilities, processing ${validFacilities.length} valid facilities`)

    if (validFacilities.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        metadata: {
          state,
          county,
          zip,
          processingTimeMs: Date.now() - startTime,
          totalFacilities: allFacilities.length,
          validFacilities: 0,
          reportingYear: null,
        }
      })
    }

    let processedFacilities: ProcessedFacility[] = []
    let selectedReportingYear: string | null = null

    if (queryParams.includeReleaseData) {
      // Fetch releases for the same filter and the most recent year with data
      let allReleases: EPARelease[] = []

      for (const year of REPORTING_YEARS) {
        try {
          // Step 1: Get reporting form data with facility IDs for the same filter
          let reportingUrl: string
          if (filterKind === 'zip' && zip) {
            reportingUrl = `${EPA_BASE_URL}/tri.tri_reporting_form/zip_code/equals/${encodeURIComponent(zip)}/and/reporting_year/equals/${year}`
          } else if (filterKind === 'county' && county && state) {
            reportingUrl = `${EPA_BASE_URL}/tri.tri_reporting_form/county_name/equals/${encodeURIComponent(county)}/and/state_abbr/equals/${encodeURIComponent(state)}/and/reporting_year/equals/${year}`
          } else {
            // state filter - need to join with tri_facility to get state info
            reportingUrl = `${EPA_BASE_URL}/tri.tri_facility/state_abbr/equals/${encodeURIComponent(state!)}/join/tri.tri_reporting_form/tri_facility_id/equals/tri_facility_id/and/reporting_year/equals/${year}`
          }

          reportingUrl += '/1:10000' // High limit for reporting forms

          console.log(`[Facilities API] Fetching reporting forms for ${year}: ${reportingUrl.substring(0, 200)}...`)
          const reportingResponse = await fetchWithRetry(reportingUrl, 2, 30000)
          
          if (reportingResponse.ok) {
            const reportingData = await reportingResponse.json()
            if (Array.isArray(reportingData) && reportingData.length > 0) {
              
              // Step 2: Get Form R release data for these doc_ctrl_nums
              const docCtrlNums = reportingData.map(r => r.doc_ctrl_num).slice(0, 1000) // Limit for URL length
              const formRPromises = []
              
              // Batch doc_ctrl_nums to avoid URL length limits
              const batchSize = 50
              for (let i = 0; i < docCtrlNums.length; i += batchSize) {
                const batch = docCtrlNums.slice(i, i + batchSize)
                const formRUrl = `${EPA_BASE_URL}/tri.tri_form_r/doc_ctrl_num/in/${batch.join(',')}`
                formRPromises.push(fetchWithRetry(formRUrl, 2, 30000))
              }
              
              const formRResponses = await Promise.all(formRPromises)
              const allFormRData: any[] = []
              
              for (const response of formRResponses) {
                if (response.ok) {
                  const data = await response.json()
                  if (Array.isArray(data)) {
                    allFormRData.push(...data)
                  }
                }
              }
              
              console.log(`[Facilities API] Found ${allFormRData.length} Form R release records for ${year}`)
              
              if (allFormRData.length > 0) {
                // Create a map of doc_ctrl_num -> form R data
                const formRByDocCtrl = new Map()
                allFormRData.forEach(formR => {
                  formRByDocCtrl.set(formR.doc_ctrl_num, formR)
                })
                
                // Join reporting data with Form R data
                allReleases = reportingData
                  .filter(reporting => formRByDocCtrl.has(reporting.doc_ctrl_num))
                  .map(reporting => {
                    const formR = formRByDocCtrl.get(reporting.doc_ctrl_num)
                    const airTotal = (formR.air_total_release || 0)
                    const waterTotal = (formR.water_total_release || 0)
                    const landTotal = (formR.land_total_release || 0)
                    const totalReleases = airTotal + waterTotal + landTotal + (formR.uninj_total_release || 0)
                    
                    return {
                      tri_facility_id: reporting.tri_facility_id,
                      reporting_year: year,
                      doc_ctrl_num: reporting.doc_ctrl_num,
                      chemical: reporting.cas_chem_name || 'Mixed Chemicals',
                      total_air_emissions: airTotal,
                      total_releases: totalReleases
                    }
                  })
                
                selectedReportingYear = year
                console.log(`[Facilities API] Successfully joined ${allReleases.length} release records for ${year}`)
                break
              }
            }
          } else {
            console.warn(`[Facilities API] EPA API returned ${reportingResponse.status} for reporting forms in ${year}.`)
          }
        } catch (error) {
          console.warn(`[Facilities API] Could not fetch releases for year ${year}. Trying previous year.`, error)
        }
      }

      // If we couldn't get release data, continue with facilities only (graceful degradation)
      if (allReleases.length === 0) {
        console.warn(`[Facilities API] No release data found for any year. Continuing with facilities only.`)
        processedFacilities = validFacilities.map(facility => processFacilityData(facility, []))
      } else {
        // Map releases to facilities
        const releasesByFacilityId = new Map<string, EPARelease[]>()
        for (const release of allReleases) {
          if (!releasesByFacilityId.has(release.tri_facility_id)) {
            releasesByFacilityId.set(release.tri_facility_id, [])
          }
          releasesByFacilityId.get(release.tri_facility_id)!.push(release)
        }

        processedFacilities = validFacilities.map(facility => {
          const facilityReleases = releasesByFacilityId.get(facility.tri_facility_id) || []
          return processFacilityData(facility, facilityReleases)
        })
      }

    } else {
      // If not including release data, just process facilities without it
      processedFacilities = validFacilities.map(facility => processFacilityData(facility, []))
    }

    const processingTime = Date.now() - startTime
    console.log(`[Facilities API] Successfully processed ${processedFacilities.length} facilities in ${processingTime}ms`)

    return NextResponse.json({
      success: true,
      data: processedFacilities,
      count: processedFacilities.length,
      metadata: {
        state,
        county,
        zip,
        processingTimeMs: processingTime,
        totalFacilities: allFacilities.length,
        validFacilities: validFacilities.length,
        includeReleaseData: queryParams.includeReleaseData,
        selectedReportingYear: selectedReportingYear,
      }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error("[Facilities API] Request failed:", error)
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    const statusCode = errorMessage.includes("EPA API returned") ? 502 : 500
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        metadata: {
          processingTimeMs: processingTime
        }
      },
      { status: statusCode }
    )
  }
}
