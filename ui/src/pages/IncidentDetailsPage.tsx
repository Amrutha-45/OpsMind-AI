import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { relativeTime, formatScore } from '@/lib/utils';
import type { Incident } from '@/types';

interface IncidentDetailsPageProps {
  incident: Incident | null;
  onBack: () => void;
  onOpenResolve: () => void;
  onSubmitFeedback: (suggestionText: string, helpful: boolean) => Promise<void>;
}

export const IncidentDetailsPage: React.FC<IncidentDetailsPageProps> = ({
  incident,
  onBack,
  onOpenResolve,
  onSubmitFeedback,
}) => {
  const [feedbackSent, setFeedbackSent] = useState<Record<string, boolean | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!incident) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#07090e] text-center space-y-4">
        <p className="text-sm text-[#8292a8]">No incident selected.</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Incidents</span>
        </Button>
      </div>
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

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-[#8292a8] hover:text-[#f8fafc] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Incidents</span>
        </button>

        <div className="flex items-center gap-3">
          {incident.status === 'open' ? (
            <Button
              size="sm"
              variant="emerald"
              onClick={onOpenResolve}
              className="text-xs gap-1.5 h-8"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Resolve Incident</span>
            </Button>
          ) : (
            <Badge variant="resolve" className="text-xs px-2.5 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Resolved ({relativeTime(incident.resolved_at || incident.created_at)})
            </Badge>
          )}
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="p-6 rounded-2xl border border-[#1c2636] bg-[#0c1017] space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant={sevKey}>{incident.severity}</Badge>
          <Badge variant="default">{incident.service}</Badge>
          <span className="font-mono text-xs text-[#06b6d4]">
            ID: {incident.id}
          </span>
          <span className="text-xs text-[#8292a8] flex items-center gap-1 ml-auto">
            <Clock className="h-3.5 w-3.5" />
            Opened {relativeTime(incident.created_at)}
          </span>
        </div>

        <h1 className="text-xl font-bold tracking-tight text-[#f8fafc]">
          {incident.title}
        </h1>

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

      {/* Complete Step-by-Step Lifecycle Walkthrough */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#1c2636] pb-3">
          <Activity className="h-4 w-4 text-[#06b6d4]" />
          <h2 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">
            Autonomous Incident Lifecycle
          </h2>
        </div>

        {/* Step 1: Incident Detected */}
        <div className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-[#f87171] font-mono text-xs font-bold">
              1
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#f8fafc]">
                Incident Detected & Ingested
              </h3>
              <p className="text-[11px] text-[#8292a8]">
                Telemetry alert received, severity scored, and service classified
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#07090e] border border-[#1c2636] font-mono text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
            {incident.description}
          </div>
        </div>

        {/* Step 2: Hindsight Memory Recall */}
        <div className="p-5 rounded-xl border border-[#14b8a6]/40 bg-gradient-to-br from-[#0c1017] to-[#0a1818] space-y-4 shadow-[0_0_20px_rgba(20,184,166,0.06)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded-md bg-[#14b8a6]/15 border border-[#14b8a6]/30 flex items-center justify-center text-[#14b8a6] font-mono text-xs font-bold">
                2
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#f8fafc] flex items-center gap-2">
                  Hindsight Continuous Memory Recall
                  <Badge variant="memory" className="text-[9px]">
                    VECTOR EMBEDDING MATCH
                  </Badge>
                </h3>
                <p className="text-[11px] text-[#8292a8]">
                  Queried bank <code className="font-mono text-[#14b8a6]">opsmind_{incident.service}</code> for previous postmortems
                </p>
              </div>
            </div>
          </div>

          {incident.similar_past_incidents && incident.similar_past_incidents.length > 0 ? (
            <div className="space-y-3">
              {incident.similar_past_incidents.map((past, idx) => {
                const wasHelpful = feedbackSent[past.text];

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-[#07090e] border border-[#1c2636] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#14b8a6] font-medium flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Recalled Memory #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#14b8a6]/10 border border-[#14b8a6]/30 font-mono text-xs text-[#14b8a6]">
                        {formatScore(past.score)} Vector Similarity
                      </span>
                    </div>

                    <p className="text-xs text-[#cbd5e1] leading-relaxed">
                      {past.text}
                    </p>

                    {/* Operator Feedback Buttons */}
                    <div className="pt-2 border-t border-[#1c2636] flex items-center justify-between">
                      <span className="text-xs text-[#8292a8]">
                        Did this recalled memory help diagnose or solve the issue?
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={wasHelpful === true ? 'emerald' : 'outline'}
                          onClick={() => handleFeedback(past.text, true)}
                          disabled={isSubmitting}
                          className="h-7 text-xs px-2.5 gap-1"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Helpful</span>
                        </Button>
                        <Button
                          size="sm"
                          variant={wasHelpful === false ? 'destructive' : 'outline'}
                          onClick={() => handleFeedback(past.text, false)}
                          disabled={isSubmitting}
                          className="h-7 text-xs px-2.5 gap-1"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>Not Helpful</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#07090e] border border-[#1c2636] text-xs text-[#8292a8] space-y-1.5">
              <p className="text-[#cbd5e1] font-medium text-sm">
                No matching memory found
              </p>
              <p className="text-[11px]">
                No sufficiently similar prior incident memories exist in bank <span className="font-mono text-[#06b6d4]">opsmind_{incident.service}</span>. Once this incident is resolved, its verified root cause and remediation will be committed to Hindsight memory for future recall.
              </p>
            </div>
          )}
        </div>

        {/* Step 3 & 4: Agent Autonomous Analysis & Recommended Fix */}
        <div className="p-5 rounded-xl border border-[#06b6d4]/40 bg-[#0c1017] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center text-[#06b6d4] font-mono text-xs font-bold">
              3 & 4
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#f8fafc]">
                Agent Autonomous Analysis & Remediation
              </h3>
              <p className="text-[11px] text-[#8292a8]">
                Diagnostic hypothesis synthesized from error telemetry and recalled memory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-[#07090e] border border-[#1c2636] space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[#06b6d4] font-bold">
                Root Cause Diagnosis
              </div>
              <div className="text-xs text-[#cbd5e1] leading-relaxed">
                {incident.root_cause || (
                  <span className="text-[#8292a8] italic">
                    Synthesizing logs and telemetry with memory patterns...
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#07090e] border border-[#1c2636] space-y-1.5">
              <div className="text-[10px] font-mono uppercase text-[#10b981] font-bold">
                Recommended Remediation Plan
              </div>
              <div className="text-xs text-[#cbd5e1] leading-relaxed">
                {incident.resolution || (
                  <span className="text-[#8292a8] italic">
                    Ready to execute runbook hotfix or configuration patch.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 5 & 6: Verification, Resolution & Memory Update */}
        <div className="p-5 rounded-xl border border-[#10b981]/40 bg-[#0c1017] space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] font-mono text-xs font-bold">
              5 & 6
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#f8fafc]">
                Verification & Memory Commitment
              </h3>
              <p className="text-[11px] text-[#8292a8]">
                Permanent indexing into the microservice Hindsight memory bank
              </p>
            </div>
          </div>

          {incident.status === 'resolved' ? (
            <div className="p-4 rounded-lg bg-[#07090e] border border-[#10b981]/30 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-[#10b981]">
                  Verified & Committed to Hindsight Memory Bank
                </h4>
                <p className="text-[#8292a8] text-[11px] leading-relaxed">
                  This incident's diagnosed root cause and applied fix have been embedded and stored into <code className="font-mono text-[#cbd5e1]">opsmind_{incident.service}</code>. Any team member facing this failure mode in the future will achieve instant resolution.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#07090e] border border-[#1c2636] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#f8fafc]">
                  Awaiting Operator Resolution
                </div>
                <div className="text-[11px] text-[#8292a8]">
                  Apply the recommended fix and resolve the incident to commit this learning to memory.
                </div>
              </div>

              <Button
                variant="emerald"
                size="sm"
                onClick={onOpenResolve}
                className="text-xs shrink-0"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                <span>Resolve & Store Memory</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
