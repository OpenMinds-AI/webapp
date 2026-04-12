import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const INTENTS = [
  { key: 'build', title: 'Build & Automate', subtitle: 'Products, tools, workflows, AI agents.' },
  { key: 'learn', title: 'Learn & Grow', subtitle: 'Training, tutoring, consulting, mentoring.' },
  { key: 'events', title: 'Events', subtitle: 'Hackathons, workshops, showcases.' },
  { key: 'find', title: 'Find Talent', subtitle: 'Hire, match, long-term resource.' },
];

const SUB_INTENTS: Record<string, string[]> = {
  build: ['MVP', 'Product build', 'Internal tool or dashboard', 'AI automation and workflows', 'AI agents and integrations', 'No-code or low-code solution', 'Process optimization'],
  learn: ['Workshops and Masterclasses', 'Mentor or Mentee session', 'Tech consulting', 'AI and data strategy', 'Tutoring session'],
  events: ['Hackathon', 'Workshop', 'Showcase', 'Meetup', 'Conference'],
  find: ['Talent matching (project-based)', 'Part-time hire', 'Full-time hire', 'Cybersecurity audit', 'AI-powered matching'],
};

const BUDGET = ['Under €1k', '€1k–5k', '€5k–15k', '€15k–50k', '€50k+', "Let's discuss"];
const TIMELINE = ['ASAP', 'Within 1 month', '1–3 months', '3–6 months', 'No rush'];
const REFERRAL = ['LinkedIn', 'Twitter', 'Friend', 'Event', 'Other'];

interface FormData {
  intent_group: string;
  sub_intents: string[];
  description: string;
  full_name: string;
  email: string;
  company_name: string;
  budget_range: string;
  timeline: string;
  referral_source: string;
}

const initial: FormData = {
  intent_group: '', sub_intents: [], description: '',
  full_name: '', email: '', company_name: '',
  budget_range: '', timeline: '', referral_source: '',
};

const Pill = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 border"
    style={{
      background: selected ? '#1A0D2E' : '#0D0D0D',
      borderColor: selected ? '#5B3FA6' : '#1A1A1A',
      color: selected ? '#FFFFFF' : '#666666',
    }}
  >{label}</button>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full h-12 px-4 rounded-[10px] text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 placeholder:text-[#444444]" />
);

