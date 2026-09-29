import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Brain,
  ThumbsUp,
  ArrowRight,
  Plus,
  Database,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { relativeTime } from '@/lib/utils';
import type { Incident, LearningStats } from '@/types';

interface OverviewPageProps {
  incidents: Incident[];
  stats: LearningStats | null;
  onNavigateToIncidents: () => void;
  onSelectIncident: (id: string) => void;
  onOpenNewIncident: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
  knownServices: string[];
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  incidents,
  stats,
  onNavigateToIncidents,
  onSelectIncident,
  onOpenNewIncident,
  onSeedDemo,
  isSeeding,
  knownServices,
}) => {
  const activeCount = incidents.filter((i) => i.status === 'open').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;
  const totalRecalls = incidents.reduce(
    (acc, i) => acc + (i.similar_past_incidents?.length || 0),
    0
  );

  const acceptanceRate = stats?.acceptance_rate
    ? `${Math.round(stats.acceptance_rate * 100)}%`
    : '100%';

  const recentIncidents = incidents.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Hero Welcome / System Status Banner */}
      <div className="relative rounded-2xl border border-[#1c2636] bg-gradient-to-r from-[#0c1017] via-[#0e141f] to-[#0c1017] p-6 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#06b6d4]/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-mono text-[#10b981] font-semibold tracking-wider uppercase">
                Continuous Memory Engine Active
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc]">
              Autonomous Incident Memory & Response
            </h1>
            <p className="text-sm text-[#8292a8] leading-relaxed">
              OpsMind AI indexes every production outage into persistent Hindsight memory banks. When a new regression occurs, past postmortems and proven fixes are recalled instantly in milliseconds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="text-xs h-9 border-[#1c2636] bg-[#121824] text-[#cbd5e1] hover:bg-[#172030]"
            >
              <Database className="h-4 w-4 mr-1.5 text-[#8292a8]" />
              <span>{isSeeding ? 'Seeding Data...' : 'Seed Sample Incidents'}</span>
            </Button>
            <Button
              onClick={onOpenNewIncident}
              className="text-xs h-9 bg-[#06b6d4] text-[#07090e] font-semibold hover:bg-[#22d3ee] shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>Open Incident</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Incidents */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#28374d] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8292a8] uppercase tracking-wider">
              Active Outages
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/25 flex items-center justify-center text-[#f87171]">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#f8fafc] flex items-center gap-2">
              {activeCount}
              {activeCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-[#f87171] animate-ping" />
              )}
            </div>
            <p className="text-xs text-[#8292a8] mt-1">
              {activeCount === 0
                ? 'All services operational'
                : 'Awaiting operator verification'}
            </p>
          </div>
        </div>

        {/* Card 2: Resolved Incidents */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#28374d] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8292a8] uppercase tracking-wider">
              Resolved & Indexed
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/25 flex items-center justify-center text-[#10b981]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#10b981]">
              {resolvedCount}
            </div>
            <p className="text-xs text-[#8292a8] mt-1">
              Postmortems stored in memory
            </p>
          </div>
        </div>

        {/* Card 3: Memory Recalls */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#28374d] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8292a8] uppercase tracking-wider">
              Memory Recalls
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#14b8a6]/10 border border-[#14b8a6]/25 flex items-center justify-center text-[#14b8a6]">
              <Brain className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#14b8a6]">
              {totalRecalls}
            </div>
            <p className="text-xs text-[#8292a8] mt-1">
              Vector matches across banks
            </p>
          </div>
        </div>

        {/* Card 4: Operator Acceptance Rate */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#28374d] transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8292a8] uppercase tracking-wider">
              Acceptance Rate
            </span>
            <div className="h-8 w-8 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/25 flex items-center justify-center text-[#06b6d4]">
              <ThumbsUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#06b6d4]">
              {acceptanceRate}
            </div>
            <p className="text-xs text-[#8292a8] mt-1">
              Helpful operator feedback
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Incidents Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#f8fafc]">
                Recent Incident Stream
              </h2>
              <p className="text-xs text-[#8292a8]">
                Real-time alerts processed with Hindsight memory recall
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToIncidents}
              className="text-xs text-[#06b6d4] hover:text-[#22d3ee] gap-1"
            >
              <span>View all incidents</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2.5">
            {recentIncidents.length === 0 ? (
              <div className="p-8 rounded-xl border border-[#1c2636] bg-[#0c1017] text-center space-y-3">
                <Radio className="h-8 w-8 mx-auto text-[#4b5a6f]" />
                <p className="text-xs text-[#8292a8]">
                  No incidents recorded yet. Click "Seed Sample Incidents" or "Open Incident" to simulate an alert.
                </p>
              </div>
            ) : (
              recentIncidents.map((inc) => {
                const sevKey = inc.severity.toLowerCase() as
                  | 'sev1'
                  | 'sev2'
                  | 'sev3'
                  | 'sev4';

                return (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc.id)}
                    className="p-4 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#06b6d4]/50 hover:bg-[#121824] transition-all cursor-pointer group flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={sevKey}>{inc.severity}</Badge>
                        <Badge variant="default" className="text-[10px]">
                          {inc.service}
                        </Badge>
                        <span className="text-[11px] text-[#4b5a6f]">
                          {relativeTime(inc.created_at)}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-[#f8fafc] group-hover:text-[#06b6d4] transition-colors truncate">
                        {inc.title}
                      </h3>

                      <p className="text-xs text-[#8292a8] line-clamp-1">
                        {inc.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {inc.status === 'open' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />
                          Open
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="iconSm"
                        className="text-[#8292a8] group-hover:text-[#06b6d4]"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 1 Col: Memory Banks & How It Works */}
        <div className="space-y-6">
          {/* Active Memory Banks */}
          <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#f8fafc] flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-[#14b8a6]" />
                Active Memory Banks
              </h3>
              <Badge variant="memory" className="text-[9px]">
                Vectorize
              </Badge>
            </div>

            <div className="space-y-2">
              {knownServices.map((svc) => (
                <div
                  key={svc}
                  className="p-2.5 rounded-lg bg-[#07090e] border border-[#1c2636] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-mono text-[#f8fafc] font-medium">
                      {svc}
                    </div>
                    <div className="text-[10px] font-mono text-[#8292a8]">
                      bank: opsmind_{svc}
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Explainer for Beginners */}
          <div className="p-5 rounded-xl border border-[#1c2636] bg-gradient-to-br from-[#0c1017] to-[#121824] space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#f8fafc]">
              <Sparkles className="h-3.5 w-3.5 text-[#a855f7]" />
              <span>How OpsMind AI Works</span>
            </div>

            <ul className="space-y-2 text-xs text-[#8292a8] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#06b6d4] font-bold">1.</span>
                <span>An alert triggers an incident with error logs and stack traces.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#14b8a6] font-bold">2.</span>
                <span>Hindsight performs vector semantic search across the service memory bank.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#a855f7] font-bold">3.</span>
                <span>The autonomous agent matches identical past outages and proposes a fix.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono text-[#10b981] font-bold">4.</span>
                <span>Verified resolutions are indexed permanently to prevent repeat downtime.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
