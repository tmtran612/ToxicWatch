"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWatchlist } from "@/lib/watchlist-context"
import {
  BookmarkIcon,
  MapPinIcon,
  FactoryIcon,
  FlaskConicalIcon,
  TrashIcon,
  BellIcon,
  TrendingUpIcon,
} from "lucide-react"
import { formatChemicalAmount, getRiskLevel } from "@/lib/tri-utils"

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, getWatchlistByType } = useWatchlist()
  const [activeTab, setActiveTab] = useState("all")

  const facilities = getWatchlistByType("facility")
  const locations = getWatchlistByType("location")
  const chemicals = getWatchlistByType("chemical")

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-400 bg-red-500/10 border-red-500/20"
      case "moderate":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
      case "low":
        return "text-green-400 bg-green-500/10 border-green-500/20"
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">My Watchlist</h1>
          <p className="text-muted-foreground text-lg">
            Track facilities, locations, and chemicals you're monitoring for environmental changes
          </p>
        </div>

        {watchlist.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No items in watchlist</h3>
              <p className="text-muted-foreground mb-6">
                Start adding facilities, locations, or chemicals to track environmental changes
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <a href="/search">Search Facilities</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/map">Browse Map</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Items</p>
                      <p className="text-2xl font-bold text-foreground">{watchlist.length}</p>
                    </div>
                    <BookmarkIcon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Facilities</p>
                      <p className="text-2xl font-bold text-foreground">{facilities.length}</p>
                    </div>
                    <FactoryIcon className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Locations</p>
                      <p className="text-2xl font-bold text-foreground">{locations.length}</p>
                    </div>
                    <MapPinIcon className="h-8 w-8 text-chart-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chemicals</p>
                      <p className="text-2xl font-bold text-foreground">{chemicals.length}</p>
                    </div>
                    <FlaskConicalIcon className="h-8 w-8 text-chart-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Watchlist Items */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted">
                <TabsTrigger value="all">All Items ({watchlist.length})</TabsTrigger>
                <TabsTrigger value="facilities">Facilities ({facilities.length})</TabsTrigger>
                <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
                <TabsTrigger value="chemicals">Chemicals ({chemicals.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {watchlist.map((item) => (
                  <Card key={item.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {item.type === "facility" && <FactoryIcon className="h-5 w-5 text-accent" />}
                            {item.type === "location" && <MapPinIcon className="h-5 w-5 text-chart-2" />}
                            {item.type === "chemical" && <FlaskConicalIcon className="h-5 w-5 text-chart-3" />}
                            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                            <Badge variant="outline" className="capitalize">
                              {item.type}
                            </Badge>
                          </div>

                          {item.type === "facility" && item.data && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Industry</p>
                                <p className="font-medium text-foreground">{item.data.industry}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Releases</p>
                                <p className="font-medium text-foreground">
                                  {formatChemicalAmount(item.data.totalReleases, "pounds")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Risk Level</p>
                                <Badge
                                  className={getRiskColor(getRiskLevel(item.data.totalReleases))}
                                  variant="outline"
                                >
                                  {getRiskLevel(item.data.totalReleases)} risk
                                </Badge>
                              </div>
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground mt-2">
                            Added {item.addedAt.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <BellIcon className="h-4 w-4 mr-2" />
                            Alerts
                          </Button>
                          <Button variant="outline" size="sm">
                            <TrendingUpIcon className="h-4 w-4 mr-2" />
                            Trends
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromWatchlist(item.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="facilities" className="space-y-4 mt-6">
                {facilities.map((item) => (
                  <Card key={item.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FactoryIcon className="h-5 w-5 text-accent" />
                            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                          </div>

                          {item.data && (
                            <>
                              <p className="text-muted-foreground mb-3">
                                {item.data.address}, {item.data.city}, {item.data.state}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Industry</p>
                                  <p className="font-medium text-foreground">{item.data.industry}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Total Releases</p>
                                  <p className="font-medium text-foreground">
                                    {formatChemicalAmount(item.data.totalReleases, "pounds")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Risk Level</p>
                                  <Badge
                                    className={getRiskColor(getRiskLevel(item.data.totalReleases))}
                                    variant="outline"
                                  >
                                    {getRiskLevel(item.data.totalReleases)} risk
                                  </Badge>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWatchlist(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="locations" className="space-y-4 mt-6">
                {locations.map((item) => (
                  <Card key={item.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MapPinIcon className="h-5 w-5 text-chart-2" />
                            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">Added {item.addedAt.toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWatchlist(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="chemicals" className="space-y-4 mt-6">
                {chemicals.map((item) => (
                  <Card key={item.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FlaskConicalIcon className="h-5 w-5 text-chart-3" />
                            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">Added {item.addedAt.toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWatchlist(item.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}
