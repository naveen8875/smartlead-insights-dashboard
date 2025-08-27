# 🚀 Smartlead Analytics Dashboard

A professional, real-time analytics dashboard for Smartlead cold email campaigns. Built for agencies to showcase their expertise and provide clients with comprehensive campaign insights.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Framework](https://img.shields.io/badge/Framework-Vite%20%2B%20React-blue)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20%2B%20Shadcn%2Fui-purple)
![API](https://img.shields.io/badge/API-Smartlead%20v1-orange)

## ✨ Features

### 📊 **Executive Summary**
- Total campaigns and active campaigns overview
- Monthly email sending capacity
- Response rate tracking
- Account health monitoring

### 🎯 **Campaign Performance Matrix**
- Comprehensive campaign settings analysis
- Daily sending limits and capacity tracking
- Follow-up percentage monitoring
- Campaign status distribution
- Real-time search and filtering

### 📧 **Inbox Health Monitor**
- Email account status monitoring (SMTP/IMAP)
- Warmup progress tracking
- Account health scoring
- Flexible pagination for large account lists
- Critical account alerts

### 📈 **Sequence Analysis**
- Email sequence performance insights
- Subject line analysis
- Content length optimization
- AI-powered optimization recommendations
- A/B testing insights

### 🎨 **Dynamic Theming**
- Environment-based color customization
- Client branding support
- Professional appearance
- Responsive design

### 🚨 **Error Handling**
- User-friendly error notifications
- API failure recovery
- Rate limiting protection
- Network error handling

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Smartlead API key

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd smartlead-insights
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Smartlead API Configuration
VITE_SMARTLEAD_API_KEY=your_smartlead_api_key_here
VITE_SMARTLEAD_BASE_URL=https://server.smartlead.ai/api/v1

# Client Branding
VITE_CLIENT_NAME=Your Client Name Here
VITE_AGENCY_LOGO_URL=https://your-domain.com/logo.png
VITE_BRAND_PRIMARY_COLOR=#10B981
VITE_BRAND_SECONDARY_COLOR=#059669

# Theme Colors (Optional)
VITE_BACKGROUND_COLOR=#FAFAFA
VITE_FOREGROUND_COLOR=#0A0A0A
VITE_CARD_BACKGROUND_COLOR=#FFFFFF
VITE_CARD_FOREGROUND_COLOR=#0A0A0A

# Optional Security
VITE_DASHBOARD_PASSWORD=optional_password_here
```

### 3. Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see your dashboard!

### 4. Production Build
```bash
npm run build
npm run preview
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npx vercel
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from your `.env` file

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Other Platforms

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### Railway
```bash
railway login
railway init
railway up
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_SMARTLEAD_API_KEY` | Your Smartlead API key | ✅ | - |
| `VITE_SMARTLEAD_BASE_URL` | Smartlead API base URL | ❌ | `https://server.smartlead.ai/api/v1` |
| `VITE_CLIENT_NAME` | Client name for branding | ❌ | `Smartlead Analytics` |
| `VITE_AGENCY_LOGO_URL` | Agency logo URL | ❌ | - |
| `VITE_BRAND_PRIMARY_COLOR` | Primary brand color | ❌ | `#10B981` |
| `VITE_BRAND_SECONDARY_COLOR` | Secondary brand color | ❌ | `#059669` |
| `VITE_BACKGROUND_COLOR` | Main background color | ❌ | `#FAFAFA` |
| `VITE_FOREGROUND_COLOR` | Main text color | ❌ | `#0A0A0A` |
| `VITE_CARD_BACKGROUND_COLOR` | Card background color | ❌ | `#FFFFFF` |
| `VITE_CARD_FOREGROUND_COLOR` | Card text color | ❌ | `#0A0A0A` |

### Branding Customization

The dashboard supports full branding customization through environment variables:

```env
# Professional blue theme
VITE_BRAND_PRIMARY_COLOR=#3B82F6
VITE_BRAND_SECONDARY_COLOR=#1D4ED8

# Dark theme
VITE_BACKGROUND_COLOR=#0A0A0A
VITE_FOREGROUND_COLOR=#FAFAFA
VITE_CARD_BACKGROUND_COLOR=#1A1A1A
```

## 📊 API Integration

### Smartlead API Features
- **Rate Limiting**: Built-in 10 requests per 2 seconds
- **Caching**: 5-minute cache for performance
- **Error Handling**: Comprehensive error recovery
- **Authentication**: Query parameter-based API key

### Supported Endpoints
- `/campaigns` - Campaign list and details
- `/email-accounts` - Email account monitoring
- `/campaigns/{id}/sequences` - Sequence analysis
- `/clients` - Client management (optional)

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   └── ...             # Feature components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and API
├── pages/              # Page components
└── types/              # TypeScript types
```

### Key Technologies
- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Charts**: Recharts (simplified for performance)
- **Icons**: Lucide React
- **API**: Smartlead API v1

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🚨 Troubleshooting

### Common Issues

#### API Key Issues
```
Error: Invalid API key
```
**Solution**: Verify your `VITE_SMARTLEAD_API_KEY` is correct and active.

#### Rate Limiting
```
Error: Rate limit exceeded
```
**Solution**: The dashboard handles rate limiting automatically. Wait a few seconds and refresh.

#### Network Errors
```
Error: Smartlead API call failed
```
**Solution**: Check your internet connection and Smartlead API status.

#### Build Errors
```
Error: Build failed
```
**Solution**: Ensure all environment variables are set correctly.

### Performance Optimization

#### For Large Datasets
- Use pagination for email accounts
- Implement search filters
- Enable caching (already configured)

#### For Multiple Clients
- Use environment variables for branding
- Deploy separate instances per client
- Consider multi-tenant setup

## 📈 Usage Examples

### Agency Lead Magnet
1. Deploy dashboard with your branding
2. Share with prospects to showcase expertise
3. Use as conversation starter for Smartlead services

### Client Reporting
1. Customize branding for each client
2. Deploy dedicated instance
3. Provide real-time campaign insights

### Internal Monitoring
1. Use for internal campaign monitoring
2. Track account health across campaigns
3. Monitor warmup progress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Create an issue on GitHub
- **Smartlead Support**: Contact Smartlead for API-related issues

## 🎯 Roadmap

- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] Email template analysis
- [ ] Integration with other email tools
- [ ] Mobile app version

---

**Built with ❤️ for the cold email community**