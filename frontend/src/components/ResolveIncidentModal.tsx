import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Database, CheckCircle2 } from 'lucide-react';
import type { Incident, ResolveIncidentRequest } from '@/types';

interface ResolveIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: Incident | null;
  onResolve: (id: string, data: ResolveIncidentRequest) => Promise<void>;
}

export const ResolveIncidentModal: React.FC<ResolveIncidentModalProps> = ({
  open,
  onOpenChange,
  incident,
  onResolve,
}) => {
  const [rootCause, setRootCause] = useState(
    incident?.root_cause || ''
  );
  const [resolution, setResolution] = useState(
    incident?.resolution || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if incident changes
  React.useEffect(() => {
    if (incident) {
      setRootCause(incident.root_cause || '');
      setResolution(incident.resolution || '');
    }
  }, [incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !rootCause.trim() || !resolution.trim()) return;

    setIsSubmitting(true);
    try {
      await onResolve(incident.id, {
        root_cause: rootCause,
        resolution: resolution,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#10b981]/15 text-[#10b981] flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <DialogTitle>Resolve Incident & Store in Hindsight</DialogTitle>
            </div>
            <DialogDescription>
              Resolving this incident stores the diagnosed root cause and verified fix into the{' '}
              <code className="text-[#06b6d4]">opsmind_{incident.service}</code> memory bank.
            </DialogDescription>
          </DialogHeader>

          <div className="p-2.5 rounded bg-[#07090e] border border-[#1c2636] space-y-1">
            <div className="text-[10px] text-[#8292a8]">Target Incident</div>
            <div className="text-xs font-semibold text-[#f8fafc] truncate">
              {incident.title}
            </div>
            <div className="text-[10px] text-[#4b5a6f] font-mono">
              ID: {incident.id} · Service: {incident.service}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                Root Cause Summary
              </label>
              <Textarea
                placeholder="e.g. Redis connection pool exhausted due to leak in token verification"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                rows={2}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                Remediation / Applied Fix
              </label>
              <Textarea
                placeholder="e.g. Scaled connection pool to 200, restarted workers, applied connection close patch"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={2}
                required
              />
            </div>
          </div>

          <div className="p-2 rounded bg-[#14b8a6]/10 border border-[#14b8a6]/25 flex items-center gap-2 text-[11px] text-[#14b8a6]">
            <Database className="h-3.5 w-3.5 shrink-0" />
            <span>Continuous Memory: Solution will be indexed into Vectorize for instant matching.</span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#10b981] text-[#07090e] font-semibold hover:bg-[#34d399]"
            >
              {isSubmitting ? 'Indexing...' : 'Resolve & Commit to Memory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
