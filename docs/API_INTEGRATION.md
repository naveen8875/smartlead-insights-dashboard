# 🔌 Smartlead API Integration Guide

Complete guide to integrating with the Smartlead API for the analytics dashboard.

## 📋 Overview

The Smartlead Analytics Dashboard integrates with Smartlead's API v1 to provide real-time campaign analytics, account monitoring, and performance insights.

## 🔑 Authentication

### API Key Setup
```env
VITE_SMARTLEAD_API_KEY=your_api_key_here
VITE_SMARTLEAD_BASE_URL=https://server.smartlead.ai/api/v1
```

### Authentication Method
Smartlead uses **query parameter authentication**:
```
https://server.smartlead.ai/api/v1/campaigns?api_key=YOUR_API_KEY
```

## 📊 Supported Endpoints

### 1. Campaigns

#### Get All Campaigns
```typescript
GET /campaigns?api_key=YOUR_API_KEY
```

**Response:**
```json
[
  {
    "id": 123,
    "name": "Cold Outreach Campaign",
    "status": "ACTIVE",
    "max_leads_per_day": 100,
    "follow_up_percentage": 80,
    "min_time_btwn_emails": 1440,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:45:00Z",
    "track_settings": "{\"opens\":true,\"clicks\":true}",
    "scheduler_cron_value": "0 9 * * 1-5",
    "stop_lead_settings": "{\"max_emails\":5}",
    "unsubscribe_text": "Unsubscribe",
    "send_as_plain_text": false,
    "enable_ai_esp_matching": true,
    "client_id": 456
  }
]
```

#### Get Campaign Details
```typescript
GET /campaigns/{campaignId}?api_key=YOUR_API_KEY
```

### 2. Email Accounts

#### Get Email Accounts (Paginated)
```typescript
GET /email-accounts?offset=0&limit=50&api_key=YOUR_API_KEY
```

**Response:**
```json
[
  {
    "id": 789,
    "email": "john@company.com",
    "is_smtp_success": true,
    "is_imap_success": true,
    "message_per_day": 100,
    "daily_sent_count": 45,
    "warmup_details": {
      "status": "ACTIVE",
      "progress": 75,
      "estimated_days_to_ready": 5
    },
    "account_type": "GMAIL",
    "created_at": "2024-01-10T09:00:00Z"
  }
]
```

#### Get Email Account Details
```typescript
GET /email-accounts/{accountId}?api_key=YOUR_API_KEY
```

### 3. Sequences

#### Get Campaign Sequences
```typescript
GET /campaigns/{campaignId}/sequences?api_key=YOUR_API_KEY
```

**Response:**
```json
[
  {
    "id": 101,
    "name": "Follow-up Sequence",
    "steps": [
      {
        "id": 1,
        "subject": "Quick follow-up",
        "email_body": "<p>Hi {first_name},</p><p>Just following up...</p>",
        "delay_days": 2,
        "variant": "A"
      }
    ],
    "performance": {
      "open_rate": 25.5,
      "reply_rate": 3.2,
      "unsubscribe_rate": 0.8
    }
  }
]
```

### 4. Clients (Optional)

#### Get Clients
```typescript
GET /clients?api_key=YOUR_API_KEY
```

## ⚡ Rate Limiting

### Limits
- **10 requests per 2 seconds**
- Automatic rate limiting in the dashboard
- 200ms delay between requests

### Implementation
```typescript
// Built into the API service
private readonly RATE_LIMIT_DELAY = 200; // 10 requests per 2 seconds
```

## 💾 Caching Strategy

### Cache Configuration
- **Duration**: 5 minutes
- **Scope**: Per endpoint and parameters
- **Automatic**: Built into the API service

### Cache Keys
```typescript
const cacheKey = `${endpoint}-${JSON.stringify(options || {})}`;
```

## 🚨 Error Handling

### Error Types

#### 401 - Invalid API Key
```json
{
  "message": "Invalid API key. Please check your SMARTLEAD_API_KEY.",
  "status": 401,
  "code": "INVALID_API_KEY"
}
```

#### 429 - Rate Limit Exceeded
```json
{
  "message": "Rate limit exceeded. Please wait before making more requests.",
  "status": 429,
  "code": "RATE_LIMIT_EXCEEDED"
}
```

