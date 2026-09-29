import React, { useState } from 'react';
import {
  Brain,
  Database,
  Sparkles,
  Quote,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatScore, relativeTime } from '@/lib/utils';
import type { Incident, Insight } from '@/types';

interface MemoryPageProps {
  incidents: Incident[];
  knownServices: string[];
  onReflect: (service: string, question: string) => Promise<Insight>;
  onSelectIncident: (id: string) => void;
}

export const MemoryPage: React.FC<MemoryPageProps> = ({
  incidents,
  knownServices,
  onReflect,
  onSelectIncident,
}) => {
  const [selectedService, setSelectedService] = useState(
    knownServices[0] || 'payments'
  );
  const [question, setQuestion] = useState(
    'What are the recurring failure modes and how should they be prevented?'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Group resolved incidents by service
  const serviceStats = knownServices.map((svc) => {
    const svcIncidents = incidents.filter((i) => i.service === svc);
    const resolved = svcIncidents.filter((i) => i.status === 'resolved');
    return {
      service: svc,
      bankId: `opsmind_${svc}`,
      totalIncidents: svcIncidents.length,
      resolvedCount: resolved.length,
    };
  });

  const handleRunReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !question.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await onReflect(selectedService, question);
      setInsight(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reflection failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#14b8a6]" />
          <h1 className="text-xl font-bold tracking-tight text-[#f8fafc]">
            Hindsight Memory Banks
          </h1>
          <Badge variant="memory" className="text-xs">
            VECTORIZE ENGINE
          </Badge>
        </div>
        <p className="text-xs text-[#8292a8] mt-1 max-w-2xl leading-relaxed">
          OpsMind AI maintains dedicated semantic memory banks for each microservice. Outage logs, root causes, and verified fixes are indexed as vector embeddings for immediate recall.
        </p>
      </div>

      {/* Memory Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {serviceStats.map((stat) => (
          <div
            key={stat.service}
            className={`p-5 rounded-xl border transition-all cursor-pointer ${
              selectedService === stat.service
                ? 'border-[#14b8a6] bg-[#0c131a] shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                : 'border-[#1c2636] bg-[#0c1017] hover:border-[#28374d]'
            }`}
            onClick={() => setSelectedService(stat.service)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-[#14b8a6]" />
                <span className="font-semibold text-xs text-[#f8fafc]">
                  {stat.service}
                </span>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            </div>

            <div className="font-mono text-[11px] text-[#8292a8] mb-3">
              Bank ID: <span className="text-[#06b6d4]">{stat.bankId}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1c2636]">
              <span className="text-[#8292a8]">Indexed Memories</span>
              <span className="font-mono text-[#f8fafc] font-semibold">
                {stat.resolvedCount} postmortems
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Incident Reflection Section */}
      <div className="p-6 rounded-2xl border border-[#a855f7]/30 bg-[#0c1017] space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#a855f7]" />
            <h2 className="text-sm font-semibold text-[#f8fafc]">
              Cross-Incident Memory Reflection
            </h2>
            <Badge variant="reflect" className="text-[10px]">
              SEMANTIC SYNTHESIS
            </Badge>
          </div>
          <p className="text-xs text-[#8292a8] mt-1">
            Query across the accumulated incident history of <span className="text-[#06b6d4] font-mono">{selectedService}</span> to detect macroscopic failure patterns.
          </p>
        </div>

        <form onSubmit={handleRunReflection} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-[#cbd5e1] block mb-1.5">
                Target Bank
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="h-9 w-full rounded-md border border-[#1c2636] bg-[#07090e] px-2.5 text-xs text-[#f8fafc] focus:outline-none focus:border-[#a855f7] cursor-pointer"
              >
                {knownServices.map((s) => (
                  <option key={s} value={s}>
                    {s} (opsmind_{s})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-medium text-[#cbd5e1] block mb-1.5">
                Reflection Question
              </label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about recurring causes, connection leaks, deploy regressions..."
                className="h-9 text-xs bg-[#07090e] border-[#1c2636]"
                required
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#8292a8]">
              <span>Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setQuestion(
                    'What are the recurring failure modes and how should they be prevented?'
                  )
                }
                className="underline hover:text-[#f8fafc] cursor-pointer"
              >
                Recurring failures
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() =>
                  setQuestion(
                    'Which dependency causes the most latency or connection pool issues?'
                  )
                }
                className="underline hover:text-[#f8fafc] cursor-pointer"
              >
                Pool & connection leaks
              </button>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-[#a855f7] text-white hover:bg-[#c084fc] font-semibold text-xs h-8"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {isLoading ? 'Synthesizing...' : 'Run Reflection'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#f87171] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {insight && (
          <div className="p-5 rounded-xl border border-[#a855f7]/30 bg-[#07090e] space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#a855f7] font-semibold uppercase tracking-wider">
                Synthesized Memory Insight
              </span>
              {insight.confidence !== null && (
                <span className="text-xs font-mono text-[#cbd5e1]">
                  Confidence: {formatScore(insight.confidence)}
                </span>
              )}
            </div>

            <div className="text-xs text-[#f8fafc] leading-relaxed whitespace-pre-wrap">
              {insight.answer}
            </div>

            {insight.based_on && insight.based_on.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#1c2636]">
                <span className="text-[10px] font-mono text-[#8292a8] uppercase tracking-wider block">
                  Grounding Evidence ({insight.based_on.length} memories referenced)
                </span>
                <div className="space-y-1.5">
                  {insight.based_on.map((source, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-[#0c1017] border border-[#1c2636] text-[11px] text-[#8292a8] flex items-start gap-2"
                    >
                      <Quote className="h-3 w-3 text-[#a855f7] shrink-0 mt-0.5" />
                      <span>{source.text || source.content || JSON.stringify(source)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recalled Memories & Knowledge Base */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-[#f8fafc]">
          Indexed Postmortems in Memory
        </h2>

        <div className="space-y-2.5">
          {incidents
            .filter((i) => i.status === 'resolved')
            .map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className="p-4 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#14b8a6]/50 hover:bg-[#121824] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{inc.service}</Badge>
                    <span className="text-xs font-semibold text-[#f8fafc] truncate">
                      {inc.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#8292a8] line-clamp-1">
                    <strong className="text-[#cbd5e1]">Fix:</strong> {inc.resolution}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[#4b5a6f]">
                    {relativeTime(inc.resolved_at || inc.created_at)}
                  </span>
                  <Badge variant="resolve" className="text-[10px]">
                    Indexed
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
