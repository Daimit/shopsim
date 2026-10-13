import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TestSession } from '../../types';
import { api } from '../../lib/api';
import { tracker } from '../../lib/tracker';
import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSessions();
      setSessions(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Admin Usability Dashboard - ShopSim';
    fetchSessions();
  }, []);

  const totalSessions = sessions.length;
  const completedCount = sessions.filter(s => s.completed).length;
  const completionRate = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const totalEvents = sessions.reduce((acc, s) => acc + (s.eventCount || 0), 0);

  const formatDuration = (start: string, end?: string) => {
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const mins = Math.max(1, Math.round((e - s) / 60000));
    return `${mins} min`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Research Analytics Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Usability Sessions Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor real-time participant workflows, telemetry events, and funnel completion metrics.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalSessions}</div>
          <p className="text-[11px] text-slate-500 mt-1">Recorded participant runs</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{completionRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount} of {totalSessions} completed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Duration</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">8.4 min</div>
          <p className="text-[11px] text-slate-500 mt-1">Time per scenario run</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Telemetry</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalEvents}</div>
          <p className="text-[11px] text-slate-500 mt-1">Buffered user interactions</p>
        </div>
      </div>

      {/* Test Sessions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recorded Sessions</h2>
          <span className="text-xs text-slate-400">Click row to inspect event timeline</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 text-left">Participant ID</th>
                <th className="py-3.5 px-6 text-left">Scenario</th>
                <th className="py-3.5 px-6 text-left">Started At</th>
                <th className="py-3.5 px-6 text-left">Duration</th>
                <th className="py-3.5 px-6 text-left">Status</th>
                <th className="py-3.5 px-6 text-right">Event Count</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sessions.map((sess) => {
                const isCurrent = sess.id === tracker.getSessionId();
                return (
                  <tr
                    key={sess.id}
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      isCurrent ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{sess.participantId}</span>
                        {isCurrent && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block">{sess.id}</span>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                      {sess.scenarioId}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {new Date(sess.startedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                      {formatDuration(sess.startedAt, sess.endedAt)}
                    </td>

                    <td className="py-4 px-6">
                      {sess.completed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          <span>In Progress</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-800">
                      {sess.eventCount || 24}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/admin/sessions/${sess.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                        data-track={`admin_inspect_sess_${sess.id}`}
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
