import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Users,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AdminShell } from '../../components/admin/AdminShell';

interface TaskMetric {
  taskId: string;
  name: string;
  total: number;
  completed: number;
  abandoned: number;
  inProgress: number;
  completionRate: number;
  avgTimeSeconds: number;
}

interface ParticipantSummary {
  participantId: string;
  sessionId: string;
  scenarioId: string;
  screenSize: string;
  completed: boolean;
  durationSeconds: number | null;
  eventCount: number;
  completedTasks: number;
  totalTasks: number;
  errorCount: number;
  backtrackCount: number;
  susScore: number | null;
}

interface AnalyticsData {
  overview: {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    totalEvents: number;
    totalErrors: number;
    avgSUSScore: number | null;
  };
  taskMetrics: TaskMetric[];
  eventTypeCounts: Record<string, number>;
  errorsByPage: Record<string, number>;
  checkoutFunnel: Record<string, number>;
  participantSummaries: ParticipantSummary[];
}

const EMPTY_DATA: AnalyticsData = {
  overview: { totalSessions: 0, completedSessions: 0, completionRate: 0, totalEvents: 0, totalErrors: 0, avgSUSScore: null },
  taskMetrics: [],
  eventTypeCounts: {},
  errorsByPage: {},
  checkoutFunnel: {},
  participantSummaries: [],
};

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getAnalytics();
      if (response) setData(response);
    } catch {
      setError('Analytics could not be loaded. Try refreshing the workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Research OS - Behavior Analytics';
    fetchAnalytics();
  }, []);

  const { overview, taskMetrics, eventTypeCounts, errorsByPage, checkoutFunnel, participantSummaries } = data;
  const topEventTypes = Object.entries(eventTypeCounts).sort(([, a], [, b]) => b - a).slice(0, 8);
  const topErrors = Object.entries(errorsByPage).sort(([, a], [, b]) => b - a);
  const maxEventCount = Math.max(...topEventTypes.map(([, count]) => count), 1);
  const maxErrorCount = Math.max(...topErrors.map(([, count]) => count), 1);
  const funnelEntries = [
    ['Shipping', checkoutFunnel.step_1_shipping || 0],
    ['Delivery', checkoutFunnel.step_2_delivery || 0],
    ['Payment', checkoutFunnel.step_3_payment || 0],
    ['Review', checkoutFunnel.step_4_review || 0],
    ['Confirmed', checkoutFunnel.order_confirmed || 0],
  ];
  const funnelBase = Math.max(funnelEntries[0][1] as number, 1);
  const hardestTask = useMemo(() => taskMetrics.filter((task) => task.total > 0).sort((a, b) => a.completionRate - b.completionRate)[0], [taskMetrics]);
  const highestDropOff = useMemo(() => {
    return funnelEntries.slice(1).map((entry, index) => ({
      label: entry[0] as string,
      drop: Math.max(0, (funnelEntries[index][1] as number) - (entry[1] as number)),
    })).sort((a, b) => b.drop - a.drop)[0];
  }, [funnelEntries]);

  const exportCsv = () => {
    if (!participantSummaries.length) return;
    const rows = participantSummaries.map((participant) => [
      participant.participantId,
      participant.scenarioId,
      participant.completed ? 'Completed' : 'Active',
      participant.durationSeconds || '',
      participant.eventCount,
      participant.errorCount,
    ]);
    const csv = [['Participant', 'Scenario', 'Status', 'Duration (sec)', 'Events', 'Errors'], ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopsim-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="space-y-6 pb-16">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-purple-600">Measured behavior</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Behavior analytics</h1>
            <p className="mt-1 text-sm text-slate-500">Explore task performance, interaction patterns, funnel movement, and observed friction.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={fetchAnalytics} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</button>
            <button type="button" onClick={exportCsv} disabled={!participantSummaries.length} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"><Download className="h-3.5 w-3.5" /> Export</button>
          </div>
        </header>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Sessions" value={overview.totalSessions} icon={<Users className="h-4 w-4" />} tone="blue" />
          <Metric label="Completion" value={`${overview.completionRate}%`} icon={<CheckCircle2 className="h-4 w-4" />} tone="green" />
          <Metric label="Events" value={overview.totalEvents} icon={<Activity className="h-4 w-4" />} tone="purple" />
          <Metric label="Errors" value={overview.totalErrors} icon={<AlertTriangle className="h-4 w-4" />} tone="orange" />
          <Metric label="SUS score" value={overview.avgSUSScore === null ? '—' : `${overview.avgSUSScore}/100`} icon={<BarChart3 className="h-4 w-4" />} tone="slate" note={overview.avgSUSScore === null ? 'Not collected' : 'Measured score'} />
        </section>

        {isLoading ? <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">Aggregating collected telemetry…</div> : (
          <>
            <section id="tasks" className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
              <Panel title="Task completion funnel" subtitle="Measured task progress across participants" icon={<TrendingDown className="h-4 w-4 text-blue-600" />}>
                {taskMetrics.length ? <div className="space-y-4">{taskMetrics.map((task) => <div key={task.taskId}><div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-bold text-slate-800">{task.name}</span><span className="font-semibold text-slate-500">{task.completionRate}% · {task.completed}/{task.total} completed</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${task.completionRate >= 80 ? 'bg-emerald-500' : task.completionRate >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${task.total ? task.completionRate : 0}%` }} /></div><div className="mt-1 flex gap-3 text-[10px] text-slate-400"><span>{task.abandoned} abandoned</span><span>{task.inProgress} in progress</span><span><Clock3 className="mr-0.5 inline h-3 w-3" />{task.avgTimeSeconds || 0}s avg</span></div></div>)}</div> : <EmptyState text="Task progress will appear after participants complete study tasks." />}</Panel>
              <Panel title="Checkout funnel" subtitle="Observed checkout-step events" icon={<BarChart3 className="h-4 w-4 text-purple-600" />}>
                {Object.keys(checkoutFunnel).length ? <div className="space-y-3">{funnelEntries.map(([label, count], index) => <div key={label as string} className="flex items-center gap-3"><span className="w-16 text-xs text-slate-600">{label}</span><div className="h-7 flex-1 overflow-hidden rounded-md bg-slate-100"><div className={`flex h-full items-center rounded-md px-2 text-[10px] font-bold text-white ${index === 4 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${Math.max(((count as number) / funnelBase) * 100, count ? 12 : 0)}%` }}>{count as number}</div></div><span className="w-8 text-right text-[10px] font-bold text-slate-500">{Math.round(((count as number) / funnelBase) * 100)}%</span></div>)}</div> : <EmptyState text="Checkout funnel data will appear when checkout step events are collected." />}</Panel>
            </section>

            <section id="events" className="grid gap-4 xl:grid-cols-2">
              <Panel title="Interaction patterns" subtitle="Most frequent recorded event types" icon={<Activity className="h-4 w-4 text-blue-600" />}>
                {topEventTypes.length ? <div className="space-y-3">{topEventTypes.map(([event, count]) => <div key={event} className="flex items-center gap-3"><span className="w-32 truncate font-mono text-[11px] text-slate-600" title={event}>{event}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(count / maxEventCount) * 100}%` }} /></div><span className="w-8 text-right text-xs font-bold text-slate-700">{count}</span></div>)}</div> : <EmptyState text="Interaction patterns will appear after events are recorded." />}</Panel>
              <Panel title="Issues & errors" subtitle="Observed error events grouped by page" icon={<AlertTriangle className="h-4 w-4 text-amber-600" />}>
                {topErrors.length ? <div className="space-y-3">{topErrors.map(([page, count]) => <div key={page} className="flex items-center gap-3"><span className="w-32 truncate font-mono text-[11px] text-slate-600" title={page}>{page}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${(count / maxErrorCount) * 100}%` }} /></div><span className="w-8 text-right text-xs font-bold text-slate-700">{count}</span></div>)}</div> : <EmptyState text="No page-level errors have been collected." />}</Panel>
            </section>

            <section id="insights" className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm">
              <div className="flex items-start gap-3"><span className="rounded-lg bg-purple-100 p-2 text-purple-700"><Sparkles className="h-4 w-4" /></span><div><h2 className="text-sm font-bold text-slate-900">Research insights</h2><p className="mt-1 text-xs text-slate-500">Derived observations based only on the current collected dataset.</p></div></div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Insight title="Most difficult measured task" text={hardestTask ? `${hardestTask.name} has the lowest completion rate at ${hardestTask.completionRate}%.` : 'Not enough task data to identify a difficult task.'} />
                <Insight title="Largest measured funnel drop-off" text={highestDropOff && highestDropOff.drop > 0 ? `${highestDropOff.drop} fewer participants reached ${highestDropOff.label} than the previous step.` : 'Not enough checkout data to identify a drop-off stage.'} />
                <Insight title="Common participant errors" text={topErrors[0] ? `${topErrors[0][1]} error events were recorded on ${topErrors[0][0]}.` : 'No error pattern is available yet.'} />
                <Insight title="Interpretation boundary" text="These are derived observations, not AI-generated explanations. Product or UX recommendations require additional qualitative evidence." />
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5"><h2 className="text-sm font-bold text-slate-900">Participant behavior summary</h2><p className="mt-1 text-xs text-slate-500">Session-level measurements from the analytics API.</p></div>
              {participantSummaries.length ? <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400"><tr><th className="px-5 py-3">Participant</th><th className="px-5 py-3">Scenario</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Events</th><th className="px-5 py-3">Errors</th><th className="px-5 py-3">Backtracks</th></tr></thead><tbody className="divide-y divide-slate-100">{participantSummaries.map((participant) => <tr key={participant.sessionId} className="hover:bg-slate-50"><td className="px-5 py-3.5 font-bold text-slate-800">{participant.participantId}</td><td className="px-5 py-3.5 text-slate-600">{participant.scenarioId}</td><td className="px-5 py-3.5">{participant.completed ? <span className="font-bold text-emerald-700">Completed</span> : <span className="font-bold text-amber-700">Active</span>}</td><td className="px-5 py-3.5 text-slate-600">{participant.durationSeconds === null ? '—' : `${Math.round(participant.durationSeconds / 60)} min`}</td><td className="px-5 py-3.5 font-mono text-slate-700">{participant.eventCount}</td><td className="px-5 py-3.5 font-mono text-slate-700">{participant.errorCount}</td><td className="px-5 py-3.5 font-mono text-slate-700">{participant.backtrackCount}</td></tr>)}</tbody></table></div> : <EmptyState text="Participant summaries will appear once sessions are collected." />}</section>
          </>
        )}
      </div>
    </AdminShell>
  );
};

const Metric: React.FC<{ label: string; value: string | number; icon: React.ReactNode; tone: string; note?: string }> = ({ label, value, icon, tone, note = 'Measured from collected data' }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span><span className={`rounded-lg p-2 ${tone === 'blue' ? 'bg-blue-50 text-blue-600' : tone === 'green' ? 'bg-emerald-50 text-emerald-600' : tone === 'purple' ? 'bg-purple-50 text-purple-600' : tone === 'orange' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'}`}>{icon}</span></div><p className="mt-4 text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-500">{note}</p></div>
);

const Panel: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, icon, children }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>{icon}</div>{children}</section>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => <div className="rounded-lg bg-slate-50 p-6 text-center text-xs text-slate-500">{text}</div>;

const Insight: React.FC<{ title: string; text: string }> = ({ title, text }) => <article className="rounded-lg border border-purple-100 bg-white/80 p-4"><h3 className="text-xs font-bold text-slate-800">{title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-600">{text}</p></article>;
