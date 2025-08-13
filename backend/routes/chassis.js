const express = require('express');
const router = express.Router();

// GET /api/chassis - Get all available chassis
router.get('/', async (req, res) => {
  try {
    const { supabase } = req;
    
    // Get current price list
    const { data: priceList, error: priceListError } = await supabase
      .from('price_lists')
      .select('id')
      .eq('is_active', true)
      .eq('model_year', 2026)
      .single();

    if (priceListError) {
      return res.status(500).json({ error: 'Failed to get price list' });
    }

    // Get base vehicles with pricing and category info
    const { data: chassis, error } = await supabase
      .from('base_vehicles')
      .select(`
        id,
        vehicle_id,
        series_code,
        wheelbase_inches,
        drivetrain_type,
        drive_type,
        engine_series,
        model_description,
        gvwr_pounds,
        gcwr_pounds,
        payload_pounds,
        max_payload_pounds,
        curb_weight_pounds,
        vehicle_categories (
          category_name,
          category_code
        ),
        base_vehicle_pricing (
          dealer_invoice_price,
          suggested_retail_price,
          destination_delivery_charge
        )
      `)
      .eq('price_list_id', priceList.id)
      .eq('is_active', true)
      .order('series_code')
      .order('wheelbase_inches');

    if (error) {
      console.error('Chassis query error:', error);
      return res.status(500).json({ error: 'Failed to fetch chassis data' });
    }

    // Format the response
    const formattedChassis = chassis.map(item => ({
      id: item.id,
      vehicleId: item.vehicle_id,
      seriesCode: item.series_code,
      wheelbaseInches: item.wheelbase_inches,
      drivetrainType: item.drivetrain_type,
      driveType: item.drive_type,
      engineSeries: item.engine_series,
      modelDescription: item.model_description,
      gvwrPounds: item.gvwr_pounds,
      gcwrPounds: item.gcwr_pounds,
      payloadPounds: item.payload_pounds,
      maxPayloadPounds: item.max_payload_pounds,
      curbWeightPounds: item.curb_weight_pounds,
      category: {
        name: item.vehicle_categories?.category_name,
        code: item.vehicle_categories?.category_code
      },
      pricing: item.base_vehicle_pricing?.[0] ? {
        dealerInvoice: item.base_vehicle_pricing[0].dealer_invoice_price,
        suggestedRetail: item.base_vehicle_pricing[0].suggested_retail_price,
        destinationCharge: item.base_vehicle_pricing[0].destination_delivery_charge
      } : null
    }));

    res.json({
      success: true,
      data: formattedChassis,
      count: formattedChassis.length
    });

  } catch (error) {
    console.error('Chassis route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chassis/:id - Get specific chassis details
router.get('/:id', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;

    const { data: chassis, error } = await supabase
      .from('base_vehicles')
      .select(`
        *,
        vehicle_categories (*),
        base_vehicle_pricing (*),
        chassis_fuel_compatibility (
          *,
          fuel_type_options (*),
          powertrain_providers (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Chassis detail error:', error);
      return res.status(404).json({ error: 'Chassis not found' });
    }

    res.json({
      success: true,
      data: chassis
    });

  } catch (error) {
    console.error('Chassis detail route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chassis/:id/fuel-options - Get available fuel types for chassis
router.get('/:id/fuel-options', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;

    const { data: fuelOptions, error } = await supabase
      .from('chassis_fuel_compatibility')
      .select(`
        *,
        fuel_type_options (
          fuel_code,
          fuel_name,
          fuel_category,
          requires_conversion
        ),
        powertrain_providers (
          provider_name,
          provider_type,
          specialization
        )
      `)
      .eq('base_vehicle_id', id)
      .eq('availability_status', 'Available');

    if (error) {
      console.error('Fuel options error:', error);
      return res.status(500).json({ error: 'Failed to fetch fuel options' });
    }

    res.json({
      success: true,
      data: fuelOptions
    });

  } catch (error) {
    console.error('Fuel options route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/chassis/:id/compatible-bodies - Get compatible body configurations
router.get('/:id/compatible-bodies', async (req, res) => {
  try {
    const { supabase } = req;
    const { id } = req.params;

    const { data: compatibleBodies, error } = await supabase
      .from('chassis_body_compatibility')
      .select(`
        *,
        body_configurations (
          *,
          body_models (*)
        )
      `)
      .eq('base_vehicle_id', id)
      .eq('is_compatible', true);

    if (error) {
      console.error('Compatible bodies error:', error);
      return res.status(500).json({ error: 'Failed to fetch compatible bodies' });
    }

    res.json({
      success: true,
      data: compatibleBodies
    });

  } catch (error) {
    console.error('Compatible bodies route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

