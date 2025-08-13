# Endera Vehicle Configurator

A professional vehicle configuration system for Ford E-Series chassis with Endera electric bus and shuttle body configurations.

## 🌐 Live Demo

**Deployed Application:** https://8xhpiqcqko33.manus.space

## 🚀 Features

### Core Functionality
- **Vehicle Configuration**: Step-by-step chassis and body selection
- **Real-time Pricing**: Ford E-Series MSRP with destination charges
- **Quote Generation**: Professional PDF quotes with auto-generated numbers
- **Session Management**: Persistent configuration sessions
- **User Types**: Customer and dealer views
- **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- **Database Integration**: Supabase backend with 70+ tables
- **API Architecture**: RESTful Node.js/Express API
- **Modern Frontend**: React with TypeScript and Tailwind CSS
- **PDF Generation**: Professional quotes with Endera branding
- **Real Data**: Actual Ford E-Series specifications and pricing

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom Endera branding
- **UI Components**: Shadcn/ui component library
- **State Management**: React hooks and context
- **Routing**: React Router for SPA navigation

### Backend (Node.js/Express)
- **Runtime**: Node.js with Express framework
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **Authentication**: Supabase Auth (ready for implementation)
- **PDF Generation**: ReportLab for professional quote documents
- **API Design**: RESTful endpoints with proper error handling

### Database Schema
- **Chassis Data**: Ford E-Series specifications and pricing
- **Body Configurations**: Endera electric and legacy models
- **Configuration Sessions**: User session tracking
- **Quotes**: Quote generation and management
- **Pricing**: Dynamic pricing calculations

## 📁 Project Structure

```
endera-configurator/
├── frontend/
│   └── endera-configurator-frontend/
│       ├── src/
│       │   ├── components/          # React components
│       │   ├── pages/              # Page components
│       │   ├── assets/             # Vehicle images and assets
│       │   └── App.jsx             # Main application
│       ├── public/                 # Static assets
│       └── package.json            # Frontend dependencies
├── backend/
│   ├── routes/                     # API route handlers
│   │   ├── chassis.js             # Chassis API endpoints
│   │   ├── bodies.js              # Body configuration endpoints
│   │   ├── configurations.js      # Session management
│   │   ├── pricing.js             # Pricing calculations
│   │   ├── quotes.js              # Quote generation
│   │   └── catalog.js             # Vehicle catalog
│   ├── server.js                  # Express server setup
│   └── package.json               # Backend dependencies
└── deployment/                    # Deployment configurations
    ├── src/
    │   ├── main.py                # Flask deployment version
    │   └── routes/                # Python API routes
    └── static/                    # Built frontend assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ (for deployment version)
- Supabase account and project

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd endera-configurator
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file with Supabase credentials
   echo "SUPABASE_URL=your_supabase_url" > .env
   echo "SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
   
   # Start backend server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend/endera-configurator-frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Database Setup

The application requires a Supabase database with the following key tables:

- `chassis` - Ford E-Series chassis specifications
- `body_configurations` - Endera body options
- `configuration_sessions` - User session tracking
- `quotes` - Generated quotes
- `quote_line_items` - Quote details

See the database documentation for complete schema details.

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```

**Frontend**
API endpoints are configured in the React components to connect to the backend.

### Supabase Configuration

1. Create a new Supabase project
2. Import the provided database schema
3. Configure Row Level Security (RLS) policies
4. Update environment variables with your project credentials

## 📊 API Endpoints

### Chassis Management
- `GET /api/chassis` - Get available chassis options
- `GET /api/chassis/:id` - Get specific chassis details

### Body Configurations
- `GET /api/bodies` - Get available body configurations
- `GET /api/bodies/models` - Get body models by fuel type

### Configuration Sessions
- `POST /api/configurations/sessions` - Create new session
- `POST /api/configurations/sessions/:id/selections` - Add selection
- `GET /api/configurations/sessions/:id` - Get session details

### Pricing
- `GET /api/pricing/sessions/:id` - Calculate session pricing

### Quote Generation
- `POST /api/quotes` - Generate new quote
- `GET /api/quotes/:id/pdf` - Download quote PDF

