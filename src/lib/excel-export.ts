import * as XLSX from "xlsx";
import { format, parseISO } from "date-fns";

export interface CampaignExportData {
  id: number;
  name: string;
  status: string;
  created_at: string;
  client_name: string;
  sent_count: string;
  open_count: string;
  click_count: string;
  reply_count: string;
  bounce_count: string;
  sequence_count: string;
  total_leads: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  bounce_rate: number;
}

export interface ClientData {
  id: number;
  name: string;
  email: string;
}

// Helper function to get client name from client_id
const getClientName = (
  clientId: number | null,
  clients: ClientData[]
): string => {
  if (!clientId) return "No Client";

  const client = clients.find((c) => c.id === clientId);
  return client ? client.name : `Client ${clientId}`;
};

export const generateCampaignExport = async (
  campaigns: any[],
  analytics: any[],
  clients: ClientData[],
  startDate: Date,
  endDate: Date,
  selectedClientId: string | null
) => {
  try {
    // Filter campaigns by date and client
    const filteredCampaigns = campaigns.filter((campaign) => {
      const campaignDate = new Date(campaign.created_at);
      const isInDateRange =
        campaignDate >= startDate && campaignDate <= endDate;
      const matchesClient =
        !selectedClientId ||
        selectedClientId === "all" ||
        campaign.client_id === parseInt(selectedClientId);
      return isInDateRange && matchesClient;
    });

    // Prepare export data
    const exportData: CampaignExportData[] = filteredCampaigns.map(
      (campaign) => {
        const campaignAnalytics = analytics.find((a) => a.id === campaign.id);

        if (!campaignAnalytics) {
          return {
            id: campaign.id,
            name: campaign.name || `Campaign ${campaign.id}`,
            status: campaign.status,
            created_at: campaign.created_at,
            client_name: getClientName(campaign.client_id, clients),
            sent_count: "0",
            open_count: "0",
            click_count: "0",
            reply_count: "0",
            bounce_count: "0",
            sequence_count: "0",
            total_leads: 0,
            open_rate: 0,
            click_rate: 0,
            reply_rate: 0,
            bounce_rate: 0,
          };
        }

        const sentCount = parseInt(campaignAnalytics.sent_count) || 0;
        const openCount = parseInt(campaignAnalytics.open_count) || 0;
        const clickCount = parseInt(campaignAnalytics.click_count) || 0;
        const replyCount = parseInt(campaignAnalytics.reply_count) || 0;
        const bounceCount = parseInt(campaignAnalytics.bounce_count) || 0;

        return {
          id: campaign.id,
          name: campaign.name || `Campaign ${campaign.id}`,
          status: campaign.status,
          created_at: campaign.created_at,
          client_name: getClientName(campaign.client_id, clients),
          sent_count: campaignAnalytics.sent_count || "0",
          open_count: campaignAnalytics.open_count || "0",
          click_count: campaignAnalytics.click_count || "0",
          reply_count: campaignAnalytics.reply_count || "0",
          bounce_count: campaignAnalytics.bounce_count || "0",
          sequence_count: campaignAnalytics.sequence_count || "0",
          total_leads: campaignAnalytics.campaign_lead_stats?.total || 0,
          open_rate: sentCount > 0 ? (openCount / sentCount) * 100 : 0,
          click_rate: sentCount > 0 ? (clickCount / sentCount) * 100 : 0,
          reply_rate: sentCount > 0 ? (replyCount / sentCount) * 100 : 0,
          bounce_rate: sentCount > 0 ? (bounceCount / sentCount) * 100 : 0,
        };
      }
    );

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create data sheet
    const dataSheet = createDataSheet(exportData);
    XLSX.utils.book_append_sheet(workbook, dataSheet, "Campaign Data");

    // Create charts sheet
    const chartsSheet = createChartsSheet(exportData, clients);
    XLSX.utils.book_append_sheet(workbook, chartsSheet, "Performance Charts");

    // Create summary sheet
    const summarySheet = createSummarySheet(exportData, clients);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary & Insights");

    // Create quick charts sheet
    const quickChartsSheet = createQuickChartsSheet(exportData, clients);
    XLSX.utils.book_append_sheet(workbook, quickChartsSheet, "Quick Charts");

    // Generate filename
    const startDateStr = format(startDate, "yyyy-MM-dd");
    const endDateStr = format(endDate, "yyyy-MM-dd");
    const clientStr =
      selectedClientId && selectedClientId !== "all"
        ? clients.find((c) => c.id === parseInt(selectedClientId))?.name ||
          "Unknown"
        : "All Clients";

    const filename = `Smartlead_Campaigns_${clientStr}_${startDateStr}_to_${endDateStr}.xlsx`;

    // Write and download
    XLSX.writeFile(workbook, filename);

    return { success: true, filename };
  } catch (error) {
    console.error("Export failed:", error);
    return { success: false, error: error.message };
  }
};

