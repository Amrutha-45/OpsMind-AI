import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BarChart3, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Incident, LearningStats } from '@/types';

interface ScoreboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: LearningStats | null;
  incidents: Incident[];
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  open,
  onOpenChange,
  stats,
  incidents,
}) => {
  const total = incidents.length;
  const resolved = incidents.filter((i) => i.status === 'resolved').length;
  const openCount = total - resolved;

  const sevBreakdown = incidents.reduce((acc, inc) => {
    acc[inc.severity] = (acc[inc.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const acceptanceRate = stats?.acceptance_rate
    ? `${Math.round(stats.acceptance_rate * 100)}%`
    : '100%';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#06b6d4]/15 text-[#06b6d4] flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <DialogTitle>OpsMind Memory Scoreboard</DialogTitle>
          </div>
          <DialogDescription>
            Continuous metrics tracking how effectively Hindsight memory recalls lead to verified incident resolutions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-3 rounded-xl bg-[#07090e] border border-[#1c2636]">
              <div className="text-[10px] text-[#8292a8]">Total Incidents</div>
              <div className="text-xl font-bold font-mono text-[#f8fafc]">
                {total}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#07090e] border border-[#1c2636]">
              <div className="text-[10px] text-[#8292a8]">Resolved</div>
              <div className="text-xl font-bold font-mono text-[#10b981]">
                {resolved}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#07090e] border border-[#1c2636]">
              <div className="text-[10px] text-[#8292a8]">Acceptance</div>
              <div className="text-xl font-bold font-mono text-[#06b6d4]">
                {acceptanceRate}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#07090e] border border-[#1c2636]">
              <div className="text-[10px] text-[#8292a8]">Active Open</div>
              <div className="text-xl font-bold font-mono text-[#f87171]">
                {openCount}
              </div>
            </div>
          </div>

          {/* Feedback Stats */}
          <div className="p-4 rounded-xl border border-[#1c2636] bg-[#090d14] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                <ThumbsUp className="h-3.5 w-3.5 text-[#10b981]" />
                Operator Feedback on Recalled Suggestions
              </span>
              <span className="text-xs font-mono text-[#8292a8]">
                {stats?.total_feedback || 0} reviews
              </span>
            </div>

            <div className="h-2 w-full bg-[#121824] rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${
                    stats?.total_feedback
                      ? ((stats.helpful || 0) / stats.total_feedback) * 100
                      : 100
                  }%`,
                }}
                className="bg-[#10b981] transition-all"
              />
              <div
                style={{
                  width: `${
                    stats?.total_feedback
                      ? ((stats.not_helpful || 0) / stats.total_feedback) * 100
                      : 0
                  }%`,
                }}
                className="bg-[#ef4444] transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#10b981] flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                Helpful: {stats?.helpful || 0}
              </span>
              <span className="text-[#ef4444] flex items-center gap-1">
                <ThumbsDown className="h-3 w-3" />
                Not helpful: {stats?.not_helpful || 0}
              </span>
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="p-3 rounded-xl border border-[#1c2636] bg-[#090d14] space-y-2">
            <span className="text-[11px] font-mono uppercase text-[#8292a8]">
              Severity Distribution
            </span>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {(['SEV1', 'SEV2', 'SEV3', 'SEV4'] as const).map((sev) => (
                <div
                  key={sev}
                  className="p-2 rounded bg-[#07090e] border border-[#1c2636]"
                >
                  <div className="text-[10px] text-[#8292a8]">{sev}</div>
                  <div className="font-mono font-bold text-[#f8fafc]">
                    {sevBreakdown[sev] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
