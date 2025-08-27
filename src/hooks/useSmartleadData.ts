import { useState, useEffect } from 'react';
import { smartleadAPI } from '@/lib/smartlead-api';
import { useToast } from '@/hooks/use-toast';
import {
    calculateAccountHealthScore,
    analyzeCampaignCapacity,
    getAccountsInWarmup,
    calculateMonthlyReach,
    calculateSimplifiedMetrics
} from '@/lib/analytics';
import type {
    SmartleadCampaign,
    SmartleadEmailAccount,
    SmartleadClient,
    SmartleadAPIError
} from '@/lib/types';

interface SmartleadData {
    campaigns: SmartleadCampaign[];
    emailAccounts: SmartleadEmailAccount[];
    clients: SmartleadClient[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date;
}

interface SmartleadKPIs {
    // Simplified metrics for lead generation users
    totalCampaigns: number;
    activeCampaigns: number;
    monthlyEmailsSent: number;
    responseRate: number;

    // Legacy metrics (kept for backward compatibility)
    healthyAccounts: number;
    monthlyReach: number;
    accountsInWarmup: number;
    accountHealthScore: number;
    dailyCapacity: number;
    totalAccounts: number;
}

export const useSmartleadData = () => {
    const { toast } = useToast();
    const [data, setData] = useState<SmartleadData>({
        campaigns: [],
        emailAccounts: [],
        clients: [],
        loading: true,
        error: null,
        lastUpdated: new Date(),
    });

    const [kpis, setKpis] = useState<SmartleadKPIs>({
        // Simplified metrics
        totalCampaigns: 0,
        activeCampaigns: 0,
        monthlyEmailsSent: 0,
        responseRate: 0,

        // Legacy metrics
        healthyAccounts: 0,
        monthlyReach: 0,
        accountsInWarmup: 0,
        accountHealthScore: 0,
        dailyCapacity: 0,
        totalAccounts: 0,
    });

    const fetchData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true, error: null }));

            // Fetch all data in parallel (with rate limiting handled by the API service)
            const [campaigns, emailAccounts, clients] = await Promise.all([
                smartleadAPI.getCampaigns(),
                smartleadAPI.getEmailAccounts(),
                smartleadAPI.getClients().catch(() => []), // Clients might not be available
            ]);

            setData({
                campaigns,
                emailAccounts,
                clients,
                loading: false,
                error: null,
                lastUpdated: new Date(),
            });

            // Calculate KPIs
            const accountHealth = calculateAccountHealthScore(emailAccounts);
            const campaignCapacity = analyzeCampaignCapacity(campaigns);
            const warmupAccounts = getAccountsInWarmup(emailAccounts);
            const monthlyReach = calculateMonthlyReach(campaigns);
            const simplifiedMetrics = calculateSimplifiedMetrics(campaigns, emailAccounts);

            setKpis({
                // Simplified metrics
                totalCampaigns: simplifiedMetrics.totalCampaigns,
                activeCampaigns: simplifiedMetrics.activeCampaigns,
                monthlyEmailsSent: simplifiedMetrics.monthlyEmailsSent,
                responseRate: simplifiedMetrics.responseRate,

                // Legacy metrics
                healthyAccounts: accountHealth.healthyAccounts,
                monthlyReach,
                accountsInWarmup: warmupAccounts,
                accountHealthScore: accountHealth.healthScore,
                dailyCapacity: campaignCapacity.dailyCapacity,
                totalAccounts: accountHealth.totalAccounts,
            });

        } catch (error: any) {
            console.error('Error fetching Smartlead data:', error);

            // Show user-friendly error toast
            const errorMessage = error.message || 'Failed to fetch data from Smartlead';
            const isAPIError = error.status || error.code;

            toast({
                title: "Smartlead API Error",
                description: isAPIError
                    ? `${errorMessage}. Please try refreshing the page.`
                    : "Smartlead API call failed. Please try refreshing the page.",
                variant: "destructive",
                duration: 10000, // Show for 10 seconds
            });

            setData(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const refreshData = () => {
        fetchData();
    };

    return {
        ...data,
        kpis,
        refreshData,
    };
};
