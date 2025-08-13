const express = require('express');
const router = express.Router();

// GET /api/bodies/models - Get available body models (must be before /:id route)
router.get('/models', async (req, res) => {
  try {
    const { supabase } = req;

    const { data: models, error } = await supabase
      .from('body_models')
      .select(`
        *,
        body_manufacturers (*),
        body_configurations (
          id,
          config_code,
          config_name,
          passenger_capacity,
          wheelchair_positions,
          fuel_type
        )
      `)
      .eq('is_active', true)
      .order('model_name');

    if (error) {
      console.error('Body models error:', error);
      return res.status(500).json({ error: 'Failed to fetch body models' });
    }

    res.json({
      success: true,
      data: models
    });

  } catch (error) {
    console.error('Body models route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bodies - Get all available body configurations
router.get('/', async (req, res) => {
  try {
    const { supabase } = req;
    const { fuel_type, passenger_capacity, wheelchair_positions } = req.query;

    const { data: bodies, error } = await supabase
      .from('body_configurations')
      .select('*')
      .order('config_name');

    if (error) {
      console.error('Bodies query error:', error);
      return res.status(500).json({ error: 'Failed to fetch body configurations' });
    }

    // Format the response with basic data
    const formattedBodies = bodies.map(body => ({
      id: body.id,
      configCode: body.config_code,
      configName: body.config_name,
      passengerCapacity: body.passenger_capacity,
      wheelchairPositions: body.wheelchair_positions,
      overallLengthFt: body.overall_length_ft,
      overallWidthIn: body.overall_width_in,
      overallHeightIn: body.overall_height_in,
      fuelType: body.fuel_type,
      electricRangeMiles: body.electric_range_miles,
      batteryCapacityKwh: body.battery_capacity_kwh,
      isAdaCompliant: body.is_ada_compliant,
      hasRearLift: body.has_rear_lift,
      hasFrontLift: body.has_front_lift
    }));

    res.json({
      success: true,
      data: formattedBodies,
      count: formattedBodies.length,
      filters: {
        fuelType: fuel_type,
        passengerCapacity: passenger_capacity,
        wheelchairPositions: wheelchair_positions
      }
    });

  } catch (error) {
    console.error('Bodies route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bodies/:id - Get specific body configuration details
router.get('/:id', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;

    const { data: body, error } = await supabase
      .from('body_configurations')
      .select(`
        *,
        body_models (*),
        body_floor_plans (*),
        body_features (
          *,
          body_feature_categories (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Body detail error:', error);
      return res.status(404).json({ error: 'Body configuration not found' });
    }

    res.json({
      success: true,
      data: body
    });

  } catch (error) {
    console.error('Body detail route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bodies/:id/compatible-chassis - Get compatible chassis for body
router.get('/:id/compatible-chassis', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;

    const { data: compatibleChassis, error } = await supabase
      .from('chassis_body_compatibility')
      .select(`
        *,
        base_vehicles (
          *,
          vehicle_categories (*),
          base_vehicle_pricing (*)
        )
      `)
      .eq('body_config_id', id)
      .eq('is_compatible', true);

    if (error) {
      console.error('Compatible chassis error:', error);
      return res.status(500).json({ error: 'Failed to fetch compatible chassis' });
    }

    res.json({
      success: true,
      data: compatibleChassis
    });

  } catch (error) {
    console.error('Compatible chassis route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bodies/:id/features - Get available features for body
router.get('/:id/features', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;
    const { category } = req.query;

    let query = supabase
      .from('body_features')
      .select(`
        *,
        body_feature_categories (
          category_code,
          category_name
        )
      `)
      .eq('body_config_id', id);

    if (category) {
      query = query.eq('body_feature_categories.category_code', category);
    }

    const { data: features, error } = await query;

    if (error) {
      console.error('Body features error:', error);
      return res.status(500).json({ error: 'Failed to fetch body features' });
    }

    // Group features by category
    const groupedFeatures = features.reduce((acc, feature) => {
      const categoryCode = feature.body_feature_categories?.category_code || 'OTHER';
      if (!acc[categoryCode]) {
        acc[categoryCode] = {
          categoryName: feature.body_feature_categories?.category_name || 'Other',
          features: []
        };
      }
      acc[categoryCode].features.push({
        id: feature.id,
        featureCode: feature.feature_code,
        featureName: feature.feature_name,
        featureDescription: feature.feature_description,
        isStandard: feature.is_standard,
        isOptional: feature.is_optional
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedFeatures
    });

  } catch (error) {
    console.error('Body features route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

