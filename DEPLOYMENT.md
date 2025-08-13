# Deployment Guide - Endera Vehicle Configurator

This guide covers deployment options for the Endera Vehicle Configurator.

## 🌐 Live Demo

**Current Deployment:** https://8xhpiqcqko33.manus.space

## 📋 Deployment Options

### Option 1: Full Stack (Node.js + React)

**Best for:** Production environments with full database integration

**Requirements:**
- Node.js 18+
- Supabase database
- Hosting platform (Railway, Render, Heroku, VPS)

**Steps:**
1. Set up Supabase database with provided schema
2. Configure environment variables
3. Build React frontend: `npm run build`
4. Deploy Node.js backend with built frontend
5. Configure domain and SSL

### Option 2: Flask Deployment (Simplified)

**Best for:** Quick demos, prototypes, or environments without Node.js

**Requirements:**
- Python 3.11+
- Flask hosting platform
- Optional: Supabase for full functionality

**Steps:**
1. Use the `/deployment` folder contents
2. Install Python dependencies: `pip install -r requirements.txt`
3. Configure Flask app
4. Deploy to platform of choice

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Application Settings
PORT=3001
NODE_ENV=production
```

### Database Setup

1. **Create Supabase Project**
   - Sign up at https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Import Database Schema**
   - Use the provided SQL files to create tables
   - Set up Row Level Security (RLS) policies
   - Import sample data if needed

3. **Configure API Access**
   - Enable API access for required tables
   - Set up proper permissions
   - Test database connectivity

## 🚀 Platform-Specific Deployment

### Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

### Render

1. Create new web service
2. Connect repository
3. Configure build and start commands
4. Add environment variables

### Heroku

1. Create new app
2. Add Node.js buildpack
3. Configure environment variables
4. Deploy via Git or GitHub

### VPS/Self-Hosted

1. Set up Node.js environment
2. Clone repository
3. Install dependencies
4. Configure reverse proxy (nginx)
5. Set up SSL certificate
6. Configure process manager (PM2)

## 📊 Database Schema

### Core Tables

**chassis**
- Ford E-Series specifications
- Pricing information
- Technical details

**body_configurations**
- Endera body options
- Electric and legacy models
- Capacity and features

**configuration_sessions**
- User session tracking
- Selection persistence
- Session management

**quotes**
- Generated quotes
- Customer information
- Pricing calculations

### Sample Data

The repository includes sample data for:
- Ford E-Series chassis (11 models)
- Endera body configurations (8 models)
- Pricing information
- Configuration examples

## 🔒 Security Configuration

### Production Security

1. **Environment Variables**
   - Never commit sensitive data
   - Use platform environment variable systems
   - Rotate keys regularly

2. **Database Security**
   - Enable RLS policies
   - Limit API access
   - Monitor usage

3. **Application Security**
   - Enable HTTPS
   - Configure CORS properly
   - Validate all inputs

### SSL/TLS Setup

Most hosting platforms provide automatic SSL. For self-hosted:

1. Obtain SSL certificate (Let's Encrypt recommended)
2. Configure nginx/Apache
3. Redirect HTTP to HTTPS
4. Test SSL configuration

## 📈 Performance Optimization

### Frontend Optimization

1. **Build Optimization**
   ```bash
   npm run build
   ```

2. **Asset Optimization**
   - Compress images
   - Minify CSS/JS
   - Enable gzip compression

3. **CDN Setup**
   - Use CDN for static assets
   - Configure caching headers
   - Optimize image delivery

### Backend Optimization

1. **Database Optimization**
   - Add proper indexes
   - Optimize queries
   - Enable connection pooling

2. **Caching**
   - Implement Redis caching
   - Cache frequent queries
   - Use CDN for API responses

3. **Monitoring**
   - Set up application monitoring
   - Track performance metrics
   - Monitor error rates

## 🔍 Monitoring & Maintenance

### Health Checks

Set up health check endpoints:
- `/api/health` - Basic health check
- `/api/status` - Detailed status information
- Database connectivity tests

### Logging

Configure logging for:
- API requests and responses
- Database queries
- Error tracking
- Performance metrics

### Backup Strategy

1. **Database Backups**
   - Automated daily backups
   - Point-in-time recovery
   - Cross-region replication

2. **Application Backups**
   - Code repository backups
   - Configuration backups
   - Asset backups

## 🐛 Troubleshooting

### Common Deployment Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

**Database Connection Issues:**
- Verify Supabase credentials
- Check network connectivity
- Ensure database tables exist

**API Errors:**
- Check environment variables
- Verify API endpoint configurations
- Review server logs

### Debug Mode

Enable debug logging:

```bash
# Node.js
DEBUG=* npm start

# Flask
FLASK_DEBUG=1 python src/main.py
```

## 📞 Support

### Deployment Support

For deployment assistance:
1. Check this documentation
2. Review platform-specific guides
3. Contact technical support

### Platform Resources

- **Railway:** https://docs.railway.app
- **Render:** https://render.com/docs
- **Heroku:** https://devcenter.heroku.com
- **Supabase:** https://supabase.com/docs

## 🔄 Updates & Maintenance

### Update Process

1. **Development**
   - Make changes in development environment
   - Test thoroughly
   - Update documentation

2. **Staging**
   - Deploy to staging environment
   - Run integration tests
   - Verify functionality

3. **Production**
   - Deploy to production
   - Monitor for issues
   - Rollback if necessary

### Version Control

- Use semantic versioning
- Tag releases
- Maintain changelog
- Document breaking changes

---

**Last Updated:** August 2025  
**Version:** 1.0.0

