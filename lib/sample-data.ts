import type { TRIFacility, ChemicalRelease, HealthImpact } from "./types"

export const sampleFacilities: TRIFacility[] = [
  // Example:
  // {
  //   id: "fac-001",
  //   facilityName: "Example Facility",
  //   address: "123 Example St",
  //   city: "City",
  //   state: "ST",
  //   zipCode: "00000",
  //   county: "County",
  //   latitude: 0,
  //   longitude: 0,
  //   industry: "Industry",
  //   parentCompany: "Parent Company",
  //   reportingYear: 2023,
  // },
]

export const sampleReleases: ChemicalRelease[] = [
  // Example:
  // {
  //   id: "rel-001",
  //   facilityId: "fac-001",
  //   chemicalName: "Example Chemical",
  //   casNumber: "000-00-0",
  //   releaseType: "air",
  //   amount: 0,
  //   unit: "pounds",
  //   reportingYear: 2023,
  //   mediaType: "Air",
  // },
]

export const healthImpacts: HealthImpact[] = [
  // Example:
  // {
  //   casNumber: "000-00-0",
  //   chemicalName: "Example Chemical",
  //   healthEffects: ["Effect 1", "Effect 2"],
  //   carcinogen: false,
  //   acuteToxicity: "low",
  //   chronicToxicity: "low",
  //   description: "Description here.",
  // },
]
