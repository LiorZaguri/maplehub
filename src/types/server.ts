export interface Server {
  worldId: number;
  worldName: string;
  logDate: string;
  login00: number;
  login01: number;
  login02: number;
  game00: number;
  game01: number;
  game02: number;
  game03: number;
  game04: number;
  game05: number;
  game06: number;
  game07: number;
  game08: number;
  game09: number;
  game10: number;
  game11: number;
  game12: number;
  game13: number;
  game14: number;
  game15: number;
  game16: number;
  game17: number;
  game18: number;
  game19: number;
  game20: number;
  game21: number;
  game22: number;
  game23: number;
  game24: number;
  game25: number;
  game26: number;
  game27: number;
  game28: number;
  game29: number;
  game30: number;
  game31: number;
  game32: number;
  game33: number;
  game34: number;
  game35: number;
  game36: number;
  game37: number;
  game38: number;
  game39: number;
  shop00: number;
  pvp00: number;
  pvp01: number;
  pvp02: number;
  ITC00: number;
  claim00: number;
  log00: number;
  bridge00: number;
  mapGen00: number;
  hub00: number;
}
export interface ServerStatusResponse {
  servers: Server[];
  maintenance?: boolean;
}

export interface ServiceStatus {
  name: string;
  status: number;
  category: 'login' | 'game' | 'shop' | 'pvp' | 'system';
}
