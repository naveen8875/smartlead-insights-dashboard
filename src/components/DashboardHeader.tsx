import { RefreshCw, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartleadAPIService } from "@/lib/smartlead-api";

interface DashboardHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onExport?: () => void;
}

export const DashboardHeader = ({
  onRefresh,
  isRefreshing = false,
  onExport,
}: DashboardHeaderProps) => {
  const dashboardConfig = SmartleadAPIService.getDashboardConfig();

  return (
    <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {dashboardConfig.agencyLogoUrl ? (
              <img
                src={dashboardConfig.agencyLogoUrl}
                alt="Agency Logo"
                className="w-10 h-10 rounded-lg object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
                <span className="text-brand-primary-foreground font-bold text-lg">
                  S
                </span>
              </div>
            )}
            <div className="border-l border-border pl-4">
              <h1 className="text-xl font-semibold text-foreground">
                {dashboardConfig.clientName} Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Smartlead Dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-muted-foreground">Last updated</p>
            <p className="text-sm font-medium text-foreground">
              {new Date().toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-success">Live</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="ml-2"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
