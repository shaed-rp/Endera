const express = require('express');
const router = express.Router();

// GET /api/pricing/sessions/:sessionId - Calculate pricing for current session
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { supabase } = req;
    const { sessionId } = req.params;
    const { userType = 'customer' } = req.query;

    // Get session with all selections
    const { data: session, error: sessionError } = await supabase
      .from('configuration_sessions')
      .select(`
        *,
        configuration_selections (
          *,
          vehicle_options (
            option_code,
            option_name,
            vehicle_option_pricing (
              dealer_invoice_price,
              suggested_retail_price,
              is_no_charge,
              is_credit
            )
          )
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let pricingBreakdown = {
      chassis: { price: 0, description: 'Base Chassis' },
      fuelConversion: { price: 0, description: 'Fuel System' },
      body: { price: 0, description: 'Body Configuration' },
      options: { price: 0, description: 'Selected Options', items: [] },
      subtotal: 0,
      taxes: 0,
      fees: 0,
      total: 0
    };

    // Get chassis pricing
    if (session.selected_chassis_id) {
      const { data: chassisPricing, error: chassisError } = await supabase
        .from('base_vehicle_pricing')
        .select(`
          dealer_invoice_price,
          suggested_retail_price,
          destination_delivery_charge,
          base_vehicles (
            series_code,
            wheelbase_inches,
            model_description
          )
        `)
        .eq('vehicle_id', session.selected_chassis_id)
        .eq('is_current', true)
        .single();

      if (!chassisError && chassisPricing) {
        const price = userType === 'dealer' 
          ? chassisPricing.dealer_invoice_price 
          : chassisPricing.suggested_retail_price;
        
        pricingBreakdown.chassis = {
          price: parseFloat(price),
          description: `${chassisPricing.base_vehicles.series_code} ${chassisPricing.base_vehicles.wheelbase_inches}" WB`,
          details: chassisPricing.base_vehicles.model_description,
          destinationCharge: parseFloat(chassisPricing.destination_delivery_charge || 0)
        };
      }
    }

    // Get fuel conversion pricing
    if (session.selected_chassis_id && session.selected_fuel_type) {
      const { data: fuelPricing, error: fuelError } = await supabase
        .from('chassis_fuel_compatibility')
        .select(`
          base_price_adjustment,
          fuel_type_options (
            fuel_name,
            requires_conversion
          ),
          powertrain_providers (
            provider_name
          )
        `)
        .eq('base_vehicle_id', session.selected_chassis_id)
        .eq('fuel_type_options.fuel_code', session.selected_fuel_type)
        .single();

      if (!fuelError && fuelPricing) {
        pricingBreakdown.fuelConversion = {
          price: parseFloat(fuelPricing.base_price_adjustment || 0),
          description: fuelPricing.fuel_type_options.fuel_name,
          provider: fuelPricing.powertrain_providers?.provider_name,
          requiresConversion: fuelPricing.fuel_type_options.requires_conversion
        };
      }
    }

    // Get body pricing (placeholder since pricing not populated)
    if (session.selected_body_id) {
      const { data: bodyConfig, error: bodyError } = await supabase
        .from('body_configurations')
        .select(`
          config_name,
          passenger_capacity,
          wheelchair_positions,
          fuel_type,
          electric_range_miles
        `)
        .eq('id', session.selected_body_id)
        .single();

      if (!bodyError && bodyConfig) {
        // Placeholder pricing based on body type and fuel
        let bodyPrice = 45000; // Base body price
        if (bodyConfig.fuel_type === 'Electric') {
          bodyPrice += 25000; // Electric conversion premium
          if (bodyConfig.electric_range_miles > 120) {
            bodyPrice += 15000; // Extended range premium
          }
        }
        if (bodyConfig.wheelchair_positions > 0) {
          bodyPrice += 8000; // ADA compliance premium
        }

        pricingBreakdown.body = {
          price: bodyPrice,
          description: bodyConfig.config_name,
          details: `${bodyConfig.passenger_capacity} passengers, ${bodyConfig.wheelchair_positions} wheelchair positions`,
          fuelType: bodyConfig.fuel_type,
          range: bodyConfig.electric_range_miles
        };
      }
    }

    // Calculate options pricing
    let optionsTotal = 0;
    const optionItems = [];

    for (const selection of session.configuration_selections || []) {
      if (selection.vehicle_options && selection.vehicle_option_pricing) {
        const pricing = selection.vehicle_option_pricing[0];
        if (pricing) {
          const price = userType === 'dealer' 
            ? pricing.dealer_invoice_price 
            : pricing.suggested_retail_price;
          
          const optionPrice = pricing.is_credit ? -Math.abs(price) : Math.abs(price);
          const totalOptionPrice = optionPrice * selection.quantity;
          
          optionsTotal += totalOptionPrice;
          
          optionItems.push({
            code: selection.vehicle_options.option_code,
            name: selection.vehicle_options.option_name,
            quantity: selection.quantity,
            unitPrice: optionPrice,
            totalPrice: totalOptionPrice,
            isCredit: pricing.is_credit,
            isNoCharge: pricing.is_no_charge
          });
        }
      }
    }

    pricingBreakdown.options = {
      price: optionsTotal,
      description: 'Selected Options',
      items: optionItems
    };

    // Calculate totals
    pricingBreakdown.subtotal = 
      pricingBreakdown.chassis.price + 
      (pricingBreakdown.chassis.destinationCharge || 0) +
      pricingBreakdown.fuelConversion.price + 
      pricingBreakdown.body.price + 
      pricingBreakdown.options.price;

    // Add estimated taxes and fees (placeholder)
    pricingBreakdown.taxes = pricingBreakdown.subtotal * 0.08; // 8% estimated tax
    pricingBreakdown.fees = 500; // Documentation and processing fees

    pricingBreakdown.total = pricingBreakdown.subtotal + pricingBreakdown.taxes + pricingBreakdown.fees;

    // Update session with calculated pricing
    await supabase
      .from('configuration_sessions')
      .update({
        base_price: pricingBreakdown.chassis.price + pricingBreakdown.fuelConversion.price + pricingBreakdown.body.price,
        options_price: pricingBreakdown.options.price,
        total_price: pricingBreakdown.total
      })
      .eq('id', sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        userType,
        pricing: pricingBreakdown,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Pricing calculation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pricing/estimate - Get quick pricing estimate
router.get('/estimate', async (req, res) => {
  try {
    const { supabase } = req;
    const { chassisId, bodyId, fuelType, userType = 'customer' } = req.query;

    if (!chassisId || !bodyId) {
      return res.status(400).json({ error: 'chassisId and bodyId are required' });
    }

    let estimate = {
      chassis: 0,
      fuelConversion: 0,
      body: 0,
      estimatedTotal: 0
    };

    // Get chassis pricing
    const { data: chassisPricing } = await supabase
      .from('base_vehicle_pricing')
      .select('dealer_invoice_price, suggested_retail_price')
      .eq('vehicle_id', chassisId)
      .eq('is_current', true)
      .single();

    if (chassisPricing) {
      estimate.chassis = userType === 'dealer' 
        ? chassisPricing.dealer_invoice_price 
        : chassisPricing.suggested_retail_price;
    }

    // Get fuel conversion pricing
    if (fuelType) {
      const { data: fuelPricing } = await supabase
        .from('chassis_fuel_compatibility')
        .select('base_price_adjustment')
        .eq('base_vehicle_id', chassisId)
        .eq('fuel_type_options.fuel_code', fuelType)
        .single();

      if (fuelPricing) {
        estimate.fuelConversion = fuelPricing.base_price_adjustment || 0;
      }
    }

    // Get body configuration details for pricing estimate
    const { data: bodyConfig } = await supabase
      .from('body_configurations')
      .select('fuel_type, electric_range_miles, wheelchair_positions')
      .eq('id', bodyId)
      .single();

    if (bodyConfig) {
      // Placeholder body pricing logic
      let bodyPrice = 45000;
      if (bodyConfig.fuel_type === 'Electric') {
        bodyPrice += 25000;
        if (bodyConfig.electric_range_miles > 120) {
          bodyPrice += 15000;
        }
      }
      if (bodyConfig.wheelchair_positions > 0) {
        bodyPrice += 8000;
      }
      estimate.body = bodyPrice;
    }

    estimate.estimatedTotal = estimate.chassis + estimate.fuelConversion + estimate.body;

    res.json({
      success: true,
      data: estimate
    });

  } catch (error) {
    console.error('Pricing estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pricing/options/:optionId - Get option pricing
router.get('/options/:optionId', async (req, res) => {
  try {
    const { supabase } = req;
    const { optionId } = req.params;
    const { userType = 'customer' } = req.query;

    const { data: optionPricing, error } = await supabase
      .from('vehicle_option_pricing')
      .select(`
        *,
        vehicle_options (
          option_code,
          option_name,
          option_description
        )
      `)
      .eq('option_id', optionId)
      .eq('is_current', true)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Option pricing not found' });
    }

    const price = userType === 'dealer' 
      ? optionPricing.dealer_invoice_price 
      : optionPricing.suggested_retail_price;

    res.json({
      success: true,
      data: {
        optionId,
        optionCode: optionPricing.vehicle_options.option_code,
        optionName: optionPricing.vehicle_options.option_name,
        description: optionPricing.vehicle_options.option_description,
        price: parseFloat(price),
        isCredit: optionPricing.is_credit,
        isNoCharge: optionPricing.is_no_charge,
        userType
      }
    });

  } catch (error) {
    console.error('Option pricing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

