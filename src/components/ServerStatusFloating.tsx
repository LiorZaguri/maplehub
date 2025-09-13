import { useState, useEffect, useRef } from "react";
import { useServerStatus } from "@/hooks/useServerStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Bell, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ServerStatusFloating = () => {
  const { data, loading, error, lastUpdate } = useServerStatus();
  const [canUseNotifications, setCanUseNotifications] = useState(false);
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  const { toast } = useToast();

  // Check notification support and permission status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window;
    setCanUseNotifications(supported);
    if (supported) {
      setNotificationsAllowed(Notification.permission === "granted");
    }
  }, []);

  const handleEnableNotifications = () => {
    if (!canUseNotifications) return;
    
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationsAllowed(true);
        toast({
          title: "Notifications enabled",
          description: "You'll be notified when MapleStory servers come back online.",
        });
      } else {
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted animate-pulse rounded-full"></div>
          <span className="text-xs text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-600">Error loading status</span>
        </div>
      </div>
    );
  }

  const isMaintenance = data?.maintenance || false;
  const lastChecked = lastUpdate ? lastUpdate.toLocaleTimeString() : null;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground">MapleStory Servers</span>
        <div className="flex items-center gap-1">
          {canUseNotifications && !notificationsAllowed && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleEnableNotifications}
              title="Enable notifications"
            >
              <Bell className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {isMaintenance ? (
            <AlertTriangle className="w-3 h-3 text-orange-500" />
          ) : (
            <CheckCircle className="w-3 h-3 text-green-500" />
          )}
          <span className={isMaintenance ? "text-orange-600" : "text-green-600"}>
            {isMaintenance ? "Maintenance" : "Online"}
          </span>
        </div>
        {lastChecked && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{lastChecked}</span>
          </div>
        )}
      </div>
    </div>
  );
};
