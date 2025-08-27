import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useSmartlead } from '@/contexts/SmartleadContext';
import { smartleadAPI } from '@/lib/smartlead-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingUp, Mail, Users, Target, BarChart3, Activity, ChevronLeft, ChevronRight, Check, ChevronsUpDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { SmartleadCampaign, SmartleadSequence } from '@/lib/types';

interface SequenceData {
    campaignId: number;
    campaignName: string;
    sequences: SmartleadSequence[];
    loading: boolean;
    error: string | null;
}

interface SmartleadSequenceAnalysisProps {
    selectedClientId?: number | null;
}

export const SmartleadSequenceAnalysis = ({ selectedClientId }: SmartleadSequenceAnalysisProps) => {
    const { campaigns } = useSmartlead();
    const { toast } = useToast();
    const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
    const [sequenceData, setSequenceData] = useState<SequenceData | null>(null);
    const [loading, setLoading] = useState(false);

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

    const fetchSequenceData = async (campaignId: number) => {
        setLoading(true);
        try {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (!campaign) throw new Error('Campaign not found');

            const sequences = await smartleadAPI.getCampaignSequences(campaignId.toString());

            setSequenceData({
                campaignId,
                campaignName: campaign.name,
                sequences,
                loading: false,
                error: null
            });
        } catch (error: any) {
            console.error('Failed to fetch sequences:', error);

            // Show user-friendly error toast
            toast({
                title: "Failed to load sequence data",
                description: "Smartlead API call failed. Please try refreshing the page.",
                variant: "destructive",
                duration: 8000, // Show for 8 seconds
            });

            setSequenceData({
                campaignId,
                campaignName: '',
                sequences: [],
                loading: false,
                error: error.message || 'Failed to fetch sequences'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCampaign) {
            fetchSequenceData(selectedCampaign);
        }
    }, [selectedCampaign]);

    // Helper function to safely get content length (strip HTML tags)
    const getContentLength = (content: string | null | undefined): number => {
        if (!content) return 0;
        try {
            // Remove HTML tags and decode HTML entities
            const strippedContent = content
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
                .replace(/&amp;/g, '&') // Replace &amp; with &
                .replace(/&lt;/g, '<') // Replace &lt; with <
                .replace(/&gt;/g, '>') // Replace &gt; with >
                .replace(/&quot;/g, '"') // Replace &quot; with "
                .replace(/&#39;/g, "'") // Replace &#39; with '
                .trim();
            return strippedContent.length;
        } catch (error) {
            console.warn('Error processing content length:', error);
            return 0;
        }
    };

    const getSequenceStepData = (sequences: SmartleadSequence[]) => {
        // Since we don't have performance metrics in the API response,
        // we'll create a visualization based on sequence structure
        return sequences.map(sequence => ({
            step: `Step ${sequence.seq_number}`,
            delayDays: sequence.seq_delay_details.delayInDays,
            hasVariants: sequence.sequence_variants && sequence.sequence_variants.length > 0,
            variantCount: sequence.sequence_variants?.length || 0,
            subjectLength: sequence.subject?.length || 0,
            bodyLength: getContentLength(sequence.email_body),
        }));
    };

    const getSequencePerformanceData = (sequences: SmartleadSequence[]) => {
        return sequences.map(sequence => {
            const variantCount = sequence.sequence_variants?.length || 0;
            const hasVariants = variantCount > 0;
            const delayDays = sequence.seq_delay_details.delayInDays;
            const subjectLength = sequence.subject?.length || 0;
            const bodyLength = getContentLength(sequence.email_body);

            return {
                name: `Step ${sequence.seq_number}`,
                variantCount,
                hasVariants,
                delayDays,
                subjectLength,
                bodyLength,
                complexity: subjectLength + bodyLength, // Simple complexity metric
            };
        });
    };

    const getSubjectLinePerformance = (sequences: SmartleadSequence[]) => {
        const subjectData: { [key: string]: { count: number; hasVariants: boolean; avgDelay: number } } = {};

        sequences.forEach(sequence => {
            const subject = sequence.subject || 'No Subject';
            if (!subjectData[subject]) {
                subjectData[subject] = { count: 0, hasVariants: false, avgDelay: 0 };
            }

            subjectData[subject].count += 1;
            subjectData[subject].hasVariants = subjectData[subject].hasVariants || (sequence.sequence_variants && sequence.sequence_variants.length > 0);
            subjectData[subject].avgDelay += sequence.seq_delay_details.delayInDays;
        });

        return Object.entries(subjectData).map(([subject, data]) => ({
            subject: subject.length > 30 ? subject.substring(0, 30) + '...' : subject,
            count: data.count,
            hasVariants: data.hasVariants,
            avgDelay: data.avgDelay / data.count,
        }));
    };

    // Generate sequence optimization insights
    const getSequenceInsights = (sequences: SmartleadSequence[]) => {
        const insights = [];

        // Analyze sequence length
        if (sequences.length < 3) {
            insights.push({
                type: 'warning',
                title: 'Short Sequence',
                message: 'Consider adding more follow-up steps to increase engagement opportunities.',
                icon: '📧'
            });
        } else if (sequences.length > 7) {
            insights.push({
                type: 'info',
                title: 'Long Sequence',
                message: 'Long sequences may have diminishing returns. Consider testing shorter versions.',
                icon: '⏱️'
            });
        }

        // Analyze delay patterns
        const delays = sequences.map(s => s.seq_delay_details.delayInDays);
        const avgDelay = delays.reduce((sum, delay) => sum + delay, 0) / delays.length;

        if (avgDelay < 1) {
            insights.push({
                type: 'warning',
                title: 'Aggressive Timing',
                message: 'Very short delays between emails may trigger spam filters.',
                icon: '⚡'
            });
        } else if (avgDelay > 5) {
            insights.push({
                type: 'info',
                title: 'Conservative Timing',
                message: 'Long delays may reduce momentum. Consider testing shorter intervals.',
                icon: '🐌'
            });
        }

        // Analyze variant usage
        const sequencesWithVariants = sequences.filter(s => s.sequence_variants && s.sequence_variants.length > 0);
        const variantPercentage = (sequencesWithVariants.length / sequences.length) * 100;

        if (variantPercentage < 20) {
            insights.push({
                type: 'suggestion',
                title: 'A/B Testing Opportunity',
                message: 'Consider adding variants to more sequence steps for better optimization.',
                icon: '🧪'
            });
        } else if (variantPercentage > 80) {
            insights.push({
                type: 'success',
                title: 'Good A/B Testing',
                message: 'Excellent use of variants across sequence steps.',
                icon: '✅'
            });
        }

        // Analyze content length
        const totalBodyLength = sequences.reduce((sum, s) => sum + getContentLength(s.email_body), 0);
        const avgBodyLength = sequences.length > 0 ? totalBodyLength / sequences.length : 0;

        if (avgBodyLength < 100) {
            insights.push({
                type: 'warning',
                title: 'Short Content',
                message: 'Very short emails may lack value. Consider adding more context.',
                icon: '📝'
            });
        } else if (avgBodyLength > 1000) {
            insights.push({
                type: 'info',
                title: 'Long Content',
                message: 'Long emails may reduce engagement. Consider testing shorter versions.',
                icon: '📖'
            });
        }

        return insights;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value.toFixed(1)}%
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (allCampaigns.length === 0) {
        return (
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Campaigns</h3>
                        <p>No campaigns available for sequence analysis</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* Campaign Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Sequence Performance Analysis
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Analyze email sequence performance and optimization opportunities
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Select Campaign:</label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-[300px] justify-between"
                                >
                                    {selectedCampaign
                                        ? allCampaigns.find((campaign) => campaign.id === selectedCampaign)?.name
                                        : "Choose a campaign to analyze..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput
                                        placeholder="Search campaigns..."
                                        value={searchValue}
                                        onValueChange={setSearchValue}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No campaign found.</CommandEmpty>
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
                    </div>
                </CardContent>
            </Card>

            {loading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-[300px] w-full" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {sequenceData?.error && (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-red-600">
                            Error loading sequence data: {sequenceData.error}
                        </div>
                    </CardContent>
                </Card>
            )}

            {sequenceData && !loading && !sequenceData.error && (
                <>
                    {/* Sequence Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sequence Overview: {sequenceData.campaignName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-brand-primary">
                                        {sequenceData.sequences.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Sequences</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-brand-secondary">
                                        {sequenceData.sequences.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Steps</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {sequenceData.sequences.reduce((sum, seq) =>
                                            sum + (seq.sequence_variants?.length || 0), 0
                                        ).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Variants</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {sequenceData.sequences.reduce((sum, seq) =>
                                            sum + seq.seq_delay_details.delayInDays, 0
                                        ).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Delay Days</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sequence Analysis Tabs */}
                    <Tabs defaultValue="performance" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="performance">Sequence Structure</TabsTrigger>
                            <TabsTrigger value="steps">Step Overview</TabsTrigger>
                            <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
                            <TabsTrigger value="insights">Optimization Insights</TabsTrigger>
                        </TabsList>

                        <TabsContent value="performance" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Sequence Performance Chart */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Sequence Structure Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={getSequencePerformanceData(sequenceData.sequences)}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="variantCount" fill="hsl(var(--brand-primary))" name="Variants" />
                                                <Bar dataKey="delayDays" fill="hsl(var(--brand-secondary))" name="Delay Days" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Reply Rate Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Variant Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={getSequencePerformanceData(sequenceData.sequences).map(seq => ({
                                                        name: seq.name,
                                                        value: seq.variantCount
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, value }) => `${name}: ${value} variants`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {getSequencePerformanceData(sequenceData.sequences).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={`hsl(${120 + index * 30}, 70%, 50%)`} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="steps" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sequence Structure Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={getSequenceStepData(sequenceData.sequences)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="step" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="delayDays" stroke="hsl(var(--brand-primary))" name="Delay Days" />
                                            <Line type="monotone" dataKey="variantCount" stroke="hsl(var(--brand-secondary))" name="Variants" />
                                            <Line type="monotone" dataKey="bodyLength" stroke="#EF4444" name="Body Length" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="subjects" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subject Line Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={getSubjectLinePerformance(sequenceData.sequences)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="count" fill="hsl(var(--brand-primary))" name="Usage Count" />
                                            <Bar dataKey="avgDelay" fill="hsl(var(--brand-secondary))" name="Avg Delay Days" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="insights" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Sequence Optimization Insights
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        AI-powered recommendations to improve your sequence performance
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {getSequenceInsights(sequenceData.sequences).map((insight, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg border ${insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                                                    insight.type === 'success' ? 'border-green-200 bg-green-50' :
                                                        insight.type === 'suggestion' ? 'border-blue-200 bg-blue-50' :
                                                            'border-gray-200 bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-2xl">{insight.icon}</span>
                                                    <div className="flex-1">
                                                        <h4 className={`font-semibold ${insight.type === 'warning' ? 'text-yellow-800' :
                                                            insight.type === 'success' ? 'text-green-800' :
                                                                insight.type === 'suggestion' ? 'text-blue-800' :
                                                                    'text-gray-800'
                                                            }`}>
                                                            {insight.title}
                                                        </h4>
                                                        <p className={`text-sm mt-1 ${insight.type === 'warning' ? 'text-yellow-700' :
                                                            insight.type === 'success' ? 'text-green-700' :
                                                                insight.type === 'suggestion' ? 'text-blue-700' :
                                                                    'text-gray-700'
                                                            }`}>
                                                            {insight.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {getSequenceInsights(sequenceData.sequences).length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                                <h3 className="text-lg font-semibold mb-2">Great Sequence!</h3>
                                                <p>Your sequence looks well-optimized. No major improvements needed.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sequence Performance Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sequence Performance Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {sequenceData.sequences.length}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Sequence Steps</div>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                {sequenceData.sequences.filter(s => s.sequence_variants && s.sequence_variants.length > 0).length}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Steps with Variants</div>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">
                                                {(() => {
                                                    const totalDelay = sequenceData.sequences.reduce((sum, s) => sum + (s.seq_delay_details?.delayInDays || 0), 0);
                                                    const avgDelay = sequenceData.sequences.length > 0 ? totalDelay / sequenceData.sequences.length : 0;
                                                    return Math.round(avgDelay * 10) / 10;
                                                })()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Avg Delay (Days)</div>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600">
                                                {(() => {
                                                    const totalLength = sequenceData.sequences.reduce((sum, s) => sum + getContentLength(s.email_body), 0);
                                                    const avgLength = sequenceData.sequences.length > 0 ? totalLength / sequenceData.sequences.length : 0;
                                                    return Math.round(avgLength);
                                                })()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">Avg Content Length</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};
