import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, Award } from "lucide-react"

interface ComparisonSummaryProps {
  data: Array<{
    location: string
    totalReleases: number
    highRiskFacilities: number
    riskScore: number
    trend: "up" | "down" | "stable"
    trendPercent: number
  }>
}

export function ComparisonSummary({ data }: ComparisonSummaryProps) {
  const sortedByRisk = [...data].sort((a, b) => b.riskScore - a.riskScore)
  const bestPerformer = sortedByRisk[sortedByRisk.length - 1]
  const worstPerformer = sortedByRisk[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-green-400" />
            Best Environmental Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-green-400">{bestPerformer?.location}</h3>
            <p className="text-slate-400">Lowest risk score: {bestPerformer?.riskScore}/100</p>
            <div className="flex items-center gap-2">
              {bestPerformer?.trend === "down" ? (
                <TrendingDown className="h-4 w-4 text-green-400" />
              ) : bestPerformer?.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-red-400" />
              ) : null}
              <span className="text-sm text-slate-400">{bestPerformer?.trendPercent}% vs last year</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Highest Risk Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-red-400">{worstPerformer?.location}</h3>
            <p className="text-slate-400">Risk score: {worstPerformer?.riskScore}/100</p>
            <Badge variant="destructive" className="text-xs">
              {worstPerformer?.highRiskFacilities} high-risk facilities
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Regional Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-white">
              {Math.round(data.reduce((sum, d) => sum + d.totalReleases, 0) / data.length).toLocaleString()}
            </div>
            <p className="text-slate-400">Average total releases</p>
            <div className="text-sm text-slate-400">Across {data.length} locations</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
