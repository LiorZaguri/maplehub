import { useEffect, useRef, useState } from "react";
import { useServerStatus } from "@/hooks/useServerStatus";

export const ServerStatusNotifier = () => {
  const { data } = useServerStatus();
  const previousMaintenance = useRef<boolean | undefined>(undefined);
  const [canUseNotifications, setCanUseNotifications] = useState(false);

  // Check notification support on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = "Notification" in window;
    setCanUseNotifications(supported);
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
        new Notification("🎉 Maintenance Completed", {
          body: "MapleStory servers are back online!",
          icon: "/favicon.ico",
          tag: "maplestory-maintenance", // Prevent duplicate notifications
        });

      const currentPermission = Notification.permission;

      if (currentPermission === "granted") {
        notify();
      } else if (currentPermission === "default") {
        // Only request if we're actually about to notify
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            notify();
          }
        });
      }
      // If "denied", silently do nothing - user has already made their choice
    }

    previousMaintenance.current = isMaint;
  }, [data?.maintenance, canUseNotifications]);

  // This component doesn't render anything
  return null;
};
