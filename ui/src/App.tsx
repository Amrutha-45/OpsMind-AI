import { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigation } from '@/components/Navigation';
import { OverviewPage } from '@/pages/OverviewPage';
import { IncidentsPage } from '@/pages/IncidentsPage';
import { IncidentDetailsPage } from '@/pages/IncidentDetailsPage';
import { MemoryPage } from '@/pages/MemoryPage';
import { AgentActivityPage } from '@/pages/AgentActivityPage';
import { ScoreboardPage } from '@/pages/ScoreboardPage';
import { ArchitecturePage } from '@/pages/ArchitecturePage';

import { NewIncidentModal } from '@/components/NewIncidentModal';
import { ResolveIncidentModal } from '@/components/ResolveIncidentModal';

import { api } from '@/lib/api';
import type {
  Incident,
  HealthStatus,
  LearningStats,
  OpenIncidentRequest,
  ResolveIncidentRequest,
  PageRoute,
} from '@/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<LearningStats | null>(null);

  // Modals
  const [isNewIncidentOpen, setIsNewIncidentOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Synchronize hash routing with state
  const parseHash = useCallback((): { page: PageRoute; incidentId: string | null } => {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash.startsWith('incident/')) {
      const id = hash.replace('incident/', '');
      return { page: 'incident-details', incidentId: id };
    }
    switch (hash) {
      case 'incidents':
        return { page: 'incidents', incidentId: null };
      case 'memory':
        return { page: 'memory', incidentId: null };
      case 'agent-activity':
        return { page: 'agent-activity', incidentId: null };
      case 'scoreboard':
        return { page: 'scoreboard', incidentId: null };
      case 'architecture':
        return { page: 'architecture', incidentId: null };
      case 'overview':
      default:
        return { page: 'overview', incidentId: null };
    }
  }, []);

  const navigateTo = useCallback(
    (page: PageRoute, incidentId?: string | null) => {
      if (page === 'incident-details') {
        const id = incidentId || selectedIncidentId;
        if (id) {
          setSelectedIncidentId(id);
          window.location.hash = `incident/${id}`;
        } else {
          window.location.hash = 'incidents';
          setCurrentPage('incidents');
          return;
        }
      } else {
        window.location.hash = page;
      }
      setCurrentPage(page);
    },
    [selectedIncidentId]
  );

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const { page, incidentId } = parseHash();
      setCurrentPage(page);
      if (incidentId) {
        setSelectedIncidentId(incidentId);
      }
    };

    // Initialize from URL on load
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseHash]);

  // Load backend data
  const refreshData = useCallback(async () => {
    try {
      const [h, incs, st] = await Promise.all([
        api.health().catch(() => null),
        api.listIncidents().catch(() => []),
        api.stats().catch(() => null),
      ]);
      if (h) setHealth(h);
      if (incs) {
        setIncidents(incs);
        setSelectedIncidentId((curr) => {
          if (curr && incs.some((i) => i.id === curr)) return curr;
          return incs.length > 0 ? incs[0].id : null;
        });
      }
      if (st) setStats(st);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Known services
  const knownServices = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => set.add(i.service));
    if (set.size === 0) {
      set.add('payments');
      set.add('notifications');
      set.add('auth');
    }
    return Array.from(set);
  }, [incidents]);

  const selectedIncident = useMemo(() => {
    return incidents.find((i) => i.id === selectedIncidentId) || null;
  }, [incidents, selectedIncidentId]);

  // Handlers
  const handleOpenIncident = async (data: OpenIncidentRequest) => {
    const created = await api.openIncident(data);
    setIncidents((prev) => [created, ...prev]);
    setSelectedIncidentId(created.id);
    navigateTo('incident-details', created.id);
    api.stats().then((s) => setStats(s)).catch(() => {});
  };

  const handleResolveIncident = async (
    id: string,
    data: ResolveIncidentRequest
  ) => {
    const updated = await api.resolveIncident(id, data);
    setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
    api.stats().then((s) => setStats(s)).catch(() => {});
  };

  const handleSubmitFeedback = async (
    suggestionText: string,
    helpful: boolean
  ) => {
    if (!selectedIncidentId) return;
    await api.submitFeedback(selectedIncidentId, {
      suggestion_text: suggestionText,
      was_helpful: helpful,
    });
    api.stats().then((s) => setStats(s)).catch(() => {});
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await api.seedDemo();
      await refreshData();
    } catch (err) {
      console.error('Seed demo failed:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const openIncidentsCount = incidents.filter((i) => i.status === 'open').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#07090e] text-[#f8fafc]">
      {/* Persistent Top Navigation Bar */}
      <Navigation
        currentPage={currentPage}
        onNavigate={(page) => navigateTo(page)}
        health={health}
        openIncidentsCount={openIncidentsCount}
        onOpenNewIncident={() => setIsNewIncidentOpen(true)}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
      />

      {/* Main Page Content Area */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        {currentPage === 'overview' && (
          <OverviewPage
            incidents={incidents}
            stats={stats}
            onNavigateToIncidents={() => navigateTo('incidents')}
            onSelectIncident={(id) => navigateTo('incident-details', id)}
            onOpenNewIncident={() => setIsNewIncidentOpen(true)}
            onSeedDemo={handleSeedDemo}
            isSeeding={isSeeding}
            knownServices={knownServices}
          />
        )}

        {currentPage === 'incidents' && (
          <IncidentsPage
            incidents={incidents}
            onSelectIncident={(id) => navigateTo('incident-details', id)}
            onOpenNewIncident={() => setIsNewIncidentOpen(true)}
            knownServices={knownServices}
          />
        )}

        {currentPage === 'incident-details' && (
          <IncidentDetailsPage
            incident={selectedIncident}
            onBack={() => navigateTo('incidents')}
            onOpenResolve={() => setIsResolveOpen(true)}
            onSubmitFeedback={handleSubmitFeedback}
          />
        )}

        {currentPage === 'memory' && (
          <MemoryPage
            incidents={incidents}
            knownServices={knownServices}
            onReflect={(svc, q) => api.reflect({ service: svc, question: q })}
            onSelectIncident={(id) => navigateTo('incident-details', id)}
          />
        )}

        {currentPage === 'agent-activity' && (
          <AgentActivityPage
            incidents={incidents}
            onSelectIncident={(id) => navigateTo('incident-details', id)}
          />
        )}

        {currentPage === 'scoreboard' && (
          <ScoreboardPage
            stats={stats}
            incidents={incidents}
          />
        )}

        {currentPage === 'architecture' && <ArchitecturePage />}
      </main>

      {/* Global Modals */}
      <NewIncidentModal
        open={isNewIncidentOpen}
        onOpenChange={setIsNewIncidentOpen}
        onSubmit={handleOpenIncident}
        knownServices={knownServices}
      />

      <ResolveIncidentModal
        open={isResolveOpen}
        onOpenChange={setIsResolveOpen}
        incident={selectedIncident}
        onResolve={handleResolveIncident}
      />
    </div>
  );
}
