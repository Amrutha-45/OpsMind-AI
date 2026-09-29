import React from 'react';
import {
  Activity,
  Brain,
  Cpu,
  Sparkles,
  CheckCircle2,
  Database,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Incident } from '@/types';

interface AgentActivityPageProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
}

export const AgentActivityPage: React.FC<AgentActivityPageProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Incident Detection & Triage',
      icon: ShieldAlert,
      color: '#ef4444',
      desc: 'Telemetry anomalies, error logs, and high-frequency exceptions are captured. The agent classifies the affected service and assigns severity.',
      detail: 'Extracts service tags, error signatures, and stack trace fingerprints.',
    },
    {
      step: '02',
      title: 'Hindsight Memory Recall',
      icon: Brain,
      color: '#14b8a6',
      desc: 'Queries the microservice memory bank using Vectorize embeddings to discover semantically similar past outages and verified runbooks.',
      detail: 'Calculates cosine similarity to match past root causes and prevent reinventing solutions.',
    },
    {
      step: '03',
      title: 'Autonomous Reasoning',
      icon: Cpu,
      color: '#06b6d4',
      desc: 'The agent combines live telemetry with recalled institutional memory to formulate a concrete diagnostic hypothesis.',
      detail: 'Correlates deployment timestamps, configuration diffs, and connection saturation.',
    },
    {
      step: '04',
      title: 'Fix Recommendation',
      icon: Sparkles,
      color: '#a855f7',
      desc: 'Generates a precise hotfix, runbook execution command, or parameter rollback tailored to the diagnosed failure pattern.',
      detail: 'Offers verified actions directly to on-call operators.',
    },
    {
      step: '05',
      title: 'Verification & Resolution',
      icon: CheckCircle2,
      color: '#10b981',
      desc: 'Human on-call engineer reviews and confirms remediation, or allows autonomous execution if high confidence is established.',
      detail: 'Records operator feedback (helpful / unhelpful) to tune future suggestions.',
    },
    {
      step: '06',
      title: 'Continuous Memory Synthesis',
      icon: Database,
      color: '#38bdf8',
      desc: 'The confirmed root cause and resolution are synthesized into the Hindsight memory bank, updating institutional memory forever.',
      detail: 'The platform becomes permanently smarter with each resolved incident.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#06b6d4]" />
          <h1 className="text-xl font-bold tracking-tight text-[#f8fafc]">
            Autonomous Agent Workflow
          </h1>
          <Badge variant="default" className="text-xs">
            CONTINUOUS LOOP
          </Badge>
        </div>
        <p className="text-xs text-[#8292a8] mt-1 max-w-2xl leading-relaxed">
          How OpsMind AI observes production systems, queries persistent memory banks, formulates root cause hypotheses, and continuously evolves.
        </p>
      </div>

      {/* Visual Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.step}
              className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#28374d] transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div
                  style={{ color: st.color, backgroundColor: `${st.color}15`, borderColor: `${st.color}35` }}
                  className="h-8 w-8 rounded-lg border flex items-center justify-center"
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs font-bold text-[#4b5a6f]">
                  STAGE {st.step}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#f8fafc] group-hover:text-[#06b6d4] transition-colors">
                  {st.title}
                </h3>
                <p className="text-xs text-[#8292a8] mt-1.5 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1c2636] text-[11px] font-mono text-[#4b5a6f]">
                {st.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Agent Decisions Stream */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[#f8fafc] flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#06b6d4]" />
          <span>Recent Agent Decisions Across Telemetry</span>
        </h2>

        <div className="space-y-2.5">
          {incidents.slice(0, 5).map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              className="p-4 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#06b6d4]/50 hover:bg-[#121824] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="default">{inc.service}</Badge>
                  <span className="text-xs font-semibold text-[#f8fafc] truncate">
                    {inc.title}
                  </span>
                </div>
                <p className="text-xs text-[#8292a8] line-clamp-1">
                  <strong className="text-[#06b6d4]">Agent Diagnosis:</strong>{' '}
                  {inc.root_cause || 'Awaiting log correlation'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-[#14b8a6]">
                  {inc.similar_past_incidents?.length || 0} memory recall(s)
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#4b5a6f]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
