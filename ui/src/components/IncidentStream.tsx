import React, { useMemo } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { relativeTime, cn } from '@/lib/utils';
import type { Incident } from '@/types';

interface IncidentStreamProps {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  services: string[];
}

export const IncidentStream: React.FC<IncidentStreamProps> = ({
  incidents,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  serviceFilter,
  onServiceFilterChange,
  statusFilter,
  onStatusFilterChange,
  services,
}) => {
  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = inc.title.toLowerCase().includes(q);
        const matchDesc = inc.description.toLowerCase().includes(q);
        const matchService = inc.service.toLowerCase().includes(q);
        const matchTags = inc.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchService && !matchTags) return false;
      }
      if (serviceFilter && serviceFilter !== 'all') {
        if (inc.service !== serviceFilter) return false;
      }
      if (statusFilter && statusFilter !== 'all') {
        if (inc.status !== statusFilter) return false;
      }
      return true;
    });
  }, [incidents, search, serviceFilter, statusFilter]);

  const openCount = incidents.filter((i) => i.status === 'open').length;

  return (
    <aside className="w-full h-full flex flex-col bg-[#0c1017] border-r border-[#1c2636] select-none">
      {/* Top Header */}
      <div className="p-3 border-b border-[#1c2636] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#cbd5e1]">
              Incident Stream
            </span>
            <Badge variant="muted" className="text-[10px] px-1.5 py-0 h-4">
              {filtered.length}
            </Badge>
          </div>
          {openCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-[#f87171] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f87171] animate-ping" />
              {openCount} active
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#4b5a6f]" />
          <Input
            placeholder="Search incidents or tags..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-7 text-xs bg-[#07090e] border-[#1c2636]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <select
            value={serviceFilter}
            onChange={(e) => onServiceFilterChange(e.target.value)}
            className="flex-1 h-6 bg-[#07090e] text-[#8292a8] text-[11px] rounded border border-[#1c2636] px-1.5 focus:border-[#06b6d4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Services</option>
            {services.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-24 h-6 bg-[#07090e] text-[#8292a8] text-[11px] rounded border border-[#1c2636] px-1.5 focus:border-[#06b6d4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incident List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[#4b5a6f] text-xs">
              No matching incidents found.
            </div>
          ) : (
            filtered.map((inc) => {
              const isSelected = inc.id === selectedId;
              const sevKey = inc.severity.toLowerCase() as
                | 'sev1'
                | 'sev2'
                | 'sev3'
                | 'sev4';

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelect(inc.id)}
                  className={cn(
                    'group relative p-3 rounded-lg border text-left cursor-pointer transition-all duration-150',
                    isSelected
                      ? 'border-[#06b6d4] bg-[#121824] shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'border-[#1c2636] bg-[#090d14] hover:border-[#28374d] hover:bg-[#0e141f]'
                  )}
                >
                  {/* Top Bar: Sev + Service + Status */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Badge variant={sevKey}>{inc.severity}</Badge>
                      <span className="font-mono text-[11px] text-[#8292a8] truncate max-w-[110px]">
                        {inc.service}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px]">
                      {inc.status === 'open' ? (
                        <span className="flex items-center gap-1 text-[#f87171] font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />
                          Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#10b981]">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Incident Title */}
                  <h4
                    className={cn(
                      'text-xs font-semibold leading-snug line-clamp-2 mb-2',
                      isSelected ? 'text-[#f8fafc]' : 'text-[#cbd5e1] group-hover:text-[#f8fafc]'
                    )}
                  >
                    {inc.title}
                  </h4>

                  {/* Bottom: Relative Time + Tags */}
                  <div className="flex items-center justify-between gap-2 text-[10px] text-[#4b5a6f]">
                    <span>{relativeTime(inc.created_at)}</span>
                    <div className="flex items-center gap-1 overflow-hidden">
                      {inc.tags?.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-1 py-0.2 rounded bg-[#121824] border border-[#1c2636] text-[9px] text-[#8292a8] truncate max-w-[65px]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </aside>
  );
};
