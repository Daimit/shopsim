import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Send } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { api } from '../lib/api';
import { tracker } from '../lib/tracker';
import { useSessionStore } from '../store/sessionStore';
import { ResearchFeedback } from '../types';

const SUS_ITEMS = [
  'I think that I would like to use this system frequently.',
  'I found the system unnecessarily complex.',
  'I thought the system was easy to use.',
  'I think that I would need the support of a technical person to use this system.',
  'I found the various functions in this system were well integrated.',
  'I thought there was too much inconsistency in this system.',
  'I would imagine that most people would learn to use this system very quickly.',
  'I found the system very cumbersome to use.',
  'I felt very confident using the system.',
  'I needed to learn a lot of things before I could get going with this system.',
];

const initialFeedback: ResearchFeedback = {
  responses: Array(10).fill(0),
  demographics: { ageRange: '', shoppingFrequency: '', technicalComfort: 0, deviceType: '' },
  debrief: { effortlessPart: '', hesitationPoint: '', checkoutComparison: '', suggestedChange: '' },
};

export const FeedbackPage: React.FC = () => {
  const navigate = useNavigate();
  const session = useSessionStore((state) => state.session);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const updateResponse = (index: number, value: number) => {
    setFeedback((current) => {
      const responses = [...current.responses];
      responses[index] = value;
      return { ...current, responses };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.id) {
      setError('No active study session was found. Please restart the study session.');
      return;
    }
    if (feedback.responses.some((response) => response < 1 || response > 5)) {
      setError('Please answer all 10 SUS questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await api.submitFeedback(session.id, feedback);
      tracker.track('feedback_submitted', 'post_test_feedback', { susScore: result.susScore });
      setSubmittedScore(result.susScore);
    } catch (err: any) {
      setError(err?.message || 'Feedback could not be submitted. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedScore !== null) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-black text-slate-900">Feedback submitted</h1>
          <p className="mt-2 text-sm text-slate-500">Thank you. Your responses have been saved for the usability study.</p>
          <p className="mt-5 text-3xl font-black text-emerald-600">{submittedScore}/100</p>
          <button type="button" onClick={() => navigate('/')} className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Return to Store</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumb items={[{ label: 'Post-test Feedback', href: '/feedback' }]} />
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-start gap-3">
          <ClipboardList className="mt-1 h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Post-test feedback</h1>
            <p className="mt-1 text-sm text-slate-500">Please answer the SUS questionnaire and share your experience.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">System Usability Scale</h2>
            <div className="mt-4 space-y-3">
              {SUS_ITEMS.map((item, index) => (
                <div key={item} className="rounded-xl border border-slate-100 p-3">
                  <p className="text-xs font-semibold text-slate-800">{index + 1}. {item}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <label key={value} className="flex cursor-pointer items-center gap-1 text-[11px] text-slate-600">
                        <input type="radio" name={`sus-${index}`} value={value} checked={feedback.responses[index] === value} onChange={() => updateResponse(index, value)} />
                        {value}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Participant profile</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Select label="Age range" value={feedback.demographics.ageRange} options={['18-24', '25-34', '35-44', '45-54', '55+']} onChange={(value) => setFeedback((current) => ({ ...current, demographics: { ...current.demographics, ageRange: value } }))} />
              <Select label="Online shopping frequency" value={feedback.demographics.shoppingFrequency} options={['Daily', 'Weekly', 'Monthly', 'Rarely']} onChange={(value) => setFeedback((current) => ({ ...current, demographics: { ...current.demographics, shoppingFrequency: value } }))} />
              <Select label="Device" value={feedback.demographics.deviceType} options={['Desktop', 'Laptop', 'Mobile', 'Tablet']} onChange={(value) => setFeedback((current) => ({ ...current, demographics: { ...current.demographics, deviceType: value } }))} />
              <Select label="Technical comfort" value={String(feedback.demographics.technicalComfort || '')} options={['1', '2', '3', '4', '5']} onChange={(value) => setFeedback((current) => ({ ...current, demographics: { ...current.demographics, technicalComfort: Number(value) } }))} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Debrief</h2>
            <div className="mt-4 space-y-3">
              <TextArea label="Which part felt most effortless?" value={feedback.debrief.effortlessPart} onChange={(value) => setFeedback((current) => ({ ...current, debrief: { ...current.debrief, effortlessPart: value } }))} />
              <TextArea label="Where did you hesitate or feel uncertain?" value={feedback.debrief.hesitationPoint} onChange={(value) => setFeedback((current) => ({ ...current, debrief: { ...current.debrief, hesitationPoint: value } }))} />
              <TextArea label="How did checkout compare with other stores?" value={feedback.debrief.checkoutComparison} onChange={(value) => setFeedback((current) => ({ ...current, debrief: { ...current.debrief, checkoutComparison: value } }))} />
              <TextArea label="What one change would improve the experience?" value={feedback.debrief.suggestedChange} onChange={(value) => setFeedback((current) => ({ ...current, debrief: { ...current.debrief, suggestedChange: value } }))} />
            </div>
          </section>

          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"><Send className="h-4 w-4" />{isSubmitting ? 'Submitting...' : 'Submit feedback'}</button>
        </form>
      </div>
    </div>
  );
};

const Select: React.FC<{ label: string; value: string; options: string[]; onChange: (value: string) => void }> = ({ label, value, options, onChange }) => (
  <label className="text-xs font-semibold text-slate-600">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800"><option value="">Select</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
);

const TextArea: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="block text-xs font-semibold text-slate-600">{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800" /></label>
);
