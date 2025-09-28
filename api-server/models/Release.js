const mongoose = require('mongoose');

const releaseSchema = new mongoose.Schema({
  facility_year_id: {
    type: String,
    required: true,
    index: true
  },
  facility_id: {
    type: String,
    required: true,
    index: true
  },
  reporting_year: {
    type: Number,
    required: true,
    index: true
  },
  chemical: {
    chemical_name: String,
    cas_number: String,
    element_compound: String,
    chemical_id: String,
    carcinogen: String,
    metal: String,
    classification: String
  },
  releases: {
    air_total: { type: Number, default: 0 },
    water_total: { type: Number, default: 0 },
    land_total: { type: Number, default: 0 },
    total_releases: { type: Number, default: 0 },
    unit_of_measure: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Create compound indexes for efficient queries
releaseSchema.index({ facility_year_id: 1, reporting_year: 1 });
releaseSchema.index({ facility_id: 1, reporting_year: 1 });
releaseSchema.index({ 'chemical.chemical_name': 1 });
releaseSchema.index({ 'releases.total_releases': -1 }); // For sorting by release amount

module.exports = mongoose.model('Release', releaseSchema);