const StyledSelect = ({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    className="w-full h-12 px-4 rounded-[10px] text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 appearance-none"
    style={{ color: value ? '#FFFFFF' : '#444444' }}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default function VenturesOnboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);

  const update = (key: keyof FormData, val: any) => setForm(f => ({ ...f, [key]: val }));
  const next = () => { setDirection(1); setStep(s => Math.min(s + 1, 4)); };
  const prev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const toggleSub = (s: string) => {
    update('sub_intents', form.sub_intents.includes(s)
      ? form.sub_intents.filter(x => x !== s)
      : [...form.sub_intents, s]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('ventures' as any).insert({
        full_name: form.full_name,
        email: form.email,
        company_name: form.company_name || null,
        intent_group: form.intent_group,
        sub_intents: form.sub_intents,
        description: form.description || null,
        budget_range: form.budget_range || null,
        timeline: form.timeline || null,
        referral_source: form.referral_source || null,
        status: 'pending',
      } as any);
      if (error) throw error;

      // Notify admin via email
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            type: 'venture',
            record: {
              full_name: form.full_name,
              email: form.email,
              company_name: form.company_name,
              intent_group: form.intent_group,
              budget_range: form.budget_range,
              timeline: form.timeline,
              description: form.description,
            },
          },
        });
      } catch (_) { /* don't block submission */ }

      setSubmitted(true);
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#5B3FA6' }}>
            <Check className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">Brief received. We're on it.</h1>
          <p style={{ color: '#666666' }} className="text-sm max-w-sm mx-auto">
            We'll match you with the right builder and be in touch within 48 hours.
          </p>
        </motion.div>
      </div>
    );
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  const canNext = () => {
    if (step === 1) return !!form.intent_group;
    if (step === 2) return form.sub_intents.length > 0;
    if (step === 3) return !!form.full_name && !!form.email;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="font-heading text-[32px] font-bold text-white">What do you need?</h2>
            <p className="text-[15px]" style={{ color: '#666666' }}>Pick what fits. You can select more than one.</p>
            <div className="space-y-3 mt-6">
              {INTENTS.map(i => (
                <button key={i.key} type="button" onClick={() => { update('intent_group', i.key); update('sub_intents', []); }}
                  className="w-full text-left rounded-[12px] p-5 transition-all duration-200"
                  style={{
                    background: form.intent_group === i.key ? '#1A0D2E' : '#0D0D0D',
                    border: `1px solid ${form.intent_group === i.key ? '#5B3FA6' : '#1A1A1A'}`,
                  }}
                >
                  <p className="text-white font-medium text-[15px]">{i.title}</p>
                  <p className="text-[13px] mt-1" style={{ color: '#666666' }}>{i.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">What specifically?</h2>
            <div className="flex flex-wrap gap-2">
              {(SUB_INTENTS[form.intent_group] || []).map(s => (
                <Pill key={s} label={s} selected={form.sub_intents.includes(s)} onClick={() => toggleSub(s)} />
              ))}
            </div>
            <div>
              <label className="text-sm text-white block mb-2">Tell us exactly what you want.</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe what you need, what you've tried, what success looks like..."
                className="w-full px-4 py-3 rounded-[10px] text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 resize-none placeholder:text-[#444444]"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="font-heading text-[32px] font-bold text-white">Who are we talking to?</h2>
            <StyledInput placeholder="Your full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
            <StyledInput placeholder="your@email.com" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
            <StyledInput placeholder="Your company or project — optional" value={form.company_name} onChange={e => update('company_name', e.target.value)} />
            <StyledSelect value={form.budget_range} onChange={v => update('budget_range', v)} options={BUDGET} placeholder="Budget range" />
            <StyledSelect value={form.timeline} onChange={v => update('timeline', v)} options={TIMELINE} placeholder="Timeline" />
            <StyledSelect value={form.referral_source} onChange={v => update('referral_source', v)} options={REFERRAL} placeholder="How did you find OpenMinds AI?" />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">Ready to send?</h2>
            <p className="text-[15px]" style={{ color: '#666666' }}>Here's your brief.</p>
            <div className="rounded-[16px] p-6 space-y-4" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A' }}>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Intent</p>
                <p className="text-white text-sm">{INTENTS.find(i => i.key === form.intent_group)?.title}</p>
              </div>
              {form.sub_intents.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: '#444444' }}>Specifics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.sub_intents.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs" style={{ background: '#1A0D2E', border: '1px solid #5B3FA6', color: 'white' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.description && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Description</p>
                  <p className="text-sm line-clamp-4" style={{ color: '#999' }}>{form.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Name</p>
                  <p className="text-white text-sm">{form.full_name}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Email</p>
                  <p className="text-white text-sm">{form.email}</p>
                </div>
                {form.company_name && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Company</p>
                    <p className="text-white text-sm">{form.company_name}</p>
                  </div>
                )}
                {form.budget_range && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Budget</p>
                    <p className="text-white text-sm">{form.budget_range}</p>
                  </div>
                )}
                {form.timeline && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Timeline</p>
                    <p className="text-white text-sm">{form.timeline}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: '#1A1A1A' }}>
        <motion.div className="h-full" style={{ background: '#5B3FA6' }}
          animate={{ width: `${(step / 4) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Step counter */}
      <div className="text-center pt-8 pb-4">
        <span className="text-[13px]" style={{ color: '#444444' }}>Step {step} of 4</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 pb-24">
        <div className="w-full max-w-[600px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-[600px] mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={prev} className="h-12 px-6 rounded-[10px] text-sm font-medium transition-all duration-200"
              style={{ color: '#666666', border: '1px solid #1A1A1A' }}>
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={next} disabled={!canNext()}
              className="flex-1 h-12 rounded-[10px] text-white text-sm font-medium transition-all duration-200 disabled:opacity-40"
              style={{ background: '#5B3FA6' }}>
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-[52px] rounded-[10px] text-white text-sm font-medium transition-all duration-200 disabled:opacity-60"
              style={{ background: '#5B3FA6' }}>
              {submitting ? 'Sending...' : 'Send my brief'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
