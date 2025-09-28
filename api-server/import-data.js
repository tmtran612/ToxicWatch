require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Facility = require('./models/Facility');
const Release = require('./models/Release');

// Constants (copied from route.ts)
const EPA_BASE_URL = "https://data.epa.gov/efservice"
const REPORTING_YEARS = ["2022", "2021", "2020", "2019"]
const REQUEST_TIMEOUT_MS = 30000
const BATCH_SIZE = 50

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Fetch with timeout (copied from route.ts)
const fetchWithTimeout = async (url, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ToxicReleaseMapper/1.0'
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Sleep utility (copied from route.ts)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Fetch with retry (copied from route.ts)
const fetchWithRetry = async (url, maxRetries = 3, timeoutMs = REQUEST_TIMEOUT_MS) => {
  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, timeoutMs)
      
      // If we get a 5xx error, retry. For other errors, fail immediately
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`[Fetch Retry] Attempt ${attempt}/${maxRetries} failed with ${response.status}, retrying...`)
        await sleep(Math.pow(2, attempt - 1) * 1000) // Exponential backoff: 1s, 2s, 4s
        continue
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt < maxRetries) {
        console.warn(`[Fetch Retry] Attempt ${attempt}/${maxRetries} failed, retrying...`, error)
        await sleep(Math.pow(2, attempt - 1) * 1000)
        continue
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed')
}

// Coordinate conversion (copied from route.ts)
const looksLikeDmsInt = (value) => {
  const num = parseInt(value, 10)
  return !isNaN(num) && num >= 100000 && num <= 9999999
}

const dmsIntToDecimal = (dmsInt) => {
  const str = dmsInt.toString().padStart(6, '0')
  const degrees = parseInt(str.substring(0, 2), 10)
  const minutes = parseInt(str.substring(2, 4), 10)
  const seconds = parseInt(str.substring(4, 6), 10)
  return degrees + minutes / 60 + seconds / 3600
}

const isValidNumericCoordinate = (lat, lng) => {
  return !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0)
}

const convertCoordinates = (lat, lng) => {
  const latNum = parseFloat(lat)
  const lngNum = parseFloat(lng)

  // 1. Check if already in decimal degrees
  if (isValidNumericCoordinate(latNum, lngNum)) {
    return { latitude: latNum, longitude: lngNum > 0 ? -lngNum : lngNum }
  }

  // 2. Check for DMS format (e.g., 383148)
  if (looksLikeDmsInt(lat) && looksLikeDmsInt(lng)) {
    const latitude = dmsIntToDecimal(lat)
    const longitude = -Math.abs(dmsIntToDecimal(lng))
    return { latitude, longitude }
  }

  // 3. Fallback for other integer formats (scaled by 10000)
  const latitude = latNum / 10000
  const longitude = -Math.abs(lngNum / 10000)
  
  return { latitude, longitude }
}

// Get best coordinates (copied from route.ts)
const getBestCoordinates = (facility) => {
  // Prefer preferred (decimal) coordinates
  if (facility.pref_latitude && facility.pref_longitude) {
    const lat = parseFloat(facility.pref_latitude)
    const lng = parseFloat(facility.pref_longitude)
    if (isValidNumericCoordinate(lat, lng)) {
      return { latitude: lat, longitude: lng, valid: true }
    }
  }
  // Fallback to raw facility coords (may be packed DMS or scaled ints)
  if (facility.fac_latitude && facility.fac_longitude) {
    const { latitude, longitude } = convertCoordinates(facility.fac_latitude, facility.fac_longitude)
    return { latitude, longitude, valid: isValidNumericCoordinate(latitude, longitude) }
  }
  return { latitude: 0, longitude: 0, valid: false }
}

