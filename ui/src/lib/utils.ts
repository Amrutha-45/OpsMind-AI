import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Severity, IncidentStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function severityColor(sev: Severity) {
  const map: Record<Severity, { text: string; bg: string; border: string }> = {
    SEV1: { text: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
    SEV2: { text: '#fb923c', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)' },
    SEV3: { text: '#facc15', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.4)'  },
    SEV4: { text: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)' },
  };
  return map[sev];
}

export function severityLabel(sev: Severity): string {
  const map: Record<Severity, string> = {
    SEV1: 'Critical',
    SEV2: 'High',
    SEV3: 'Medium',
    SEV4: 'Low',
  };
  return map[sev];
}

export function statusColor(status: IncidentStatus) {
  return status === 'resolved'
    ? { text: '#10b981', label: 'Resolved' }
    : { text: '#8292a8', label: 'Open' };
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}
