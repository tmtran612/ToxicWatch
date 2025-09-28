
import { notFound } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProcessedFacility } from "@/lib/types"
import { MapView } from "@/components/map-view"
import { formatNumber } from "@/lib/utils"

async function getFacilityData(id: string): Promise<ProcessedFacility | null> {
  try {
    // Use the internal fetch for server-side components, assuming the app is running on localhost:3000
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/facilities/${id}`, {
      cache: "no-store", // Don't cache for now to see updates
    })

    if (!res.ok) {
      console.error(`Failed to fetch facility ${id}: ${res.status} ${res.statusText}`)
      return null
    }

    const jsonResponse = await res.json()
    return jsonResponse.data
  } catch (error) {
    console.error(`Error fetching facility data for ID ${id}:`, error)
    return null
  }
}

export default async function FacilityDetailsPage({ params }: { params: { id: string } }) {
  const facility = await getFacilityData(params.id)

  if (!facility) {
    notFound()
  }

  const mapCenter = {
    lat: facility.latitude,
    lng: facility.longitude,
  }

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                <div className="mb-4 sm:mb-0">
                  <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
                    {facility.facilityName}
                  </CardTitle>
                  <CardDescription className="text-md md:text-lg text-muted-foreground">
                    {facility.industry}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-sm h-fit">
                  {facility.reportingYear} Report
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Location</h3>
                  <p>{facility.address}</p>
                  <p>
                    {facility.city}, {facility.state} {facility.zipCode}
                  </p>
                  <p>{facility.county} County</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Ownership</h3>
                  <p>{facility.parentCompany || "Not Reported"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Coordinates</h3>
                  <p>
                    Lat: {facility.latitude.toFixed(4)}, Lng: {facility.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chemical Releases ({facility.reportingYear})</CardTitle>
              <CardDescription>
                Total reported on-site releases for the most recent reporting year.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-muted/50 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground">Total On-Site Releases</p>
                <p className="text-4xl font-bold tracking-tighter">
                  {formatNumber(facility.totalReleases)}
                  <span className="text-xl font-medium text-muted-foreground ml-2">lbs</span>
                </p>
              </div>
              <Separator className="my-6" />
              <h3 className="text-lg font-semibold mb-4">Released Chemicals</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chemical Name</TableHead>
                      <TableHead className="text-right">Total Air Emissions</TableHead>
                      <TableHead className="text-right">Total Releases (All Media)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facility.releases.length > 0 ? (
                      facility.releases.map(release => (
                        <TableRow key={release.id}>
                          <TableCell className="font-medium">{release.chemicalName}</TableCell>
                          <TableCell className="text-right">
                            {formatNumber(release.totalAirEmissions)} lbs
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(release.totalReleases)} lbs
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No individual chemical release data available for this facility.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80 w-full rounded-lg overflow-hidden">
                <MapView
                  facilities={[facility]}
                  center={mapCenter}
                  zoom={14}
                  interactive={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
