from flask import Blueprint, jsonify, request
from supabase import create_client, Client

pricing_bp = Blueprint('pricing', __name__)

# Supabase configuration
SUPABASE_URL = "https://rfctmbpdthtovqkogbol.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3RtYnBkdGh0b3Zxa29nYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTc0OTUsImV4cCI6MjA3MDU5MzQ5NX0.RzvfalZtvT1ytxzCsaQaXN53vpgnY9iZ8Z4DiZIWQKU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@pricing_bp.route('/pricing/sessions/<session_id>', methods=['GET'])
def get_session_pricing(session_id):
    try:
        # Get session data
        session_response = supabase.table('configuration_sessions').select('*').eq('id', session_id).execute()
        
        if not session_response.data:
            return jsonify({'error': 'Session not found'}), 404
            
        session = session_response.data[0]
        
        # Initialize pricing
        chassis_price = 0
        destination_charge = 0
        body_price = 0
        
        # Get chassis pricing if selected
        if session.get('selected_chassis_id'):
            chassis_response = supabase.table('chassis').select('msrp, destination_charge').eq('id', session['selected_chassis_id']).execute()
            if chassis_response.data:
                chassis = chassis_response.data[0]
                chassis_price = float(chassis['msrp'] or 0)
                destination_charge = float(chassis['destination_charge'] or 0)
        
        # Body pricing is placeholder for now
        if session.get('selected_body_id'):
            body_price = 0  # Contact for pricing
        
        total_price = chassis_price + destination_charge + body_price
        
        return jsonify({
            'sessionId': session_id,
            'chassisPrice': chassis_price,
            'bodyPrice': body_price,
            'destinationCharge': destination_charge,
            'totalPrice': total_price,
            'breakdown': {
                'chassis': {
                    'msrp': chassis_price,
                    'destinationCharge': destination_charge
                },
                'body': {
                    'price': body_price,
                    'note': 'Contact for pricing' if session.get('selected_body_id') else None
                }
            }
        })
        
    except Exception as e:
        print(f"Pricing calculation error: {e}")
        return jsonify({'error': 'Failed to calculate pricing'}), 500

