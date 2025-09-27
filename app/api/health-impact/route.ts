import { type NextRequest, NextResponse } from "next/server"
import { getHealthImpact } from "@/lib/tri-utils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const casNumber = searchParams.get("casNumber")

    if (!casNumber) {
      return NextResponse.json({ success: false, error: "CAS number is required" }, { status: 400 })
    }

    const healthImpact = getHealthImpact(casNumber)

    if (!healthImpact) {
      return NextResponse.json({ success: false, error: "Health impact data not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: healthImpact,
    })
  } catch (error) {
    console.error("Error fetching health impact:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch health impact data" }, { status: 500 })
  }
}
