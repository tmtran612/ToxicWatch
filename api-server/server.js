require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Facility = require('./models/Facility');
const Release = require('./models/Release');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get facilities with optional filtering
app.get('/api/facilities', async (req, res) => {
  try {
    const { year, state, limit = 1000, skip = 0, bounds } = req.query;
    
    const query = {};
    
    // Filter by year
    if (year) {
      query.reporting_year = parseInt(year);
    }
    
    // Filter by state
    if (state) {
      query['address.state_abbr'] = state.toUpperCase();
    }
    
    // Filter by geographic bounds
    if (bounds) {
      const [swLng, swLat, neLng, neLat] = bounds.split(',').map(parseFloat);
      query.location = {
        $geoWithin: {
          $box: [[swLng, swLat], [neLng, neLat]]
        }
      };
    }
    
    const facilities = await Facility.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ total_releases: -1 })
      .lean();
    
    const total = await Facility.countDocuments(query);
    
    res.json({
      data: facilities,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching facilities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get facility details by facility_year_id
app.get('/api/facilities/:facilityYearId', async (req, res) => {
  try {
    const { facilityYearId } = req.params;
    
    // Get facility details
    const facility = await Facility.findOne({ facility_year_id: facilityYearId }).lean();
    
    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }
    
    // Get releases for this facility
    const releases = await Release.find({ facility_year_id: facilityYearId })
      .sort({ 'releases.total_releases': -1 })
      .lean();
    
    res.json({
      facility,
      releases
    });
  } catch (error) {
    console.error('Error fetching facility details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get facilities near a location
app.get('/api/facilities/near/:lng/:lat', async (req, res) => {
  try {
    const { lng, lat } = req.params;
    const { year, maxDistance = 10000, limit = 50 } = req.query; // maxDistance in meters
    
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    if (year) {
      query.reporting_year = parseInt(year);
    }
    
    const facilities = await Facility.find(query)
      .limit(parseInt(limit))
      .lean();
    
    res.json({ data: facilities });
  } catch (error) {
    console.error('Error fetching nearby facilities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get aggregated statistics
app.get('/api/stats', async (req, res) => {
  try {
    const { year, state } = req.query;
    
    const matchQuery = {};
    if (year) matchQuery.reporting_year = parseInt(year);
    if (state) matchQuery['address.state_abbr'] = state.toUpperCase();
    
    const stats = await Facility.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFacilities: { $sum: 1 },
          totalReleases: { $sum: '$total_releases' },
          avgReleases: { $avg: '$total_releases' },
          maxReleases: { $max: '$total_releases' },
          totalChemicals: { $sum: '$chemical_count' }
        }
      }
    ]);
    
    const stateStats = await Facility.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$address.state_abbr',
          count: { $sum: 1 },
          totalReleases: { $sum: '$total_releases' }
        }
      },
      { $sort: { totalReleases: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      overall: stats[0] || {
        totalFacilities: 0,
        totalReleases: 0,
        avgReleases: 0,
        maxReleases: 0,
        totalChemicals: 0
      },
      byState: stateStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available years
app.get('/api/years', async (req, res) => {
  try {
    const years = await Facility.distinct('reporting_year');
    res.json({ years: years.sort((a, b) => b - a) });
  } catch (error) {
    console.error('Error fetching years:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search facilities by name or company
app.get('/api/search', async (req, res) => {
  try {
    const { q, year, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ data: [] });
    }
    
    const query = {
      $and: [
        {
          $or: [
            { facility_name: { $regex: q, $options: 'i' } },
            { parent_company_name: { $regex: q, $options: 'i' } },
            { standard_parent_company_name: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    };
    
    if (year) {
      query.$and.push({ reporting_year: parseInt(year) });
    }
    
    const facilities = await Facility.find(query)
      .limit(parseInt(limit))
      .sort({ total_releases: -1 })
      .lean();
    
    res.json({ data: facilities });
  } catch (error) {
    console.error('Error searching facilities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
