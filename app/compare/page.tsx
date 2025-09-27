"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Search, TrendingUp, AlertTriangle, MapPin } from "lucide-react"

interface ComparisonData {
  location: string
  totalReleases: number
  highRiskFacilities: number
  topChemicals: Array<{ name: string; amount: number; risk: string }>
  yearOverYear: Array<{ year: number; releases: number }>
  riskDistribution: Array<{ risk: string; count: number; color: string }>
}

export default function ComparePage() {
  const [locations, setLocations] = useState<string[]>([])
  const [newLocation, setNewLocation] = useState("")
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("2023")

  const addLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation])
      setNewLocation("")
      fetchComparisonData([...locations, newLocation])
    }
  }

  const removeLocation = (location: string) => {
    const updated = locations.filter((l) => l !== location)
    setLocations(updated)
    setComparisonData(comparisonData.filter((d) => d.location !== location))
  }

  const fetchComparisonData = async (locs: string[]) => {
    setLoading(true)
    try {
      const promises = locs.map(async (location) => {
        const response = await fetch(`/api/comparison?location=${encodeURIComponent(location)}&year=${timeRange}`)
        return response.json()
      })
      const results = await Promise.all(promises)
      setComparisonData(results)
    } catch (error) {
      console.error("Failed to fetch comparison data:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartColors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Compare Locations
          </h1>
          <p className="text-slate-400 text-lg">
            Compare toxic release data across different locations to understand regional environmental impacts
          </p>
        </div>

        {/* Location Input */}
        <Card className="bg-slate-900/50 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Add Locations to Compare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter zip code, city, or county..."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addLocation()}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button onClick={addLocation} className="bg-purple-600 hover:bg-purple-700">
                <Search className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            <div className="flex gap-2 mb-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="5-year">5 Year Average</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {locations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <Badge
                    key={location}
                    variant="secondary"
                    className="bg-slate-800 text-white px-3 py-1 cursor-pointer hover:bg-slate-700"
                    onClick={() => removeLocation(location)}
                  >
                    {location} ×
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading comparison data...</p>
          </div>
        )}

        {comparisonData.length > 0 && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-900 border-slate-800">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-purple-600">
                Trends
              </TabsTrigger>
              <TabsTrigger value="chemicals" className="data-[state=active]:bg-purple-600">
                Top Chemicals
              </TabsTrigger>
              <TabsTrigger value="risk" className="data-[state=active]:bg-purple-600">
                Risk Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisonData.map((data, index) => (
                  <Card key={data.location} className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        {data.location}
                        <Badge
                          variant={
                            data.highRiskFacilities > 5
                              ? "destructive"
                              : data.highRiskFacilities > 2
                                ? "secondary"
                                : "default"
                          }
                          className="ml-2"
                        >
                          {data.highRiskFacilities > 5
                            ? "High Risk"
                            : data.highRiskFacilities > 2
                              ? "Medium Risk"
                              : "Low Risk"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Total Releases</span>
                          <span className="text-2xl font-bold text-white">{data.totalReleases.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">High-Risk Facilities</span>
                          <span className="text-xl font-semibold text-red-400">{data.highRiskFacilities}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-sm">Top Chemical</span>
                          <div className="mt-1">
                            <span className="text-white font-medium">{data.topChemicals[0]?.name}</span>
                            <Badge
                              variant={data.topChemicals[0]?.risk === "High" ? "destructive" : "secondary"}
                              className="ml-2 text-xs"
                            >
                              {data.topChemicals[0]?.risk} Risk
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Release Trends Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={comparisonData[0]?.yearOverYear || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="year" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #475569",
                            borderRadius: "8px",
                          }}
                        />
                        {comparisonData.map((data, index) => (
                          <Line
                            key={data.location}
                            type="monotone"
                            dataKey="releases"
                            stroke={chartColors[index % chartColors.length]}
                            strokeWidth={2}
                            name={data.location}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chemicals" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {comparisonData.map((data, index) => (
                  <Card key={data.location} className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">{data.location} - Top Chemicals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.topChemicals.slice(0, 5).map((chemical, idx) => (
                          <div key={chemical.name} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{chemical.name}</span>
                                <Badge
                                  variant={
                                    chemical.risk === "High"
                                      ? "destructive"
                                      : chemical.risk === "Medium"
                                        ? "secondary"
                                        : "default"
                                  }
                                  className="text-xs"
                                >
                                  {chemical.risk}
                                </Badge>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2 mt-1">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${(chemical.amount / data.topChemicals[0].amount) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-slate-400 text-sm ml-4">{chemical.amount.toLocaleString()} lbs</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {comparisonData.map((data, index) => (
                  <Card key={data.location} className="bg-slate-900/50 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-white">{data.location} - Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.riskDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              label={({ risk, count }) => `${risk}: ${count}`}
                            >
                              {data.riskDistribution.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "8px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {comparisonData.length === 0 && !loading && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Comparison Data</h3>
              <p className="text-slate-400">Add locations above to start comparing toxic release data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
