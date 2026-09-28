import React from 'react';
import {
  Activity,
  Brain,
  Cpu,
  Sparkles,
  TrendingUp,
  Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Incident, LearningStats } from '@/types';

interface AgentLoopPanelProps {
  currentIncident: Incident | null;
  stats: LearningStats | null;
  onReflectService: (service: string) => void;
}

export const AgentLoopPanel: React.FC<AgentLoopPanelProps> = ({
  currentIncident,
  stats,
  onReflectService,
}) => {
  const service = currentIncident?.service || 'all-services';
  const acceptanceRate = stats?.acceptance_rate
    ? `${Math.round(stats.acceptance_rate * 100)}%`
    : '100%';

  const steps = [
    {
      icon: Activity,
      label: 'Telemetry Ingestion',
      sub: 'Alert triage & severity scoring',
      status: 'done',
    },
    {
      icon: Brain,
      label: 'Hindsight Memory Recall',
      sub: `Bank: opsmind_${service}`,
      status: currentIncident ? 'done' : 'idle',
    },
    {
      icon: Cpu,
      label: 'Autonomous Reasoning',
      sub: 'Log correlation & root-cause match',
      status: currentIncident ? 'done' : 'idle',
    },
    {
      icon: Sparkles,
      label: 'Fix Generation',
      sub: 'Remediation plan & runbook execution',
      status: currentIncident?.resolution ? 'done' : 'idle',
    },
    {
      icon: Database,
      label: 'Memory Bank Synthesis',
      sub: 'Indexed for instant future recall',
      status: currentIncident?.status === 'resolved' ? 'done' : 'idle',
    },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-[#0c1017] border-l border-[#1c2636] select-none">
      {/* Top Header */}
      <div className="p-3 border-b border-[#1c2636] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#06b6d4] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#cbd5e1]">
            Agent Loop & Memory
          </span>
        </div>
        <Badge variant="memory" className="text-[9px]">
          LIVE
        </Badge>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {/* Agent Workflow Pipeline */}
          <div className="p-3 rounded-lg border border-[#1c2636] bg-[#090d14] space-y-3">
            <span className="text-[10px] font-mono text-[#8292a8] uppercase tracking-wider">
              Autonomous Loop Execution
            </span>

            <div className="space-y-2.5 relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#1c2636]" />

              {steps.map((st, i) => {
                const Icon = st.icon;
                const isActive = st.status === 'done';

                return (
                  <div key={i} className="flex items-start gap-2.5 relative z-10">
                    <div
                      className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                        isActive
                          ? 'bg-[#06b6d4]/15 border-[#06b6d4]/40 text-[#06b6d4]'
                          : 'bg-[#121824] border-[#1c2636] text-[#4b5a6f]'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium truncate ${
                            isActive ? 'text-[#f8fafc]' : 'text-[#8292a8]'
                          }`}
                        >
                          {st.label}
                        </span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                        )}
                      </div>
                      <p className="text-[10px] text-[#4b5a6f] truncate">
                        {st.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Service Bank Card */}
          <div className="p-3 rounded-lg border border-[#14b8a6]/25 bg-[#090d14] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#14b8a6] uppercase tracking-wider flex items-center gap-1.5">
                <Database className="h-3 w-3" />
                Service Memory Bank
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </div>

            <div className="p-2 rounded bg-[#07090e] border border-[#1c2636] space-y-1">
              <div className="text-[10px] text-[#8292a8]">Target Service</div>
              <div className="font-mono text-xs text-[#06b6d4] font-semibold truncate">
                {currentIncident?.service || 'Select an incident'}
              </div>
              <div className="text-[10px] text-[#4b5a6f] font-mono">
                Bank: opsmind_{service}
              </div>
            </div>

            {currentIncident && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReflectService(currentIncident.service)}
                className="w-full text-[11px] h-7 border-[#14b8a6]/30 hover:border-[#14b8a6]/50 text-[#14b8a6]"
              >
                <Brain className="h-3 w-3 mr-1" />
                Reflect on {currentIncident.service}
              </Button>
            )}
          </div>

          {/* Learning & Quality Scoreboard */}
          <div className="p-3 rounded-lg border border-[#1c2636] bg-[#090d14] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" />
                Memory Efficiency
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded bg-[#07090e] border border-[#1c2636]">
                <div className="text-[10px] text-[#8292a8]">Feedback Logs</div>
                <div className="text-sm font-bold text-[#f8fafc] font-mono">
                  {stats?.total_feedback ?? 0}
                </div>
              </div>

              <div className="p-2 rounded bg-[#07090e] border border-[#1c2636]">
                <div className="text-[10px] text-[#8292a8]">Acceptance</div>
                <div className="text-sm font-bold text-[#10b981] font-mono">
                  {acceptanceRate}
                </div>
              </div>
            </div>

            <div className="p-2 rounded bg-[#07090e] border border-[#1c2636] flex items-center justify-between text-[11px]">
              <span className="text-[#8292a8]">Helpful Resolutions</span>
              <span className="font-mono text-[#10b981] font-semibold">
                {stats?.helpful ?? 0}
              </span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};
