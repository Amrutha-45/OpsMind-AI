import React from 'react';
import {
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Incident, LearningStats } from '@/types';

interface ScoreboardPageProps {
  stats: LearningStats | null;
  incidents: Incident[];
}

export const ScoreboardPage: React.FC<ScoreboardPageProps> = ({
  stats,
  incidents,
}) => {
  const totalIncidents = incidents.length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolved').length;

  const totalFeedback = stats?.total_feedback ?? 0;
  const helpfulCount = stats?.helpful ?? 0;
  const notHelpfulCount = stats?.not_helpful ?? 0;

  const acceptanceRate = stats?.acceptance_rate
    ? `${Math.round(stats.acceptance_rate * 100)}%`
    : totalFeedback === 0
    ? '100%'
    : `${Math.round((helpfulCount / totalFeedback) * 100)}%`;

  const sevBreakdown = incidents.reduce((acc, inc) => {
    acc[inc.severity] = (acc[inc.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#38bdf8]" />
          <h1 className="text-xl font-bold tracking-tight text-[#f8fafc]">
            Learning & Performance Scoreboard
          </h1>
          <Badge variant="default" className="text-xs">
            CONTINUOUS EVALUATION
          </Badge>
        </div>
        <p className="text-xs text-[#8292a8] mt-1 max-w-2xl leading-relaxed">
          Measurable evaluation of how accurately Hindsight memory recalls lead to verified remediations across production microservices.
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Incidents */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-2">
          <span className="text-xs text-[#8292a8] uppercase tracking-wider font-medium">
            Total Incidents
          </span>
          <div className="text-3xl font-bold font-mono text-[#f8fafc]">
            {totalIncidents}
          </div>
          <p className="text-[11px] text-[#8292a8]">
            Ingested across all microservices
          </p>
        </div>

        {/* Card 2: Resolved */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-2">
          <span className="text-xs text-[#8292a8] uppercase tracking-wider font-medium">
            Resolved & Indexed
          </span>
          <div className="text-3xl font-bold font-mono text-[#10b981]">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-[#8292a8]">
            {totalIncidents > 0
              ? `${Math.round((resolvedCount / totalIncidents) * 100)}% resolution rate`
              : 'Zero downtime recorded'}
          </p>
        </div>

        {/* Card 3: Acceptance Rate */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-2">
          <span className="text-xs text-[#8292a8] uppercase tracking-wider font-medium">
            Acceptance Rate
          </span>
          <div className="text-3xl font-bold font-mono text-[#06b6d4]">
            {acceptanceRate}
          </div>
          <p className="text-[11px] text-[#8292a8]">
            Operator validation of recalled fixes
          </p>
        </div>

        {/* Card 4: Feedback Reviews */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-2">
          <span className="text-xs text-[#8292a8] uppercase tracking-wider font-medium">
            Operator Reviews
          </span>
          <div className="text-3xl font-bold font-mono text-[#a855f7]">
            {totalFeedback}
          </div>
          <p className="text-[11px] text-[#8292a8]">
            Human-in-the-loop interactions
          </p>
        </div>
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Feedback Quality Bar */}
        <div className="p-6 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f8fafc] flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-[#10b981]" />
              Operator Feedback on Memory Recalls
            </h2>
            <span className="text-xs font-mono text-[#8292a8]">
              {totalFeedback} total reviews
            </span>
          </div>

          <div className="space-y-3">
            <div className="h-3 w-full bg-[#121824] rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${
                    totalFeedback > 0 ? (helpfulCount / totalFeedback) * 100 : 100
                  }%`,
                }}
                className="bg-[#10b981] transition-all duration-300"
              />
              <div
                style={{
                  width: `${
                    totalFeedback > 0 ? (notHelpfulCount / totalFeedback) * 100 : 0
                  }%`,
                }}
                className="bg-[#ef4444] transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#10b981] flex items-center gap-1.5 font-medium">
                <ThumbsUp className="h-3.5 w-3.5" />
                Helpful: {helpfulCount}
              </span>
              <span className="text-[#ef4444] flex items-center gap-1.5 font-medium">
                <ThumbsDown className="h-3.5 w-3.5" />
                Not Helpful: {notHelpfulCount}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#8292a8] leading-relaxed">
            Every thumbs-up or thumbs-down submitted on recalled suggestions is logged directly to the learning engine. This ensures the memory bank continuously reinforces high-efficacy runbooks.
          </p>
        </div>

        {/* Right: Severity Breakdown */}
        <div className="p-6 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f8fafc] flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#f87171]" />
              Incident Severity Distribution
            </h2>
            <span className="text-xs font-mono text-[#8292a8]">
              {totalIncidents} incidents
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            {(['SEV1', 'SEV2', 'SEV3', 'SEV4'] as const).map((sev) => {
              const count = sevBreakdown[sev] || 0;
              const sevKey = sev.toLowerCase() as
                | 'sev1'
                | 'sev2'
                | 'sev3'
                | 'sev4';

              return (
                <div
                  key={sev}
                  className="p-3.5 rounded-lg bg-[#07090e] border border-[#1c2636] space-y-1.5"
                >
                  <Badge variant={sevKey}>{sev}</Badge>
                  <div className="text-xl font-bold font-mono text-[#f8fafc]">
                    {count}
                  </div>
                  <div className="text-[10px] text-[#4b5a6f]">
                    {totalIncidents > 0
                      ? `${Math.round((count / totalIncidents) * 100)}%`
                      : '0%'}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#8292a8] leading-relaxed">
            SEV1 critical outages and SEV2 degradations receive immediate automated memory recall to minimize MTTR (Mean Time to Resolution).
          </p>
        </div>
      </div>
    </div>
  );
};
