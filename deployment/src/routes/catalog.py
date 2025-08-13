from flask import Blueprint, jsonify, request
from supabase import create_client, Client

catalog_bp = Blueprint('catalog', __name__)

# Supabase configuration
SUPABASE_URL = "https://rfctmbpdthtovqkogbol.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3RtYnBkdGh0b3Zxa29nYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTc0OTUsImV4cCI6MjA3MDU5MzQ5NX0.RzvfalZtvT1ytxzCsaQaXN53vpgnY9iZ8Z4DiZIWQKU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@catalog_bp.route('/catalog/vehicles', methods=['GET'])
def get_catalog():
    try:
        # Get query parameters
        fuel_type = request.args.get('fuelType')
        min_passengers = request.args.get('minPassengers', type=int)
        max_passengers = request.args.get('maxPassengers', type=int)
        
        # Build query
        query = supabase.table('body_configurations').select('*')
        
        if fuel_type and fuel_type != 'all':
            query = query.eq('fuel_type', fuel_type)
        
        response = query.execute()
        
        vehicles = []
        for body in response.data:
            # Filter by passenger capacity if specified
            if min_passengers and body.get('passenger_capacity', 0) < min_passengers:
                continue
            if max_passengers and body.get('passenger_capacity', 0) > max_passengers:
                continue
                
            vehicles.append({
                'id': body['id'],
                'name': body['configuration_name'],
                'code': body['configuration_code'],
                'description': body['description'],
                'fuelType': body['fuel_type'],
                'length': body['length_ft'],
                'passengers': body['passenger_capacity'],
                'wheelchairPositions': body['wheelchair_positions'],
                'range': body['electric_range_miles'],
                'price': 'Contact for pricing',
                'image': '/api/placeholder/400/300'  # Placeholder image
            })
        
        return jsonify({
            'vehicles': vehicles,
            'total': len(vehicles),
            'filters': {
                'fuelType': fuel_type,
                'minPassengers': min_passengers,
                'maxPassengers': max_passengers
            }
        })
        
    except Exception as e:
        print(f"Catalog query error: {e}")
        return jsonify({'error': 'Failed to fetch catalog'}), 500

