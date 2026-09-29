import React from 'react';
import {
  Brain,
  BarChart3,
  Layers,
  Database,
  Plus,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HealthStatus } from '@/types';

interface HeaderProps {
  health: HealthStatus | null;
  onOpenNewIncident: () => void;
  onOpenReflection: () => void;
  onOpenScoreboard: () => void;
  onOpenArchitecture: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  onOpenNewIncident,
  onOpenReflection,
  onOpenScoreboard,
  onOpenArchitecture,
  onSeedDemo,
  isSeeding,
}) => {
  const isHindsightOnline = health?.status === 'ok';

  return (
    <header className="h-13 border-b border-[#1c2636] bg-[#0c1017]/90 px-4 flex items-center justify-between backdrop-blur-md shrink-0 z-20">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#3b82f6] flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.35)]">
            <Radio className="h-4 w-4 text-[#07090e] animate-pulse" />
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
            <p className="text-[10px] text-[#8292a8] leading-none hidden sm:block">
              Continuous Incident Memory & Autonomous Ops
            </p>
          </div>
        </div>

        {/* Hindsight Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#121824] border border-[#1c2636] text-[11px]">
          <span
            className={`h-2 w-2 rounded-full ${
              isHindsightOnline
                ? 'bg-[#10b981] shadow-[0_0_8px_#10b981]'
                : 'bg-[#ef4444]'
            }`}
          />
          <span className="text-[#8292a8]">Bank:</span>
          <span className="font-mono text-[#cbd5e1] text-[10px]">
            {isHindsightOnline ? 'Connected (Vectorize)' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Center Nav Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenReflection}
          className="text-[#cbd5e1] hover:text-[#a855f7]"
        >
          <Brain className="h-3.5 w-3.5 text-[#a855f7]" />
          <span>Reflect</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenScoreboard}
          className="text-[#cbd5e1] hover:text-[#38bdf8]"
        >
          <BarChart3 className="h-3.5 w-3.5 text-[#38bdf8]" />
          <span>Scoreboard</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenArchitecture}
          className="text-[#cbd5e1] hover:text-[#34d399]"
        >
          <Layers className="h-3.5 w-3.5 text-[#34d399]" />
          <span>Architecture</span>
        </Button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSeedDemo}
          disabled={isSeeding}
          className="border-[#1c2636] bg-[#121824] text-[11px]"
        >
          <Database className="h-3.5 w-3.5 text-[#8292a8]" />
          <span>{isSeeding ? 'Seeding...' : 'Seed Demo Data'}</span>
        </Button>
        <Button
          size="sm"
          onClick={onOpenNewIncident}
          className="bg-[#06b6d4] text-[#07090e] font-semibold hover:bg-[#22d3ee] shadow-[0_0_12px_rgba(6,182,212,0.25)] text-[11px]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Open Incident</span>
        </Button>
      </div>
    </header>
  );
};
