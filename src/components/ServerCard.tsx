import { Server } from "@/types/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Clock, Server as ServerIcon, Users, ShoppingCart } from "lucide-react";

interface ServerCardProps {
  server: Server;
}

export const ServerCard = ({ server }: ServerCardProps) => {
  // Calculate service statistics
  const gameChannels = Object.entries(server)
    .filter(([key]) => key.startsWith('game'))
    .map(([key, value]) => ({ name: key, status: value as number }));

  const onlineChannels = gameChannels.filter(channel => channel.status === 1).length;
  const totalChannels = gameChannels.length;

  const loginServices = Object.entries(server)
    .filter(([key]) => key.startsWith('login'))
    .map(([key, value]) => ({ name: key, status: value as number }));

  const systemServices = [
    { name: 'Shop', status: server.shop00 },
    { name: 'Claims', status: server.claim00 },
    { name: 'Hub', status: server.hub00 },
    { name: 'Bridge', status: server.bridge00 },
  ];

  const allLoginOnline = loginServices.every(service => service.status === 1);
  const shopOnline = server.shop00 === 1;

  const lastUpdated = new Date(server.logDate).toLocaleTimeString();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-card/80 hover:from-card hover:to-muted/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <ServerIcon className="w-5 h-5" />
            {server.worldName}
          </CardTitle>
          <Badge variant={allLoginOnline ? "default" : "destructive"} className="text-xs">
            {allLoginOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdated}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Login Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Login Services
          </h4>
          <div className="flex flex-wrap gap-2">
            {loginServices.map((service, index) => (
              <StatusBadge
                key={service.name}
                status={service.status}
                label={`Login ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Game Channels Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ServerIcon className="w-4 h-4 text-primary" />
              Game Channels
            </h4>
            <span className="text-xs text-muted-foreground">
              {onlineChannels}/{totalChannels} online
            </span>
          </div>
          <div className="grid grid-cols-8 gap-1">
            {gameChannels.map((channel, index) => (
              <div
                key={channel.name}
                className={`
                  text-xs font-medium px-2 py-1 rounded text-center transition-colors
                  ${channel.status === 1
                    ? 'bg-green-500/20 text-green-600 border border-green-500/30'
                    : 'bg-red-500/20 text-red-600 border border-red-500/30'
                  }
                `}
                title={`Channel ${index + 1}: ${channel.status === 1 ? 'Online' : 'Offline'}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* System Services */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-primary" />
            System Services
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {systemServices.map((service) => (
              <StatusBadge
                key={service.name}
                status={service.status}
                label={service.name}
                className="justify-center"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
