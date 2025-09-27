"use client"

import { useState } from "react"
import { FilterIcon, CalendarIcon, FlagIcon as FlaskIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function SearchFilters() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedChemicals, setSelectedChemicals] = useState<string[]>([])

  const availableYears = ["2023", "2022", "2021", "2020", "2019"]
  const commonChemicals = [
    "Benzene",
    "Toluene",
    "Lead",
    "Chromium",
    "Vinyl Chloride",
    "Methanol",
    "Ammonia",
    "Sulfuric Acid",
  ]

  const handleChemicalToggle = (chemical: string) => {
    setSelectedChemicals((prev) => (prev.includes(chemical) ? prev.filter((c) => c !== chemical) : [...prev, chemical]))
  }

  return (
    <div className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="mb-4 bg-transparent">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {(selectedYear !== "all" || selectedChemicals.length > 0) && (
              <span className="ml-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                {[selectedYear, ...selectedChemicals].filter(Boolean).length}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Filter Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Year Filter */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Reporting Year</span>
                  </div>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chemical Filter */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <FlaskIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Chemicals</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {commonChemicals.map((chemical) => (
                      <div key={chemical} className="flex items-center space-x-2">
                        <Checkbox
                          id={chemical}
                          checked={selectedChemicals.includes(chemical)}
                          onCheckedChange={() => handleChemicalToggle(chemical)}
                        />
                        <label htmlFor={chemical} className="text-sm text-foreground cursor-pointer">
                          {chemical}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedYear("all")
                    setSelectedChemicals([])
                  }}
                >
                  Clear All
                </Button>
                <Button>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
