import React, { useState } from 'react';
import { Check, Settings } from 'lucide-react';
import { AdminShell } from '../../components/admin/AdminShell';

export const AdminSettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);

  return (
    <AdminShell>
      <div className="space-y-6 pb-16">
        <header className="border-b border-slate-200 pb-5">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-blue-600">Workspace</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure how your research workspace presents collected data.</p>
        </header>
        <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }} className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Settings className="h-4 w-4" /></span>
            <div><h2 className="text-sm font-bold text-slate-900">Research display settings</h2><p className="mt-1 text-xs text-slate-500">These preferences affect your local dashboard view only.</p></div>
          </div>
          <div className="space-y-5 pt-5">
            <label className="flex items-start gap-3 text-xs text-slate-600"><input type="checkbox" defaultChecked className="mt-0.5 accent-blue-600" /><span><strong className="block text-slate-800">Show empty-state guidance</strong><span>Explain when a metric needs more collected data.</span></span></label>
            <label className="flex items-start gap-3 text-xs text-slate-600"><input type="checkbox" defaultChecked className="mt-0.5 accent-blue-600" /><span><strong className="block text-slate-800">Separate measured and derived insights</strong><span>Keep AI-style interpretations visibly distinct from observed metrics.</span></span></label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800">{saved && <Check className="h-3.5 w-3.5" />}{saved ? 'Settings saved' : 'Save settings'}</button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
};
