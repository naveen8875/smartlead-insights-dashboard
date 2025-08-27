import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Settings, Eye, Calendar, Users, Clock, Target } from 'lucide-react';
import type { SmartleadCampaign } from '@/lib/types';

interface CampaignDetailsModalProps {
    campaign: SmartleadCampaign;
    trigger?: React.ReactNode;
}

export const CampaignDetailsModal = ({ campaign, trigger }: CampaignDetailsModalProps) => {
    const [open, setOpen] = useState(false);

    // Helper function to safely render any field value
    const safeRender = (value: any): string => {
        if (typeof value === 'string') {
            return value;
        } else if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        } else if (value === null || value === undefined) {
            return 'Not configured';
        } else {
            return String(value);
        }
    };

    const getStatusBadge = (status: SmartleadCampaign['status']) => {
        const statusConfig = {
            ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
            DRAFTED: { color: 'bg-gray-100 text-gray-800', label: 'Drafted' },
            PAUSED: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
            COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
            STOPPED: { color: 'bg-red-100 text-red-800', label: 'Stopped' }
        };

        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
        return (
            <Badge className={config.color}>
                {config.label}
            </Badge>
        );
    };

    const parseTrackSettings = (trackSettings: string) => {
        try {
            const settings = JSON.parse(trackSettings);
            return Object.entries(settings).map(([key, value]) => ({
                key: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: value ? 'Enabled' : 'Disabled',
                enabled: Boolean(value)
            }));
        } catch {
            return [{ key: 'Settings', value: 'Configured', enabled: true }];
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const trackSettings = parseTrackSettings(campaign.track_settings);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Campaign Details: {campaign.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Campaign Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Campaign Overview</span>
                                {getStatusBadge(campaign.status)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Campaign Name</label>
                                    <p className="text-sm">{campaign.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <p className="text-sm">{campaign.status}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                                    <p className="text-sm">{formatDate(campaign.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                    <p className="text-sm">{formatDate(campaign.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Performance Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-brand-primary">
                                        {campaign.max_leads_per_day.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Daily Limit</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-brand-secondary">
                                        {campaign.follow_up_percentage}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Follow-up %</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {campaign.min_time_btwn_emails}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Email Delay (min)</div>
                                </div>
                                <div className="text-center p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {campaign.enable_ai_esp_matching ? 'Yes' : 'No'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">AI ESP Matching</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Track Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Track Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {trackSettings.map((setting, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <span className="text-sm font-medium">{setting.key}</span>
                                        <Badge variant={setting.enabled ? "default" : "secondary"}>
                                            {setting.value}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Scheduler</label>
                                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                                        {safeRender(campaign.scheduler_cron_value)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Stop Conditions</label>
                                    <p className="text-sm font-mono bg-muted p-2 rounded mt-1">
                                        {safeRender(campaign.stop_lead_settings)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Unsubscribe Text</label>
                                    <p className="text-sm bg-muted p-2 rounded mt-1">
                                        {safeRender(campaign.unsubscribe_text)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Send as Plain Text</label>
                                    <p className="text-sm bg-muted p-2 rounded mt-1">
                                        {campaign.send_as_plain_text ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Client Information */}
                    {campaign.client_id && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Client Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm">
                                    <span className="font-medium">Client ID:</span> {campaign.client_id}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
