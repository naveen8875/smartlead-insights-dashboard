import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  CalendarIcon,
  Download,
  FileSpreadsheet,
  Calendar as CalendarIcon2,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import {
  generateCampaignExport,
  CampaignExportData,
  ClientData,
} from "../lib/excel-export";
import { useToast } from "../hooks/use-toast";
import { smartleadAPI } from "../lib/smartlead-api";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: any[];
  clients: ClientData[];
  selectedClientId: string | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  clients,
  selectedClientId,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [exportClientId, setExportClientId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [isPreventingClose, setIsPreventingClose] = useState(false);
  const { toast } = useToast();

  // Remove the useEffect that auto-selects client based on sidebar
  // The export modal should always start with "all" campaigns

  // Reset modal to defaults when it opens
  useEffect(() => {
    if (isOpen) {
      console.log("ExportModal opened - resetting to defaults");
      setExportClientId("all");
      setEstimatedTime(0);
    }
  }, [isOpen]);

  // Calculate estimated time based on filtered campaign count
  useEffect(() => {
    // Only run filtering when modal is open and dates are selected
    if (!isOpen || !startDate || !endDate) return;

    console.log(
      "ExportModal filtering - exportClientId:",
      exportClientId,
      "campaigns count:",
      campaigns.length
    );
    const filteredCount = getFilteredCampaignCount();

    // Each analytics call takes ~500-800ms, so estimate 650ms per campaign
    const estimatedMs = filteredCount * 650;
    setEstimatedTime(Math.ceil(estimatedMs / 1000)); // Convert to seconds
  }, [isOpen, startDate, endDate, exportClientId, campaigns]);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Date Range Required",
        description: "Please select both start and end dates for the export.",
        variant: "destructive",
      });
      return;
    }

    if (startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "Start date must be before end date.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setIsPreventingClose(true);
    setExportProgress(0);

    try {
      // Show initial progress
      setExportProgress(5);

      // Fetch analytics data for filtered campaigns
      const filteredCampaigns = campaigns.filter((campaign) => {
        const campaignDate = new Date(campaign.created_at);
        const isInDateRange =
          campaignDate >= startDate && campaignDate <= endDate;
        const matchesClient =
          exportClientId === "all" ||
          campaign.client_id === parseInt(exportClientId);
        return isInDateRange && matchesClient;
      });

      toast({
        title: "Starting Export",
        description: `Fetching analytics for ${filteredCampaigns.length} campaigns. This may take ${estimatedTime} seconds.`,
        duration: 5000,
      });

      // Fetch analytics for each campaign with progress updates
      const analyticsPromises = filteredCampaigns.map(
        async (campaign, index) => {
          try {
            const analytics = await smartleadAPI.getCampaignAnalytics(
              campaign.id.toString()
            );

            // Update progress based on analytics fetched
            const progress =
              5 + Math.round((index / filteredCampaigns.length) * 80);
            setExportProgress(progress);

            return analytics;
          } catch (error) {
            console.warn(
              `Failed to fetch analytics for campaign ${campaign.id}:`,
              error
            );
            return null;
          }
        }
      );

      const analyticsResults = await Promise.all(analyticsPromises);
      const campaignAnalytics = analyticsResults.filter(Boolean);

      setExportProgress(85);

      // Generate and download Excel file
      const result = await generateCampaignExport(
        filteredCampaigns,
        campaignAnalytics,
        clients,
        startDate,
        endDate,
        exportClientId === "all" ? null : exportClientId
      );

      setExportProgress(100);

      if (result.success) {
        toast({
          title: "Export Successful! 🎉",
          description: `Campaign data exported to ${result.filename}`,
        });

        // Close modal after success
        setTimeout(() => {
          onClose();
          setIsExporting(false);
          setExportProgress(0);
          setIsPreventingClose(false);
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "An error occurred during export.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setIsPreventingClose(false);
    }
  };

  const getFilteredCampaignCount = () => {
    if (!startDate || !endDate) return 0;

    const filtered = campaigns.filter((campaign) => {
      const campaignDate = new Date(campaign.created_at);
      const isInDateRange =
        campaignDate >= startDate && campaignDate <= endDate;

      // If "All Clients" is selected, don't filter by client
      const matchesClient =
        exportClientId === "all" ||
        campaign.client_id === parseInt(exportClientId);

      return isInDateRange && matchesClient;
    });

    return filtered.length;
  };

  const getDateRangeText = () => {
    if (!startDate || !endDate) return "Select date range";
    return `${format(startDate, "MMM dd, yyyy")} - ${format(
      endDate,
      "MMM dd, yyyy"
    )}`;
  };

  const handleClose = () => {
    if (isPreventingClose) {
      toast({
        title: "Export in Progress",
        description:
          "Please wait for the export to complete. You can't close this window during export.",
        variant: "destructive",
      });
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            Export Campaign Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              <CalendarIcon2 className="h-4 w-4 inline mr-2" />
              Date Range
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                    disabled={isExporting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(startDate, "MMM dd, yyyy")
                      : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={isExporting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-sm text-muted-foreground">
              {getDateRangeText()}
            </p>
          </div>

          {/* Client Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              <Users className="h-4 w-4 inline mr-2" />
              Client Filter
            </Label>
            <Select
              value={exportClientId}
              onValueChange={setExportClientId}
              disabled={isExporting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Preview */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingUp className="h-4 w-4" />
              Export Preview
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Campaigns:</span>
                <span className="ml-2 font-semibold text-foreground">
                  {isOpen && startDate && endDate
                    ? getFilteredCampaignCount()
                    : "Select dates"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 font-semibold text-foreground">
                  Excel (.xlsx)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Sheets:</span>
                <span className="ml-2 font-semibold text-foreground">
                  4 (Data, Charts, Summary, Quick Charts)
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Client:</span>
                <span className="ml-2 font-semibold text-foreground">
                  {exportClientId === "all"
                    ? "All Clients"
                    : clients.find((c) => c.id === parseInt(exportClientId))
                        ?.name || "Unknown"}
                </span>
              </div>
            </div>

            {!startDate || !endDate ? (
              <div className="text-xs text-muted-foreground text-center pt-2">
                Please select start and end dates to see campaign count and
                estimated export time.
              </div>
            ) : null}
          </div>

          {/* Estimated Time Warning */}
          {estimatedTime > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <Clock className="h-4 w-4" />
                Estimated Export Time
              </div>
              <p className="text-sm text-amber-700">
                This export will take approximately{" "}
                <span className="font-semibold">{estimatedTime} seconds</span>{" "}
                to complete. Please don't close this window during export.
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Exporting...</span>
                <span className="font-medium">{exportProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {exportProgress < 85
                  ? `Fetching campaign analytics (${Math.round(
                      ((exportProgress - 5) / 80) * 100
                    )}% complete)...`
                  : exportProgress < 100
                  ? "Generating Excel file..."
                  : "Downloading file..."}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || !startDate || !endDate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
