import { type NextRequest, NextResponse } from "next/server"
import { searchFacilities } from "@/lib/tri-utils"
import type { SearchParams } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get("state") || "VA"
    // Fetch from EPA TRI Facility API (public, JSON)
    const epaUrl = `https://enviro.epa.gov/enviro/efservice/TRI_FACILITY/STATE_ABBR/${state}/JSON`
    const response = await fetch(epaUrl)
    const facilities = await response.json()

    // Map EPA data to FacilityWithReleases (minimal, no releases join)
    const mapped = facilities.map((f: any) => ({
      id: f.FACILITY_ID,
      facilityName: f.FACILITY_NAME,
      address: f.STREET_ADDRESS,
      city: f.CITY_NAME,
      state: f.STATE_ABBR,
      zipCode: f.ZIP_CODE,
      county: f.COUNTY_NAME,
      latitude: parseFloat(f.LATITUDE),
      longitude: parseFloat(f.LONGITUDE),
      industry: f.PRIMARY_NAICS,
      parentCompany: f.PARENT_COMPANY_NAME || undefined,
      reportingYear: f.REPORTING_YEAR,
      releases: [],
      totalReleases: 0,
      topChemicals: [],
    }))

    return NextResponse.json({
      success: true,
      data: mapped,
      count: mapped.length,
    })
  } catch (error) {
    console.error("Error fetching facilities:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch facilities" }, { status: 500 })
  }
}
