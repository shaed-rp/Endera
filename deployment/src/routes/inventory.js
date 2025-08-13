const express = require('express');
const router = express.Router();

// GET /api/inventory/availability/:configurationId - Check availability for configuration
router.get('/availability/:configurationId', async (req, res) => {
  try {
    const { supabase } = req;
    const { configurationId } = req.params;

    // This would be a complex query in a real system
    // For now, return mock availability data
    const availability = {
      chassisAvailable: Math.random() > 0.3,
      bodyAvailable: Math.random() > 0.4,
      estimatedLeadTime: Math.floor(Math.random() * 90) + 30, // 30-120 days
      inStockChassis: Math.floor(Math.random() * 5),
      inStockBodies: Math.floor(Math.random() * 3),
      nextAvailableSlot: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000)
    };

    res.json({
      success: true,
      data: availability
    });

  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/chassis - Get chassis inventory
router.get('/chassis', async (req, res) => {
  try {
    const { supabase } = req;
    const { seriesCode, wheelbase, location } = req.query;

    let query = supabase
      .from('chassis_inventory')
      .select(`
        *,
        base_vehicles (
          series_code,
          wheelbase_inches,
          model_description
        ),
        inventory_locations (
          location_name,
          location_code
        )
      `)
      .eq('is_available', true);

    if (seriesCode) {
      query = query.eq('base_vehicles.series_code', seriesCode);
    }
    if (wheelbase) {
      query = query.eq('base_vehicles.wheelbase_inches', parseInt(wheelbase));
    }
    if (location) {
      query = query.eq('inventory_locations.location_code', location);
    }

    const { data: inventory, error } = await query;

    if (error) {
      console.error('Chassis inventory error:', error);
      return res.status(500).json({ error: 'Failed to fetch chassis inventory' });
    }

    res.json({
      success: true,
      data: inventory,
      count: inventory.length
    });

  } catch (error) {
    console.error('Chassis inventory route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/bodies - Get body inventory
router.get('/bodies', async (req, res) => {
  try {
    const { supabase } = req;
    const { configCode, location } = req.query;

    let query = supabase
      .from('body_inventory')
      .select(`
        *,
        body_configurations (
          config_code,
          config_name,
          passenger_capacity
        ),
        inventory_locations (
          location_name,
          location_code
        )
      `)
      .eq('is_available', true);

    if (configCode) {
      query = query.eq('body_configurations.config_code', configCode);
    }
    if (location) {
      query = query.eq('inventory_locations.location_code', location);
    }

    const { data: inventory, error } = await query;

    if (error) {
      console.error('Body inventory error:', error);
      return res.status(500).json({ error: 'Failed to fetch body inventory' });
    }

    res.json({
      success: true,
      data: inventory,
      count: inventory.length
    });

  } catch (error) {
    console.error('Body inventory route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/production-schedule - Get production schedule
router.get('/production-schedule', async (req, res) => {
  try {
    const { supabase } = req;
    const { manufacturer, weeks = 8 } = req.query;

    let query = supabase
      .from('production_schedules')
      .select('*')
      .gte('production_week', new Date().toISOString().split('T')[0])
      .order('production_week')
      .limit(parseInt(weeks));

    if (manufacturer) {
      query = query.eq('manufacturer_code', manufacturer.toUpperCase());
    }

    const { data: schedule, error } = await query;

    if (error) {
      console.error('Production schedule error:', error);
      return res.status(500).json({ error: 'Failed to fetch production schedule' });
    }

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Production schedule route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/lead-times - Get estimated lead times
router.get('/lead-times', async (req, res) => {
  try {
    const { chassisId, bodyId, fuelType } = req.query;

    // Mock lead time calculation
    let leadTime = {
      chassis: 30, // Base chassis lead time
      body: 45,    // Body production time
      upfit: 0,    // Additional upfitting time
      total: 0
    };

    // Adjust based on fuel type
    if (fuelType === 'Electric') {
      leadTime.upfit = 30; // Electric conversion time
    }

    // Add some randomness for realism
    leadTime.chassis += Math.floor(Math.random() * 15);
    leadTime.body += Math.floor(Math.random() * 20);

    leadTime.total = leadTime.chassis + leadTime.body + leadTime.upfit;

    res.json({
      success: true,
      data: {
        leadTimeDays: leadTime,
        estimatedDelivery: new Date(Date.now() + leadTime.total * 24 * 60 * 60 * 1000),
        factors: {
          chassisAvailability: 'In Stock',
          bodyProduction: 'Standard Lead Time',
          fuelConversion: fuelType === 'Electric' ? 'Requires Upfitting' : 'No Conversion Needed'
        }
      }
    });

  } catch (error) {
    console.error('Lead times route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/locations - Get inventory locations
router.get('/locations', async (req, res) => {
  try {
    const { supabase } = req;

    const { data: locations, error } = await supabase
      .from('inventory_locations')
      .select('*')
      .eq('is_active', true)
      .order('location_name');

    if (error) {
      console.error('Locations error:', error);
      return res.status(500).json({ error: 'Failed to fetch locations' });
    }

    res.json({
      success: true,
      data: locations
    });

  } catch (error) {
    console.error('Locations route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