#### 500 - Server Error
```json
{
  "message": "API Error: 500 Internal Server Error",
  "status": 500
}
```

### Error Handling in Dashboard
```typescript
try {
  const data = await smartleadAPI.getCampaigns();
  // Handle success
} catch (error: any) {
  // Show user-friendly toast
  toast({
    title: "Smartlead API Error",
    description: `${error.message}. Please try refreshing the page.`,
    variant: "destructive",
    duration: 10000,
  });
}
```

## 🔧 API Service Implementation

### Core Service Class
```typescript
class SmartleadAPIService {
  private config: SmartleadConfig;
  private requestQueue: RequestQueueItem[] = [];
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(config: SmartleadConfig) {
    this.config = config;
  }

  // Rate-limited request method
  private async makeRequest<T>(endpoint: string): Promise<T> {
    // Implementation with rate limiting and caching
  }
}
```

### Request Queue Management
```typescript
private async processQueue(): Promise<void> {
  while (this.requestQueue.length > 0) {
    // Rate limiting logic
    await new Promise(resolve => 
      setTimeout(resolve, this.RATE_LIMIT_DELAY)
    );
    
    const request = this.requestQueue.shift();
    // Process request
  }
}
```

## 📈 Data Transformation

### Campaign Metrics Calculation
```typescript
const calculateSimplifiedMetrics = (campaigns: SmartleadCampaign[]) => {
  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
    monthlyEmailsSent: campaigns
      .filter(c => c.status === 'ACTIVE')
      .reduce((sum, camp) => sum + (camp.max_leads_per_day * 30), 0),
    responseRate: 5.2, // Default response rate
  };
};
```

### Account Health Scoring
```typescript
const calculateAccountHealthScore = (accounts: SmartleadEmailAccount[]) => {
  const healthyAccounts = accounts.filter(acc => 
    acc.is_smtp_success && acc.is_imap_success
  );
  
  return {
    healthScore: (healthyAccounts.length / accounts.length) * 100,
    healthyAccounts: healthyAccounts.length,
    totalAccounts: accounts.length,
  };
};
```

## 🧪 Testing API Integration

### Test API Key
```bash
curl "https://server.smartlead.ai/api/v1/campaigns?api_key=YOUR_API_KEY"
```

### Test Rate Limiting
```bash
# Make multiple requests quickly
for i in {1..15}; do
  curl "https://server.smartlead.ai/api/v1/campaigns?api_key=YOUR_API_KEY"
  sleep 0.1
done
```

### Test Error Handling
```bash
# Test with invalid API key
curl "https://server.smartlead.ai/api/v1/campaigns?api_key=invalid_key"
```

## 🔍 Debugging

### Enable Debug Logging
```typescript
// Add to smartlead-api.ts
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('API Request:', endpoint);
  console.log('API Response:', data);
}
```

### Network Tab Analysis
1. Open browser DevTools
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for Smartlead API calls
5. Check response status and data

### Common Issues

#### CORS Errors
- Smartlead API supports CORS
- Check if requests are being made correctly
- Verify API key is included in URL

#### Rate Limiting Issues
- Check request timing
- Verify rate limiting implementation
- Monitor request queue

#### Cache Issues
- Clear cache if data seems stale
- Check cache duration settings
- Verify cache key generation

## 📊 Performance Optimization

### Request Optimization
- Use pagination for large datasets
- Implement request deduplication
- Cache frequently accessed data

### Data Optimization
- Transform data on the server when possible
- Use efficient data structures
- Minimize unnecessary API calls

### Error Recovery
- Implement retry logic for transient errors
- Use exponential backoff
- Graceful degradation for API failures

## 🔒 Security Best Practices

### API Key Management
- Never expose API keys in client-side code
- Use environment variables
- Rotate keys regularly

### Request Validation
- Validate API responses
- Handle malformed data gracefully
- Sanitize user inputs

### Error Information
- Don't expose sensitive error details
- Log errors for debugging
- Show user-friendly messages

## 📚 Additional Resources

- [Smartlead API Documentation](https://docs.smartlead.ai)
- [API Rate Limiting Guide](https://docs.smartlead.ai/rate-limiting)
- [Error Handling Best Practices](https://docs.smartlead.ai/errors)
- [Authentication Guide](https://docs.smartlead.ai/authentication)

---

**Your API integration is now production-ready! 🚀**
