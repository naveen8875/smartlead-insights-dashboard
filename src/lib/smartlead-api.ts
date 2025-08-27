import type {
    SmartleadCampaign,
    SmartleadEmailAccount,
    SmartleadSequence,
    SmartleadClient,
    SmartleadAPIError,
    RateLimitInfo,
    SmartleadPaginatedResponse,
    SmartleadCampaignStatistics,
    SmartleadCampaignAnalytics
} from './types';

interface SmartleadConfig {
    apiKey: string;
    baseUrl: string;
}

interface RequestQueueItem {
    endpoint: string;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
}

class SmartleadAPIService {
    private config: SmartleadConfig;
    private requestQueue: RequestQueueItem[] = [];
    private isProcessingQueue = false;
    private lastRequestTime = 0;
    private readonly RATE_LIMIT_DELAY = 200; // 10 requests per 2 seconds = 200ms between requests
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private cache = new Map<string, { data: any; timestamp: number }>();

    constructor(config: SmartleadConfig) {
        this.config = config;
    }

    /**
     * Get environment configuration
     */
    static getConfig(): SmartleadConfig {
        const apiKey = import.meta.env.VITE_SMARTLEAD_API_KEY;
        const baseUrl = import.meta.env.VITE_SMARTLEAD_BASE_URL || 'https://server.smartlead.ai/api/v1';

        if (!apiKey) {
            throw new Error('SMARTLEAD_API_KEY is required. Please check your environment variables.');
        }

        return { apiKey, baseUrl };
    }

    /**
     * Make a rate-limited request to the Smartlead API
     */
    private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                endpoint,
                resolve,
                reject,
                timestamp: Date.now(),
            });

            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }

    /**
     * Process the request queue with rate limiting
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.requestQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.requestQueue.length > 0) {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;

            if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
                await new Promise(resolve =>
                    setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest)
                );
            }

            const request = this.requestQueue.shift();
            if (!request) continue;

            try {
                const result = await this.executeRequest(request.endpoint);
                request.resolve(result);
            } catch (error) {
                request.reject(error);
            }

            this.lastRequestTime = Date.now();
        }

        this.isProcessingQueue = false;
    }

    /**
     * Execute the actual HTTP request
     */
    private async executeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
        // Check cache first
        const cacheKey = `${endpoint}-${JSON.stringify(options || {})}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }

        // Smartlead uses query parameter authentication
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `${this.config.baseUrl}${endpoint}${separator}api_key=${this.config.apiKey}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error: SmartleadAPIError = {
                message: `API Error: ${response.status} ${response.statusText}`,
                status: response.status,
            };

            // Handle specific error cases
            if (response.status === 401) {
                error.message = 'Invalid API key. Please check your SMARTLEAD_API_KEY.';
                error.code = 'INVALID_API_KEY';
            } else if (response.status === 429) {
                error.message = 'Rate limit exceeded. Please wait before making more requests.';
                error.code = 'RATE_LIMIT_EXCEEDED';
            }

            throw error;
        }

        const data = await response.json();

        // Cache the response
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
        });

        return data;
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get all campaigns
     */
    async getCampaigns(offset: number = 0, limit: number = 100): Promise<SmartleadCampaign[]> {
        return this.makeRequest(`/campaigns`);
    }

    /**
     * Get specific campaign details
     */
    async getCampaignDetails(campaignId: string): Promise<SmartleadCampaign> {
        return this.makeRequest(`/campaigns/${campaignId}`);
    }

    /**
     * Get campaign sequences
     */
    async getCampaignSequences(campaignId: string): Promise<SmartleadSequence[]> {
        return this.makeRequest(`/campaigns/${campaignId}/sequences`);
    }

    /**
     * Get email accounts with pagination
     */
    async getEmailAccounts(offset: number = 0, limit: number = 100): Promise<SmartleadEmailAccount[]> {
        return this.makeRequest(`/email-accounts?offset=${offset}&limit=${limit}`);
    }



    /**
     * Get specific email account details
     */
    async getEmailAccountDetails(accountId: string): Promise<SmartleadEmailAccount> {
        return this.makeRequest(`/email-accounts/${accountId}`);
    }

    /**
     * Get campaign email accounts
     */
    async getCampaignEmailAccounts(campaignId: string): Promise<SmartleadEmailAccount[]> {
        return this.makeRequest(`/campaigns/${campaignId}/email-accounts`);
    }

    /**
     * Get clients (if using client feature)
     */
    async getClients(): Promise<SmartleadClient[]> {
        return this.makeRequest('/client');
    }

    /**
     * Get campaign leads (if available)
     */
    async getCampaignLeads(campaignId: string, offset: number = 0, limit: number = 100): Promise<any[]> {
        return this.makeRequest(`/campaigns/${campaignId}/leads?offset=${offset}&limit=${limit}`);
    }

    /**
 * Get campaign statistics with detailed lead data
 */
    async getCampaignStatistics(
        campaignId: string,
        offset: number = 0,
        limit: number = 100,
        emailSequenceNumber?: number,
        emailStatus?: 'opened' | 'clicked' | 'replied' | 'unsubscribed' | 'bounced'
    ): Promise<SmartleadCampaignStatistics> {
        let endpoint = `/campaigns/${campaignId}/statistics?offset=${offset}&limit=${limit}`;

        if (emailSequenceNumber) {
            endpoint += `&email_sequence_number=${emailSequenceNumber}`;
        }

        if (emailStatus) {
            endpoint += `&email_status=${emailStatus}`;
        }

        return this.makeRequest(endpoint);
    }

    /**
     * Get campaign top-level analytics
     */
    async getCampaignAnalytics(campaignId: string): Promise<SmartleadCampaignAnalytics> {
        return this.makeRequest(`/campaigns/${campaignId}/analytics`);
    }

    /**
     * Get campaign performance metrics (if available)
     */
    async getCampaignMetrics(campaignId: string): Promise<any> {
        return this.makeRequest(`/campaigns/${campaignId}/metrics`);
    }

    /**
     * Get sequence performance details (if available)
     */
    async getSequencePerformance(campaignId: string, sequenceId: string): Promise<any> {
        return this.makeRequest(`/campaigns/${campaignId}/sequences/${sequenceId}/performance`);
    }

    /**
     * Get email account warmup details (if available)
     */
    async getAccountWarmupDetails(accountId: string): Promise<any> {
        return this.makeRequest(`/email-accounts/${accountId}/warmup`);
    }

    /**
     * Get dashboard configuration from environment
     */
    static getDashboardConfig() {
        return {
            clientName: import.meta.env.VITE_CLIENT_NAME || 'Smartlead Dashboard',
            agencyLogoUrl: import.meta.env.VITE_AGENCY_LOGO_URL,
            brandPrimaryColor: import.meta.env.VITE_BRAND_PRIMARY_COLOR || '#10B981',
            brandSecondaryColor: import.meta.env.VITE_BRAND_SECONDARY_COLOR || '#059669',
            dashboardPassword: import.meta.env.VITE_DASHBOARD_PASSWORD,
        };
    }
}

// Export configured instance
export const smartleadAPI = new SmartleadAPIService(SmartleadAPIService.getConfig());

// Export the class for testing
export { SmartleadAPIService };
