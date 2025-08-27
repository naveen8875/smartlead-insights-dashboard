import type {
    SmartleadCampaign,
    SmartleadEmailAccount,
    AccountHealthScore,
    CampaignCapacity,
    WarmupProgress
} from './types';

/**
 * Calculate account health score based on SMTP/IMAP status
 */
export const calculateAccountHealthScore = (accounts: SmartleadEmailAccount[]): AccountHealthScore => {
    const healthyAccounts = accounts.filter(acc =>
        acc.is_smtp_success && acc.is_imap_success
    );

    return {
        totalAccounts: accounts.length,
        healthyAccounts: healthyAccounts.length,
        healthScore: accounts.length > 0 ? (healthyAccounts.length / accounts.length) * 100 : 0,
    };
};

/**
 * Analyze campaign capacity and performance
 */
export const analyzeCampaignCapacity = (campaigns: SmartleadCampaign[]): CampaignCapacity => {
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
    const totalDailyCapacity = activeCampaigns.reduce((sum, camp) =>
        sum + camp.max_leads_per_day, 0
    );

    return {
        activeCampaigns: activeCampaigns.length,
        dailyCapacity: totalDailyCapacity,
        monthlyCapacity: totalDailyCapacity * 30,
    };
};

/**
 * Get warmup progress for an email account
 */
export const getWarmupProgress = (account: SmartleadEmailAccount): WarmupProgress | null => {
    if (!account.warmup_details) return null;

    const reputation = parseInt(account.warmup_details.warmup_reputation) || 0;
    let status: WarmupProgress['status'] = 'inactive';

    if (account.warmup_details.status === 'ACTIVE') {
        if (reputation < 50) status = 'warming';
        else if (reputation < 80) status = 'progressing';
        else status = 'ready';
    }

    return {
        status,
        reputation,
        sentCount: account.warmup_details.total_sent_count,
        spamCount: account.warmup_details.total_spam_count,
    };
};

/**
 * Calculate total accounts in warmup
 */
export const getAccountsInWarmup = (accounts: SmartleadEmailAccount[]): number => {
    return accounts.filter(acc =>
        acc.warmup_details?.status === 'ACTIVE'
    ).length;
};

/**
 * Calculate estimated monthly reach based on campaign settings
 */
export const calculateMonthlyReach = (campaigns: SmartleadCampaign[]): number => {
    return campaigns
        .filter(c => c.status === 'ACTIVE')
        .reduce((sum, camp) => sum + (camp.max_leads_per_day * 30), 0);
};

/**
 * Get campaign status distribution
 */
export const getCampaignStatusDistribution = (campaigns: SmartleadCampaign[]) => {
    const distribution = {
        ACTIVE: 0,
        DRAFTED: 0,
        PAUSED: 0,
        COMPLETED: 0,
        STOPPED: 0,
    };

    campaigns.forEach(campaign => {
        distribution[campaign.status]++;
    });

    return distribution;
};

/**
 * Calculate average follow-up percentage across campaigns
 */
export const calculateAverageFollowUpPercentage = (campaigns: SmartleadCampaign[]): number => {
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
    if (activeCampaigns.length === 0) return 0;

    const totalFollowUp = activeCampaigns.reduce((sum, camp) =>
        sum + camp.follow_up_percentage, 0
    );

    return Math.round(totalFollowUp / activeCampaigns.length);
};

/**
 * Get account type distribution
 */
export const getAccountTypeDistribution = (accounts: SmartleadEmailAccount[]) => {
    const distribution = {
        GMAIL: 0,
        OUTLOOK: 0,
        SMTP: 0,
        ZOHO: 0,
    };

    accounts.forEach(account => {
        distribution[account.type]++;
    });

    return distribution;
};

/**
 * Calculate daily send capacity vs actual usage
 */
export const calculateSendCapacityUtilization = (accounts: SmartleadEmailAccount[]) => {
    const totalCapacity = accounts.reduce((sum, acc) => sum + acc.message_per_day, 0);
    const totalUsed = accounts.reduce((sum, acc) => sum + acc.daily_sent_count, 0);

    return {
        totalCapacity,
        totalUsed,
        utilizationPercentage: totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0,
    };
};

/**
 * Calculate warmup progress metrics
 */
export const calculateWarmupProgress = (accounts: SmartleadEmailAccount[]) => {
    const warmingAccounts = accounts.filter(acc => acc.warmup_details?.status === 'ACTIVE');

    if (warmingAccounts.length === 0) {
        return {
            totalWarming: 0,
            averageReputation: 0,
            totalSent: 0,
            totalSpam: 0,
            estimatedDaysToReady: 0,
        };
    }

    const totalSent = warmingAccounts.reduce((sum, acc) =>
        sum + (acc.warmup_details?.total_sent_count || 0), 0
    );

    const totalSpam = warmingAccounts.reduce((sum, acc) =>
        sum + (acc.warmup_details?.total_spam_count || 0), 0
    );

    const reputationSum = warmingAccounts.reduce((sum, acc) => {
        const reputation = acc.warmup_details?.warmup_reputation;
        return sum + (reputation ? parseFloat(reputation) : 0);
    }, 0);

    const averageReputation = reputationSum / warmingAccounts.length;
    const estimatedDaysToReady = averageReputation < 80 ? Math.ceil((80 - averageReputation) / 5) : 0;

    return {
        totalWarming: warmingAccounts.length,
        averageReputation,
        totalSent,
        totalSpam,
        estimatedDaysToReady,
    };
};

/**
 * Calculate comprehensive account health metrics
 */
export const calculateAccountHealthMetrics = (accounts: SmartleadEmailAccount[]) => {
    const healthyAccounts = accounts.filter(acc =>
        acc.is_smtp_success && acc.is_imap_success
    );

    const criticalAccounts = accounts.filter(acc =>
        !acc.is_smtp_success || !acc.is_imap_success
    );

    const totalDailyCapacity = accounts.reduce((sum, acc) => sum + acc.message_per_day, 0);
    const usedCapacity = accounts.reduce((sum, acc) => sum + acc.daily_sent_count, 0);

    return {
        totalAccounts: accounts.length,
        healthyAccounts: healthyAccounts.length,
        criticalAccounts: criticalAccounts.length,
        healthScore: accounts.length > 0 ? (healthyAccounts.length / accounts.length) * 100 : 0,
        totalDailyCapacity,
        usedCapacity,
        utilizationRate: totalDailyCapacity > 0 ? (usedCapacity / totalDailyCapacity) * 100 : 0,
    };
};

/**
 * Calculate simplified metrics for lead generation users
 */
export const calculateSimplifiedMetrics = (campaigns: SmartleadCampaign[], accounts: SmartleadEmailAccount[]) => {
    // Total campaigns (all campaigns created)
    const totalCampaigns = campaigns.length;

    // Active campaigns (currently sending emails)
    const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;

    // Emails sent this month (estimated based on daily capacity)
    const monthlyEmailsSent = campaigns
        .filter(c => c.status === 'ACTIVE')
        .reduce((sum, camp) => sum + (camp.max_leads_per_day * 30), 0);

    // Response rate (simplified - using a default value for now)
    // In a real implementation, this would come from actual response data
    const responseRate = 5.2; // Default 5.2% response rate

    return {
        totalCampaigns,
        activeCampaigns,
        monthlyEmailsSent,
        responseRate,
    };
};