### Catalog
- `GET /api/catalog/vehicles` - Browse vehicle catalog

## 🎨 Customization

### Branding
The application uses Endera's brand colors and styling:
- Primary: Purple (#7C3AED)
- Secondary: White and light grays
- Accent: Orange for highlights

### Adding New Chassis
1. Add chassis data to the `chassis` table in Supabase
2. Include specifications: series, wheelbase, GVWR, engine, pricing
3. The frontend will automatically display new options

### Adding New Body Configurations
1. Add body data to the `body_configurations` table
2. Include: name, fuel type, capacity, range, features
3. Update the bodies API if needed for new fields

## 🚀 Deployment

### Production Deployment

The application includes both Node.js and Python Flask deployment options:

**Option 1: Node.js/Express (Full Features)**
- Requires Node.js hosting environment
- Full database integration and PDF generation
- Recommended for production use

**Option 2: Flask/Python (Simplified)**
- Includes demo data for testing
- Easier deployment to various platforms
- Good for demonstrations and prototypes

### Environment Setup

1. **Build Frontend**
   ```bash
   cd frontend/endera-configurator-frontend
   npm run build
   ```

2. **Deploy Backend**
   - Copy built frontend to backend static folder
   - Configure production environment variables
   - Deploy to your hosting platform

### Hosting Recommendations

- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, Heroku, or VPS
- **Database**: Supabase (managed PostgreSQL)

## 🧪 Testing

### Manual Testing Checklist

1. **Session Creation**
   - [ ] New session creates successfully
   - [ ] Session ID displays correctly
   - [ ] User type toggle works

2. **Chassis Selection**
   - [ ] All chassis options load
   - [ ] Pricing displays correctly
   - [ ] Selection updates summary

3. **Body Selection**
   - [ ] Body options filter by fuel type
   - [ ] Specifications display correctly
   - [ ] Selection completes configuration

4. **Quote Generation**
   - [ ] Customer form validates input
   - [ ] Quote creates with auto-generated number
   - [ ] PDF downloads successfully

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test chassis endpoint
curl http://localhost:3001/api/chassis

# Test session creation
curl -X POST http://localhost:3001/api/configurations/sessions \
  -H "Content-Type: application/json" \
  -d '{"userType": "customer"}'
```

## 📈 Performance

### Optimization Features

- **Database Indexing**: Optimized queries for fast data retrieval
- **Caching**: Session data cached for improved performance
- **Lazy Loading**: Components load as needed
- **Image Optimization**: Vehicle images optimized for web

### Monitoring

- Monitor API response times
- Track session creation and completion rates
- Monitor quote generation success rates
- Database query performance

## 🔒 Security

### Current Implementation

- **Input Validation**: All API inputs validated
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin settings
- **Environment Variables**: Sensitive data in environment files

### Future Enhancements

- User authentication and authorization
- Rate limiting for API endpoints
- Enhanced input sanitization
- Audit logging for quote generation

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- **Frontend**: ESLint and Prettier for code formatting
- **Backend**: Node.js best practices
- **Database**: Follow PostgreSQL naming conventions
- **API**: RESTful design principles

## 📞 Support

### Technical Support

For technical issues or questions:
- Check the troubleshooting section below
- Review API documentation
- Contact the development team

### Business Support

For business-related inquiries:
- Contact Endera Motors directly
- Visit the official website
- Reach out to sales team

## 🐛 Troubleshooting

### Common Issues

**Frontend not loading:**
- Check if backend server is running
- Verify API endpoints are accessible
- Check browser console for errors

**Database connection errors:**
- Verify Supabase credentials
- Check network connectivity
- Ensure database tables exist

**Quote generation failing:**
- Check PDF generation dependencies
- Verify customer information format
- Review backend logs for errors

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev -- --debug
```

## 📄 License

This project is proprietary software developed for Endera Motors. All rights reserved.

## 🏆 Acknowledgments

- **Endera Motors** - Vehicle specifications and branding
- **Ford Motor Company** - E-Series chassis data
- **Development Team** - Application architecture and implementation
- **Manus Platform** - Deployment and hosting infrastructure

---

**Version**: 1.0.0  
**Last Updated**: August 2025  
**Status**: Production Ready

