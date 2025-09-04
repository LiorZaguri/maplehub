import { useState, useEffect, useRef } from "react";
import { useServerStatus } from "@/hooks/useServerStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Bell, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ServerStatusIndicator = () => {
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
    if (!canUseNotifications) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support desktop notifications.",
        variant: "destructive",
      });
      return;
    }

    // Check current permission status
    const currentPermission = Notification.permission;

    if (currentPermission === "granted") {
      setNotificationsAllowed(true);
      toast({
        title: "Notifications already enabled",
        description: "You'll be notified when maintenance ends.",
      });
      return;
    }

    if (currentPermission === "denied") {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings. Look for the site permissions or notification settings.",
        duration: 8000, // Show longer for important instructions
      });
      return;
    }

    // Permission is "default" - we can request it
    Notification.requestPermission().then((permission) => {
      const granted = permission === "granted";
      setNotificationsAllowed(granted);

      if (granted) {
        toast({
          title: "Notifications enabled! 🎉",
          description: "You'll be notified when MapleStory servers come back online.",
        });
      } else {
        toast({
          title: "Notifications not enabled",
          description: "You can enable them later from your browser settings if you change your mind.",
          duration: 6000,
        });
      }
    }).catch((error) => {
      toast({
        title: "Permission request failed",
        description: "There was an error requesting notification permission.",
        variant: "destructive",
      });
    });
  };

  if (loading) {
    return (
      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" />
          <span>Loading MapleStory servers...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-3 h-3 text-destructive" />
          <span>MapleStory servers unavailable</span>
        </div>
      </div>
    );
  }

  const isMaintenance = data?.maintenance === true;
  const lastChecked = lastUpdate ? lastUpdate.toLocaleTimeString() : null;

  return (
    <div className="px-4 py-3 border-t border-border/50 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
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
