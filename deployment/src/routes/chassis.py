from flask import Blueprint, jsonify, request
import os
from supabase import create_client, Client

chassis_bp = Blueprint('chassis', __name__)

# Supabase configuration
SUPABASE_URL = "https://rfctmbpdthtovqkogbol.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3RtYnBkdGh0b3Zxa29nYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTc0OTUsImV4cCI6MjA3MDU5MzQ5NX0.RzvfalZtvT1ytxzCsaQaXN53vpgnY9iZ8Z4DiZIWQKU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@chassis_bp.route('/chassis', methods=['GET'])
def get_chassis():
    try:
        # Get all chassis with pricing
        response = supabase.table('chassis').select(
            'id, chassis_code, model_year, series, wheelbase_inches, gvwr_lbs, '
            'engine_type, fuel_type, drivetrain, body_style, msrp, '
            'destination_charge, created_at'
        ).execute()
        
        chassis_list = []
        for chassis in response.data:
            chassis_list.append({
                'id': chassis['id'],
                'code': chassis['chassis_code'],
                'name': f"{chassis['series']} {chassis['wheelbase_inches']}\" Wheelbase {chassis['drivetrain']} {chassis['body_style']}",
                'series': chassis['series'],
                'modelYear': chassis['model_year'],
                'wheelbase': chassis['wheelbase_inches'],
                'gvwr': chassis['gvwr_lbs'],
                'engine': chassis['engine_type'],
                'fuelType': chassis['fuel_type'],
                'drivetrain': chassis['drivetrain'],
                'bodyStyle': chassis['body_style'],
                'msrp': float(chassis['msrp']) if chassis['msrp'] else 0,
                'destinationCharge': float(chassis['destination_charge']) if chassis['destination_charge'] else 0,
                'totalPrice': float(chassis['msrp'] or 0) + float(chassis['destination_charge'] or 0)
            })
        
        return jsonify(chassis_list)
        
    except Exception as e:
        print(f"Chassis query error: {e}")
        return jsonify({'error': 'Failed to fetch chassis data'}), 500

@chassis_bp.route('/chassis/<chassis_id>', methods=['GET'])
def get_chassis_by_id(chassis_id):
    try:
        response = supabase.table('chassis').select('*').eq('id', chassis_id).execute()
        
        if not response.data:
            return jsonify({'error': 'Chassis not found'}), 404
            
        chassis = response.data[0]
        return jsonify({
            'id': chassis['id'],
            'code': chassis['chassis_code'],
            'name': f"{chassis['series']} {chassis['wheelbase_inches']}\" Wheelbase {chassis['drivetrain']} {chassis['body_style']}",
            'series': chassis['series'],
            'modelYear': chassis['model_year'],
            'wheelbase': chassis['wheelbase_inches'],
            'gvwr': chassis['gvwr_lbs'],
            'engine': chassis['engine_type'],
            'fuelType': chassis['fuel_type'],
            'drivetrain': chassis['drivetrain'],
            'bodyStyle': chassis['body_style'],
            'msrp': float(chassis['msrp']) if chassis['msrp'] else 0,
            'destinationCharge': float(chassis['destination_charge']) if chassis['destination_charge'] else 0,
            'totalPrice': float(chassis['msrp'] or 0) + float(chassis['destination_charge'] or 0)
        })
        
    except Exception as e:
        print(f"Chassis query error: {e}")
        return jsonify({'error': 'Failed to fetch chassis data'}), 500

