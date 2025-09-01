import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SmartleadKPICards } from "@/components/SmartleadKPICards";
import { SmartleadCampaignTable } from "@/components/SmartleadCampaignTable";
import { SmartleadPerformanceCharts } from "@/components/SmartleadPerformanceCharts";
import { SmartleadSequenceAnalysis } from "@/components/SmartleadSequenceAnalysis";
import { SmartleadCampaignLeadsAnalysis } from "@/components/SmartleadLeadPipeline";
import { SmartleadInboxHealth } from "@/components/SmartleadInboxHealth";
import { ExportModal } from "@/components/ExportModal";
import { useSmartleadData } from "@/hooks/useSmartleadData";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { refreshData, campaigns, clients } = useSmartleadData();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleClientChange = (clientId: number | null) => {
    setSelectedClientId(clientId);
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleExportClose = () => {
    setIsExportModalOpen(false);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Smartlead Campaign Overview
              </h2>
              <p className="text-muted-foreground text-lg">
                Real-time insights from your Smartlead campaigns and email
                account health
              </p>
            </div>
            <SmartleadKPICards />
            <SmartleadPerformanceCharts />
          </div>
        );
      case "kpis":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Key Performance Indicators
              </h2>
              <p className="text-muted-foreground text-lg">
                Monitor your most important metrics at a glance
              </p>
            </div>
            <SmartleadKPICards />
          </div>
        );
      case "performance":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Performance Analytics
              </h2>
              <p className="text-muted-foreground text-lg">
                Track trends and performance over time
              </p>
            </div>
            <SmartleadPerformanceCharts />
          </div>
        );
      case "campaigns":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Campaign Management
              </h2>
              <p className="text-muted-foreground text-lg">
                Detailed view of all your active campaigns
              </p>
            </div>
            <SmartleadCampaignTable selectedClientId={selectedClientId} />
          </div>
        );
      case "sequences":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Sequence Analysis
              </h2>
              <p className="text-muted-foreground text-lg">
                Analyze your email sequences and their performance
              </p>
            </div>
            <SmartleadSequenceAnalysis selectedClientId={selectedClientId} />
          </div>
        );
      case "pipeline":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Campaign Performance Analysis
              </h2>
              <p className="text-muted-foreground text-lg">
                Track campaign performance and leads
              </p>
            </div>
            <SmartleadCampaignLeadsAnalysis
              selectedClientId={selectedClientId}
            />
          </div>
        );
      case "inbox":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Inbox Health Monitor
              </h2>
              <p className="text-muted-foreground text-lg">
                Monitor email account health and deliverability
              </p>
            </div>
            <SmartleadInboxHealth />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          selectedClientId={selectedClientId}
          onClientChange={handleClientChange}
        />
        <SidebarInset>
          <DashboardHeader
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onExport={handleExport}
          />
          <main className="flex-1 px-8 py-8 max-w-7xl mx-auto w-full">
            {renderActiveSection()}
          </main>
        </SidebarInset>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportClose}
        campaigns={campaigns}
        clients={clients}
        selectedClientId={selectedClientId?.toString() || null}
      />
    </SidebarProvider>
  );
};

export default Index;
