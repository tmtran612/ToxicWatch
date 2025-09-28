import React from "react"
import type { FacilityWithReleases } from "@/lib/types"

interface FacilityDetailsSheetProps {
  facility: FacilityWithReleases | null
  onOpenChange: (isOpen: boolean) => void
}

export function FacilityDetailsSheet({ facility, onOpenChange }: FacilityDetailsSheetProps) {
  return null
}
