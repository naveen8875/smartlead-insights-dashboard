// Smartlead API Data Types
// Based on Smartlead API v1 specifications

export interface SmartleadCampaign {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    status: 'DRAFTED' | 'ACTIVE' | 'COMPLETED' | 'STOPPED' | 'PAUSED';
    name: string;
    track_settings: string;
    scheduler_cron_value: string;
    min_time_btwn_emails: number;
    max_leads_per_day: number;
    stop_lead_settings: string;
    unsubscribe_text: string;
    client_id?: number;
    enable_ai_esp_matching: boolean;
    send_as_plain_text: boolean;
    follow_up_percentage: number;
}

export interface SmartleadEmailAccount {
    id: number;
    created_at: string;
    updated_at: string;
    user_id: number;
    from_name: string;
    from_email: string;
    username: string;
    smtp_host: string;
    smtp_port: number;
    smtp_port_type: string;
    message_per_day: number;
    is_smtp_success: boolean;
    is_imap_success: boolean;
    type: 'GMAIL' | 'ZOHO' | 'OUTLOOK' | 'SMTP';
    daily_sent_count: number;
    client_id?: number;
    warmup_details?: {
        id: number;
        status: 'ACTIVE' | 'INACTIVE';
        total_sent_count: number;
        total_spam_count: number;
        warmup_reputation: string;
    };
}

export interface SmartleadSequence {
    id: number;
    created_at: string;
    updated_at: string;
    email_campaign_id: number;
    seq_number: number;
    seq_delay_details: {
        delayInDays: number;
    };
    subject: string;
    email_body: string;
    sequence_variants?: SmartleadSequenceVariant[];
}

export interface SmartleadSequenceVariant {
    id: number;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    subject: string;
    email_body: string;
    email_campaign_seq_id: number;
    variant_label: string;
    optional_email_body_1?: string | null;
    variant_distribution_percentage?: number | null;
    year: number;
    user_id: number;
}

export interface SmartleadLead {
    id: number;
    campaign_id: number;
    email: string;
    first_name: string;
    last_name: string;
    status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
    replied: boolean;
    unsubscribed: boolean;
    created_at: string;
    updated_at: string;
    current_step: number;
    total_steps: number;
    reply_count: number;
    open_count: number;
    click_count: number;
}

// Campaign Statistics API Types
export interface SmartleadCampaignStatistics {
    total_stats: string;
    data: SmartleadCampaignStat[];
    offset: number;
    limit: number;
}

// Campaign Analytics API Types
export interface SmartleadCampaignAnalytics {
    id: number;
    user_id: number;
    created_at: string;
    status: string;
    name: string;

    // Email stats
    sent_count: string;
    open_count: string;
    click_count: string;
    reply_count: string;
    block_count: string;
    total_count: string;
    drafted_count: string;
    bounce_count: string;
    unsubscribed_count: string;

    // Sequence info
    sequence_count: string;

    // Tags
    tags: SmartleadCampaignTag[];

    // Unique counts
    unique_open_count: string;
    unique_click_count: string;
    unique_sent_count: string;

    // Client info
    client_id: number;
    client_name: string;
    client_email: string;

    // Parent campaign
    parent_campaign_id: number | null;

    // Campaign lead stats
    campaign_lead_stats: {
        total: number;
        blocked: number;
        stopped: number;
        completed: number;
        inprogress: number;
        notStarted: number;
    };
}

export interface SmartleadCampaignTag {
    id: number;
    name: string;
    color: string;
}

export interface SmartleadCampaignStat {
    lead_name: string;
    lead_email: string;
    lead_category: string | null;
    sequence_number: number;
    email_campaign_seq_id: number;
    seq_variant_id: number;
    email_subject: string;
    email_message: string;
    sent_time: string;
    open_time: string | null;
    click_time: string | null;
    reply_time: string | null;
    open_count: number;
    click_count: number;
    is_unsubscribed: boolean;
    is_bounced: boolean;
}

export interface SmartleadClient {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

// API Response Types
export interface SmartleadAPIResponse<T> {
    data: T;
    message?: string;
    status: 'success' | 'error';
}

export interface SmartleadPaginatedResponse<T> {
    data: T[];
    total: number;
    offset: number;
    limit: number;
    has_more: boolean;
}

// Dashboard Configuration Types
export interface DashboardConfig {
    clientName: string;
    agencyLogoUrl?: string;
    brandPrimaryColor: string;
    brandSecondaryColor: string;
    dashboardPassword?: string;
}

// Analytics and Calculation Types
export interface AccountHealthScore {
    totalAccounts: number;
    healthyAccounts: number;
    healthScore: number;
}

export interface CampaignCapacity {
    activeCampaigns: number;
    dailyCapacity: number;
    monthlyCapacity: number;
}

export interface WarmupProgress {
    status: 'inactive' | 'warming' | 'progressing' | 'ready';
    reputation: number;
    sentCount: number;
    spamCount: number;
}

// Error Types
export interface SmartleadAPIError {
    message: string;
    status: number;
    code?: string;
}

// Rate Limiting Types
export interface RateLimitInfo {
    requestsRemaining: number;
    resetTime: number;
    windowSize: number;
}
