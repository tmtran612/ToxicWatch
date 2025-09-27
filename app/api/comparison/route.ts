import { type NextRequest, NextResponse } from "next/server"
import { searchFacilities, generateComparisonText, getRiskLevel } from "@/lib/tri-utils"
import type { SearchParams, ComparisonData } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params: SearchParams = {
      zipCode: searchParams.get("zipCode") || undefined,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      county: searchParams.get("county") || undefined,
    }

    const facilities = searchFacilities(params)
    const totalReleases = facilities.reduce((sum, f) => sum + f.totalReleases, 0)
    const averageReleases = facilities.length > 0 ? totalReleases / facilities.length : 0

    // Get top chemicals across all facilities
    const allChemicals = facilities.flatMap((f) => f.topChemicals)
    const chemicalTotals = allChemicals.reduce(
      (acc, chem) => {
        if (!acc[chem.name]) acc[chem.name] = 0
        acc[chem.name] += chem.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const topChemicals = Object.entries(chemicalTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name)

    const location = params.zipCode || params.city || params.county || "the selected area"
    const comparisonText = generateComparisonText(facilities.length, totalReleases, location)
    const riskLevel = getRiskLevel(averageReleases)

    const comparison: ComparisonData = {
      location,
      averageReleases,
      topChemicals,
      comparisonText,
      riskLevel,
    }

    return NextResponse.json({
      success: true,
      data: comparison,
    })
  } catch (error) {
    console.error("Error generating comparison:", error)
    return NextResponse.json({ success: false, error: "Failed to generate comparison" }, { status: 500 })
  }
}
