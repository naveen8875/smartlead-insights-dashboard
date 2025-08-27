import { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Settings, Eye, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { useSmartlead } from '@/contexts/SmartleadContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CampaignDetailsModal } from '@/components/CampaignDetailsModal';
import type { SmartleadCampaign } from '@/lib/types';

type SortField = keyof SmartleadCampaign | 'max_leads_per_day' | 'follow_up_percentage' | null;
type SortDirection = 'asc' | 'desc';

interface SmartleadCampaignTableProps {
    selectedClientId?: number | null;
}

export const SmartleadCampaignTable = ({ selectedClientId }: SmartleadCampaignTableProps) => {
    const { campaigns, loading, error } = useSmartlead();
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Search filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Filter campaigns by search query, status, and client
    const filteredCampaigns = (campaigns || []).filter(campaign => {
        const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        const matchesClient = !selectedClientId || campaign.client_id === selectedClientId;
        return matchesSearch && matchesStatus && matchesClient;
    });



    const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
        if (!sortField) return 0;

        let aValue: any, bValue: any;

        switch (sortField) {
            case 'max_leads_per_day':
                aValue = a.max_leads_per_day;
                bValue = b.max_leads_per_day;
                break;
            case 'follow_up_percentage':
                aValue = a.follow_up_percentage;
                bValue = b.follow_up_percentage;
                break;
            default:
                aValue = a[sortField as keyof SmartleadCampaign];
                bValue = b[sortField as keyof SmartleadCampaign];
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return 0;
    });

    // Pagination calculations
    const totalCampaigns = sortedCampaigns.length;
    const totalPages = Math.ceil(totalCampaigns / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCampaigns = sortedCampaigns.slice(startIndex, endIndex);

    // Reset to first page when page size changes
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Reset to first page when search query changes
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCurrentPage(1);
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

    const getTrackSettingsSummary = (trackSettings: string) => {
        try {
            const settings = JSON.parse(trackSettings);
            const enabled = Object.values(settings).filter(Boolean).length;
            return `${enabled} tracking enabled`;
        } catch {
            return 'Settings configured';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ?
            <ChevronUp className="h-4 w-4 ml-1" /> :
            <ChevronDown className="h-4 w-4 ml-1" />;
    };

    if (loading) {
        return (
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Campaign Performance Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-4 w-[60px]" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="text-center text-red-600">
                        Error loading campaigns: {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Campaign Performance Matrix</h2>
                        <p className="text-sm text-muted-foreground">Smartlead campaign settings and performance metrics</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalCampaigns)} of {totalCampaigns} campaigns
                    </div>
                </CardTitle>

                {/* Search and Filter */}
                <div className="flex items-center gap-4 mt-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search campaigns..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-10 pr-10"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSearch}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                    }}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="DRAFTED">Drafted</SelectItem>
                            <SelectItem value="PAUSED">Paused</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="STOPPED">Stopped</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear Filters Button */}
                    {(searchQuery || statusFilter !== 'all') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Filter Summary */}
                {(searchQuery || statusFilter !== 'all') && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>Showing {filteredCampaigns.length} of {campaigns?.length || 0} campaigns</span>
                        {searchQuery && <span>• Search: "{searchQuery}"</span>}
                        {statusFilter !== 'all' && <span>• Status: {statusFilter}</span>}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th
                                        className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Campaign Name
                                            <SortIcon field="name" />
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Status
                                            <SortIcon field="status" />
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort('max_leads_per_day')}
                                    >
                                        <div className="flex items-center">
                                            Daily Limit
                                            <SortIcon field="max_leads_per_day" />
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort('follow_up_percentage')}
                                    >
                                        <div className="flex items-center">
                                            Follow-up %
                                            <SortIcon field="follow_up_percentage" />
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                                        onClick={() => handleSort('min_time_btwn_emails')}
                                    >
                                        <div className="flex items-center">
                                            Email Delay
                                            <SortIcon field="min_time_btwn_emails" />
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Track Settings
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedCampaigns.map((campaign) => (
                                    <tr key={campaign.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div>
                                                <div className="font-semibold text-foreground text-base">
                                                    {campaign.name && campaign.name.trim() !== ''
                                                        ? campaign.name
                                                        : `Campaign ${campaign.id}`
                                                    }
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Created {formatDate(campaign.created_at)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {getStatusBadge(campaign.status)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {campaign.max_leads_per_day.toLocaleString()}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-brand-primary h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min((campaign.max_leads_per_day / 1000) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {campaign.follow_up_percentage}%
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-brand-secondary h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${campaign.follow_up_percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-medium text-foreground">
                                                {campaign.min_time_btwn_emails} min
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm text-muted-foreground">
                                                {getTrackSettingsSummary(campaign.track_settings)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center space-x-2">
                                                <CampaignDetailsModal
                                                    campaign={campaign}
                                                    trigger={
                                                        <Button variant="ghost" size="sm" title="View campaign details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                />
                                                <Button variant="ghost" size="sm" title="Campaign settings">
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredCampaigns.length}
                            pageSize={pageSize}
                            onPageChange={goToPage}
                            onPageSizeChange={handlePageSizeChange}
                            pageSizeOptions={[5, 10, 20, 50]}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
