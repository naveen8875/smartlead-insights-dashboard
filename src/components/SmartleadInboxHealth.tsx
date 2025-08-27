import React, { useState } from 'react';
import {
    Shield,
    AlertTriangle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    Mail,
    Activity,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Wifi,
    WifiOff,
    Settings,
    BarChart3,
    Thermometer,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useSmartlead } from '@/contexts/SmartleadContext';
import { SmartleadEmailAccount } from '@/lib/types';
import { smartleadAPI } from '@/lib/smartlead-api';
import { FlexiblePagination } from '@/components/ui/flexible-pagination';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useToast } from '@/hooks/use-toast';

interface AccountHealthData {
    totalAccounts: number;
    healthyAccounts: number;
    warmingAccounts: number;
    criticalAccounts: number;
    totalDailyCapacity: number;
    usedCapacity: number;
}

export const SmartleadInboxHealth = () => {
    const { emailAccounts, loading, error } = useSmartlead();
    const { toast } = useToast();
    const [selectedAccount, setSelectedAccount] = useState<SmartleadEmailAccount | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [emailAccountsData, setEmailAccountsData] = useState<SmartleadEmailAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    // Calculate account health metrics
    const getAccountHealthData = (): AccountHealthData => {
        const accountsToUse = (emailAccountsData && emailAccountsData.length > 0) ? emailAccountsData : (emailAccounts || []);

        if (!accountsToUse || accountsToUse.length === 0) {
            return {
                totalAccounts: 0,
                healthyAccounts: 0,
                warmingAccounts: 0,
                criticalAccounts: 0,
                totalDailyCapacity: 0,
                usedCapacity: 0,
            };
        }

        const healthyAccounts = accountsToUse.filter(acc =>
            acc.is_smtp_success && acc.is_imap_success
        );

        const warmingAccounts = accountsToUse.filter(acc =>
            acc.warmup_details?.status === 'ACTIVE'
        );

        const criticalAccounts = accountsToUse.filter(acc =>
            !acc.is_smtp_success || !acc.is_imap_success
        );

        const totalDailyCapacity = accountsToUse.reduce((sum, acc) => sum + acc.message_per_day, 0);
        const usedCapacity = accountsToUse.reduce((sum, acc) => sum + acc.daily_sent_count, 0);

        return {
            totalAccounts: totalAccounts || accountsToUse.length,
            healthyAccounts: healthyAccounts.length,
            warmingAccounts: warmingAccounts.length,
            criticalAccounts: criticalAccounts.length,
            totalDailyCapacity,
            usedCapacity,
        };
    };

    // Load accounts with pagination
    const loadAccounts = async (page: number, size: number) => {
        setIsLoadingAccounts(true);
        try {
            const offset = (page - 1) * size;

            const response = await smartleadAPI.getEmailAccounts(offset, size);

            if (Array.isArray(response)) {
                setEmailAccountsData(response);

                if (response.length === 0) {
                    setHasMoreData(false);
                    setTotalAccounts(offset);
                } else if (response.length < size) {
                    const totalCount = offset + response.length;
                    setTotalAccounts(totalCount);
                    setHasMoreData(false);
                } else {
                    setHasMoreData(true);
                }
            } else {
                setEmailAccountsData([]);
                setTotalAccounts(0);
                setHasMoreData(false);
            }
        } catch (error: any) {
            console.error('Failed to load accounts:', error);

            // Show user-friendly error toast
            toast({
                title: "Failed to load email accounts",
                description: "Smartlead API call failed. Please try refreshing the page.",
                variant: "destructive",
                duration: 8000, // Show for 8 seconds
            });

            setEmailAccountsData([]);
            setTotalAccounts(0);
            setHasMoreData(false);
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadAccounts(page, pageSize);
    };

    // Handle page size change
    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
        loadAccounts(1, newPageSize);
    };

    // Initialize accounts on mount
    React.useEffect(() => {
        if (emailAccounts && emailAccounts.length > 0 && (!emailAccountsData || emailAccountsData.length === 0)) {
            setEmailAccountsData(emailAccounts);
            setTotalAccounts(emailAccounts.length);
        }
    }, [emailAccounts, emailAccountsData]);

    // Load accounts when component mounts (only if we don't have data from context)
    React.useEffect(() => {
        if (!emailAccountsData || emailAccountsData.length === 0) {
            loadAccounts(currentPage, pageSize);
        }
    }, [currentPage, pageSize]);

    const healthData = getAccountHealthData();

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Failed to load inbox health data</h3>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show message when no data is available
    if (!loading && !error && healthData.totalAccounts === 0) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center">
                        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Email Accounts Found</h3>
                        <p className="text-muted-foreground">
                            No email accounts are currently configured in your Smartlead account.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Add email accounts to your Smartlead campaigns to see health monitoring data.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Simplified Health Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <CardTitle className="text-sm font-medium">Account Health</CardTitle>
                            <InfoTooltip
                                title="Account Health"
                                description="Overall health of all your email accounts. Shows how many accounts are working properly"
                                size="sm"
                            />
                        </div>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {healthData.totalAccounts > 0
                                ? Math.round((healthData.healthyAccounts / healthData.totalAccounts) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {healthData.healthyAccounts} of {healthData.totalAccounts} accounts healthy
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <CardTitle className="text-sm font-medium">Accounts Ready</CardTitle>
                            <InfoTooltip
                                title="Accounts Ready"
                                description="Fully set up and ready email accounts that can send emails immediately"
                                size="sm"
                            />
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{healthData.healthyAccounts}</div>
                        <p className="text-xs text-muted-foreground">
                            Ready to send emails
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <CardTitle className="text-sm font-medium">Accounts Warming Up</CardTitle>
                            <InfoTooltip
                                title="Accounts Warming Up"
                                description="Email accounts still being set up and getting ready to send emails"
                                size="sm"
                            />
                        </div>
                        <Thermometer className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{healthData.warmingAccounts}</div>
                        <p className="text-xs text-muted-foreground">
                            Still being set up
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center space-x-2">
                            <CardTitle className="text-sm font-medium">Accounts Needing Attention</CardTitle>
                            <InfoTooltip
                                title="Accounts Needing Attention"
                                description="Email accounts with issues that need to be fixed before they can send emails"
                                size="sm"
                            />
                        </div>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{healthData.criticalAccounts}</div>
                        <p className="text-xs text-muted-foreground">
                            Need to be fixed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Account List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CardTitle>Email Account Status</CardTitle>
                        <InfoTooltip
                            title="Email Account Status"
                            description="Current status of all your email accounts. Green = working, Yellow = warming up, Red = needs attention"
                            size="sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                        {isLoadingAccounts ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                                            <div>
                                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(emailAccountsData || []).map((account, index) => {
                                    const healthStatus = account.is_smtp_success && account.is_imap_success ? 'healthy' : 'critical';
                                    const warmup = account.warmup_details;

                                    return (
                                        <div
                                            key={account.id}
                                            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedAccount(account)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                {healthStatus === 'healthy' ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{account.from_email}</p>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {account.from_name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {account.type}
                                                        </span>
                                                        {warmup && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Rep: {parseFloat(warmup.warmup_reputation).toFixed(1)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {account.is_smtp_success && account.is_imap_success ? (
                                                    <Wifi className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <WifiOff className="h-4 w-4 text-red-500" />
                                                )}
                                                <div className="text-right">
                                                    <div className="text-sm font-medium">
                                                        {account.daily_sent_count}/{account.message_per_day}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {warmup?.status === 'ACTIVE' ? 'Warming' : 'Active'}
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-6">
                        {emailAccountsData.length === 0 && currentPage > 1 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No More Email Accounts</h3>
                                <p className="mb-4">You've reached the end of your email accounts list.</p>
                                <div className="flex justify-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(1)}
                                    >
                                        <ChevronsLeft className="h-4 w-4 mr-1" />
                                        Go to First Page
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous Page
                                    </Button>
                                </div>
                            </div>
                        ) : emailAccountsData.length === 0 && currentPage === 1 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No Email Accounts Found</h3>
                                <p>No email accounts are currently configured in your Smartlead account.</p>
                                <p className="text-sm mt-2">Add email accounts to your Smartlead campaigns to see health monitoring data.</p>
                            </div>
                        ) : (
                            <FlexiblePagination
                                currentPage={currentPage}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                isLoading={isLoadingAccounts}
                                hasMoreData={hasMoreData}
                                pageSizeOptions={[10, 25, 50, 100]}
                                totalItems={totalAccounts > 0 ? totalAccounts : undefined}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
