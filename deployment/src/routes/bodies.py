from flask import Blueprint, jsonify, request
from supabase import create_client, Client

bodies_bp = Blueprint('bodies', __name__)

# Supabase configuration
SUPABASE_URL = "https://rfctmbpdthtovqkogbol.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3RtYnBkdGh0b3Zxa29nYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTc0OTUsImV4cCI6MjA3MDU5MzQ5NX0.RzvfalZtvT1ytxzCsaQaXN53vpgnY9iZ8Z4DiZIWQKU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@bodies_bp.route('/bodies', methods=['GET'])
def get_bodies():
    try:
        # Get all body configurations
        response = supabase.table('body_configurations').select('*').execute()
        
        bodies_list = []
        for body in response.data:
            bodies_list.append({
                'id': body['id'],
                'name': body['configuration_name'],
                'code': body['configuration_code'],
                'description': body['description'],
                'fuelType': body['fuel_type'],
                'length': body['length_ft'],
                'passengers': body['passenger_capacity'],
                'wheelchairPositions': body['wheelchair_positions'],
                'range': body['electric_range_miles'],
                'price': 'Contact for pricing'
            })
        
        return jsonify(bodies_list)
        
    except Exception as e:
        print(f"Bodies query error: {e}")
        return jsonify({'error': 'Failed to fetch body configurations'}), 500

@bodies_bp.route('/bodies/<body_id>', methods=['GET'])
def get_body_by_id(body_id):
    try:
        response = supabase.table('body_configurations').select('*').eq('id', body_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Body configuration not found'}), 404
            
        body = response.data[0]
        return jsonify({
            'id': body['id'],
            'name': body['configuration_name'],
            'code': body['configuration_code'],
            'description': body['description'],
            'fuelType': body['fuel_type'],
            'length': body['length_ft'],
            'passengers': body['passenger_capacity'],
            'wheelchairPositions': body['wheelchair_positions'],
            'range': body['electric_range_miles'],
            'price': 'Contact for pricing'
        })
        
    except Exception as e:
        print(f"Body query error: {e}")
        return jsonify({'error': 'Failed to fetch body configuration'}), 500

