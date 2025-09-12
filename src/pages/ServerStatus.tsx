import { useEffect, useRef, useState } from "react";
import { useServerStatus } from "@/hooks/useServerStatus";
import { ServerCard } from "@/components/ServerCard";
import { MaintenanceCard } from "@/components/MaintenanceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Shield, Globe, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const ServerStatus = () => {
  const { data, loading, error, lastUpdate, refetch } = useServerStatus();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("na");

  // Track previous maintenance value to detect transition true -> false
  const previousMaintenance = useRef<boolean | undefined>(undefined);

  // Track Notification API support & permission without touching window on SSR
  const [canUseNotifications, setCanUseNotifications] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);

  // On mount: detect Notification API and current permission (no auto prompt)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window;
    setCanUseNotifications(supported);
    if (supported) {
      setNotificationsAllowed(Notification.permission === "granted");
    }
  }, []);

  // Notify when maintenance transitions from true -> false
  useEffect(() => {
    if (!canUseNotifications) {
      previousMaintenance.current = data?.maintenance;
      return;
    }

    const wasMaint = previousMaintenance.current;
    const isMaint = data?.maintenance;

    if (wasMaint && isMaint === false) {
      const notify = () =>
        new Notification("Maintenance Completed", {
          body: "MapleStory servers are back online.",
        });

      if (Notification.permission === "granted") {
        notify();
      } else if (Notification.permission === "default") {
        // Only request if we're actually about to notify
        Notification.requestPermission().then((permission) => {
          setNotificationsAllowed(permission === "granted");
          if (permission === "granted") notify();
        });
      }
      // If "denied", do nothing.
    }

    previousMaintenance.current = isMaint;
  }, [data?.maintenance, canUseNotifications]);

  const handleEnableNotifications = () => {
    if (!canUseNotifications) return;
    Notification.requestPermission().then((permission) => {
      const granted = permission === "granted";
      setNotificationsAllowed(granted);
      toast({
        title: granted ? "Notifications enabled" : "Notifications blocked",
        description: granted
          ? "I'll alert you when maintenance ends."
          : "You can enable notifications from your browser settings anytime.",
      });
    });
  };

  const handleRefresh = async () => {
    toast({
      title: "Refreshing server status...",
      description: "Fetching latest data from MapleStory servers",
    });

    await refetch();

    toast({
      title: "Server status updated",
      description: `Updated at ${new Date().toLocaleTimeString()}`,
    });
  };

  if (loading && !data) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Loading Server Status</h2>
            <p className="text-muted-foreground">Fetching latest data from MapleStory servers...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Shield className="w-8 h-8 text-destructive mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">Connection Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Separate NA and EU servers based on worldId ranges
  const naServers = data?.servers?.filter(server => 
    // NA servers have worldIds: 1, 19, 45, 48, 52, 70
    [1, 19, 45, 48, 52, 70].includes(server.worldId)
  ) || [];
  
  const euServers = data?.servers?.filter(server => 
    // EU servers have worldIds: 30, 46, 49, 54
    [30, 46, 49, 54].includes(server.worldId)
  ) || [];

  // Get current tab's servers
  const currentTabServers = activeTab === "na" ? naServers : euServers;
  
  const totalServers = currentTabServers.length;
  const onlineServers = currentTabServers.filter(server => {
    // For EU servers, consider 1/3 login servers as online
    const isEUServer = [30, 46, 49, 54].includes(server.worldId);
    const loginCount = [server.login00, server.login01, server.login02].filter(status => status === 1).length;
    
    if (isEUServer) {
      return loginCount >= 1; // EU servers need at least 1/3 login servers
    } else {
      return loginCount === 3; // NA servers need all 3 login servers
    }
  }).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Server Status
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring of all Global MapleStory servers
            </p>
          </div>

        </div>


        {/* Body */}
        <div className="space-y-6">
          {/* Game Status - Compact */}
          <Card className={`card-gaming ${data?.maintenance ? 'border-orange-500/30' : 'border-success/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${data?.maintenance ? 'bg-orange-500/20' : 'bg-success/20'}`}>
                    {data?.maintenance ? (
                      <Shield className="w-5 h-5 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {data?.maintenance ? 'Maintenance in Progress' : 'Game is Up'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {data?.maintenance 
                        ? 'Servers are currently under maintenance' 
                        : ''
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {lastUpdate?.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Badge className={data?.maintenance 
                  ? "bg-orange-500/20 text-orange-600 border-orange-500/30" 
                  : "progress-complete"
                }>
                  {data?.maintenance ? 'MAINTENANCE' : 'ONLINE'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Server Cards with Tabs */}
          {data?.servers && data.servers.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                <TabsTrigger value="na" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  <Globe className="w-4 h-4 mr-2" />
                  NA ({naServers.length})
                </TabsTrigger>
                <TabsTrigger value="eu" className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  <Globe className="w-4 h-4 mr-2" />
                  EU ({euServers.length})
                </TabsTrigger>
            </TabsList>
            
            {/* Enable notifications CTA (SSR-safe) */}
            {canUseNotifications && !notificationsAllowed && (
              <div className="mt-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 max-w-md">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Get notified when maintenance ends
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Enable desktop notifications to stay updated
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleEnableNotifications} variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            )}
            
            <TabsContent value="na" className="mt-6">
                {naServers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {naServers.map((server) => (
                      <ServerCard key={server.worldId} server={server} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No North America servers available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="eu" className="mt-6">
                {euServers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {euServers.map((server) => (
                      <ServerCard key={server.worldId} server={server} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No Europe servers available</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No server data available</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ServerStatus;