// Main import function (using exact logic from route.ts)
async function importData() {
  try {
    console.log('Starting data import...');
    console.log('EPA API Base URL:', EPA_BASE_URL);

    // Clear existing data
    console.log('Clearing existing data...');
    await Facility.deleteMany({});
    await Release.deleteMany({});

    // Test with Virginia only for now
    const state = 'VA'
    
    console.log(`\n=== Processing ${state} ===`);
    
    // 1. Fetch facilities (exact same as route.ts)
    const facilitiesUrl = `${EPA_BASE_URL}/tri.tri_facility/state_abbr/equals/${encodeURIComponent(state)}/1:1000`
    console.log(`Fetching facilities: ${facilitiesUrl}`)

    const facilitiesResponse = await fetchWithTimeout(facilitiesUrl)
    
    if (!facilitiesResponse.ok) {
      throw new Error(`EPA API returned ${facilitiesResponse.status}: ${facilitiesResponse.statusText} for facilities`)
    }

    const allFacilities = await facilitiesResponse.json()
    
    if (!Array.isArray(allFacilities)) {
      throw new Error("Invalid response format from EPA facilities API")
    }

    console.log(`Found ${allFacilities.length} total facilities`)

    // Filter and validate facilities (exact same as route.ts)
    const validFacilities = allFacilities
      .filter(f => 
        f.tri_facility_id && 
        f.facility_name && 
        getBestCoordinates(f).valid
      )

    console.log(`Processing ${validFacilities.length} valid facilities`)

    if (validFacilities.length === 0) {
      throw new Error('No valid facilities found')
    }

    // 2. Fetch releases for ALL years (SLOW PATH - Import all available data)
    let allYearsReleases = []
    let yearsWithData = []

    for (const year of REPORTING_YEARS) {
      try {
        // Get reporting forms (exact same URL structure as route.ts)
        let reportingUrl = `${EPA_BASE_URL}/tri.tri_facility/state_abbr/equals/${encodeURIComponent(state)}/join/tri.tri_reporting_form/tri_facility_id/equals/tri_facility_id/and/reporting_year/equals/${year}/1:10000`

        console.log(`Fetching reporting forms for ${year}: ${reportingUrl.substring(0, 100)}...`)
        const reportingResponse = await fetchWithRetry(reportingUrl, 2, 30000)
        
        if (reportingResponse.ok) {
          const reportingData = await reportingResponse.json()
          if (Array.isArray(reportingData) && reportingData.length > 0) {
            const docCtrlNums = reportingData.map(r => r.doc_ctrl_num)
            const formRPromises = []
            const batchSize = 50
            for (let i = 0; i < docCtrlNums.length; i += batchSize) {
              const batch = docCtrlNums.slice(i, i + batchSize)
              const formRUrl = `${EPA_BASE_URL}/tri.tri_form_r/doc_ctrl_num/in/${batch.join(',')}`
              formRPromises.push(fetchWithRetry(formRUrl, 2, 30000))
            }
            
            const formRResponses = await Promise.all(formRPromises)
            const allFormRData = []
            for (const response of formRResponses) {
              if (response.ok) {
                const data = await response.json()
                if (Array.isArray(data)) allFormRData.push(...data)
              }
            }
            
            console.log(`Found ${allFormRData.length} Form R release records for ${year}`)
            
            if (allFormRData.length > 0) {
              const formRByDocCtrl = new Map()
              allFormRData.forEach(formR => formRByDocCtrl.set(formR.doc_ctrl_num, formR))
              
              const yearReleases = reportingData
                .filter(reporting => formRByDocCtrl.has(reporting.doc_ctrl_num))
                .map(reporting => {
                  const formR = formRByDocCtrl.get(reporting.doc_ctrl_num)
                  const airTotal = (formR.air_total_release || 0)
                  const waterTotal = (formR.water_total_release || 0)
                  const landTotal = (formR.land_total_release || 0)
                  const totalReleases = airTotal + waterTotal + landTotal + (formR.uninj_total_release || 0)
                  return {
                    tri_facility_id: reporting.tri_facility_id,
                    reporting_year: year,
                    doc_ctrl_num: reporting.doc_ctrl_num,
                    chemical: reporting.cas_chem_name || 'Mixed Chemicals',
                    total_air_emissions: airTotal,
                    total_releases: totalReleases
                  }
                })
              
              allYearsReleases.push(...yearReleases)
              yearsWithData.push(year)
              console.log(`Successfully joined ${yearReleases.length} release records for ${year}`)
              // CONTINUE to next year instead of breaking
            }
          }
        } else {
          console.warn(`EPA API returned ${reportingResponse.status} for reporting forms in ${year}.`)
        }
      } catch (error) {
        console.warn(`Could not fetch releases for year ${year}.`, error)
      }
    }

    // 3. Process facilities and create MongoDB records
    if (allYearsReleases.length === 0) {
      console.log('No releases found, creating facilities without release data')
    }

    const releasesByFacilityId = new Map()
    for (const release of allYearsReleases) {
      if (!releasesByFacilityId.has(release.tri_facility_id)) {
        releasesByFacilityId.set(release.tri_facility_id, [])
      }
      releasesByFacilityId.get(release.tri_facility_id).push(release)
    }

    // Create facility-year records
    let facilitiesCreated = 0
    let releasesCreated = 0

    for (const facility of validFacilities) {
      const facilityReleases = releasesByFacilityId.get(facility.tri_facility_id) || []
      const coords = getBestCoordinates(facility)
      
      // Group releases by year
      const releasesByYear = new Map()
      facilityReleases.forEach(release => {
        if (!releasesByYear.has(release.reporting_year)) {
          releasesByYear.set(release.reporting_year, [])
        }
        releasesByYear.get(release.reporting_year).push(release)
      })

      // Create facility records for each year that has data (or one with null year if no data)
      if (releasesByYear.size > 0) {
        // Create a record for each year with data
        for (const [year, yearReleases] of releasesByYear) {
          const facilityYearId = `${facility.tri_facility_id}_${year}`
          const totalReleases = yearReleases.reduce((sum, r) => sum + (r.total_releases || 0), 0)
          
          const chemicalMap = new Map()
          yearReleases.forEach(release => {
            if (release.chemical && release.total_releases) {
              const currentAmount = chemicalMap.get(release.chemical) || 0
              chemicalMap.set(release.chemical, currentAmount + release.total_releases)
            }
          })
          
          const uniqueChemicals = chemicalMap.size

          // Create facility record
          const facilityRecord = {
            facility_year_id: facilityYearId,
            facility_id: facility.tri_facility_id,
            reporting_year: parseInt(year),
            facility_name: facility.facility_name || '',
            location: {
              type: 'Point',
              coordinates: [coords.longitude, coords.latitude]
            },
            address: {
              street_address: facility.street_address || '',
              city: facility.city_name || '',
              county: facility.county_name || '',
              state_abbr: facility.state_abbr || '',
              zip_code: facility.zip_code || ''
            },
            parent_company_name: facility.parent_co_name || '',
            standard_parent_company_name: facility.parent_co_name || '',
            industry_sector: facility.primary_naics_desc || '',
            primary_naics: facility.primary_naics_desc || '',
            total_releases: totalReleases,
            chemical_count: uniqueChemicals
          }

          try {
            await Facility.create(facilityRecord)
            facilitiesCreated++
            console.log(`Created facility record: ${facilityYearId} (${totalReleases} lbs)`)
          } catch (error) {
            if (error.code !== 11000) { // Ignore duplicates
              console.warn(`Error creating facility ${facilityYearId}:`, error.message)
            }
          }

          // Create release records
          for (const release of yearReleases) {
            const releaseRecord = {
              facility_year_id: facilityYearId,
              facility_id: facility.tri_facility_id,
              reporting_year: parseInt(year),
              chemical: {
                chemical_name: release.chemical || '',
                cas_number: '',
                element_compound: '',
                chemical_id: '',
                carcinogen: '',
                metal: '',
                classification: ''
              },
              releases: {
                air_total: release.total_air_emissions || 0,
                water_total: 0,
                land_total: 0,
                total_releases: release.total_releases || 0,
                unit_of_measure: 'Pounds'
              }
            }

            try {
              await Release.create(releaseRecord)
              releasesCreated++
            } catch (error) {
              if (error.code !== 11000) { // Ignore duplicates
                console.warn(`Error creating release record:`, error.message)
              }
            }
          }
        }
      } else {
        // No releases data - create one record with null reporting year
        const facilityRecord = {
          facility_year_id: facility.tri_facility_id,
          facility_id: facility.tri_facility_id,
          reporting_year: null,
          facility_name: facility.facility_name || '',
          location: {
            type: 'Point',
            coordinates: [coords.longitude, coords.latitude]
          },
          address: {
            street_address: facility.street_address || '',
            city: facility.city_name || '',
            county: facility.county_name || '',
            state_abbr: facility.state_abbr || '',
            zip_code: facility.zip_code || ''
          },
          parent_company_name: facility.parent_co_name || '',
          standard_parent_company_name: facility.parent_co_name || '',
          industry_sector: facility.primary_naics_desc || '',
          primary_naics: facility.primary_naics_desc || '',
          total_releases: 0,
          chemical_count: 0
        }

        try {
          await Facility.create(facilityRecord)
          facilitiesCreated++
          console.log(`Created facility record: ${facility.tri_facility_id} (no releases)`)
        } catch (error) {
          if (error.code !== 11000) { // Ignore duplicates
            console.warn(`Error creating facility ${facility.tri_facility_id}:`, error.message)
          }
        }
      }
    }

    // Create indexes
    console.log('Creating database indexes...');
    await Facility.createIndexes();
    await Release.createIndexes();

    console.log('Data import completed successfully!');
    
    // Print summary statistics
    const facilityCount = await Facility.countDocuments();
    const releaseCount = await Release.countDocuments();
    
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Total facilities imported: ${facilityCount}`);
    console.log(`Total releases imported: ${releaseCount}`);
    console.log(`Years with data: ${yearsWithData.join(', ')}`);
    
    for (const year of REPORTING_YEARS) {
      const yearFacilities = await Facility.countDocuments({ reporting_year: parseInt(year) });
      console.log(`${year}: ${yearFacilities} facilities`);
    }
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the import
if (require.main === module) {
  connectDB().then(() => {
    importData();
  });
}

module.exports = { importData, connectDB };
