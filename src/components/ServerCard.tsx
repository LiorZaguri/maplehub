import { Server } from "@/types/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Server as ServerIcon, Wifi, WifiOff, Activity, Crown, Shield, Zap, Sword, Star, Flame } from "lucide-react";

interface ServerCardProps {
  server: Server;
}

// Get server-specific icon based on server name
const getServerIcon = (serverName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    // North America servers
    'Scania': Crown,      // Scania - the original server, like a crown
    'Bera': Shield,       // Bera - strong and protective
    'Kronos': Zap,        // Kronos - time/lightning themed
    'Hyperion': Star,     // Hyperion - celestial/titan themed
    'Challengers-Interactive': Sword,  // Interactive - combat focused
    'Challengers-Heroic': Flame,       // Heroic - fire/heroism themed
    // Europe servers
    'Luna': Star,         // Luna - moon/celestial themed
    'Solis': Zap,         // Solis - sun/solar themed
    'Challengers-Interactive-Europe': Sword,  // Interactive EU - combat focused
    'Challengers-Heroic-Europe': Flame,       // Heroic EU - fire/heroism themed
  };
  
  return iconMap[serverName] || ServerIcon; // Default to ServerIcon if not found
};

export const ServerCard = ({ server }: ServerCardProps) => {
  // Calculate service statistics
  const gameChannels = Object.entries(server)
    .filter(([key]) => key.startsWith('game'))
    .map(([key, value]) => ({ name: key, status: value as number }));

  // Only count channels that actually exist (status 1 or 0), ignore placeholders (-1)
  const existingChannels = gameChannels.filter(channel => channel.status !== -1);
  const onlineChannels = existingChannels.filter(channel => channel.status === 1).length;
  const totalChannels = existingChannels.length;

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
  const allServicesOnline = systemServices.every(service => service.status === 1);
  const isFullyOnline = allLoginOnline && allServicesOnline && onlineChannels === totalChannels;
  
  // More nuanced status logic
  const hasAnyLoginOnline = loginServices.some(service => service.status === 1);
  const hasAnyChannelsOnline = onlineChannels > 0;
  const hasAnyServicesOnline = systemServices.some(service => service.status === 1);
  
  // Check if this is an EU server (more lenient requirements)
  const isEUServer = [30, 46, 49, 54].includes(server.worldId);
  const loginCount = loginServices.filter(s => s.status === 1).length;
  const isEULoginAcceptable = isEUServer && loginCount >= 1; // EU servers need at least 1/3 login servers
  
  // Determine overall status
  let statusLevel = 'offline';
  let statusText = 'OFFLINE';
  let statusColor = 'destructive';
  
  if (isFullyOnline) {
    statusLevel = 'online';
    statusText = 'ONLINE';
    statusColor = 'default';
  } else if (isEULoginAcceptable && hasAnyChannelsOnline) {
    // EU servers with at least 1 login server and some channels
    statusLevel = 'online';
    statusText = 'ONLINE';
    statusColor = 'default';
  } else if (hasAnyLoginOnline && hasAnyChannelsOnline) {
    statusLevel = 'partial';
    statusText = 'PARTIAL';
    statusColor = 'secondary';
  } else if (hasAnyLoginOnline || hasAnyChannelsOnline || hasAnyServicesOnline) {
    statusLevel = 'limited';
    statusText = 'LIMITED';
    statusColor = 'secondary';
  }
  
  const lastUpdated = new Date(server.logDate).toLocaleTimeString();
  const ServerIconComponent = getServerIcon(server.worldName);

  return (
    <Card className="card-gaming group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Server Header with Status */}
      <div className={`p-4 border-b ${
        statusLevel === 'online' ? 'border-primary/30' : 
        statusLevel === 'partial' ? 'border-accent/30' : 
        statusLevel === 'limited' ? 'border-orange-500/30' : 
        'border-destructive/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              statusLevel === 'online' ? 'bg-primary/20' : 
              statusLevel === 'partial' ? 'bg-accent/20' : 
              statusLevel === 'limited' ? 'bg-orange-500/20' : 
              'bg-destructive/20'
            }`}>
              <ServerIconComponent className={`w-5 h-5 ${
                statusLevel === 'online' ? 'text-primary' : 
                statusLevel === 'partial' ? 'text-accent' : 
                statusLevel === 'limited' ? 'text-orange-500' : 
                'text-destructive'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">{server.worldName}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastUpdated}
              </p>
            </div>
          </div>
          <Badge 
            variant={statusColor as any} 
            className={`${
              statusLevel === 'online' ? "progress-complete" : 
              statusLevel === 'partial' ? "bg-yellow-500/20 text-yellow-800 border-yellow-500/30" : 
              statusLevel === 'limited' ? "bg-orange-500/20 text-orange-800 border-orange-500/30" : 
              "progress-incomplete"
            } text-xs font-bold`}
          >
            {statusText}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Login</span>
            </div>
            <div className={`text-lg font-bold ${allLoginOnline ? 'text-primary' : 'text-destructive'}`}>
              {loginServices.filter(s => s.status === 1).length}/{loginServices.length}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ServerIcon className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Channels</span>
            </div>
            <div className={`text-lg font-bold ${onlineChannels === totalChannels ? 'text-primary' : 'text-destructive'}`}>
              {onlineChannels}/{totalChannels}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Services</span>
            </div>
            <div className={`text-lg font-bold ${allServicesOnline ? 'text-primary' : 'text-destructive'}`}>
              {systemServices.filter(s => s.status === 1).length}/{systemServices.length}
            </div>
          </div>
        </div>

        {/* Channel Status Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Game Channels</h4>
          <div className="grid grid-cols-8 gap-1">
            {existingChannels.map((channel, index) => (
              <div
                key={channel.name}
                className={`
                  aspect-square rounded text-xs font-bold flex items-center justify-center transition-all duration-200
                  ${channel.status === 1
                    ? 'bg-success/20 text-success border border-success/30 hover:bg-success/30'
                    : 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30'
                  }
                `}
                title={`Channel ${index + 1}: ${channel.status === 1 ? 'Online' : 'Offline'}`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
