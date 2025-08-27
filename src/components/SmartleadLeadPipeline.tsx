import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSmartlead } from '@/contexts/SmartleadContext';
import { smartleadAPI } from '@/lib/smartlead-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, TrendingUp, Target, Activity, Mail, Reply, XCircle, CheckCircle, Check, ChevronsUpDown, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SmartleadCampaign, SmartleadCampaignStat, SmartleadCampaignStatistics, SmartleadCampaignAnalytics } from '@/lib/types';
import { FlexiblePagination } from '@/components/ui/flexible-pagination';

interface SmartleadCampaignLeadsAnalysisProps {
    selectedClientId?: number | null;
}

export const SmartleadCampaignLeadsAnalysis = ({ selectedClientId }: SmartleadCampaignLeadsAnalysisProps) => {
    const { campaigns } = useSmartlead();
    const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
    const [campaignStats, setCampaignStats] = useState<SmartleadCampaignStatistics | null>(null);
    const [campaignAnalytics, setCampaignAnalytics] = useState<SmartleadCampaignAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalLeads, setTotalLeads] = useState(0);

    // Search state for campaign selection
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Get all campaigns for selection, filtered by client if selected
    const allCampaigns = campaigns.filter(campaign =>
        !selectedClientId || campaign.client_id === selectedClientId
    );

    // Filter campaigns by search value
    const filteredCampaigns = allCampaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const fetchCampaignStats = async (campaignId: number, page: number = 1, size: number = 50) => {
        setLoading(true);
        try {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (!campaign) throw new Error('Campaign not found');

            // Calculate offset for pagination
            const offset = (page - 1) * size;

            // Fetch real campaign statistics from Smartlead API
            const statistics = await smartleadAPI.getCampaignStatistics(campaignId.toString(), offset, size);

            setCampaignStats(statistics);
            setTotalLeads(parseInt(statistics.total_stats) || 0);
            setCurrentPage(page);
        } catch (error: any) {
            console.error('Failed to fetch campaign statistics:', error);
            setCampaignStats(null);
            setTotalLeads(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchCampaignAnalytics = async (campaignId: number) => {
        try {
            const analytics = await smartleadAPI.getCampaignAnalytics(campaignId.toString());
            setCampaignAnalytics(analytics);
        } catch (error: any) {
            console.error('Failed to fetch campaign analytics:', error);
            setCampaignAnalytics(null);
        }
    };

    useEffect(() => {
        if (selectedCampaign) {
            fetchCampaignStats(selectedCampaign, currentPage, pageSize);
            fetchCampaignAnalytics(selectedCampaign);
        }
    }, [selectedCampaign, currentPage, pageSize]);

    // Helper functions for data analysis
    const getLeadStatusDistribution = (leads: SmartleadCampaignStat[]) => {
        const distribution = {
            SENT: 0,
            OPENED: 0,
            CLICKED: 0,
            REPLIED: 0,
            UNSUBSCRIBED: 0,
            BOUNCED: 0,
        };

        leads.forEach(lead => {
            if (lead.reply_time !== null) {
                distribution.REPLIED++;
            } else if (lead.click_time !== null) {
                distribution.CLICKED++;
            } else if (lead.open_time !== null) {
                distribution.OPENED++;
            } else {
                distribution.SENT++;
            }

            if (lead.is_unsubscribed) {
                distribution.UNSUBSCRIBED++;
            }

            if (lead.is_bounced) {
                distribution.BOUNCED++;
            }
        });

        return distribution;
    };

    const getSequencePerformance = (leads: SmartleadCampaignStat[]) => {
        const stepData: { [key: number]: { total: number; opened: number; replied: number } } = {};

        leads.forEach(lead => {
            const step = lead.sequence_number;
            if (!stepData[step]) {
                stepData[step] = { total: 0, opened: 0, replied: 0 };
            }

            stepData[step].total++;

            if (lead.reply_time !== null) {
                stepData[step].replied++;
            } else if (lead.open_time !== null) {
                stepData[step].opened++;
            }
        });

        return Object.entries(stepData).map(([step, data]) => ({
            step: `Step ${step}`,
            total: data.total,
            opened: data.opened,
            replied: data.replied,
            engagementRate: data.total > 0 ? ((data.opened + data.replied) / data.total) * 100 : 0,
        }));
    };

    const getResponseRateData = (leads: SmartleadCampaignStat[]) => {
        const totalLeads = leads.length;
        const repliedLeads = leads.filter(lead => lead.reply_time !== null).length;
        const unsubscribedLeads = leads.filter(lead => lead.is_unsubscribed).length;
        const openedLeads = leads.filter(lead => lead.open_time !== null).length;

        return {
            total: totalLeads,
            replied: repliedLeads,
            unsubscribed: unsubscribedLeads,
            opened: openedLeads,
            replyRate: totalLeads > 0 ? (repliedLeads / totalLeads) * 100 : 0,
            unsubscribeRate: totalLeads > 0 ? (unsubscribedLeads / totalLeads) * 100 : 0,
            openRate: totalLeads > 0 ? (openedLeads / totalLeads) * 100 : 0,
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SENT': return '#3B82F6';
            case 'OPENED': return '#F59E0B';
            case 'CLICKED': return '#8B5CF6';
            case 'REPLIED': return '#10B981';
            case 'UNSUBSCRIBED': return '#EF4444';
            case 'BOUNCED': return '#DC2626';
            default: return '#6B7280';
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    if (allCampaigns.length === 0) {
        return (
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No campaigns found. Please check your Smartlead API configuration.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Campaign Leads Analysis</h2>
                    <p className="text-muted-foreground">
                        Analyze lead engagement and sequence performance for your campaigns
                    </p>
                </div>
            </div>

            {/* Campaign Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Select Campaign
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                            >
                                {selectedCampaign
                                    ? allCampaigns.find(campaign => campaign.id === selectedCampaign)?.name
                                    : "Select a campaign..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput
                                    placeholder="Search campaigns..."
                                    value={searchValue}
                                    onValueChange={setSearchValue}
                                />
                                <CommandList>
                                    <CommandEmpty>No campaigns found.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredCampaigns.map((campaign) => (
                                            <CommandItem
                                                key={campaign.id}
                                                value={campaign.name}
                                                onSelect={() => {
                                                    setSelectedCampaign(campaign.id);
                                                    setOpen(false);
                                                    setSearchValue('');
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCampaign === campaign.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {campaign.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>

            {/* Campaign Analysis */}
            {selectedCampaign && (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {campaignAnalytics ? parseInt(campaignAnalytics.total_count) : 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Emails</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {campaignAnalytics ? `${parseInt(campaignAnalytics.unique_sent_count)} unique leads` : ''}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">
                                        {campaignAnalytics ? parseInt(campaignAnalytics.reply_count) : 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Replies</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {campaignAnalytics && parseInt(campaignAnalytics.total_count) > 0 ?
                                            `${((parseInt(campaignAnalytics.reply_count) / parseInt(campaignAnalytics.total_count)) * 100).toFixed(1)}% reply rate` :
                                            '0%'
                                        }
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-yellow-600">
                                        {campaignAnalytics ? parseInt(campaignAnalytics.unique_open_count) : 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Unique Opens</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {campaignAnalytics && parseInt(campaignAnalytics.unique_sent_count) > 0 ?
                                            `${((parseInt(campaignAnalytics.unique_open_count) / parseInt(campaignAnalytics.unique_sent_count)) * 100).toFixed(1)}% open rate` :
                                            '0%'
                                        }
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {campaignAnalytics ? parseInt(campaignAnalytics.unique_click_count) : 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Unique Clicks</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {campaignAnalytics && parseInt(campaignAnalytics.unique_open_count) > 0 ?
                                            `${((parseInt(campaignAnalytics.unique_click_count) / parseInt(campaignAnalytics.unique_open_count)) * 100).toFixed(1)}% click rate` :
                                            '0%'
                                        }
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Campaign Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Campaign Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {campaignAnalytics ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {campaignAnalytics.sequence_count}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Sequence Steps</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">
                                            {campaignAnalytics.campaign_lead_stats.completed}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Completed Leads</div>
                                    </div>
                                    <div className="text-center p-4 bg-muted rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {campaignAnalytics.campaign_lead_stats.total}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Leads</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="text-center p-4 bg-muted rounded-lg">
                                            <Skeleton className="h-8 w-16 mx-auto mb-2" />
                                            <Skeleton className="h-4 w-24 mx-auto" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Analysis Tabs */}
                    <Tabs defaultValue="performance" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
                            <TabsTrigger value="leads">Lead Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="performance" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                                {/* Email Performance Metrics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Email Performance Metrics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {campaignAnalytics ? (
                                            <div className="space-y-6">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>Reply Rate</span>
                                                        <span>
                                                            {parseInt(campaignAnalytics.total_count) > 0 ?
                                                                `${((parseInt(campaignAnalytics.reply_count) / parseInt(campaignAnalytics.total_count)) * 100).toFixed(1)}%` :
                                                                '0%'
                                                            }
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={parseInt(campaignAnalytics.total_count) > 0 ?
                                                            (parseInt(campaignAnalytics.reply_count) / parseInt(campaignAnalytics.total_count)) * 100 : 0
                                                        }
                                                        className="h-2"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>Open Rate</span>
                                                        <span>
                                                            {parseInt(campaignAnalytics.unique_sent_count) > 0 ?
                                                                `${((parseInt(campaignAnalytics.unique_open_count) / parseInt(campaignAnalytics.unique_sent_count)) * 100).toFixed(1)}%` :
                                                                '0%'
                                                            }
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={parseInt(campaignAnalytics.unique_sent_count) > 0 ?
                                                            (parseInt(campaignAnalytics.unique_open_count) / parseInt(campaignAnalytics.unique_sent_count)) * 100 : 0
                                                        }
                                                        className="h-2"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>Click Rate</span>
                                                        <span>
                                                            {parseInt(campaignAnalytics.unique_open_count) > 0 ?
                                                                `${((parseInt(campaignAnalytics.unique_click_count) / parseInt(campaignAnalytics.unique_open_count)) * 100).toFixed(1)}%` :
                                                                '0%'
                                                            }
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={parseInt(campaignAnalytics.unique_open_count) > 0 ?
                                                            (parseInt(campaignAnalytics.unique_click_count) / parseInt(campaignAnalytics.unique_open_count)) * 100 : 0
                                                        }
                                                        className="h-2"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span>Unsubscribe Rate</span>
                                                        <span>
                                                            {parseInt(campaignAnalytics.total_count) > 0 ?
                                                                `${((parseInt(campaignAnalytics.unsubscribed_count) / parseInt(campaignAnalytics.total_count)) * 100).toFixed(1)}%` :
                                                                '0%'
                                                            }
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={parseInt(campaignAnalytics.total_count) > 0 ?
                                                            (parseInt(campaignAnalytics.unsubscribed_count) / parseInt(campaignAnalytics.total_count)) * 100 : 0
                                                        }
                                                        className="h-2"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <div key={i}>
                                                        <Skeleton className="h-4 w-32 mb-2" />
                                                        <Skeleton className="h-2 w-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Additional Campaign Insights */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Campaign Tags</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {campaignAnalytics?.tags && campaignAnalytics.tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {campaignAnalytics.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        style={{ backgroundColor: tag.color, color: 'white' }}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No tags assigned</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Client Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {campaignAnalytics ? (
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Name: </span>
                                                    <span className="font-medium">{campaignAnalytics.client_name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Email: </span>
                                                    <span className="font-medium">{campaignAnalytics.client_email}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">ID: </span>
                                                    <span className="font-medium">{campaignAnalytics.client_id}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Skeleton className="h-16 w-full" />
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Campaign Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {campaignAnalytics ? (
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Status: </span>
                                                    <Badge variant={campaignAnalytics.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                                        {campaignAnalytics.status}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Created: </span>
                                                    <span className="font-medium">
                                                        {new Date(campaignAnalytics.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Sequences: </span>
                                                    <span className="font-medium">{campaignAnalytics.sequence_count}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <Skeleton className="h-16 w-full" />
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="leads" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Lead Details
                                        <Badge variant="secondary" className="ml-2">
                                            Page {currentPage} of {Math.ceil(totalLeads / pageSize)}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Skeleton key={i} className="h-16 w-full" />
                                            ))}
                                        </div>
                                    ) : campaignStats ? (
                                        <>
                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                {campaignStats.data.map((lead, index) => (
                                                    <div key={index} className="p-4 border rounded-lg space-y-3">
                                                        {/* Lead Header */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="font-semibold text-lg">{lead.lead_name || 'Unknown Lead'}</div>
                                                                    {lead.lead_category && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {lead.lead_category}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground font-mono">{lead.lead_email}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {lead.reply_time && (
                                                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                                                        <Reply className="h-3 w-3 mr-1" />
                                                                        Replied
                                                                    </Badge>
                                                                )}
                                                                {lead.open_time && !lead.reply_time && (
                                                                    <Badge variant="secondary">
                                                                        <Activity className="h-3 w-3 mr-1" />
                                                                        Opened
                                                                    </Badge>
                                                                )}
                                                                {lead.is_unsubscribed && (
                                                                    <Badge variant="destructive">
                                                                        <XCircle className="h-3 w-3 mr-1" />
                                                                        Unsubscribed
                                                                    </Badge>
                                                                )}
                                                                {lead.is_bounced && (
                                                                    <Badge variant="destructive">
                                                                        <XCircle className="h-3 w-3 mr-1" />
                                                                        Bounced
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Email Details */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Sequence Step:</span>
                                                                    <span className="font-medium">Step {lead.sequence_number}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Email Subject:</span>
                                                                    <span className="font-medium max-w-[200px] truncate" title={lead.email_subject}>
                                                                        {lead.email_subject}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Variant ID:</span>
                                                                    <span className="font-mono text-xs">{lead.seq_variant_id}</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Sent:</span>
                                                                    <span className="font-medium">
                                                                        {new Date(lead.sent_time).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Opens:</span>
                                                                    <span className="font-medium">{lead.open_count}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Clicks:</span>
                                                                    <span className="font-medium">{lead.click_count}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Engagement Timeline */}
                                                        <div className="space-y-2">
                                                            <div className="text-sm font-medium text-muted-foreground">Engagement Timeline:</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                                                                {lead.sent_time && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Mail className="h-3 w-3 text-blue-500" />
                                                                        <span>Sent: {new Date(lead.sent_time).toLocaleTimeString()}</span>
                                                                    </div>
                                                                )}
                                                                {lead.open_time && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Activity className="h-3 w-3 text-yellow-500" />
                                                                        <span>Opened: {new Date(lead.open_time).toLocaleTimeString()}</span>
                                                                    </div>
                                                                )}
                                                                {lead.click_time && (
                                                                    <div className="flex items-center gap-1">
                                                                        <TrendingUp className="h-3 w-3 text-purple-500" />
                                                                        <span>Clicked: {new Date(lead.click_time).toLocaleTimeString()}</span>
                                                                    </div>
                                                                )}
                                                                {lead.reply_time && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Reply className="h-3 w-3 text-green-500" />
                                                                        <span>Replied: {new Date(lead.reply_time).toLocaleTimeString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Quick Actions */}
                                                        <div className="flex items-center justify-between pt-2 border-t">
                                                            <div className="text-xs text-muted-foreground">
                                                                Campaign ID: {lead.email_campaign_seq_id}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {lead.reply_time && (
                                                                    <Button size="sm" variant="outline" className="h-7 text-xs">
                                                                        <Reply className="h-3 w-3 mr-1" />
                                                                        View Reply
                                                                    </Button>
                                                                )}
                                                                <Button size="sm" variant="ghost" className="h-7 text-xs">
                                                                    <Activity className="h-3 w-3 mr-1" />
                                                                    Details
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            <div className="mt-6">
                                                <FlexiblePagination
                                                    currentPage={currentPage}
                                                    pageSize={pageSize}
                                                    totalItems={totalLeads}
                                                    onPageChange={handlePageChange}
                                                    onPageSizeChange={handlePageSizeChange}
                                                    pageSizeOptions={[25, 50, 100]}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-8">
                                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No lead data available for this campaign.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}

            {/* No Campaign Selected */}
            {!selectedCampaign && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Select a Campaign</h3>
                        <p className="text-muted-foreground">
                            Choose a campaign from the dropdown above to analyze lead engagement and performance.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