const createDataSheet = (data: CampaignExportData[]) => {
  const headers = [
    "Campaign ID",
    "Campaign Name",
    "Status",
    "Created Date",
    "Client Name",
    "Sent Count",
    "Open Count",
    "Click Count",
    "Reply Count",
    "Bounce Count",
    "Open Rate %",
    "Click Rate %",
    "Reply Rate %",
    "Bounce Rate %",
    "Sequence Count",
    "Total Leads",
  ];

  const rows = data.map((item) => [
    item.id,
    item.name,
    item.status,
    format(parseISO(item.created_at), "MMM dd, yyyy"),
    item.client_name,
    parseInt(item.sent_count),
    parseInt(item.open_count),
    parseInt(item.click_count),
    parseInt(item.reply_count),
    parseInt(item.bounce_count),
    Number(item.open_rate.toFixed(2)),
    Number(item.click_rate.toFixed(2)),
    Number(item.reply_rate.toFixed(2)),
    Number(item.bounce_rate.toFixed(2)),
    parseInt(item.sequence_count),
    item.total_leads,
  ]);

  const sheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Apply styling
  worksheet["!cols"] = [
    { width: 12 }, // Campaign ID
    { width: 25 }, // Campaign Name
    { width: 15 }, // Status
    { width: 15 }, // Created Date
    { width: 20 }, // Client Name
    { width: 12 }, // Sent Count
    { width: 12 }, // Open Count
    { width: 12 }, // Click Count
    { width: 12 }, // Reply Count
    { width: 12 }, // Bounce Count
    { width: 12 }, // Open Rate %
    { width: 12 }, // Click Rate %
    { width: 12 }, // Reply Rate %
    { width: 12 }, // Bounce Rate %
    { width: 15 }, // Sequence Count
    { width: 12 }, // Total Leads
  ];

  return worksheet;
};

