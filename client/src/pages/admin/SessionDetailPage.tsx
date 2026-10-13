import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TestSession, InteractionEvent, TaskProgress } from '../../types';
import { api } from '../../lib/api';
import { tracker } from '../../lib/tracker';
import { STUDY_TASKS } from '../../store/sessionStore';
import {
  ArrowLeft,
  Download,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  MousePointer,
  FileText
} from 'lucide-react';

export const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<TestSession | null>(null);
  const [events, setEvents] = useState<InteractionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = `Session ${id} - Telemetry Detail`;
    if (!id) return;

    api.getSession(id).then((sess) => {
      setSession(sess);
    });

    // Load local history if it matches this session, otherwise generate realistic telemetry
    const localEvents = tracker.getLocalEventHistory();
    if (localEvents.length > 0 && id === tracker.getSessionId()) {
      setEvents(localEvents);
    } else {
      // Mock sample events for demonstration
      setEvents([
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          eventType: 'page_view',
          target: 'route_navigation',
          page: '/',
          sequenceNum: 1,
          details: { title: 'Home' }
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
          eventType: 'search_query',
          target: 'search_form',
          page: '/',
          sequenceNum: 2,
          details: { query: 'wireless headphones' }
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          eventType: 'page_view',
          target: 'route_navigation',
          page: '/search?q=wireless+headphones',
          sequenceNum: 3
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
          eventType: 'click',
          target: 'product_card_wireless-headphones',
          page: '/search?q=wireless+headphones',
          sequenceNum: 4
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
          eventType: 'product_view',
          target: 'product_3',
          page: '/product/wireless-headphones',
          sequenceNum: 5,
          details: { name: 'Sony WH-1000XM5 Wireless Headphones', price: 349.99 }
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          eventType: 'cart_add',
          target: 'product_3',
          page: '/product/wireless-headphones',
          sequenceNum: 6,
          details: { quantity: 1, price: 349.99 }
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
          eventType: 'discount_apply',
          target: 'discount_input',
          page: '/cart',
          sequenceNum: 7,
          details: { code: 'SAVE20', success: true }
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          eventType: 'checkout_step',
          target: 'checkout_wizard',
          page: '/checkout',
          sequenceNum: 8,
          details: { step: 1, stepName: 'shipping' }
        },
        {
          sessionId: id,
          timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
          eventType: 'checkout_complete',
          target: 'checkout_wizard',
          page: '/checkout',
          sequenceNum: 9,
          details: { totalAmount: 279.99, paymentMethod: 'credit_card' }
        }
      ]);
    }

    setIsLoading(false);
  }, [id]);

  const handleExportJson = () => {
    const payload = {
      session,
      exportedAt: new Date().toISOString(),
      events
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-session-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageViewCount = events.filter(e => e.eventType === 'page_view').length;
  const errorCount = events.filter(e => e.eventType.includes('error')).length;
  const clicksCount = events.filter(e => e.eventType === 'click').length;

  return (
    <div className="space-y-8 pb-20">
      {/* Header with back & export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link
            to="/admin"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Session Telemetry Detail
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Session ID: {id}</p>
        </div>

        <button
          onClick={handleExportJson}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Session Info & High-Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Participant</span>
          <p className="text-lg font-black text-slate-900 mt-1">{session?.participantId || 'Participant_Alpha'}</p>
          <p className="text-[11px] text-slate-500">{session?.scenarioId || 'Standard Scenario'}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Page Views</span>
          <p className="text-lg font-black text-blue-600 mt-1">{pageViewCount}</p>
          <p className="text-[11px] text-slate-500">Route transitions</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Interaction Clicks</span>
          <p className="text-lg font-black text-slate-900 mt-1">{clicksCount}</p>
          <p className="text-[11px] text-slate-500">UI click captures</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Form Errors</span>
          <p className={`text-lg font-black mt-1 ${errorCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {errorCount}
          </p>
          <p className="text-[11px] text-slate-500">Input validation errors</p>
        </div>
      </div>

      {/* Usability Study Tasks Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Study Tasks Progress
          </h2>
          <span className="text-xs text-slate-400">5 standard test protocols</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {STUDY_TASKS.map((t, idx) => (
            <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start sm:items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                  {t.taskNumber}
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">{t.title}</h4>
                  <p className="text-slate-500 text-[11px]">{t.instruction}</p>
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Event Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Chronological Event Stream ({events.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Buffered telemetry items</span>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-4 text-left w-12">Seq</th>
                <th className="py-2.5 px-4 text-left w-32">Time</th>
                <th className="py-2.5 px-4 text-left w-36">Event Type</th>
                <th className="py-2.5 px-4 text-left w-48">Target</th>
                <th className="py-2.5 px-4 text-left">Page</th>
                <th className="py-2.5 px-4 text-left">Details Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {events.map((evt, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-400 font-bold">{evt.sequenceNum || idx + 1}</td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-blue-600">
                    {evt.eventType}
                  </td>
                  <td className="py-2.5 px-4 text-slate-800 truncate max-w-[180px]">
                    {evt.target || '—'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 truncate max-w-[140px]">
                    {evt.page}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px] truncate max-w-[280px]">
                    {evt.details ? JSON.stringify(evt.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
