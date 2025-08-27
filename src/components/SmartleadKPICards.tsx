import {
    BarChart3,
    Shield,
    Users,
    TrendingUp,
    Loader2,
    AlertCircle,
    Mail
} from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useSmartleadData } from '@/hooks/useSmartleadData';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: {
        direction: 'up' | 'down' | 'neutral';
        percentage: number;
        period: string;
    };
    loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    subtitle,
    description,
    icon: Icon,
    trend,
    loading = false
}) => {
    const getTrendColor = (direction: string) => {
        switch (direction) {
            case 'up':
                return 'text-green-600';
            case 'down':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getTrendIcon = (direction: string) => {
        switch (direction) {
            case 'up':
                return '↗';
            case 'down':
                return '↘';
            default:
                return '→';
        }
    };

    return (
        <Card className="kpi-card dashboard-slide-in">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {title}
                            </p>
                            <InfoTooltip
                                title={title}
                                description={description}
                                size="sm"
                            />
                        </div>
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="text-2xl font-bold text-muted-foreground">Loading...</span>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-foreground mb-2">
                                {value}
                            </p>
                        )}
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mb-2">
                                {subtitle}
                            </p>
                        )}
                        {trend && !loading && (
                            <div className={`flex items-center text-sm font-medium ${getTrendColor(trend.direction)}`}>
                                <span className="mr-1">{getTrendIcon(trend.direction)}</span>
                                <span>
                                    {trend.percentage}% {trend.period}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-brand-primary/10 rounded-lg ml-4">
                        <Icon className="h-6 w-6 text-brand-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const SmartleadKPICards = () => {
    const { kpis, loading, error } = useSmartleadData();

    if (error) {
        return (
            <Alert className="mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Error loading Smartlead data: {error}
                </AlertDescription>
            </Alert>
        );
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    const formatPercentage = (num: number) => {
        return `${num.toFixed(1)}%`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <KPICard
                title="Total Campaigns"
                value={loading ? '...' : kpis.totalCampaigns}
                subtitle="All campaigns created"
                description="Number of email campaigns you have created in your Smartlead account"
                icon={BarChart3}
                loading={loading}
            />

            <KPICard
                title="Active Campaigns"
                value={loading ? '...' : kpis.activeCampaigns}
                subtitle="Currently sending emails"
                description="Campaigns that are currently running and sending emails to your leads"
                icon={TrendingUp}
                loading={loading}
            />

            <KPICard
                title="Response Rate"
                value={loading ? '...' : formatPercentage(kpis.responseRate)}
                subtitle="People who replied"
                description="Percentage of people who replied to your emails. For example: if you sent 100 emails and 10 people replied, your response rate is 10%"
                icon={Users}
                loading={loading}
            />
        </div>
    );
};