const createChartsSheet = (
  data: CampaignExportData[],
  clients: ClientData[]
) => {
  // Prepare chart data
  const topCampaigns = [...data]
    .sort((a, b) => b.reply_rate - a.reply_rate)
    .slice(0, 10);

  const clientPerformance = clients
    .map((client) => {
      const clientCampaigns = data.filter((c) => c.client_name === client.name);
      if (clientCampaigns.length === 0)
        return { client: client.name, avgReplyRate: 0, campaignCount: 0 };

      const avgReplyRate =
        clientCampaigns.reduce((sum, c) => sum + c.reply_rate, 0) /
        clientCampaigns.length;
      return {
        client: client.name,
        avgReplyRate: Number(avgReplyRate.toFixed(2)),
        campaignCount: clientCampaigns.length,
      };
    })
    .filter((c) => c.campaignCount > 0);

  // Create chart data arrays with clear instructions
  const chartData = [
    ["📊 EXCEL CHART CREATION GUIDE"],
    [""],
    ["🎯 HOW TO CREATE CHARTS:"],
    ["1. Select the data range for your chart (including headers)"],
    ["2. Go to Insert > Charts in Excel"],
    ["3. Choose your preferred chart type"],
    ["4. Excel will automatically create the chart"],
    [""],
    ["📈 CHART 1: TOP CAMPAIGNS BY REPLY RATE (Bar Chart)"],
    ["Select cells A10:C20 below to create a bar chart"],
    ["Campaign Name", "Reply Rate %", "Sent Count"],
    ...topCampaigns.map((c) => [c.name, c.reply_rate, parseInt(c.sent_count)]),
    [""],
    ["📊 CHART 2: CLIENT PERFORMANCE COMPARISON (Bar Chart)"],
    ["Select cells A23:C30 below to create a bar chart"],
    ["Client Name", "Average Reply Rate %", "Campaign Count"],
    ...clientPerformance.map((c) => [
      c.client,
      c.avgReplyRate,
      c.campaignCount,
    ]),
    [""],
    ["🥧 CHART 3: CAMPAIGN DISTRIBUTION BY CLIENT (Pie Chart)"],
    ["Select cells A33:B40 below to create a pie chart"],
    ["Client Name", "Campaign Count"],
    ...clientPerformance.map((c) => [c.client, c.campaignCount]),
    [""],
    ["📉 CHART 4: REPLY RATE TREND (Line Chart)"],
    ["Select cells A43:C50 below to create a line chart"],
    ["Campaign Name", "Reply Rate %", "Sent Count"],
    ...data
      .slice(0, 8)
      .map((c) => [c.name, c.reply_rate, parseInt(c.sent_count)]),
    [""],
    ["📊 CHART 5: PERFORMANCE METRICS COMPARISON (Radar Chart)"],
    ["Select cells A53:C60 below to create a radar chart"],
    ["Metric", "Value", "Target"],
    [
      "Open Rate",
      data.reduce((sum, c) => sum + c.open_rate, 0) / data.length,
      25,
    ],
    [
      "Click Rate",
      data.reduce((sum, c) => sum + c.click_rate, 0) / data.length,
      5,
    ],
    [
      "Reply Rate",
      data.reduce((sum, c) => sum + c.reply_rate, 0) / data.length,
      2,
    ],
    [
      "Bounce Rate",
      data.reduce((sum, c) => sum + c.bounce_rate, 0) / data.length,
      2,
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(chartData);

  // Apply styling
  worksheet["!cols"] = [
    { width: 40 }, // Campaign/Client Name
    { width: 15 }, // Reply Rate
    { width: 15 }, // Campaign Count
  ];

  return worksheet;
};

const createSummarySheet = (
  data: CampaignExportData[],
  clients: ClientData[]
) => {
  if (data.length === 0) {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["No data available for the selected criteria"],
    ]);
    return worksheet;
  }

  // Calculate summary metrics
  const totalCampaigns = data.length;
  const totalSent = data.reduce((sum, c) => sum + parseInt(c.sent_count), 0);
  const totalOpens = data.reduce((sum, c) => sum + parseInt(c.open_count), 0);
  const totalClicks = data.reduce((sum, c) => sum + parseInt(c.click_count), 0);
  const totalReplies = data.reduce(
    (sum, c) => sum + parseInt(c.reply_count),
    0
  );
  const totalBounces = data.reduce(
    (sum, c) => sum + parseInt(c.bounce_count),
    0
  );

  const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
  const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;
  const avgReplyRate = totalSent > 0 ? (totalReplies / totalSent) * 100 : 0;
  const avgBounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;

  // Top performers
  const topPerformers = [...data]
    .sort((a, b) => b.reply_rate - a.reply_rate)
    .slice(0, 5);

  // Areas for improvement
  const lowPerformers = [...data]
    .filter((c) => c.reply_rate < 2 && parseInt(c.sent_count) > 10)
    .sort((a, b) => a.reply_rate - b.reply_rate)
    .slice(0, 5);

  // Client performance summary
  const clientSummary = clients
    .map((client) => {
      const clientCampaigns = data.filter((c) => c.client_name === client.name);
      if (clientCampaigns.length === 0) return null;

      const clientSent = clientCampaigns.reduce(
        (sum, c) => sum + parseInt(c.sent_count),
        0
      );
      const clientReplies = clientCampaigns.reduce(
        (sum, c) => sum + parseInt(c.reply_count),
        0
      );
      const clientReplyRate =
        clientSent > 0 ? (clientReplies / clientSent) * 100 : 0;

      return {
        client: client.name,
        campaigns: clientCampaigns.length,
        totalSent: clientSent,
        totalReplies: clientReplies,
        replyRate: Number(clientReplyRate.toFixed(2)),
      };
    })
    .filter(Boolean);

  const summaryData = [
    ["SMARTLEAD CAMPAIGN EXPORT SUMMARY"],
    ["Generated on:", new Date().toLocaleString()],
    [""],
    ["EXPORT PERIOD"],
    ["Total Campaigns", totalCampaigns],
    ["Total Emails Sent", totalSent],
    [""],
    ["OVERALL PERFORMANCE"],
    ["Average Open Rate", `${avgOpenRate.toFixed(2)}%`],
    ["Average Click Rate", `${avgClickRate.toFixed(2)}%`],
    ["Average Reply Rate", `${avgReplyRate.toFixed(2)}%`],
    ["Average Bounce Rate", `${avgBounceRate.toFixed(2)}%`],
    [""],
    ["CLIENT PERFORMANCE SUMMARY"],
    ["Client Name", "Campaigns", "Total Sent", "Total Replies", "Reply Rate %"],
    ...clientSummary.map((c) => [
      c.client,
      c.campaigns,
      c.totalSent,
      c.totalReplies,
      `${c.replyRate}%`,
    ]),
    [""],
    ["TOP PERFORMING CAMPAIGNS"],
    ["Campaign Name", "Reply Rate %", "Sent Count", "Client"],
    ...topPerformers.map((c) => [
      c.name,
      `${c.reply_rate.toFixed(2)}%`,
      parseInt(c.sent_count),
      c.client_name,
    ]),
    [""],
    ["CAMPAIGNS NEEDING IMPROVEMENT"],
    ["Campaign Name", "Reply Rate %", "Sent Count", "Client"],
    ...lowPerformers.map((c) => [
      c.name,
      `${c.reply_rate.toFixed(2)}%`,
      parseInt(c.sent_count),
      c.client_name,
    ]),
    [""],
    ["ACTIONABLE INSIGHTS"],
    ["1. Focus on campaigns with low reply rates but high send volumes"],
    ["2. Analyze top performers for best practices"],
    ["3. Consider A/B testing subject lines and content"],
    ["4. Monitor bounce rates for deliverability issues"],
    ["5. Optimize email sequences based on response patterns"],
    ["6. Client-specific optimization opportunities identified above"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Apply styling
  worksheet["!cols"] = [
    { width: 40 }, // Campaign Name/Description
    { width: 15 }, // Reply Rate
    { width: 15 }, // Sent Count
    { width: 20 }, // Client/Additional data
  ];

  return worksheet;
};

const createQuickChartsSheet = (
  data: CampaignExportData[],
  clients: ClientData[]
) => {
  // Create clean, chart-ready data without instructions
  const chartData = [
    // Chart 1: Top Campaigns Bar Chart
    ["TOP CAMPAIGNS - REPLY RATE"],
    ["Campaign Name", "Reply Rate %", "Sent Count", "Client"],
    ...data
      .sort((a, b) => b.reply_rate - a.reply_rate)
      .slice(0, 10)
      .map((c) => [
        c.name,
        c.reply_rate,
        parseInt(c.sent_count),
        c.client_name,
      ]),

    // Empty rows for separation
    [""],
    [""],

    // Chart 2: Client Performance Bar Chart
    ["CLIENT PERFORMANCE"],
    ["Client Name", "Avg Reply Rate %", "Campaign Count", "Total Sent"],
    ...clients
      .map((client) => {
        const clientCampaigns = data.filter(
          (c) => c.client_name === client.name
        );
        if (clientCampaigns.length === 0) return null;

        const avgReplyRate =
          clientCampaigns.reduce((sum, c) => sum + c.reply_rate, 0) /
          clientCampaigns.length;
        const totalSent = clientCampaigns.reduce(
          (sum, c) => sum + parseInt(c.sent_count),
          0
        );

        return [
          client.name,
          Number(avgReplyRate.toFixed(2)),
          clientCampaigns.length,
          totalSent,
        ];
      })
      .filter(Boolean),

    // Empty rows for separation
    [""],
    [""],

    // Chart 3: Pie Chart Data
    ["CAMPAIGN DISTRIBUTION BY CLIENT"],
    ["Client Name", "Campaign Count"],
    ...clients
      .map((client) => {
        const clientCampaigns = data.filter(
          (c) => c.client_name === client.name
        );
        return clientCampaigns.length > 0
          ? [client.name, clientCampaigns.length]
          : null;
      })
      .filter(Boolean),

    // Empty rows for separation
    [""],
    [""],

    // Chart 4: Performance Metrics
    ["PERFORMANCE METRICS"],
    ["Metric", "Current Value", "Industry Average"],
    [
      "Open Rate",
      `${(data.reduce((sum, c) => sum + c.open_rate, 0) / data.length).toFixed(
        2
      )}%`,
      "25%",
    ],
    [
      "Click Rate",
      `${(data.reduce((sum, c) => sum + c.click_rate, 0) / data.length).toFixed(
        2
      )}%`,
      "5%",
    ],
    [
      "Reply Rate",
      `${(data.reduce((sum, c) => sum + c.reply_rate, 0) / data.length).toFixed(
        2
      )}%`,
      "2%",
    ],
    [
      "Bounce Rate",
      `${(
        data.reduce((sum, c) => sum + c.bounce_rate, 0) / data.length
      ).toFixed(2)}%`,
      "2%",
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(chartData);

  // Apply styling
  worksheet["!cols"] = [
    { width: 35 }, // Names/Metrics
    { width: 15 }, // Values
    { width: 15 }, // Additional data
    { width: 20 }, // Extra columns
  ];

  return worksheet;
};
