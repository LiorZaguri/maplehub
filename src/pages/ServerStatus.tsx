import { useEffect, useRef, useState } from "react";
import { useServerStatus } from "@/hooks/useServerStatus";
import { ServerCard } from "@/components/ServerCard";
import { MaintenanceCard } from "@/components/MaintenanceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Shield, Globe, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const ServerStatus = () => {
  const { data, loading, error, lastUpdate, refetch } = useServerStatus();
  const { toast } = useToast();

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

  const totalServers = data?.servers?.length || 0;
  const onlineServers =
    data?.servers?.filter(
      (server) => server.login00 === 1 && server.login01 === 1 && server.login02 === 1
    ).length || 0;

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
              Real-time monitoring of all MapleStory North America servers
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-border/50 rounded-lg p-6">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Globe className="w-10 h-10 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">MapleStory Server Status</h2>
            </div>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time monitoring of all MapleStory North America servers
            </p>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge
                  variant={onlineServers === totalServers ? "default" : "destructive"}
                  className="text-sm"
                >
                  {onlineServers}/{totalServers} Servers Online
                </Badge>
              </div>

              {lastUpdate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}

              <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-8">
          {/* Maintenance Status */}
          <MaintenanceCard maintenance={data?.maintenance} lastChecked={lastUpdate} />

          {/* Enable notifications CTA (SSR-safe) */}
          {canUseNotifications && !notificationsAllowed && (
            <Button onClick={handleEnableNotifications} className="mt-4">
              Enable desktop notifications
            </Button>
          )}

          {/* Server Cards */}
          {data?.servers && data.servers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.servers.map((server) => (
                <ServerCard key={server.worldId} server={server} />
              ))}
            </div>
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
