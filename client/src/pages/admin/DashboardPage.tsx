import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { TestSession } from '../../types';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { AdminShell } from '../../components/admin/AdminShell';

const formatDuration = (start: string, end?: string) => {
  const endTime = end ? new Date(end).getTime() : Date.now();
  const minutes = Math.max(0, Math.round((endTime - new Date(start).getTime()) / 60000));
  return `${minutes} min`;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' });

export const DashboardPage: React.FC = () => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'completed' | 'active'>('all');
  const [device, setDevice] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const { user, demoLogin } = useAuthStore();

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setSessions(await api.getSessions());
    } catch {
      setError('We could not load participant sessions. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Research OS - Overview';
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => sessions.filter((session) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || session.participantId.toLowerCase().includes(query) || session.id.toLowerCase().includes(query) || session.scenarioId.toLowerCase().includes(query);
    const matchesStatus = status === 'all' || (status === 'completed' ? session.completed : !session.completed);
    const isMobile = session.screenSize?.includes('390') || /mobile|android|iphone/i.test(session.userAgent || '');
    const matchesDevice = device === 'all' || (device === 'mobile' ? isMobile : !isMobile);
    return matchesSearch && matchesStatus && matchesDevice;
  }), [sessions, search, status, device]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const visibleSessions = filteredSessions.slice((page - 1) * pageSize, page * pageSize);
  const completed = sessions.filter((session) => session.completed).length;
  const totalEvents = sessions.reduce((sum, session) => sum + (session.eventCount || 0), 0);
  const averageDuration = sessions.length
    ? Math.round(sessions.reduce((sum, session) => sum + (session.endedAt ? (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000 : 0), 0) / sessions.filter((session) => session.endedAt).length || 0)
    : 0;
  const trend = Array.from({ length: 7 }, (_, index) => sessions.filter((session) => new Date(session.startedAt).getDay() === index).length);
  const maxTrend = Math.max(...trend, 1);

  const exportCsv = () => {
    if (!sessions.length) return;
    const rows = sessions.map((session) => [session.participantId, session.id, session.scenarioId, session.screenSize || '', session.completed ? 'Completed' : 'Active', session.eventCount || 0]);
    const csv = [['Participant', 'Session ID', 'Scenario', 'Screen', 'Status', 'Events'], ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopsim-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell>
      <div className="space-y-6 pb-16">
        {user?.role !== 'admin' && (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span><strong>Researcher access recommended.</strong> Sign in as an administrator to use the full workspace.</span>
            <button type="button" onClick={() => demoLogin('admin')} className="rounded-lg bg-purple-600 px-3 py-2 font-bold text-white hover:bg-purple-700">1-click admin login</button>
          </div>
        )}

        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-blue-600">Usability research</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Overview</h1>
            <p className="mt-1 text-sm text-slate-500">A clear view of participant activity and study health.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={fetchSessions} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh</button>
            <button type="button" onClick={exportCsv} disabled={!sessions.length} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"><Download className="h-3.5 w-3.5" /> Export</button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total sessions" value={sessions.length} icon={<Users className="h-4 w-4" />} tone="blue" />
          <Metric label="Completion rate" value={`${sessions.length ? Math.round((completed / sessions.length) * 100) : 0}%`} icon={<CheckCircle2 className="h-4 w-4" />} tone="green" />
          <Metric label="Avg. duration" value={`${averageDuration} min`} icon={<Clock3 className="h-4 w-4" />} tone="purple" />
          <Metric label="Total events" value={totalEvents} icon={<Activity className="h-4 w-4" />} tone="orange" />
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><h2 className="text-sm font-bold text-slate-900">Session activity</h2><p className="mt-1 text-xs text-slate-500">Recorded sessions by day of week</p></div><Activity className="h-4 w-4 text-blue-600" /></div>
            <div className="mt-6 flex h-36 items-end gap-2">
              {trend.map((count, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-md bg-blue-500/80 transition-all" style={{ height: `${Math.max(8, (count / maxTrend) * 100)}%` }} title={`${count} sessions`} /><span className="text-[10px] text-slate-400">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</span></div>)}
            </div>
          </section>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><h2 className="text-sm font-bold text-slate-900">Study health</h2><p className="mt-1 text-xs text-slate-500">Measured from collected sessions</p></div><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
            <div className="mt-5 space-y-4">
              <HealthRow label="Completed sessions" value={completed} total={sessions.length} color="bg-emerald-500" />
              <HealthRow label="Active sessions" value={sessions.length - completed} total={sessions.length} color="bg-amber-500" />
              <HealthRow label="Sessions with events" value={sessions.filter((session) => (session.eventCount || 0) > 0).length} total={sessions.length} color="bg-blue-500" />
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-sm font-bold text-slate-900">Sessions & participants</h2><p className="mt-1 text-xs text-slate-500">Search and inspect every recorded participant run.</p></div>
            <div className="flex flex-wrap gap-2">
              <div className="relative"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search sessions..." className="w-48 rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-500" /></div>
              <select value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-600"><option value="all">All status</option><option value="completed">Completed</option><option value="active">Active</option></select>
              <select value={device} onChange={(event) => { setDevice(event.target.value as typeof device); setPage(1); }} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-600"><option value="all">All devices</option><option value="desktop">Desktop</option><option value="mobile">Mobile</option></select>
            </div>
          </div>
          {error && <div className="m-5 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</div>}
          {isLoading ? <div className="p-12 text-center text-xs text-slate-500">Loading participant sessions…</div> : !visibleSessions.length ? <div className="p-12 text-center"><XCircle className="mx-auto h-7 w-7 text-slate-300" /><p className="mt-2 text-sm font-bold text-slate-700">No sessions found</p><p className="mt-1 text-xs text-slate-500">Try changing the filters or collect a participant session first.</p></div> : (
            <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400"><tr><th className="px-5 py-3">Participant</th><th className="px-5 py-3">Scenario</th><th className="px-5 py-3">Started</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Events</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{visibleSessions.map((session) => <tr key={session.id} className="hover:bg-blue-50/30"><td className="px-5 py-4"><p className="font-bold text-slate-800">{session.participantId}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{session.id.slice(0, 12)}…</p></td><td className="px-5 py-4 text-slate-600">{session.scenarioId}</td><td className="px-5 py-4 text-slate-500">{formatDate(session.startedAt)}</td><td className="px-5 py-4 text-slate-600">{formatDuration(session.startedAt, session.endedAt)}</td><td className="px-5 py-4">{session.completed ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Completed</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-bold text-amber-700"><Clock3 className="h-3 w-3" /> Active</span>}</td><td className="px-5 py-4 text-right font-mono font-bold text-slate-700">{session.eventCount || 0}</td><td className="px-5 py-4 text-right"><Link to={`/admin/sessions/${session.id}`} className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800">Inspect <ArrowUpRight className="h-3 w-3" /></Link></td></tr>)}</tbody></table></div>
          )}
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>{filteredSessions.length} sessions</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Previous</button><span>Page {page} / {totalPages}</span><button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-slate-200 px-2 py-1 disabled:opacity-40">Next</button></div></div>
        </section>
      </div>
    </AdminShell>
  );
};

const Metric: React.FC<{ label: string; value: string | number; icon: React.ReactNode; tone: 'blue' | 'green' | 'purple' | 'orange' }> = ({ label, value, icon, tone }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span><span className={`rounded-lg p-2 ${tone === 'blue' ? 'bg-blue-50 text-blue-600' : tone === 'green' ? 'bg-emerald-50 text-emerald-600' : tone === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>{icon}</span></div><p className="mt-4 text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-[11px] text-slate-500">Based on collected data</p></div>
);

const HealthRow: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => (
  <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-600">{label}</span><strong className="text-slate-900">{value}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${total ? (value / total) * 100 : 0}%` }} /></div></div>
);
