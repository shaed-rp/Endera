const express = require('express');
const router = express.Router();

// GET /api/catalog/search - Search complete vehicles
router.get('/search', async (req, res) => {
  try {
    const { supabase } = req;
    const { 
      q, 
      fuel_type, 
      min_capacity, 
      max_capacity, 
      min_price, 
      max_price,
      wheelchair_positions,
      in_stock,
      page = 1,
      limit = 20
    } = req.query;

    let query = supabase
      .from('complete_vehicles')
      .select(`
        *,
        base_vehicles (
          series_code,
          wheelbase_inches,
          model_description,
          gvwr_pounds
        ),
        body_configurations (
          config_code,
          config_name,
          passenger_capacity,
          wheelchair_positions,
          fuel_type,
          electric_range_miles
        ),
        complete_vehicle_pricing (
          total_delivered_price
        )
      `)
      .eq('validation_status', 'Validated')
      .order('configuration_name');

    // Apply filters
    if (fuel_type) {
      query = query.eq('body_configurations.fuel_type', fuel_type);
    }
    if (min_capacity) {
      query = query.gte('body_configurations.passenger_capacity', parseInt(min_capacity));
    }
    if (max_capacity) {
      query = query.lte('body_configurations.passenger_capacity', parseInt(max_capacity));
    }
    if (wheelchair_positions) {
      query = query.gte('body_configurations.wheelchair_positions', parseInt(wheelchair_positions));
    }

    const { data: vehicles, error } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Catalog search error:', error);
      return res.status(500).json({ error: 'Failed to search catalog' });
    }

    // Filter by price if specified
    let filteredVehicles = vehicles;
    if (min_price || max_price) {
      filteredVehicles = vehicles.filter(vehicle => {
        const price = vehicle.complete_vehicle_pricing?.[0]?.total_delivered_price;
        if (!price) return false;
        if (min_price && price < parseFloat(min_price)) return false;
        if (max_price && price > parseFloat(max_price)) return false;
        return true;
      });
    }

    // Text search if query provided
    if (q) {
      const searchTerm = q.toLowerCase();
      filteredVehicles = filteredVehicles.filter(vehicle => 
        vehicle.configuration_name.toLowerCase().includes(searchTerm) ||
        vehicle.body_configurations?.config_name.toLowerCase().includes(searchTerm) ||
        vehicle.base_vehicles?.series_code.toLowerCase().includes(searchTerm)
      );
    }

    // Format response
    const formattedVehicles = filteredVehicles.map(vehicle => ({
      id: vehicle.id,
      configurationName: vehicle.configuration_name,
      totalPassengerCapacity: vehicle.total_passenger_capacity,
      chassis: {
        seriesCode: vehicle.base_vehicles?.series_code,
        wheelbase: vehicle.base_vehicles?.wheelbase_inches,
        description: vehicle.base_vehicles?.model_description,
        gvwr: vehicle.base_vehicles?.gvwr_pounds
      },
      body: {
        configCode: vehicle.body_configurations?.config_code,
        configName: vehicle.body_configurations?.config_name,
        passengerCapacity: vehicle.body_configurations?.passenger_capacity,
        wheelchairPositions: vehicle.body_configurations?.wheelchair_positions,
        fuelType: vehicle.body_configurations?.fuel_type,
        electricRange: vehicle.body_configurations?.electric_range_miles
      },
      pricing: vehicle.complete_vehicle_pricing?.[0] ? {
        totalDeliveredPrice: vehicle.complete_vehicle_pricing[0].total_delivered_price
      } : null,
      validationStatus: vehicle.validation_status
    }));

    res.json({
      success: true,
      data: formattedVehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: formattedVehicles.length
      },
      filters: {
        query: q,
        fuelType: fuel_type,
        minCapacity: min_capacity,
        maxCapacity: max_capacity,
        minPrice: min_price,
        maxPrice: max_price,
        wheelchairPositions: wheelchair_positions,
        inStock: in_stock
      }
    });

  } catch (error) {
    console.error('Catalog search route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/catalog/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    const { supabase } = req;

    // Get unique fuel types
    const { data: fuelTypes } = await supabase
      .from('body_configurations')
      .select('fuel_type')
      .not('fuel_type', 'is', null);

    // Get capacity range
    const { data: capacityRange } = await supabase
      .from('body_configurations')
      .select('passenger_capacity')
      .order('passenger_capacity');

    // Get price range
    const { data: priceRange } = await supabase
      .from('complete_vehicle_pricing')
      .select('total_delivered_price')
      .eq('is_current', true)
      .order('total_delivered_price');

    // Get series codes
    const { data: seriesCodes } = await supabase
      .from('base_vehicles')
      .select('series_code')
      .eq('is_active', true);

    const filters = {
      fuelTypes: [...new Set(fuelTypes?.map(f => f.fuel_type).filter(Boolean))],
      capacityRange: {
        min: capacityRange?.[0]?.passenger_capacity || 14,
        max: capacityRange?.[capacityRange.length - 1]?.passenger_capacity || 24
      },
      priceRange: {
        min: priceRange?.[0]?.total_delivered_price || 80000,
        max: priceRange?.[priceRange.length - 1]?.total_delivered_price || 250000
      },
      seriesCodes: [...new Set(seriesCodes?.map(s => s.series_code))],
      wheelchairOptions: [0, 1, 2]
    };

    res.json({
      success: true,
      data: filters
    });

  } catch (error) {
    console.error('Filters route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/catalog/complete-vehicles - Get all complete vehicles
router.get('/complete-vehicles', async (req, res) => {
  try {
    const { supabase } = req;
    const { page = 1, limit = 20, sort = 'name' } = req.query;

    let orderBy = 'configuration_name';
    if (sort === 'price') orderBy = 'complete_vehicle_pricing.total_delivered_price';
    if (sort === 'capacity') orderBy = 'total_passenger_capacity';

    const { data: vehicles, error } = await supabase
      .from('complete_vehicles')
      .select(`
        *,
        base_vehicles (*),
        body_configurations (*),
        complete_vehicle_pricing (*)
      `)
      .eq('validation_status', 'Validated')
      .order(orderBy)
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('Complete vehicles error:', error);
      return res.status(500).json({ error: 'Failed to fetch complete vehicles' });
    }

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: vehicles.length
      }
    });

  } catch (error) {
    console.error('Complete vehicles route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/catalog/complete-vehicles/:id - Get specific complete vehicle
router.get('/complete-vehicles/:id', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;

    const { data: vehicle, error } = await supabase
      .from('complete_vehicles')
      .select(`
        *,
        base_vehicles (
          *,
          base_vehicle_pricing (*)
        ),
        body_configurations (
          *,
          body_models (*),
          body_features (
            *,
            body_feature_categories (*)
          )
        ),
        complete_vehicle_pricing (*),
        vehicle_images (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Complete vehicle detail error:', error);
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({
      success: true,
      data: vehicle
    });

  } catch (error) {
    console.error('Complete vehicle detail route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/catalog/popular - Get popular configurations
router.get('/popular', async (req, res) => {
  try {
    const { supabase } = req;
    const { limit = 10 } = req.query;

    const { data: popular, error } = await supabase
      .from('popular_configurations')
      .select(`
        *,
        complete_vehicles (
          *,
          base_vehicles (*),
          body_configurations (*)
        )
      `)
      .order('popularity_score', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Popular configurations error:', error);
      return res.status(500).json({ error: 'Failed to fetch popular configurations' });
    }

    res.json({
      success: true,
      data: popular
    });

  } catch (error) {
    console.error('Popular configurations route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/catalog/recommendations/:userEmail - Get personalized recommendations
router.get('/recommendations/:userEmail', async (req, res) => {
  try {
    const { supabase } = req;
    const { userEmail } = req.params;
    const { limit = 5 } = req.query;

    // This would call the get_user_recommendations function
    // For now, return popular configurations as recommendations
    const { data: recommendations, error } = await supabase
      .from('popular_configurations')
      .select(`
        *,
        complete_vehicles (
          *,
          base_vehicles (*),
          body_configurations (*)
        )
      `)
      .order('popularity_score', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Recommendations error:', error);
      return res.status(500).json({ error: 'Failed to fetch recommendations' });
    }

    res.json({
      success: true,
      data: recommendations,
      userEmail
    });

  } catch (error) {
    console.error('Recommendations route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

