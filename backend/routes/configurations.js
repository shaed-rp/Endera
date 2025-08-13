const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto-js');
const router = express.Router();

// POST /api/configurations/sessions - Create new configuration session
router.post('/sessions', async (req, res) => {
  try {
    const { supabase } = req;
    const { userEmail, userName, userPhone, userType = 'customer' } = req.body;

    // Generate session token
    const sessionToken = crypto.lib.WordArray.random(32).toString();

    const { data: session, error } = await supabase
      .from('configuration_sessions')
      .insert({
        session_token: sessionToken,
        user_email: userEmail,
        user_name: userName,
        user_phone: userPhone,
        user_type: userType,
        current_step: 'chassis_selection',
        session_status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.id,
        sessionToken: session.session_token,
        currentStep: session.current_step,
        expiresAt: session.expires_at
      }
    });

  } catch (error) {
    console.error('Create session route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/configurations/sessions/:sessionId - Get session state
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { supabase } = req;
    const { sessionId } = req.params;

    const { data: session, error } = await supabase
      .from('configuration_sessions')
      .select(`
        *,
        configuration_selections (
          *,
          vehicle_options (
            option_code,
            option_name
          )
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Session fetch error:', error);
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Session expired' });
    }

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Get session route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/configurations/sessions/:sessionId - Update session
router.put('/sessions/:sessionId', async (req, res) => {
  try {
    const { supabase } = req;
    const { sessionId } = req.params;
    const { 
      currentStep, 
      selectedChassisId, 
      selectedBodyId, 
      selectedFuelType,
      basePrice,
      optionsPrice,
      totalPrice 
    } = req.body;

    const updateData = {};
    if (currentStep) updateData.current_step = currentStep;
    if (selectedChassisId) updateData.selected_chassis_id = selectedChassisId;
    if (selectedBodyId) updateData.selected_body_id = selectedBodyId;
    if (selectedFuelType) updateData.selected_fuel_type = selectedFuelType;
    if (basePrice !== undefined) updateData.base_price = basePrice;
    if (optionsPrice !== undefined) updateData.options_price = optionsPrice;
    if (totalPrice !== undefined) updateData.total_price = totalPrice;

    const { data: session, error } = await supabase
      .from('configuration_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Session update error:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Update session route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/configurations/sessions/:sessionId/selections - Add selection to session
router.post('/sessions/:sessionId/selections', async (req, res) => {
  try {
    const { supabase } = req;
    const { sessionId } = req.params;
    const { selectionType, selectedItemId, selectedItemCode, quantity = 1, unitPrice, totalPrice } = req.body;

    const { data: selection, error } = await supabase
      .from('configuration_selections')
      .insert({
        session_id: sessionId,
        selection_type: selectionType,
        selected_item_id: selectedItemId,
        selected_item_code: selectedItemCode,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        is_valid: true
      })
      .select()
      .single();

    if (error) {
      console.error('Selection creation error:', error);
      return res.status(500).json({ error: 'Failed to add selection' });
    }

    res.status(201).json({
      success: true,
      data: selection
    });

  } catch (error) {
    console.error('Add selection route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/configurations/sessions/:sessionId/selections/:selectionId - Remove selection
router.delete('/sessions/:sessionId/selections/:selectionId', async (req, res) => {
  try {
    const { supabase } = req;
    const { sessionId, selectionId } = req.params;

    const { error } = await supabase
      .from('configuration_selections')
      .delete()
      .eq('id', selectionId)
      .eq('session_id', sessionId);

    if (error) {
      console.error('Selection deletion error:', error);
      return res.status(500).json({ error: 'Failed to remove selection' });
    }

    res.json({
      success: true,
      message: 'Selection removed successfully'
    });

  } catch (error) {
    console.error('Remove selection route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/configurations/sessions/:sessionId/validate - Validate current configuration
router.post('/sessions/:sessionId/validate', async (req, res) => {
  try {
    const { supabase } = req;
    const { sessionId } = req.params;

    // Get current session
    const { data: session, error: sessionError } = await supabase
      .from('configuration_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const validationResults = [];

    // Validate chassis-body compatibility
    if (session.selected_chassis_id && session.selected_body_id) {
      const { data: compatibility, error: compatError } = await supabase
        .from('chassis_body_compatibility')
        .select('*')
        .eq('base_vehicle_id', session.selected_chassis_id)
        .eq('body_config_id', session.selected_body_id)
        .eq('is_compatible', true)
        .single();

      if (compatError || !compatibility) {
        validationResults.push({
          type: 'compatibility',
          status: 'error',
          message: 'Selected chassis and body are not compatible',
          code: 'INCOMPATIBLE_CHASSIS_BODY'
        });
      } else {
        validationResults.push({
          type: 'compatibility',
          status: 'passed',
          message: 'Chassis and body are compatible'
        });
      }
    }

    // Validate fuel type compatibility
    if (session.selected_chassis_id && session.selected_fuel_type) {
      const { data: fuelCompat, error: fuelError } = await supabase
        .from('chassis_fuel_compatibility')
        .select('*')
        .eq('base_vehicle_id', session.selected_chassis_id)
        .eq('fuel_type_options.fuel_code', session.selected_fuel_type)
        .eq('availability_status', 'Available');

      if (fuelError || !fuelCompat || fuelCompat.length === 0) {
        validationResults.push({
          type: 'fuel_compatibility',
          status: 'error',
          message: 'Selected fuel type is not available for this chassis',
          code: 'INCOMPATIBLE_FUEL_TYPE'
        });
      } else {
        validationResults.push({
          type: 'fuel_compatibility',
          status: 'passed',
          message: 'Fuel type is compatible with chassis'
        });
      }
    }

    // Log validation results
    for (const result of validationResults) {
      await supabase
        .from('configuration_validations')
        .insert({
          session_id: sessionId,
          validation_type: result.type,
          validation_status: result.status,
          error_code: result.code,
          error_message: result.message
        });
    }

    const hasErrors = validationResults.some(r => r.status === 'error');

    res.json({
      success: true,
      data: {
        isValid: !hasErrors,
        validationResults
      }
    });

  } catch (error) {
    console.error('Validation route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/configurations/save - Save configuration
router.post('/save', async (req, res) => {
  try {
    const { supabase } = req;
    const { sessionId, configurationName, userEmail, isFavorite = false } = req.body;

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('configuration_sessions')
      .select(`
        *,
        configuration_selections (*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Generate share token
    const shareToken = crypto.lib.WordArray.random(32).toString();

    // Save configuration
    const { data: savedConfig, error } = await supabase
      .from('saved_configurations')
      .insert({
        configuration_name: configurationName,
        user_email: userEmail,
        session_id: sessionId,
        configuration_data: {
          chassis_id: session.selected_chassis_id,
          body_id: session.selected_body_id,
          fuel_type: session.selected_fuel_type,
          selections: session.configuration_selections
        },
        total_price: session.total_price,
        is_favorite: isFavorite,
        share_token: shareToken
      })
      .select()
      .single();

    if (error) {
      console.error('Save configuration error:', error);
      return res.status(500).json({ error: 'Failed to save configuration' });
    }

    res.status(201).json({
      success: true,
      data: {
        configurationId: savedConfig.id,
        shareToken: savedConfig.share_token,
        shareUrl: `${req.protocol}://${req.get('host')}/shared/${savedConfig.share_token}`
      }
    });

  } catch (error) {
    console.error('Save configuration route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/configurations/shared/:shareToken - Get shared configuration
router.get('/shared/:shareToken', async (req, res) => {
  try {
    const { supabase } = req;
    const { shareToken } = req.params;

    const { data: config, error } = await supabase
      .from('saved_configurations')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (error) {
      console.error('Shared config error:', error);
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Shared configuration route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

