const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  // Unique identifier combining facility_id and reporting_year
  facility_year_id: {
    type: String,
    required: true,
    unique: true
  },
  facility_id: {
    type: String,
    required: true,
    index: true
  },
  reporting_year: {
    type: Number,
    required: false,
    index: true
  },
  facility_name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    street_address: String,
    city: String,
    county: String,
    state_abbr: String,
    zip_code: String
  },
  parent_company_name: String,
  standard_parent_company_name: String,
  industry_sector: String,
  primary_naics: String,
  total_releases: {
    type: Number,
    default: 0
  },
  chemical_count: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for location queries
facilitySchema.index({ location: '2dsphere' });

// Create compound index for filtering by year and location
facilitySchema.index({ reporting_year: 1, location: '2dsphere' });

// Create compound index for facility queries
facilitySchema.index({ facility_id: 1, reporting_year: 1 });

module.exports = mongoose.model('Facility', facilitySchema);
