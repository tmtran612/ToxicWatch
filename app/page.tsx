import { SearchIcon, MapIcon, BrainIcon, BookmarkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MapIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">ToxicWatch</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                Search
              </Link>
              <Link href="/map" className="text-muted-foreground hover:text-foreground transition-colors">
                Map
              </Link>
              <Link href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">
                Compare
              </Link>
              <Link href="/ai-assistant" className="text-muted-foreground hover:text-foreground transition-colors">
                AI Assistant
              </Link>
              <Link href="/watchlist" className="text-muted-foreground hover:text-foreground transition-colors">
                Watchlist
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            Know what toxic chemicals are released in <span className="text-primary">your community</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-3xl mx-auto">
            AI-powered insights from EPA TRI data help communities understand toxic releases, health impacts, and take
            informed action for environmental justice.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="flex gap-2">
              <Input placeholder="Enter ZIP code or city name" className="flex-1" />
              <Link href="/search">
                <Button size="lg" className="px-6">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">21,000+</div>
              <div className="text-muted-foreground">Facilities tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">650+</div>
              <div className="text-muted-foreground">Toxic chemicals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50</div>
              <div className="text-muted-foreground">States covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful tools for environmental awareness</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <SearchIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Location Search</CardTitle>
                <CardDescription>Find toxic release facilities near you by ZIP code or county</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Search EPA TRI data to discover which facilities in your area are releasing toxic chemicals and what
                  substances they're emitting.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <MapIcon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Interactive Maps</CardTitle>
                <CardDescription>Visualize toxic releases with maps and timelines</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See toxic release patterns over time with interactive maps showing facility locations, emission
                  levels, and historical trends.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <BrainIcon className="h-6 w-6 text-chart-2" />
                </div>
                <CardTitle>AI Health Assistant</CardTitle>
                <CardDescription>Get plain-language explanations of health impacts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ask questions about chemical health effects and get AI-powered insights comparing your area to state
                  and national averages.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center mb-4">
                  <BookmarkIcon className="h-6 w-6 text-chart-4" />
                </div>
                <CardTitle>Personal Watchlist</CardTitle>
                <CardDescription>Track facilities and locations you care about</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Save facilities, locations, and chemicals to your personal watchlist and get notified of changes in
                  toxic releases.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Start exploring toxic releases in your community</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Knowledge is power. Understanding what's being released in your area is the first step toward environmental
            justice and community health.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="px-8 py-3">
                Search Facilities
              </Button>
            </Link>
            <Link href="/map">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                View Map
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                Ask AI Assistant
              </Button>
            </Link>
            <Link href="/watchlist">
              <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                My Watchlist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                  <MapIcon className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold">ToxicWatch</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Making EPA toxic release data accessible and actionable for communities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Facility Search
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Interactive Maps
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    AI Assistant
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Health Insights
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Data</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    EPA TRI Database
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Chemical Lookup
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Health Effects
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API Access
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>Built for environmental justice and community health awareness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
