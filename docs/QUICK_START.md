# ⚡ 5-Minute Quick Start Guide

Deploy your Smartlead Analytics Dashboard in under 5 minutes!

## 🎯 What You'll Get

- ✅ Professional analytics dashboard
- ✅ Real-time Smartlead data
- ✅ Custom branding
- ✅ Mobile-responsive design
- ✅ Production-ready deployment

## 🚀 Step 1: Prepare Your Environment (1 minute)

### Prerequisites
- Smartlead API key (get from [Smartlead Dashboard](https://app.smartlead.ai))
- Git repository (GitHub, GitLab, etc.)
- Vercel account (free at [vercel.com](https://vercel.com))

### Get Your Smartlead API Key
1. Go to [Smartlead Dashboard](https://app.smartlead.ai)
2. Navigate to Settings → API
3. Copy your API key

## 🚀 Step 2: Deploy to Vercel (2 minutes)

### Option A: Deploy from GitHub (Recommended)

1. **Fork this repository**
   - Click "Fork" on GitHub
   - Clone to your account

2. **Connect to Vercel**
   ```bash
   npx vercel
   ```

3. **Follow the prompts:**
   - Link to existing project? → `N`
   - Project name → `smartlead-dashboard`
   - Directory → `./`
   - Override settings? → `N`

### Option B: Deploy from Local

1. **Clone and deploy**
   ```bash
   git clone <your-repo-url>
   cd smartlead-insights
   npx vercel
   ```

## 🚀 Step 3: Configure Environment Variables (1 minute)

### Set Required Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
VITE_SMARTLEAD_API_KEY=your_actual_api_key_here
VITE_CLIENT_NAME=Your Client Name
VITE_BRAND_PRIMARY_COLOR=#10B981
VITE_BRAND_SECONDARY_COLOR=#059669
```

### Optional Branding Variables

```env
VITE_AGENCY_LOGO_URL=https://your-domain.com/logo.png
VITE_BACKGROUND_COLOR=#FAFAFA
VITE_FOREGROUND_COLOR=#0A0A0A
VITE_CARD_BACKGROUND_COLOR=#FFFFFF
VITE_CARD_FOREGROUND_COLOR=#0A0A0A
```

## 🚀 Step 4: Deploy to Production (1 minute)

```bash
npx vercel --prod
```

**That's it!** Your dashboard is now live at `https://your-project.vercel.app`

## 🎨 Customization Examples

### Professional Blue Theme
```env
VITE_BRAND_PRIMARY_COLOR=#3B82F6
VITE_BRAND_SECONDARY_COLOR=#1D4ED8
VITE_CLIENT_NAME=Acme Corporation
```

### Dark Theme
```env
VITE_BACKGROUND_COLOR=#0A0A0A
VITE_FOREGROUND_COLOR=#FAFAFA
VITE_CARD_BACKGROUND_COLOR=#1A1A1A
VITE_CARD_FOREGROUND_COLOR=#FAFAFA
```

### Agency Branding
```env
VITE_CLIENT_NAME=Your Agency Name
VITE_AGENCY_LOGO_URL=https://youragency.com/logo.png
VITE_BRAND_PRIMARY_COLOR=#FF6B35
VITE_BRAND_SECONDARY_COLOR=#F7931E
```

## 📱 Test Your Dashboard

### Basic Functionality
- [ ] Dashboard loads without errors
- [ ] Campaigns display correctly
- [ ] Email accounts show up
- [ ] Error handling works

### Branding Check
- [ ] Colors match your brand
- [ ] Client name displays correctly
- [ ] Logo appears (if set)
- [ ] Mobile responsive

## 🎯 Use Cases

### For Agencies
1. **Lead Magnet**: Share with prospects
2. **Client Reporting**: Dedicated instances per client
3. **Internal Monitoring**: Track your own campaigns

### For Businesses
1. **Campaign Monitoring**: Track performance
2. **Team Collaboration**: Share insights
3. **ROI Analysis**: Measure effectiveness

## 🚨 Troubleshooting

### Common Issues

#### Dashboard Not Loading
```bash
# Check environment variables
vercel env ls

# Redeploy
vercel --prod
```

#### API Errors
- Verify API key is correct
- Check Smartlead API status
- Ensure rate limiting isn't exceeded

#### Styling Issues
- Clear browser cache
- Check environment variables
- Verify color format (#RRGGBB)

### Quick Fixes

#### Reset Environment Variables
```bash
vercel env rm VITE_SMARTLEAD_API_KEY
vercel env add VITE_SMARTLEAD_API_KEY
vercel --prod
```

#### Force Redeploy
```bash
vercel --prod --force
```

## 📊 Next Steps

### Custom Domain
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records

### Analytics
1. Enable Vercel Analytics
2. Set up Google Analytics
3. Monitor performance

### Scaling
1. Deploy multiple instances for different clients
2. Set up monitoring
3. Configure alerts

## 🆘 Need Help?

### Quick Support
1. Check [troubleshooting section](../README.md#troubleshooting)
2. Review [deployment guide](./DEPLOYMENT.md)
3. Create GitHub issue

### Contact
- **Smartlead Support**: For API issues
- **Vercel Support**: For deployment issues
- **GitHub Issues**: For dashboard bugs

## 🎉 Success!

Your Smartlead Analytics Dashboard is now:
- ✅ **Live and accessible**
- ✅ **Branded for your business**
- ✅ **Connected to real data**
- ✅ **Mobile responsive**
- ✅ **Production ready**

**Share it with your clients and prospects to showcase your expertise! 🚀**

---

**Deployment Time: ~5 minutes** ⚡
