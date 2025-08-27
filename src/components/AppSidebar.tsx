import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  TrendingUp,
  Mail,
  Activity,
  PieChart,
  Home,
  Zap,
  Filter,
  Building2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { smartleadAPI } from "@/lib/smartlead-api";
import type { SmartleadClient } from "@/lib/types";

const navigationItems = [
  {
    id: "overview",
    title: "Overview",
    icon: Home,
    description: "Dashboard summary",
    color: "text-blue-600"
  },
  {
    id: "campaigns",
    title: "Campaigns",
    icon: Mail,
    description: "Campaign table",
    color: "text-orange-600"
  },
  {
    id: "sequences",
    title: "Sequences",
    icon: PieChart,
    description: "Sequence analysis",
    color: "text-pink-600"
  },
  {
    id: "pipeline",
    title: "Campaign Performance",
    icon: Users,
    description: "Campaign performance analysis",
    color: "text-indigo-600"
  },
  {
    id: "inbox",
    title: "Inbox Health",
    icon: Activity,
    description: "Email account health",
    color: "text-emerald-600"
  },
];

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  selectedClientId?: number | null;
  onClientChange?: (clientId: number | null) => void;
}

export function AppSidebar({ activeSection, onSectionChange, selectedClientId, onClientChange }: AppSidebarProps) {
  const [clients, setClients] = useState<SmartleadClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const clientsData = await smartleadAPI.getClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const handleClientChange = (value: string) => {
    const clientId = value === 'all' ? null : parseInt(value);
    onClientChange?.(clientId);
  };

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarContent className="p-6 w-full">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className={`
                      group relative w-full h-fit justify-start gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200
                      hover:bg-muted/60
                      ${activeSection === item.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 ${activeSection === item.id ? 'text-primary-foreground' : item.color}`} />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {item.title}
                      </span>
                      <span className="text-xs text-muted-foreground/70 leading-tight">
                        {item.description}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Client Filter */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Client Filter
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <Select value={selectedClientId?.toString() || 'all'} onValueChange={handleClientChange}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select client" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      All Clients
                    </div>
                  </SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingClients && (
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  Loading clients...
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer Section */}
        <div className="mt-auto pt-8 px-2">
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-foreground">Live Data</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time integration
            </p>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}