import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

# Demo data for the configurator
DEMO_CHASSIS = [
    {
        'id': '1',
        'code': 'E3F-138-DRW',
        'name': 'E3F 138" Wheelbase DRW E-350',
        'series': 'E3F',
        'modelYear': 2024,
        'wheelbase': 138,
        'gvwr': 10000,
        'engine': 'V8 Gas',
        'fuelType': 'Gasoline',
        'drivetrain': 'DRW',
        'bodyStyle': 'E-350',
        'msrp': 41585,
        'destinationCharge': 2095,
        'totalPrice': 43680
    },
    {
        'id': '2',
        'code': 'E3F-158-DRW',
        'name': 'E3F 158" Wheelbase DRW E-350',
        'series': 'E3F',
        'modelYear': 2024,
        'wheelbase': 158,
        'gvwr': 10000,
        'engine': 'V8 Gas',
        'fuelType': 'Gasoline',
        'drivetrain': 'DRW',
        'bodyStyle': 'E-350',
        'msrp': 42330,
        'destinationCharge': 2095,
        'totalPrice': 44425
    }
]

DEMO_BODIES = [
    {
        'id': '1',
        'name': 'B4 XR - 24ft Electric Extended Range',
        'code': 'B4XR-CONFIG',
        'description': 'Electric shuttle with extended range capability',
        'fuelType': 'Electric',
        'length': 24,
        'passengers': 18,
        'wheelchairPositions': 2,
        'range': 150,
        'price': 'Contact for pricing'
    },
    {
        'id': '2',
        'name': 'B5 SR - 25ft Electric Standard Range',
        'code': 'B5SR-CONFIG',
        'description': 'Electric shuttle with standard range',
        'fuelType': 'Electric',
        'length': 25,
        'passengers': 20,
        'wheelchairPositions': 2,
        'range': 105,
        'price': 'Contact for pricing'
    }
]

@app.route('/api/chassis', methods=['GET'])
def get_chassis():
    return jsonify(DEMO_CHASSIS)

@app.route('/api/bodies', methods=['GET'])
def get_bodies():
    return jsonify(DEMO_BODIES)

@app.route('/api/configurations/sessions', methods=['POST'])
def create_session():
    import uuid
    session_id = str(uuid.uuid4())
    return jsonify({
        'sessionId': session_id,
        'sessionToken': 'demo-token',
        'userType': 'customer',
        'currentStep': 'chassis_selection',
        'status': 'active'
    }), 201

@app.route('/api/configurations/sessions/<session_id>/selections', methods=['POST'])
def create_selection(session_id):
    import uuid
    return jsonify({
        'id': str(uuid.uuid4()),
        'sessionId': session_id,
        'selectionType': 'chassis',
        'selectedItemId': '1',
        'isValid': True
    }), 201

@app.route('/api/pricing/sessions/<session_id>', methods=['GET'])
def get_pricing(session_id):
    return jsonify({
        'sessionId': session_id,
        'chassisPrice': 41585,
        'bodyPrice': 0,
        'destinationCharge': 2095,
        'totalPrice': 43680
    })

@app.route('/api/quotes', methods=['POST'])
def create_quote():
    import uuid
    from datetime import datetime, timedelta
    
    quote_id = str(uuid.uuid4())
    quote_number = f"ENQ-{datetime.now().strftime('%Y%m%d')}-1001"
    
    return jsonify({
        'quoteId': quote_id,
        'quoteNumber': quote_number,
        'customerName': 'Demo Customer',
        'customerEmail': 'demo@example.com',
        'totalPrice': 43680,
        'validUntil': (datetime.now() + timedelta(days=30)).isoformat(),
        'pdfUrl': f"/api/quotes/{quote_id}/pdf"
    }), 201

@app.route('/api/quotes/<quote_id>/pdf', methods=['GET'])
def download_pdf(quote_id):
    return jsonify({'message': 'PDF generation available in full version with database connection'})

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

