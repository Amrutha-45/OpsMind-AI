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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { OpenIncidentRequest, Severity } from '@/types';

interface NewIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OpenIncidentRequest) => Promise<void>;
  knownServices: string[];
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  knownServices,
}) => {
  const [service, setService] = useState('auth-service');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<Severity>('SEV2');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('jwt, latency');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !service.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        service,
        title,
        severity,
        description,
        tags,
      });
      setTitle('');
      setDescription('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <DialogHeader>
            <DialogTitle>Open New Incident</DialogTitle>
            <DialogDescription>
              Trigger an alert to simulate incoming telemetry and test Hindsight memory recall.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                  Service
                </label>
                <input
                  list="services-list"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. auth-service"
                  className="flex h-8 w-full rounded-md border border-[#1c2636] bg-[#07090e] px-2 text-xs text-[#f8fafc] focus:outline-none focus:border-[#06b6d4]"
                  required
                />
                <datalist id="services-list">
                  {knownServices.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="h-8 w-full rounded-md border border-[#1c2636] bg-[#07090e] px-2 text-xs text-[#f8fafc] focus:outline-none focus:border-[#06b6d4] cursor-pointer"
                >
                  <option value="SEV1">SEV1 - Critical Outage</option>
                  <option value="SEV2">SEV2 - High Degradation</option>
                  <option value="SEV3">SEV3 - Medium Failure</option>
                  <option value="SEV4">SEV4 - Low / Warning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                Incident Title
              </label>
              <Input
                placeholder="e.g. Token validation timeout in auth-service"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                Description & Symptoms
              </label>
              <Textarea
                placeholder="Paste logs, stack traces, or observed error rates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#cbd5e1] block mb-1">
                Tags (comma separated)
              </label>
              <Input
                placeholder="e.g. auth, redis, timeout"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
              />
            </div>
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
              className="bg-[#06b6d4] text-[#07090e] font-semibold hover:bg-[#22d3ee]"
            >
              {isSubmitting ? 'Opening...' : 'Open & Trigger Agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
