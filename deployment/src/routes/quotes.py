from flask import Blueprint, jsonify, request, make_response
from supabase import create_client, Client
from datetime import datetime, timedelta
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

quotes_bp = Blueprint('quotes', __name__)

# Supabase configuration
SUPABASE_URL = "https://rfctmbpdthtovqkogbol.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3RtYnBkdGh0b3Zxa29nYm9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMTc0OTUsImV4cCI6MjA3MDU5MzQ5NX0.RzvfalZtvT1ytxzCsaQaXN53vpgnY9iZ8Z4DiZIWQKU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@quotes_bp.route('/quotes', methods=['POST'])
def create_quote():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['sessionId', 'customerName', 'customerEmail']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        session_id = data['sessionId']
        
        # Get session data
        session_response = supabase.table('configuration_sessions').select('*').eq('id', session_id).execute()
        
        if not session_response.data:
            return jsonify({'error': 'Session not found'}), 404
            
        session = session_response.data[0]
        
        # Calculate pricing
        chassis_price = 0
        destination_charge = 0
        
        if session.get('selected_chassis_id'):
            chassis_response = supabase.table('chassis').select('msrp, destination_charge').eq('id', session['selected_chassis_id']).execute()
            if chassis_response.data:
                chassis = chassis_response.data[0]
                chassis_price = float(chassis['msrp'] or 0)
                destination_charge = float(chassis['destination_charge'] or 0)
        
        total_price = chassis_price + destination_charge
        
        # Create quote
        quote_data = {
            'session_id': session_id,
            'customer_name': data['customerName'],
            'customer_email': data['customerEmail'],
            'customer_phone': data.get('customerPhone'),
            'customer_company': data.get('customerCompany'),
            'quote_type': 'estimate',
            'quote_status': 'draft',
            'base_price': chassis_price,
            'destination_charge': destination_charge,
            'total_price': total_price,
            'valid_until': (datetime.now() + timedelta(days=30)).isoformat(),
            'notes': data.get('notes')
        }
        
        response = supabase.table('quotes').insert(quote_data).execute()
        
        if response.data:
            quote = response.data[0]
            return jsonify({
                'quoteId': quote['id'],
                'quoteNumber': quote['quote_number'],
                'customerName': quote['customer_name'],
                'customerEmail': quote['customer_email'],
                'totalPrice': quote['total_price'],
                'validUntil': quote['valid_until'],
                'pdfUrl': f"/api/quotes/{quote['id']}/pdf",
                'createdAt': quote['created_at']
            }), 201
        else:
            return jsonify({'error': 'Failed to create quote'}), 500
            
    except Exception as e:
        print(f"Quote creation error: {e}")
        return jsonify({'error': 'Failed to create quote'}), 500

