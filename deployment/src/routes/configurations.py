from flask import Blueprint, jsonify, request
from supabase import create_client, Client
import secrets
from datetime import datetime, timedelta

configurations_bp = Blueprint('configurations', __name__)

# Supabase configuration
SUPABASE_URL = "https://rfctmbpdthtovqkogbol.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3RtYnBkdGh0b3Zxa29nYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTc0OTUsImV4cCI6MjA3MDU5MzQ5NX0.RzvfalZtvT1ytxzCsaQaXN53vpgnY9iZ8Z4DiZIWQKU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@configurations_bp.route('/configurations/sessions', methods=['POST'])
def create_session():
    try:
        data = request.get_json() or {}
        user_type = data.get('userType', 'customer')
        
        # Generate session token
        session_token = secrets.token_hex(32)
        
        # Create session
        session_data = {
            'session_token': session_token,
            'user_type': user_type,
            'current_step': 'chassis_selection',
            'session_status': 'active',
            'expires_at': (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        response = supabase.table('configuration_sessions').insert(session_data).execute()
        
        if response.data:
            session = response.data[0]
            return jsonify({
                'sessionId': session['id'],
                'sessionToken': session['session_token'],
                'userType': session['user_type'],
                'currentStep': session['current_step'],
                'status': session['session_status'],
                'expiresAt': session['expires_at']
            }), 201
        else:
            return jsonify({'error': 'Failed to create session'}), 500
            
    except Exception as e:
        print(f"Session creation error: {e}")
        return jsonify({'error': 'Failed to create configuration session'}), 500

@configurations_bp.route('/configurations/sessions/<session_id>/selections', methods=['POST'])
def create_selection(session_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['selectionType', 'selectedItemId']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        selection_data = {
            'session_id': session_id,
            'selection_type': data['selectionType'],
            'selected_item_id': data['selectedItemId'],
            'selected_item_code': data.get('selectedItemCode'),
            'quantity': data.get('quantity', 1),
            'unit_price': data.get('unitPrice'),
            'total_price': data.get('totalPrice'),
            'is_valid': True
        }
        
        response = supabase.table('configuration_selections').insert(selection_data).execute()
        
        if response.data:
            selection = response.data[0]
            return jsonify({
                'id': selection['id'],
                'sessionId': selection['session_id'],
                'selectionType': selection['selection_type'],
                'selectedItemId': selection['selected_item_id'],
                'selectedItemCode': selection['selected_item_code'],
                'quantity': selection['quantity'],
                'unitPrice': selection['unit_price'],
                'totalPrice': selection['total_price'],
                'isValid': selection['is_valid']
            }), 201
        else:
            return jsonify({'error': 'Failed to create selection'}), 500
            
    except Exception as e:
        print(f"Selection creation error: {e}")
        return jsonify({'error': 'Failed to create selection'}), 500

@configurations_bp.route('/configurations/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    try:
        response = supabase.table('configuration_sessions').select('*').eq('id', session_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Session not found'}), 404
            
        session = response.data[0]
        return jsonify({
            'sessionId': session['id'],
            'sessionToken': session['session_token'],
            'userType': session['user_type'],
            'currentStep': session['current_step'],
            'status': session['session_status'],
            'selectedChassisId': session.get('selected_chassis_id'),
            'selectedBodyId': session.get('selected_body_id'),
            'basePrice': session.get('base_price'),
            'optionsPrice': session.get('options_price'),
            'totalPrice': session.get('total_price'),
            'expiresAt': session['expires_at']
        })
        
    except Exception as e:
        print(f"Session query error: {e}")
        return jsonify({'error': 'Failed to fetch session'}), 500

