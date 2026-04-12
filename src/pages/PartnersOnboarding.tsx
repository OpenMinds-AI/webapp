import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STAGES = ['Early beta', 'Launched', 'Scaling', 'Established'];
const OFFER_OPTIONS = ['Free access', 'Discounted access', 'Credits or API access', 'Sponsored hackathon or event', 'Exclusive features for OpenMinds members', 'Mentorship or training from your team', 'Other'];
const WANT_OPTIONS = ['Early adopter feedback', 'Community reach and visibility', 'Featured partner placement', 'Beta testers', 'Co-created content', 'Event collaboration', 'Authentic testimonials', 'Long-term community presence'];
const REFERRAL = ['LinkedIn', 'Twitter', 'Friend', 'Event', 'Other'];

interface FormData {
  full_name: string;
  email: string;
  company_name: string;
  stage: string;
  tool_description: string;
  what_they_offer: string[];
  offer_details: string;
  what_they_want: string[];
  goals: string;
  referral_source: string;
}

const initial: FormData = {
  full_name: '', email: '', company_name: '', stage: '', tool_description: '',
  what_they_offer: [], offer_details: '', what_they_want: [], goals: '', referral_source: '',
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

export default function PartnersOnboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [direction, setDirection] = useState(1);

  const update = (key: keyof FormData, val: any) => setForm(f => ({ ...f, [key]: val }));
  const next = () => { setDirection(1); setStep(s => Math.min(s + 1, 4)); };
  const prev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const toggleArr = (key: 'what_they_offer' | 'what_they_want', val: string) => {
    const arr = form[key];
    update(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('partner_applications' as any).insert({
        full_name: form.full_name,
        email: form.email,
        company_name: form.company_name,
        tool_description: form.tool_description || null,
        stage: form.stage || null,
        what_they_offer: form.what_they_offer,
        offer_details: form.offer_details || null,
        what_they_want: form.what_they_want,
        goals: form.goals || null,
        referral_source: form.referral_source || null,
        status: 'pending',
      } as any);
      if (error) throw error;

      // Notify admin via email
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            type: 'partner',
            record: {
              full_name: form.full_name,
              email: form.email,
              company_name: form.company_name,
              stage: form.stage,
              what_they_offer: form.what_they_offer,
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
          <h1 className="font-heading text-2xl font-bold text-white mb-2">Application received.</h1>
          <p style={{ color: '#666666' }} className="text-sm max-w-sm mx-auto">
            We review every partner personally. We'll be in touch soon.
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
    if (step === 1) return !!form.full_name && !!form.email && !!form.company_name;
    if (step === 2) return form.what_they_offer.length > 0;
    if (step === 3) return form.what_they_want.length > 0;
    return true;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="font-heading text-[32px] font-bold text-white">Tell us about your tool.</h2>
            <StyledInput placeholder="Your name" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
            <StyledInput placeholder="your@email.com" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
            <StyledInput placeholder="What's it called?" value={form.company_name} onChange={e => update('company_name', e.target.value)} />
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] mb-2 block" style={{ color: '#444444' }}>Stage</label>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => <Pill key={s} label={s} selected={form.stage === s} onClick={() => update('stage', s)} />)}
              </div>
            </div>
            <div>
              <label className="text-sm text-white block mb-2">What you've built.</label>
              <textarea rows={3} value={form.tool_description} onChange={e => update('tool_description', e.target.value)}
                placeholder="What does it do? Who is it for? What makes it different."
                className="w-full px-4 py-3 rounded-[10px] text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 resize-none placeholder:text-[#444444]" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">What can you offer the community?</h2>
            <p className="text-[15px]" style={{ color: '#666666' }}>Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
              {OFFER_OPTIONS.map(o => <Pill key={o} label={o} selected={form.what_they_offer.includes(o)} onClick={() => toggleArr('what_they_offer', o)} />)}
            </div>
            <div>
              <label className="text-sm text-white block mb-1">Tell us more about what you're offering.</label>
              <textarea rows={3} value={form.offer_details} onChange={e => update('offer_details', e.target.value)}
                placeholder="How many seats? What discount? Any conditions?"
                className="w-full px-4 py-3 rounded-[10px] text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 resize-none placeholder:text-[#444444]" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">What are you looking for?</h2>
            <p className="text-[15px]" style={{ color: '#666666' }}>Be specific. This helps us match the right opportunity.</p>
            <div className="flex flex-wrap gap-2">
              {WANT_OPTIONS.map(o => <Pill key={o} label={o} selected={form.what_they_want.includes(o)} onClick={() => toggleArr('what_they_want', o)} />)}
            </div>
            <div>
              <label className="text-sm text-white block mb-1">Anything else we can do for you?</label>
              <textarea rows={3} value={form.goals} onChange={e => update('goals', e.target.value)}
                placeholder="Tell us what success looks like for this partnership."
                className="w-full px-4 py-3 rounded-[10px] text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 resize-none placeholder:text-[#444444]" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">Almost there.</h2>
            <div>
              <select value={form.referral_source} onChange={e => update('referral_source', e.target.value)}
                className="w-full h-12 px-4 rounded-[10px] text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 appearance-none"
                style={{ color: form.referral_source ? '#FFFFFF' : '#444444' }}>
                <option value="" disabled>How did you find OpenMinds AI?</option>
                {REFERRAL.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="rounded-[16px] p-6 space-y-4" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A' }}>
              <div>
                <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Company</p>
                <p className="text-white text-sm">{form.company_name}</p>
              </div>
              {form.stage && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Stage</p>
                  <p className="text-white text-sm">{form.stage}</p>
                </div>
              )}
              {form.what_they_offer.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: '#444444' }}>What they offer</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.what_they_offer.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs" style={{ background: '#1A0D2E', border: '1px solid #5B3FA6', color: 'white' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.what_they_want.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: '#444444' }}>What they want</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.what_they_want.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full text-xs" style={{ background: '#1A0D2E', border: '1px solid #5B3FA6', color: 'white' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.offer_details && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: '#444444' }}>Offer details</p>
                  <p className="text-sm line-clamp-3" style={{ color: '#999' }}>{form.offer_details}</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: '#1A1A1A' }}>
        <motion.div className="h-full" style={{ background: '#5B3FA6' }}
          animate={{ width: `${(step / 4) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>
      <div className="text-center pt-8 pb-4">
        <span className="text-[13px]" style={{ color: '#444444' }}>Step {step} of 4</span>
      </div>
      <div className="flex-1 flex items-start justify-center px-6 pb-24">
        <div className="w-full max-w-[600px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={variants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-[600px] mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={prev} className="h-12 px-6 rounded-[10px] text-sm font-medium transition-all duration-200"
              style={{ color: '#666666', border: '1px solid #1A1A1A' }}>Back</button>
          )}
          {step < 4 ? (
            <button onClick={next} disabled={!canNext()}
              className="flex-1 h-12 rounded-[10px] text-white text-sm font-medium transition-all duration-200 disabled:opacity-40"
              style={{ background: '#5B3FA6' }}>Next</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-[52px] rounded-[10px] text-white text-sm font-medium transition-all duration-200 disabled:opacity-60"
              style={{ background: '#5B3FA6' }}>{submitting ? 'Sending...' : 'Apply as a partner'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
