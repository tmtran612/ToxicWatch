import { type NextRequest, NextResponse } from "next/server"

// Node.js API base URL
const NODE_API_BASE_URL = "http://localhost:3001"

// Types matching the frontend expectations
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

// Transform MongoDB facility to frontend format
function transformFacilityWithReleases(mongoFacility: any, mongoReleases: any[]): ProcessedFacility {
  const longitude = mongoFacility.location?.coordinates?.[0] || 0
  const latitude = mongoFacility.location?.coordinates?.[1] || 0
  
  // Transform releases
  const releases = mongoReleases.map(release => ({
    id: release._id || `${release.facility_year_id}_${release.chemical?.chemical_name}`,
    chemicalName: release.chemical?.chemical_name || "Unknown Chemical",
    casNumber: release.chemical?.cas_number || undefined,
    totalAirEmissions: release.releases?.air_total || 0,
    totalReleases: release.releases?.total_releases || 0,
    healthImpacts: []
  }))
  
  // Calculate top chemicals (top 5 by total releases)
  const topChemicals = releases
    .sort((a, b) => b.totalReleases - a.totalReleases)
    .slice(0, 5)
    .map(release => ({
      name: release.chemicalName,
      amount: release.totalReleases,
      unit: "pounds"
    }))
  
  // Calculate total releases
  const totalReleases = releases.reduce((sum, release) => sum + release.totalReleases, 0)
  
  return {
    id: mongoFacility.facility_year_id || mongoFacility._id,
    facilityName: mongoFacility.facility_name || "Unknown Facility",
    address: mongoFacility.address?.street_address || "",
    city: mongoFacility.address?.city || "",
    state: mongoFacility.address?.state_abbr || "",
    zipCode: mongoFacility.address?.zip_code || "",
    county: mongoFacility.address?.county || "",
    latitude,
    longitude,
    industry: mongoFacility.industry_sector || mongoFacility.primary_naics || "Unknown",
    parentCompany: mongoFacility.parent_company_name || mongoFacility.standard_parent_company_name || undefined,
    reportingYear: mongoFacility.reporting_year || null,
    releases,
    totalReleases,
    topChemicals
  }
}

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
    // Forward the request to Node.js API
    const nodeApiUrl = `${NODE_API_BASE_URL}/api/facilities/${facilityId}`
    
    console.log(`[Frontend Proxy] Fetching facility detail from: ${nodeApiUrl}`)
    
    const response = await fetch(nodeApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ success: false, error: "Facility not found" }, { status: 404 })
      }
      throw new Error(`Node.js API returned ${response.status}: ${response.statusText}`)
    }
    
    const mongoData = await response.json()
    
    // Transform the response to match frontend expectations
    const transformedFacility = transformFacilityWithReleases(
      mongoData.facility, 
      mongoData.releases || []
    )
    
    const processingTime = Date.now() - startTime
    console.log(`[Frontend Proxy] Transformed facility ${facilityId} with ${transformedFacility.releases.length} releases in ${processingTime}ms`)
    
    return NextResponse.json({
      success: true,
      data: transformedFacility,
      metadata: {
        processingTimeMs: processingTime,
        originalReleaseCount: mongoData.releases?.length || 0
      }
    })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error(`[Frontend Proxy] Facility detail request failed for ID ${facilityId}:`, error)
    
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    const statusCode = errorMessage.includes("Node.js API returned") ? 502 : 500
    
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
