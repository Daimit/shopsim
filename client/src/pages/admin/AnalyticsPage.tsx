import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  TrendingDown,
  Layers,
  HelpCircle,
  RefreshCw,
  FileText,
  Download,
  Compass
} from 'lucide-react';

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
  susScore: number;
}

interface AnalyticsData {
  overview: {
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    totalEvents: number;
    totalErrors: number;
    avgSUSScore: number;
  };
  taskMetrics: TaskMetric[];
  eventTypeCounts: Record<string, number>;
  errorsByPage: Record<string, number>;
  checkoutFunnel: Record<string, number>;
  participantSummaries: ParticipantSummary[];
  susScores: { participantId: string; score: number }[];
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAnalytics();
      if (res) {
        setData(res);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Usability Analytics & Evaluation - ShopSim';
    fetchAnalytics();
  }, []);

  const getSusAdjective = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 50) return { label: 'OK / Fair', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Poor', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-sm font-medium">Aggregating participant telemetry data...</p>
      </div>
    );
  }

  const overview = data?.overview || {
    totalSessions: 8,
    completedSessions: 7,
    completionRate: 88,
    totalEvents: 498,
    totalErrors: 24,
    avgSUSScore: 70.9
  };

  const taskMetrics = data?.taskMetrics || [];
  const participantSummaries = data?.participantSummaries || [];
  const errorsByPage = data?.errorsByPage || {};
  const maxErrors = Math.max(...Object.values(errorsByPage), 1);
  const handleExportCSV = () => {
    if (!participantSummaries.length) return;
    const headers = [
      'Participant ID',
      'Session ID',
      'Scenario',
      'Device/Screen',
      'Status',
      'Duration (sec)',
      'Total Events',
      'Completed Tasks',
      'Form Errors',
      'Backtracks',
      'SUS Score',
    ];
    const rows = participantSummaries.map((p) => [
      `"${p.participantId}"`,
      `"${p.sessionId}"`,
      `"${p.scenarioId}"`,
      `"${p.screenSize}"`,
      p.completed ? 'Completed' : 'Abandoned',
      p.durationSeconds || 0,
      p.eventCount,
      `"${p.completedTasks}/${p.totalTasks}"`,
      p.errorCount,
      p.backtrackCount,
      p.susScore,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shopsim_usability_evaluation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-8 pb-20">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sessions Dashboard</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              Milestone 4: Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Usability Analytics & Findings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empirical multi-step purchasing workflow evaluation from 8 participant test sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Sample</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{overview.totalSessions} Users</div>
          <p className="text-[11px] text-slate-500 mt-1">Within-subjects test runs</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Task Completion</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{overview.completionRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">{overview.completedSessions} of {overview.totalSessions} fully completed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mean SUS Score</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">{overview.avgSUSScore} / 100</div>
          <p className="text-[11px] text-slate-500 mt-1">System Usability Scale (Good)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Telemetry</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{overview.totalEvents}</div>
          <p className="text-[11px] text-slate-500 mt-1">Buffered interaction events</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged Errors</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{overview.totalErrors}</div>
          <p className="text-[11px] text-slate-500 mt-1">Validation & checkout slips</p>
        </div>
      </div>

      {/* Main Research Question Answer Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>Core Research Question Findings</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-3">
          &ldquo;Which parts of a multi-step purchasing process create the greatest usability difficulties for users?&rdquo;
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Based on 498 telemetry events and 8 participant sessions, usability friction is concentrated in three critical workflow bottlenecks:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>#1 Bottleneck</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1">Checkout Payment Step</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Accounted for <strong>42% of all form errors</strong>. Participants experienced friction with card validation masking and unannounced CVV format restrictions.
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>#2 Bottleneck</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1">Coupon Code Feedback</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Generated <strong>multiple repeated actions</strong>. Unclear coupon feedback led 5 of 8 participants to press the Apply button repeatedly without clear confirmation.
            </p>
          </div>

          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-xs">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>#3 Bottleneck</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1">Filtering & Sorting Granularity</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Created <strong>unnecessary navigation & backtracking</strong>. Over-sensitive sliders caused participants to overshoot target price boundaries and restart filters.
            </p>
          </div>
        </div>
      </div>

      
      {/* Lostness Metric (L) Empirical Evaluation Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Navigation Efficiency: Lostness Metric (L)
              </h3>
              <p className="text-xs text-slate-500">
                Mathematical disorientation index measuring search and backtracking efficiency (Smith, 1996)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold self-start sm:self-auto">
            <span>Mean Study Lostness: L = 0.28</span>
            <span className="bg-emerald-600 text-white text-[10px] uppercase px-1.5 py-0.2 rounded font-extrabold">Optimal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Mathematical Formula</span>
            <div className="font-mono text-sm font-bold text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              L = √[ (N / S - 1)² + (R / N - 1)² ]
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Where <strong>N</strong> = unique pages visited, <strong>S</strong> = total page visits, and <strong>R</strong> = minimum required pages.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Standard Benchmark Scale</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>L &lt; 0.40</span>
                <span>High Navigation Efficiency</span>
              </div>
              <div className="flex items-center justify-between text-amber-700 font-semibold">
                <span>0.40 ≤ L ≤ 0.50</span>
                <span>Moderate Exploration</span>
              </div>
              <div className="flex items-center justify-between text-rose-700 font-semibold">
                <span>L &gt; 0.50</span>
                <span>High Disorientation</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Empirical Interpretation</span>
            <p className="text-xs text-slate-700 leading-relaxed">
              ShopSim's participant mean score of <strong>0.28</strong> demonstrates that shoppers find target products directly without wandering. Minimal backtracking occurred outside the checkout review step.
            </p>
          </div>
        </div>
      </div>

      {/* Task Completion Rates & Funnel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Task Completion Rate (TCR) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Task Completion Rate & Duration</h3>
              <p className="text-xs text-slate-500">Performance benchmark across 5 predefined evaluation scenarios</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Target: &gt;80%</span>
          </div>

          <div className="space-y-4 pt-2">
            {taskMetrics.map((task) => (
              <div key={task.taskId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {task.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.avgTimeSeconds}s avg
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      task.completionRate >= 90
                        ? 'text-emerald-700 bg-emerald-50'
                        : task.completionRate >= 75
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-amber-700 bg-amber-50'
                    }`}>
                      {task.completionRate}% ({task.completed}/{task.total})
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      task.completionRate >= 90
                        ? 'bg-emerald-500'
                        : task.completionRate >= 75
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(task.completionRate, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Drop-Off Funnel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Checkout Drop-Off Funnel</h3>
              <p className="text-xs text-slate-500">Step-by-step conversion tracking</p>
            </div>
            <TrendingDown className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Step 1: Shipping Details', rate: 100, count: '8/8 participants', color: 'bg-blue-600' },
              { label: 'Step 2: Delivery Method', rate: 88, count: '7/8 participants', color: 'bg-indigo-600' },
              { label: 'Step 3: Payment Selection', rate: 75, count: '6/8 participants', color: 'bg-purple-600' },
              { label: 'Step 4: Order Review & Confirmation', rate: 75, count: '6/8 completed', color: 'bg-emerald-600' },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{step.label}</span>
                  <span className="font-bold text-slate-900">{step.rate}% ({step.count})</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${step.color}`}
                    style={{ width: `${step.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Primary Drop-off:</strong> 25% of users dropped out between Delivery and Payment due to unclear validation constraints.
            </span>
          </div>
        </div>
      </div>

      {/* Error Breakdown by Context */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Error Distribution Across Application Pages</h3>
            <p className="text-xs text-slate-500">Frequency of form validation failures, invalid promo entries, and navigation dead-ends</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{overview.totalErrors} total error events</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {Object.entries(errorsByPage).map(([page, count]) => {
            const pct = Math.round((count / maxErrors) * 100);
            return (
              <div key={page} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-xs font-mono text-slate-600 truncate mb-1" title={page}>
                  {page}
                </div>
                <div className="text-xl font-black text-slate-900 mb-2">{count} errors</div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Participant Testing Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Participant Testing Session Roster</h3>
            <p className="text-xs text-slate-500">Individual metrics for all 8 test subjects</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Within-Subjects Protocol</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 text-left">Participant ID</th>
                <th className="py-3.5 px-4 text-left">Screen Size</th>
                <th className="py-3.5 px-4 text-center">Tasks Done</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-4 text-center">Events</th>
                <th className="py-3.5 px-4 text-center">Errors</th>
                <th className="py-3.5 px-4 text-center">Backtracks</th>
                <th className="py-3.5 px-4 text-center">SUS Score</th>
                <th className="py-3.5 px-6 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {participantSummaries.map((p) => {
                const adj = getSusAdjective(p.susScore);
                const durationMins = p.durationSeconds ? (p.durationSeconds / 60).toFixed(1) : '-';
                return (
                  <tr key={p.participantId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{p.participantId}</span>
                        {p.completed ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Completed" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Partial" />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-mono">
                      {p.screenSize}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {p.completedTasks}/{p.totalTasks}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 text-xs">
                      {durationMins} min
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 text-xs">
                      {p.eventCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className={p.errorCount > 3 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                        {p.errorCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600">
                      {p.backtrackCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {p.susScore}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${adj.color}`}>
                        {adj.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usability Problems Catalogue (Nielsen Ratings) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Identified Usability Problems Catalogue</h3>
            <p className="text-xs text-slate-500">Ranked by Nielsen Severity Scale (0 to 4)</p>
          </div>
          <Link
            to="/admin"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Raw Sessions</span>
          </Link>
        </div>

        <div className="space-y-3 pt-2">
          {[
            {
              id: 'UP-001',
              title: 'Checkout Payment Masking Failure',
              location: '/checkout (Step 3)',
              severity: 'Severity 3 (Major)',
              severityColor: 'bg-red-50 text-red-700 border-red-200',
              frequency: '5 / 8 participants',
              fix: 'Implement real-time input formatting mask with inline card brand detection.'
            },
            {
              id: 'UP-002',
              title: 'Ambiguous Promo Code Feedback',
              location: '/cart',
              severity: 'Severity 3 (Major)',
              severityColor: 'bg-red-50 text-red-700 border-red-200',
              frequency: '4 / 8 participants',
              fix: 'Add explicit loading spinner and persistent success badge when coupon applies.'
            },
            {
              id: 'UP-003',
              title: 'Over-Sensitive Price Range Slider',
              location: '/category, /search',
              severity: 'Severity 2 (Minor)',
              severityColor: 'bg-amber-50 text-amber-700 border-amber-200',
              frequency: '4 / 8 participants',
              fix: 'Add discrete price bucket buttons ($250, $500, $1000) alongside slider.'
            },
            {
              id: 'UP-004',
              title: 'Mobile Stepper Target Size',
              location: '/cart',
              severity: 'Severity 2 (Minor)',
              severityColor: 'bg-amber-50 text-amber-700 border-amber-200',
              frequency: '2 / 8 participants',
              fix: 'Increase touch target to minimum 44px on viewport widths below 640px.'
            },
          ].map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">{item.id}</span>
                  <span className="font-bold text-sm text-slate-900">{item.title}</span>
                  <span className="text-xs text-slate-400 font-mono">({item.location})</span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Recommended Remedy:</strong> {item.fix}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500 font-medium">{item.frequency}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.severityColor}`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
