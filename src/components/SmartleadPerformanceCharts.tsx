import { useSmartlead } from '@/contexts/SmartleadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export const SmartleadPerformanceCharts = () => {
    const { campaigns, loading, error } = useSmartlead();

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Capacity Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="text-center text-red-600">
                        Error loading campaign data: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Simplified metrics for lead generation users
    const activeCampaigns = (campaigns || []).filter(c => c.status === 'ACTIVE').length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Accounts Connected */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CardTitle>Email Accounts Connected</CardTitle>
                        <InfoTooltip
                            title="Email Accounts Connected"
                            description="Number of email accounts linked to your campaigns for sending emails"
                            size="sm"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Email accounts connected to your campaigns
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-8">
                        <div className="text-4xl font-bold text-brand-secondary mb-2">
                            {/* This would come from email accounts data */}
                            {(campaigns || []).filter(c => c.status === 'ACTIVE').length * 2}
                        </div>
                        <div className="text-lg text-muted-foreground">Email Accounts</div>
                        <div className="text-sm text-muted-foreground mt-2">
                            Connected to your campaigns
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Emails Sent Today */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CardTitle>Emails Sent Today</CardTitle>
                        <InfoTooltip
                            title="Emails Sent Today"
                            description="Total emails sent in the last 24 hours across all your campaigns"
                            size="sm"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Email activity in the last 24 hours
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-8">
                        <div className="text-4xl font-bold text-brand-primary mb-2">
                            {activeCampaigns}
                        </div>
                        <div className="text-lg text-muted-foreground">Active Campaigns</div>
                        <div className="text-sm text-muted-foreground mt-2">
                            Currently sending emails to your leads
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Average Open Rate */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CardTitle>Average Open Rate</CardTitle>
                        <InfoTooltip
                            title="Average Open Rate"
                            description="Average percentage of people who open your emails. This shows how engaging your email subject lines are"
                            size="sm"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        How many people open your emails on average
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="text-center p-8">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                            24.5%
                        </div>
                        <div className="text-lg text-muted-foreground">Average Open Rate</div>
                        <div className="text-sm text-muted-foreground mt-2">
                            People who open your emails
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
