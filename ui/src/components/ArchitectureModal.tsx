import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Layers, ArrowRight, Brain, Cpu, Database } from 'lucide-react';

interface ArchitectureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#10b981]/15 text-[#10b981] flex items-center justify-center">
              <Layers className="h-3.5 w-3.5" />
            </div>
            <DialogTitle>OpsMind AI Architecture</DialogTitle>
          </div>
          <DialogDescription>
            Autonomous DevOps incident response powered by Hindsight continuous memory banks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Visual Architecture Diagram */}
          <div className="p-4 rounded-xl border border-[#1c2636] bg-[#07090e] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Box 1 */}
              <div className="p-3 rounded-lg border border-[#1c2636] bg-[#0c1017] space-y-2">
                <div className="flex items-center gap-1.5 text-[#06b6d4] font-semibold">
                  <Cpu className="h-4 w-4" />
                  <span>1. Ingestion</span>
                </div>
                <p className="text-[11px] text-[#8292a8] leading-relaxed">
                  Alerts from Prometheus, Datadog, or Sentry arrive. The agent classifies service, severity, and error signatures.
                </p>
              </div>

              {/* Box 2 */}
              <div className="p-3 rounded-lg border border-[#14b8a6]/40 bg-[#0c131a] space-y-2 shadow-[0_0_15px_rgba(20,184,166,0.08)]">
                <div className="flex items-center gap-1.5 text-[#14b8a6] font-semibold">
                  <Brain className="h-4 w-4" />
                  <span>2. Hindsight Recall</span>
                </div>
                <p className="text-[11px] text-[#8292a8] leading-relaxed">
                  Queries bank <code className="text-[#14b8a6]">opsmind_&lt;service&gt;</code> using Vectorize embeddings. Recalls past root causes and fixes.
                </p>
              </div>

              {/* Box 3 */}
              <div className="p-3 rounded-lg border border-[#10b981]/40 bg-[#0a1814] space-y-2">
                <div className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                  <Database className="h-4 w-4" />
                  <span>3. Continuous Synthesis</span>
                </div>
                <p className="text-[11px] text-[#8292a8] leading-relaxed">
                  Upon resolution, the diagnosed cause and fix are committed back to the memory bank for institutional knowledge.
                </p>
              </div>
            </div>

            {/* Loop Description */}
            <div className="p-3 rounded-lg bg-[#0c1017] border border-[#1c2636] flex items-center justify-between text-[11px] text-[#cbd5e1]">
              <span className="font-mono text-[#06b6d4]">Telemetry Alert</span>
              <ArrowRight className="h-3 w-3 text-[#4b5a6f]" />
              <span className="font-mono text-[#14b8a6]">Vector Similarity</span>
              <ArrowRight className="h-3 w-3 text-[#4b5a6f]" />
              <span className="font-mono text-[#f8fafc]">Autonomous Remediation</span>
              <ArrowRight className="h-3 w-3 text-[#4b5a6f]" />
              <span className="font-mono text-[#10b981]">Postmortem Synthesized</span>
            </div>
          </div>

          {/* Key Capabilities */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[#1c2636] bg-[#090d14] space-y-1.5">
              <h4 className="font-semibold text-[#f8fafc]">Why Hindsight (Vectorize)?</h4>
              <p className="text-[11px] text-[#8292a8] leading-relaxed">
                Standard LLM agents suffer from amnesia between sessions. Hindsight provides persistent vector memory banks per microservice, allowing OpsMind to recall identical outage patterns from months ago in milliseconds.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-[#1c2636] bg-[#090d14] space-y-1.5">
              <h4 className="font-semibold text-[#f8fafc]">Cross-Incident Reflection</h4>
              <p className="text-[11px] text-[#8292a8] leading-relaxed">
                Beyond 1-to-1 similarity matching, Hindsight reflection lets SREs query macroscopic patterns across multiple incidents (e.g. chronic memory leaks, fragile database pools) to prevent outages before they happen.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