@quotes_bp.route('/quotes/<quote_id>/pdf', methods=['GET'])
def download_quote_pdf(quote_id):
    try:
        # Get quote data
        quote_response = supabase.table('quotes').select('*').eq('id', quote_id).execute()
        
        if not quote_response.data:
            return jsonify({'error': 'Quote not found'}), 404
            
        quote = quote_response.data[0]
        
        # Get session data
        session_response = supabase.table('configuration_sessions').select('*').eq('id', quote['session_id']).execute()
        session = session_response.data[0] if session_response.data else {}
        
        # Get chassis data
        chassis_data = {}
        if session.get('selected_chassis_id'):
            chassis_response = supabase.table('chassis').select('*').eq('id', session['selected_chassis_id']).execute()
            chassis_data = chassis_response.data[0] if chassis_response.data else {}
        
        # Get body data
        body_data = {}
        if session.get('selected_body_id'):
            body_response = supabase.table('body_configurations').select('*').eq('id', session['selected_body_id']).execute()
            body_data = body_response.data[0] if body_response.data else {}
        
        # Generate PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#7C3AED')
        )
        
        # Title
        elements.append(Paragraph("ENDERA VEHICLE QUOTE", title_style))
        elements.append(Spacer(1, 12))
        
        # Quote info
        quote_info = [
            ['Quote Number:', quote.get('quote_number', 'N/A')],
            ['Date:', datetime.now().strftime('%B %d, %Y')],
            ['Valid Until:', datetime.fromisoformat(quote['valid_until']).strftime('%B %d, %Y') if quote.get('valid_until') else 'N/A'],
            ['Customer:', quote.get('customer_name', 'N/A')],
            ['Email:', quote.get('customer_email', 'N/A')],
            ['Company:', quote.get('customer_company', 'N/A') if quote.get('customer_company') else 'N/A']
        ]
        
        quote_table = Table(quote_info, colWidths=[2*inch, 4*inch])
        quote_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(quote_table)
        elements.append(Spacer(1, 20))
        
        # Configuration details
        elements.append(Paragraph("VEHICLE CONFIGURATION", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Chassis details
        if chassis_data:
            chassis_info = [
                ['Chassis:', f"{chassis_data.get('series', 'N/A')} {chassis_data.get('wheelbase_inches', 'N/A')}\" Wheelbase"],
                ['Model Year:', str(chassis_data.get('model_year', 'N/A'))],
                ['GVWR:', f"{chassis_data.get('gvwr_lbs', 'N/A')} lbs"],
                ['Engine:', chassis_data.get('engine_type', 'N/A')],
                ['Fuel Type:', chassis_data.get('fuel_type', 'N/A')]
            ]
            
            chassis_table = Table(chassis_info, colWidths=[2*inch, 4*inch])
            chassis_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(chassis_table)
            elements.append(Spacer(1, 12))
        
        # Body details
        if body_data:
            body_info = [
                ['Body Configuration:', body_data.get('configuration_name', 'N/A')],
                ['Length:', f"{body_data.get('length_ft', 'N/A')} ft"],
                ['Passenger Capacity:', str(body_data.get('passenger_capacity', 'N/A'))],
                ['Wheelchair Positions:', str(body_data.get('wheelchair_positions', 'N/A'))],
                ['Fuel Type:', body_data.get('fuel_type', 'N/A')]
            ]
            
            if body_data.get('electric_range_miles'):
                body_info.append(['Electric Range:', f"{body_data['electric_range_miles']} miles"])
            
            body_table = Table(body_info, colWidths=[2*inch, 4*inch])
            body_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            
            elements.append(body_table)
            elements.append(Spacer(1, 20))
        
        # Pricing
        elements.append(Paragraph("PRICING SUMMARY", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        pricing_data = [
            ['Item', 'Price'],
            ['Chassis (MSRP)', f"${quote.get('base_price', 0):,.2f}"],
            ['Destination Charge', f"${quote.get('destination_charge', 0):,.2f}"],
            ['Body Configuration', 'Contact for pricing'],
            ['', ''],
            ['TOTAL ESTIMATE', f"${quote.get('total_price', 0):,.2f}+"]
        ]
        
        pricing_table = Table(pricing_data, colWidths=[4*inch, 2*inch])
        pricing_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7C3AED')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -2), 1, colors.black),
            ('LINEBELOW', (0, -1), (-1, -1), 2, colors.HexColor('#7C3AED')),
        ]))
        
        elements.append(pricing_table)
        elements.append(Spacer(1, 20))
        
        # Footer
        elements.append(Paragraph("* Final pricing includes body configuration and options. Contact Endera Motors for complete pricing details.", styles['Normal']))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("Contact: 1-800-ENDERA-1 | info@enderamotors.com | www.enderamotors.com", styles['Normal']))
        
        # Build PDF
        doc.build(elements)
        
        # Get PDF data
        pdf_data = buffer.getvalue()
        buffer.close()
        
        # Create response
        response = make_response(pdf_data)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename="Endera_Quote_{quote.get("quote_number", "quote")}.pdf"'
        
        return response
        
    except Exception as e:
        print(f"PDF generation error: {e}")
        return jsonify({'error': 'Failed to generate PDF'}), 500

