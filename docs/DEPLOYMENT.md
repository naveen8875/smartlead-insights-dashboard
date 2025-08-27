# 🚀 Deployment Guide

Complete guide to deploy your Smartlead Analytics Dashboard to production.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository set up
- Smartlead API key ready
- Domain name (optional but recommended)

## 🌐 Platform Options

### 1. Vercel (Recommended)

**Why Vercel?**
- ✅ Zero configuration
- ✅ Automatic deployments
- ✅ Global CDN
- ✅ Environment variable management
- ✅ Custom domains
- ✅ Analytics included

#### Step-by-Step Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   cd smartlead-insights
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project? → `N` (for first deployment)
   - Project name → `smartlead-dashboard` (or your preferred name)
   - Directory → `./` (current directory)
   - Override settings? → `N`

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_SMARTLEAD_API_KEY
   vercel env add VITE_CLIENT_NAME
   vercel env add VITE_BRAND_PRIMARY_COLOR
   # Add all other variables from your .env file
   ```

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Environment Variables Setup

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
VITE_SMARTLEAD_API_KEY=your_actual_api_key
VITE_SMARTLEAD_BASE_URL=https://server.smartlead.ai/api/v1
VITE_CLIENT_NAME=Your Client Name
VITE_AGENCY_LOGO_URL=https://your-domain.com/logo.png
VITE_BRAND_PRIMARY_COLOR=#10B981
VITE_BRAND_SECONDARY_COLOR=#059669
VITE_BACKGROUND_COLOR=#FAFAFA
VITE_FOREGROUND_COLOR=#0A0A0A
VITE_CARD_BACKGROUND_COLOR=#FFFFFF
VITE_CARD_FOREGROUND_COLOR=#0A0A0A
```

### 2. Netlify

#### Step-by-Step Deployment

1. **Build your project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `dist/` folder
   - Or connect your Git repository

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all variables from your `.env` file

4. **Configure Build Settings**
   ```bash
   Build command: npm run build
   Publish directory: dist
   ```

### 3. Railway

#### Step-by-Step Deployment

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set VITE_SMARTLEAD_API_KEY=your_key
   railway variables set VITE_CLIENT_NAME="Your Client"
   # Add all other variables
   ```

### 4. DigitalOcean App Platform

#### Step-by-Step Deployment

1. **Create App**
   - Go to DigitalOcean App Platform
   - Connect your Git repository
   - Select Node.js environment

2. **Configure Build**
   ```yaml
   build_command: npm run build
   run_command: npm run preview
   ```

3. **Set Environment Variables**
   - Add all VITE_* variables in the App Platform dashboard

## 🔧 Post-Deployment Configuration

### 1. Custom Domain Setup

#### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

#### Netlify
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Update DNS records

### 2. SSL Certificate
- **Vercel**: Automatic SSL
- **Netlify**: Automatic SSL
- **Railway**: Automatic SSL
- **DigitalOcean**: Automatic SSL

### 3. Performance Optimization

#### Enable Caching
```bash
# Vercel (already configured in vercel.json)
# Netlify (add to _headers file)
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

#### Enable Compression
- **Vercel**: Automatic
- **Netlify**: Automatic
- **Railway**: Automatic

## 🧪 Testing Your Deployment

### 1. Basic Functionality Test
- [ ] Dashboard loads without errors
- [ ] API calls work (check browser network tab)
- [ ] All components render correctly
- [ ] Responsive design works on mobile

### 2. API Integration Test
- [ ] Campaigns load correctly
- [ ] Email accounts display
- [ ] Error handling works (try invalid API key)
- [ ] Rate limiting works

### 3. Branding Test
- [ ] Colors match your brand
- [ ] Logo displays correctly
- [ ] Client name shows properly
- [ ] Theme customization works

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build locally first
npm run build

# Common fixes:
npm install --force
rm -rf node_modules package-lock.json
npm install
```

#### Environment Variables Not Working
```bash
# Verify variables are set
vercel env ls

# Redeploy after adding variables
vercel --prod
```

#### API Errors in Production
- Check API key is correct
- Verify CORS settings
- Test API endpoints directly

#### Performance Issues
- Enable caching
- Optimize images
- Use CDN for assets

### Debug Commands

```bash
# Check build output
npm run build

# Preview production build
npm run preview

# Check environment variables
echo $VITE_SMARTLEAD_API_KEY

# Test API connection
curl "https://server.smartlead.ai/api/v1/campaigns?api_key=YOUR_KEY"
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Automatic performance monitoring
- Real user metrics
- Error tracking

### 2. Custom Analytics
```javascript
// Add to your app for custom tracking
window.addEventListener('error', (e) => {
  // Send to your analytics service
  console.error('App Error:', e.error);
});
```

### 3. Uptime Monitoring
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor API response times
- Set up alerts for downtime

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit API keys to Git
- Use platform-specific secret management
- Rotate keys regularly

### 2. CORS Configuration
- Configure allowed origins
- Restrict API access if needed

### 3. Rate Limiting
- Monitor API usage
- Set up alerts for rate limit hits

## 📈 Scaling Considerations

### 1. Multiple Clients
```bash
# Deploy separate instances per client
vercel --name client1-dashboard
vercel --name client2-dashboard
```

### 2. High Traffic
- Enable caching
- Use CDN
- Monitor performance

### 3. Data Volume
- Implement pagination
- Use lazy loading
- Optimize API calls

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Custom domain set up
- [ ] SSL certificate active
- [ ] Error monitoring enabled
- [ ] Performance optimized
- [ ] Mobile responsive tested
- [ ] API integration verified
- [ ] Branding customized
- [ ] Documentation updated
- [ ] Backup strategy in place

## 🆘 Support

### Getting Help
1. Check the [README.md](../README.md)
2. Review [troubleshooting section](../README.md#troubleshooting)
3. Create an issue on GitHub
4. Contact platform support

### Useful Links
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Railway Documentation](https://docs.railway.app)
- [Smartlead API Documentation](https://docs.smartlead.ai)

---

**Your dashboard is now production-ready! 🚀**
