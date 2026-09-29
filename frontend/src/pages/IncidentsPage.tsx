import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { relativeTime } from '@/lib/utils';
import type { Incident } from '@/types';

interface IncidentsPageProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onOpenNewIncident: () => void;
  knownServices: string[];
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  onSelectIncident,
  onOpenNewIncident,
  knownServices,
}) => {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = inc.title.toLowerCase().includes(q);
        const matchDesc = inc.description.toLowerCase().includes(q);
        const matchService = inc.service.toLowerCase().includes(q);
        const matchTags = inc.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchService && !matchTags) return false;
      }
      if (serviceFilter !== 'all' && inc.service !== serviceFilter) return false;
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
      return true;
    });
  }, [incidents, search, serviceFilter, severityFilter, statusFilter]);

  const openCount = incidents.filter((i) => i.status === 'open').length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#f8fafc]">
              Incidents
            </h1>
            <Badge variant="muted" className="text-xs">
              {filtered.length} total
            </Badge>
            {openCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-[#f87171] font-medium ml-2">
                <span className="h-2 w-2 rounded-full bg-[#f87171] animate-ping" />
                {openCount} active outages
              </span>
            )}
          </div>
          <p className="text-xs text-[#8292a8] mt-1">
            Browse and inspect incident lifecycles, memory matches, and autonomous remediation history.
          </p>
        </div>

        <Button
          onClick={onOpenNewIncident}
          className="text-xs h-9 bg-[#06b6d4] text-[#07090e] font-semibold hover:bg-[#22d3ee] shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>Open Incident</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#4b5a6f]" />
            <Input
              placeholder="Search by title, logs, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-[#07090e] border-[#1c2636]"
            />
          </div>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="h-8 bg-[#07090e] text-[#8292a8] text-xs rounded-md border border-[#1c2636] px-2.5 focus:border-[#06b6d4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Services</option>
            {knownServices.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 bg-[#07090e] text-[#8292a8] text-xs rounded-md border border-[#1c2636] px-2.5 focus:border-[#06b6d4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="SEV1">SEV1 - Critical</option>
            <option value="SEV2">SEV2 - High</option>
            <option value="SEV3">SEV3 - Medium</option>
            <option value="SEV4">SEV4 - Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 bg-[#07090e] text-[#8292a8] text-xs rounded-md border border-[#1c2636] px-2.5 focus:border-[#06b6d4] focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents List Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-[#1c2636] bg-[#0c1017] space-y-3">
            <p className="text-xs text-[#8292a8]">
              No incidents match your current filter parameters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setServiceFilter('all');
                setSeverityFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs border-[#1c2636]"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          filtered.map((inc) => {
            const sevKey = inc.severity.toLowerCase() as
              | 'sev1'
              | 'sev2'
              | 'sev3'
              | 'sev4';

            const memoryCount = inc.similar_past_incidents?.length || 0;

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className="p-5 rounded-xl border border-[#1c2636] bg-[#0c1017] hover:border-[#06b6d4]/50 hover:bg-[#121824] transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={sevKey}>{inc.severity}</Badge>
                    <Badge variant="default" className="text-[10px]">
                      {inc.service}
                    </Badge>
                    <span className="font-mono text-xs text-[#4b5a6f]">
                      {inc.id}
                    </span>
                    <span className="text-xs text-[#8292a8] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {relativeTime(inc.created_at)}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#f8fafc] group-hover:text-[#06b6d4] transition-colors leading-snug">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-[#8292a8] line-clamp-2 max-w-3xl leading-relaxed">
                    {inc.description}
                  </p>

                  {/* Tags & Memory Recall Pill */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {memoryCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#14b8a6]/15 text-[#14b8a6] border border-[#14b8a6]/30 flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        {memoryCount} past memory match{memoryCount > 1 ? 'es' : ''}
                      </span>
                    )}

                    {inc.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-[#07090e] border border-[#1c2636] text-[10px] text-[#8292a8] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Status & Action */}
                <div className="flex items-center gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1c2636]">
                  {inc.status === 'open' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#f87171]" />
                      Open Outage
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolved
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#8292a8] group-hover:text-[#06b6d4] gap-1"
                  >
                    <span>Inspect Lifecycle</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
