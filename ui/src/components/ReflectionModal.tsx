import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Sparkles, AlertCircle, Quote } from 'lucide-react';
import { formatScore } from '@/lib/utils';
import type { Insight } from '@/types';

interface ReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knownServices: string[];
  initialService?: string;
  onReflect: (service: string, question: string) => Promise<Insight>;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  open,
  onOpenChange,
  knownServices,
  initialService = 'auth-service',
  onReflect,
}) => {
  const [service, setService] = useState(initialService);
  const [question, setQuestion] = useState(
    'What are the recurring failure modes and how should they be prevented?'
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Insight | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service.trim() || !question.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const insight = await onReflect(service, question);
      setResult(insight);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reflection query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#a855f7]/15 text-[#a855f7] flex items-center justify-center">
              <Brain className="h-3.5 w-3.5" />
            </div>
            <DialogTitle>Cross-Incident Memory Reflection</DialogTitle>
          </div>
          <DialogDescription>
            Ask high-level questions across the accumulated incident history of any service using Hindsight reflection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRun} className="space-y-3 pt-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                Target Service
              </label>
              <input
                list="reflect-services"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. auth-service"
                className="flex h-8 w-full rounded-md border border-[#1c2636] bg-[#07090e] px-2 text-xs text-[#f8fafc] focus:outline-none focus:border-[#a855f7]"
                required
              />
              <datalist id="reflect-services">
                {knownServices.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div className="col-span-2">
              <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                Reflection Question
              </label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What caused repeated timeouts in the last sprint?"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] text-[#8292a8]">
              <span>Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setQuestion(
                    'What are the recurring failure modes and how should they be prevented?'
                  )
                }
                className="underline hover:text-[#f8fafc]"
              >
                Recurring failures
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() =>
                  setQuestion(
                    'Which dependency causes the most latency or connection issues?'
                  )
                }
                className="underline hover:text-[#f8fafc]"
              >
                Flaky dependencies
              </button>
            </div>

            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-[#a855f7] text-white hover:bg-[#c084fc] font-semibold text-xs"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {loading ? 'Synthesizing...' : 'Run Reflection'}
            </Button>
          </div>
        </form>

        {error && (
          <div className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#f87171] flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="p-4 rounded-xl border border-[#a855f7]/30 bg-[#07090e] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#a855f7] uppercase tracking-wider">
                  Synthesized Memory Insight
                </span>
                {result.confidence !== null && (
                  <span className="text-[10px] font-mono text-[#cbd5e1]">
                    Confidence: {formatScore(result.confidence)}
                  </span>
                )}
              </div>

              <div className="text-xs text-[#f8fafc] leading-relaxed whitespace-pre-wrap">
                {result.answer}
              </div>
            </div>

            {result.based_on && result.based_on.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#8292a8] uppercase tracking-wider block">
                  Grounding Evidence ({result.based_on.length} memories)
                </span>
                <div className="space-y-1.5">
                  {result.based_on.map((source, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[#090d14] border border-[#1c2636] text-[11px] text-[#8292a8] flex items-start gap-2"
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
      </DialogContent>
    </Dialog>
  );
};
