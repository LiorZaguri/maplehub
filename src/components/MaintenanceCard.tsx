import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Settings } from "lucide-react";

interface MaintenanceCardProps {
  maintenance?: boolean;
  lastChecked?: Date | null;
}

export const MaintenanceCard = ({ maintenance, lastChecked }: MaintenanceCardProps) => {
  const isMaintenance = maintenance === true;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center space-y-0 space-x-2">
        {isMaintenance ? (
          <AlertTriangle className="w-5 h-5 text-orange-500" />
        ) : (
          <Settings className="w-5 h-5 text-primary" />
        )}
        <CardTitle className="text-lg">Maintenance Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {isMaintenance ? (
            <Badge variant="destructive">Maintenance In Progress</Badge>
          ) : (
            <Badge
              variant="default"
              className="bg-green-500/10 text-green-600 border-green-500/20"
            >
              Game Is Up
            </Badge>
          )}
        </div>

        {isMaintenance && (
          <p className="text-sm text-muted-foreground mt-2">
            Allow browser notifications to get an alert when maintenance ends.
          </p>
        )}

        {lastChecked && (
          <p className="text-xs text-muted-foreground mt-2">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
