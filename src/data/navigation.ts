import { Users, Sword, CheckSquare, Server, Calculator, Wrench } from 'lucide-react';
import { HexaIcon } from '@/components/icons/HexaIcon';

export interface NavigationItem {
  name: string;
  path: string | null;
  icon: React.ComponentType<{ className?: string; isActive?: boolean }>;
  isDropdown?: boolean;
}

export interface ToolItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string; isActive?: boolean }>;
}

export const mainNavItems: NavigationItem[] = [
  { name: 'Roster', path: '/', icon: Users },
  { name: 'Boss Tracker', path: '/bosses', icon: Sword },
  { name: 'Daily Tracker', path: '/tasks', icon: CheckSquare },
  { name: 'Server Status', path: '/server-status', icon: Server },
];

export const topNavItems: NavigationItem[] = [
  { name: 'Roster', path: '/', icon: Users },
  { name: 'Boss Tracker', path: '/bosses', icon: Sword },
  { name: 'Daily Tracker', path: '/tasks', icon: CheckSquare },
  { name: 'Tools', path: null, icon: Wrench, isDropdown: true },
  { name: 'Server Status', path: '/server-status', icon: Server },
];

export const toolItems: ToolItem[] = [
  { name: 'Liberation Calculator', path: '/liberation-calculator', icon: Calculator },
  { name: 'Fragment Calculator', path: '/fragment-calculator', icon: HexaIcon },
];
