import React from 'react';
import {
  Layers,
  Brain,
  Cpu,
  Database,
  ArrowRight,
  Radio,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-[#34d399]" />
          <h1 className="text-xl font-bold tracking-tight text-[#f8fafc]">
            System Architecture
          </h1>
          <Badge variant="resolve" className="text-xs">
            HINDSIGHT POWERED
          </Badge>
        </div>
        <p className="text-xs text-[#8292a8] mt-1 max-w-2xl leading-relaxed">
          How OpsMind AI integrates with Hindsight (Vectorize) to build an autonomous, self-learning incident response platform with persistent institutional memory.
        </p>
      </div>

      {/* Visual Architectural Flow */}
      <div className="p-6 rounded-2xl border border-[#1c2636] bg-[#0c1017] space-y-6">
        <h2 className="text-sm font-semibold text-[#f8fafc] uppercase tracking-wider">
          End-to-End Incident Memory Loop
        </h2>

        {/* 3 Major Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Telemetry & Ingestion */}
          <div className="p-5 rounded-xl border border-[#1c2636] bg-[#07090e] space-y-3">
            <div className="flex items-center gap-2 text-[#ef4444]">
              <Radio className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">
                1. Telemetry Ingestion
              </span>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Alerts from monitoring systems (Prometheus, Datadog, Sentry) trigger new incident records with stack traces, error messages, and service tags.
            </p>
            <div className="p-2.5 rounded bg-[#0c1017] border border-[#1c2636] font-mono text-[11px] text-[#8292a8]">
              Target: /incidents (POST)
            </div>
          </div>

          {/* Pillar 2: Hindsight Memory Bank */}
          <div className="p-5 rounded-xl border border-[#14b8a6]/40 bg-[#0c131a] space-y-3 shadow-[0_0_20px_rgba(20,184,166,0.06)]">
            <div className="flex items-center gap-2 text-[#14b8a6]">
              <Brain className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">
                2. Vector Semantic Recall
              </span>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              The agent embeds incoming logs and queries microservice banks (e.g. <code className="text-[#14b8a6]">opsmind_payments</code>) for past incident postmortems with high vector similarity.
            </p>
            <div className="p-2.5 rounded bg-[#07090e] border border-[#1c2636] font-mono text-[11px] text-[#14b8a6]">
              Engine: Vectorize Embeddings
            </div>
          </div>

          {/* Pillar 3: Synthesis & Indexing */}
          <div className="p-5 rounded-xl border border-[#10b981]/40 bg-[#0a1814] space-y-3">
            <div className="flex items-center gap-2 text-[#10b981]">
              <Database className="h-4 w-4" />
              <span className="font-semibold text-xs uppercase tracking-wider">
                3. Permanent Memory Index
              </span>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              Upon incident resolution, the verified root cause and applied remediation are committed back into Hindsight so future regressions are resolved in seconds.
            </p>
            <div className="p-2.5 rounded bg-[#07090e] border border-[#1c2636] font-mono text-[11px] text-[#10b981]">
              Lifecycle: Continuous Evolution
            </div>
          </div>
        </div>

        {/* Step-by-step Connection Bar */}
        <div className="p-3.5 rounded-xl bg-[#07090e] border border-[#1c2636] flex flex-wrap items-center justify-between gap-2 text-xs text-[#cbd5e1]">
          <span className="font-mono text-[#ef4444]">Alert Ingested</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#4b5a6f]" />
          <span className="font-mono text-[#14b8a6]">Memory Bank Recalled</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#4b5a6f]" />
          <span className="font-mono text-[#06b6d4]">Autonomous Diagnosis</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#4b5a6f]" />
          <span className="font-mono text-[#a855f7]">Operator Feedback</span>
          <ArrowRight className="h-3.5 w-3.5 text-[#4b5a6f]" />
          <span className="font-mono text-[#10b981]">Postmortem Indexed</span>
        </div>
      </div>

      {/* Deep-Dive Architectural Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deep Dive 1 */}
        <div className="p-6 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#06b6d4]" />
            <h3 className="text-sm font-semibold text-[#f8fafc]">
              Why Hindsight (Vectorize) Matters
            </h3>
          </div>
          <p className="text-xs text-[#8292a8] leading-relaxed">
            Standard AI coding or DevOps assistants suffer from stateless session amnesia. When an outage repeats two weeks later, traditional assistants have to rediscover the root cause from scratch. Hindsight gives OpsMind AI dedicated, persistent vector memory banks per microservice, allowing it to remember past outages across teams, months, and deployments.
          </p>
        </div>

        {/* Deep Dive 2 */}
        <div className="p-6 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#a855f7]" />
            <h3 className="text-sm font-semibold text-[#f8fafc]">
              Cross-Incident Memory Reflection
            </h3>
          </div>
          <p className="text-xs text-[#8292a8] leading-relaxed">
            Beyond 1-to-1 similarity search on a single incident, Hindsight reflection enables SRE teams to analyze macroscopic trends across months of outages. The <code className="text-[#a855f7]">/reflect</code> endpoint synthesizes answers to questions like "What chronic connection pool bugs occur after deployments?" grounded in real postmortems with verifiable confidence scores.
          </p>
        </div>
      </div>
    </div>
  );
};
