import React, { useState } from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { relativeTime, formatScore } from '@/lib/utils';
import type { Incident } from '@/types';

interface IncidentWorkspaceProps {
  incident: Incident | null;
  onOpenResolve: () => void;
  onSubmitFeedback: (suggestionText: string, helpful: boolean) => Promise<void>;
}

export const IncidentWorkspace: React.FC<IncidentWorkspaceProps> = ({
  incident,
  onOpenResolve,
  onSubmitFeedback,
}) => {
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!incident) {
    return (
      <main className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-[#07090e] text-center select-none">
        <div className="max-w-md space-y-4">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-[#121824] border border-[#1c2636] flex items-center justify-center text-[#06b6d4] shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Brain className="h-7 w-7" />
          </div>
          <h3 className="text-base font-semibold text-[#f8fafc]">
            Select an Incident to Inspect
          </h3>
          <p className="text-xs text-[#8292a8] leading-relaxed">
            OpsMind AI connects with Hindsight (Vectorize) memory banks to automatically recall past root causes, runbook fixes, and autonomous remediation plans.
          </p>
          <div className="p-3 rounded-lg bg-[#0c1017] border border-[#1c2636] text-[11px] text-[#4b5a6f] font-mono text-left space-y-1">
            <div>1. Ingestion: SEV alert arrives from telemetry</div>
            <div>2. Recall: Hindsight queries memory bank</div>
            <div>3. Reason: Agent formulates remediation plan</div>
            <div>4. Learn: Resolution permanently indexed</div>
          </div>
        </div>
      </main>
    );
  }

  const sevKey = incident.severity.toLowerCase() as
    | 'sev1'
    | 'sev2'
    | 'sev3'
    | 'sev4';

  const handleFeedback = async (suggestion: string, helpful: boolean) => {
    setIsSubmitting(true);
    try {
      await onSubmitFeedback(suggestion, helpful);
      setFeedbackSent((prev) => ({ ...prev, [suggestion]: helpful }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const topMatch = incident.similar_past_incidents?.[0];

  return (
    <main className="flex-1 h-full flex flex-col bg-[#07090e] overflow-hidden">
      {/* Top Banner / Breadcrumb */}
      <div className="h-12 border-b border-[#1c2636] bg-[#0c1017] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#4b5a6f]">Incidents</span>
          <span className="text-[#28374d]">/</span>
          <span className="font-mono text-[#06b6d4]">{incident.id}</span>
          <span className="text-[#28374d]">/</span>
          <span className="font-mono text-[#cbd5e1]">{incident.service}</span>
        </div>

        <div>
          {incident.status === 'open' ? (
            <Button
              size="sm"
              variant="emerald"
              onClick={onOpenResolve}
              className="text-xs gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Resolve Incident</span>
            </Button>
          ) : (
            <Badge variant="resolve" className="text-xs px-2 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Resolved ({relativeTime(incident.resolved_at || incident.created_at)})
            </Badge>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-5">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Main Title Card */}
          <div className="p-4 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={sevKey}>{incident.severity}</Badge>
              <Badge variant="default">{incident.service}</Badge>
              <span className="text-xs text-[#8292a8] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Opened {relativeTime(incident.created_at)}
              </span>
            </div>

            <h2 className="text-base font-bold text-[#f8fafc] leading-snug">
              {incident.title}
            </h2>

            <div className="p-3 rounded-lg bg-[#07090e] border border-[#1c2636] text-xs text-[#cbd5e1] font-mono whitespace-pre-wrap leading-relaxed">
              {incident.description}
            </div>

            {incident.tags && incident.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {incident.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[#121824] border border-[#1c2636] text-[10px] text-[#8292a8] font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 🧠 Hindsight Recall Section */}
          <div className="rounded-xl border border-[#14b8a6]/30 bg-gradient-to-br from-[#0c1017] via-[#0c131a] to-[#0a1818] p-4 shadow-[0_0_20px_rgba(20,184,166,0.06)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#14b8a6]/15 border border-[#14b8a6]/40 flex items-center justify-center text-[#14b8a6]">
                  <Brain className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#f8fafc] flex items-center gap-2">
                    Hindsight Memory Recall
                    <Badge variant="memory" className="text-[9px]">
                      VECTOR MATCH
                    </Badge>
                  </h3>
                  <p className="text-[10px] text-[#8292a8]">
                    Bank: opsmind_{incident.service} · Autonomous similarity search
                  </p>
                </div>
              </div>

              {topMatch && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#14b8a6]/10 border border-[#14b8a6]/30 text-[11px] font-mono text-[#14b8a6]">
                  <Sparkles className="h-3 w-3" />
                  <span>{formatScore(topMatch.score)} Match</span>
                </div>
              )}
            </div>

            {incident.similar_past_incidents && incident.similar_past_incidents.length > 0 ? (
              <div className="space-y-3">
                {incident.similar_past_incidents.map((past, idx) => {
                  const wasHelpful = feedbackSent[past.text];

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#07090e]/90 border border-[#1c2636] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] text-[#14b8a6] uppercase tracking-wider">
                          Recalled Memory #{idx + 1}
                        </span>
                        <span className="text-[10px] text-[#4b5a6f] font-mono">
                          Score: {formatScore(past.score)}
                        </span>
                      </div>

                      <p className="text-xs text-[#cbd5e1] leading-relaxed">
                        {past.text}
                      </p>

                      {/* Human-in-the-loop Feedback Buttons */}
                      <div className="pt-2 border-t border-[#1c2636] flex items-center justify-between">
                        <span className="text-[11px] text-[#8292a8]">
                          Was this recalled insight helpful?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant={wasHelpful === true ? 'emerald' : 'outline'}
                            onClick={() => handleFeedback(past.text, true)}
                            disabled={isSubmitting}
                            className="h-6 text-[10px] px-2 gap-1"
                          >
                            <ThumbsUp className="h-2.5 w-2.5" />
                            <span>Helpful</span>
                          </Button>
                          <Button
                            size="sm"
                            variant={wasHelpful === false ? 'destructive' : 'outline'}
                            onClick={() => handleFeedback(past.text, false)}
                            disabled={isSubmitting}
                            className="h-6 text-[10px] px-2 gap-1"
                          >
                            <ThumbsDown className="h-2.5 w-2.5" />
                            <span>Not Helpful</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#07090e]/70 border border-[#1c2636] text-xs text-[#8292a8] space-y-1.5">
                <p className="text-[#cbd5e1] font-medium text-sm">
                  No matching memory found
                </p>
                <p className="text-[11px]">
                  No sufficiently similar prior incident memories exist in bank <span className="font-mono text-[#06b6d4]">opsmind_{incident.service}</span>. When this incident is resolved, OpsMind will automatically index its root cause and remediation into Hindsight memory so future regressions can be resolved immediately.
                </p>
              </div>
            )}
          </div>

          {/* 🤖 Agent Diagnostics & Remediation Plan */}
          <div className="rounded-xl border border-[#06b6d4]/30 bg-[#0c1017] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#06b6d4]/15 border border-[#06b6d4]/40 flex items-center justify-center text-[#06b6d4]">
                <Wrench className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#f8fafc]">
                  Autonomous Agent Plan
                </h3>
                <p className="text-[10px] text-[#8292a8]">
                  Automated diagnosis synthesized with past runbook history
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#07090e] border border-[#1c2636] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#06b6d4]">
                  Root Cause Diagnosis
                </div>
                <div className="text-[#cbd5e1] leading-relaxed">
                  {incident.root_cause || (
                    <span className="text-[#8292a8] italic">
                      Correlating logs and telemetry with memory patterns...
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#07090e] border border-[#1c2636] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#10b981]">
                  Recommended Remediation
                </div>
                <div className="text-[#cbd5e1] leading-relaxed">
                  {incident.resolution || (
                    <span className="text-[#8292a8] italic">
                      Ready to execute runbook hotfix or configuration patch.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resolved State Confirmation */}
          {incident.status === 'resolved' && (
            <div className="p-4 rounded-xl border border-[#10b981]/30 bg-[#0c1017] flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-[#10b981]">
                  Incident Successfully Resolved & Indexed
                </h4>
                <p className="text-[#8292a8] text-[11px] leading-relaxed">
                  The verified root cause and fix have been synthesized and stored in the Hindsight bank for <code className="font-mono text-[#cbd5e1]">{incident.service}</code>. Any similar failure in the future will achieve instant recall with high confidence.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </main>
  );
};
