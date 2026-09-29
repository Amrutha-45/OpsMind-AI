import React from 'react';
import {
  LayoutDashboard,
  AlertCircle,
  Brain,
  Activity,
  BarChart3,
  Layers,
  Database,
  Plus,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PageRoute, HealthStatus } from '@/types';

interface NavigationProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  health: HealthStatus | null;
  openIncidentsCount: number;
  onOpenNewIncident: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  health,
  openIncidentsCount,
  onOpenNewIncident,
  onSeedDemo,
  isSeeding,
}) => {
  const isOnline = health?.status === 'ok';

  const navItems: Array<{
    id: PageRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertCircle,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
    },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'agent-activity', label: 'Agent Activity', icon: Activity },
    { id: 'scoreboard', label: 'Scoreboard', icon: BarChart3 },
    { id: 'architecture', label: 'Architecture', icon: Layers },
  ];

  return (
    <header className="h-14 border-b border-[#1c2636] bg-[#0c1017]/95 px-6 flex items-center justify-between backdrop-blur-md shrink-0 z-30 select-none">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-6">
        <div
          onClick={() => onNavigate('overview')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-transform group-hover:scale-105">
            <Radio className="h-4 w-4 text-[#07090e]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#f8fafc]">
                OpsMind <span className="text-[#06b6d4]">AI</span>
              </span>
              <Badge variant="memory" className="text-[9px] px-1.5 py-0 h-4">
                HINDSIGHT
              </Badge>
            </div>
            <p className="text-[10px] text-[#8292a8] leading-none">
              Autonomous Incident Memory
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              currentPage === item.id ||
              (item.id === 'incidents' && currentPage === 'incident-details');

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'text-[#f8fafc] bg-[#121824] shadow-sm'
                    : 'text-[#8292a8] hover:text-[#cbd5e1] hover:bg-[#121824]/50'
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 transition-colors ${
                    isActive ? 'text-[#06b6d4]' : 'text-[#8292a8]'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/40">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#06b6d4] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Actions & Health Status */}
      <div className="flex items-center gap-3">
        {/* Hindsight Health Indicator */}
        <div
          title={isOnline ? 'Hindsight Memory Bank connected' : 'Connecting to Hindsight...'}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121824] border border-[#1c2636] text-[11px]"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline
                ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]'
                : 'bg-[#ef4444]'
            }`}
          />
          <span className="text-[#8292a8] text-[10px]">Bank:</span>
          <span className="font-mono text-[#cbd5e1] text-[10px]">
            {isOnline ? 'Online (Vectorize)' : 'Connecting...'}
          </span>
        </div>

        {/* Demo Seed Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSeedDemo}
          disabled={isSeeding}
          className="text-xs h-8 border-[#1c2636] bg-[#0c1017] text-[#cbd5e1] hover:bg-[#121824] hover:text-[#f8fafc]"
        >
          <Database className="h-3.5 w-3.5 text-[#8292a8]" />
          <span className="hidden md:inline">
            {isSeeding ? 'Seeding...' : 'Seed Demo'}
          </span>
        </Button>

        {/* Primary Action: Open Incident */}
        <Button
          size="sm"
          onClick={onOpenNewIncident}
          className="text-xs h-8 bg-[#06b6d4] text-[#07090e] font-semibold hover:bg-[#22d3ee] shadow-[0_0_12px_rgba(6,182,212,0.25)]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Open Incident</span>
        </Button>
      </div>
    </header>
  );
};
