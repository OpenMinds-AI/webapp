import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, X, Plus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ROLES = ['AI Engineer', 'Full-Stack Dev', 'Backend Dev', 'Frontend Dev', 'Data Scientist', 'ML Engineer', 'Product Designer', 'No-Code Builder', 'Other'];
const SENIORITY = ['Junior', 'Mid', 'Senior', 'Lead'];
const AVAILABILITY_OPTIONS = [
  { label: 'Open to work', color: '#22C55E' },
  { label: 'Building something', color: '#EAB308' },
  { label: 'Unavailable', color: '#EF4444' },
];
const ENGAGEMENT = ['Project-based', 'Part-time', 'Full-time', 'Open to anything'];
const WORK_PREF = ['Remote only', 'Hybrid', 'Flexible'];
const LOOKING_FOR = ['Work', 'Mentorship', 'Community'];
const REFERRAL = ['LinkedIn', 'Twitter', 'Friend', 'Event', 'Other'];

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bangladesh','Belgium','Brazil','Bulgaria','Cambodia','Canada','Chile','China','Colombia',
  'Croatia','Czech Republic','Denmark','Egypt','Estonia','Ethiopia','Finland','France',
  'Georgia','Germany','Ghana','Greece','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Japan','Jordan','Kazakhstan','Kenya','South Korea','Latvia',
  'Lebanon','Lithuania','Luxembourg','Malaysia','Mexico','Morocco','Myanmar','Nepal',
  'Netherlands','New Zealand','Nigeria','Norway','Pakistan','Peru','Philippines','Poland',
  'Portugal','Romania','Russia','Saudi Arabia','Serbia','Singapore','Slovakia','Slovenia',
  'South Africa','Spain','Sri Lanka','Sweden','Switzerland','Taiwan','Thailand','Tunisia',
  'Turkey','UAE','Uganda','Ukraine','United Kingdom','United States','Uruguay','Uzbekistan',
  'Venezuela','Vietnam'
];

interface FormData {
  full_name: string;
  email: string;
  country: string;
  timezone: string;
  avatar_url: string;
  primary_role: string;
  skills: string[];
  years_experience: number;
  seniority: string;
  availability: string;
  engagement_type: string;
  work_preference: string;
  hourly_rate_range: string;
  portfolio_url: string;
  github_url: string;
  projects: { title: string; description: string }[];
  proudest_build: string;
  looking_for: string[];
  willing_to_mentor: boolean;
  referral_source: string;
  why_join: string;
  linkedin_url: string;
}

const initialForm: FormData = {
  full_name: '', email: '', country: '', timezone: '', avatar_url: '',
  primary_role: '', skills: [], years_experience: 0, seniority: '',
  availability: '', engagement_type: '', work_preference: '', hourly_rate_range: '',
  portfolio_url: '', github_url: '',
  projects: [{ title: '', description: '' }, { title: '', description: '' }],
  proudest_build: '', looking_for: [], willing_to_mentor: false,
  referral_source: '', why_join: '', linkedin_url: '',
};

const Pill = ({ label, selected, onClick, dot }: { label: string; selected: boolean; onClick: () => void; dot?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 border flex items-center gap-2"
    style={{
      background: selected ? '#1A0D2E' : '#0D0D0D',
      borderColor: selected ? '#5B3FA6' : '#1A1A1A',
      color: selected ? '#FFFFFF' : '#666666',
    }}
  >
    {dot && <span className="w-2 h-2 rounded-full" style={{ background: dot }} />}
    {label}
  </button>
);

const StyledInput = ({ style, onFocus, onBlur, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full h-12 px-4 rounded-[10px] text-white text-sm border focus:outline-none transition-colors duration-200 placeholder:text-[#444444] autofill-fix"
    style={{ background: '#0D0D0D', borderColor: '#1A1A1A', ...style }}
    onFocus={e => { e.currentTarget.style.borderColor = '#5B3FA6'; onFocus?.(e); }}
    onBlur={e => { e.currentTarget.style.borderColor = '#1A1A1A'; onBlur?.(e); }}
  />
);

const StyledTextarea = ({ maxLen, value, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { maxLen: number; value: string }) => (
  <div className="relative">
    <textarea
      {...props}
      value={value}
      maxLength={maxLen}
      className="w-full px-4 py-3 rounded-[10px] text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors duration-200 resize-none placeholder:text-[#444444]"
    />
    <span className="absolute bottom-2 right-3 text-[11px]" style={{ color: '#444444' }}>
      {(value || '').length}/{maxLen}
    </span>
  </div>
);

export default function JoinOnboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [skillInput, setSkillInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDrop, setShowCountryDrop] = useState(false);
  const [direction, setDirection] = useState(1);
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setForm(f => ({ ...f, timezone: tz }));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountryDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const update = (key: keyof FormData, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `talent-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file);
    if (error) { toast({ title: 'Upload failed', variant: 'destructive' }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    update('avatar_url', urlData.publicUrl);
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(false);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      update('skills', [...form.skills, s]);
      setSkillInput('');
    }
  };

  const next = () => { setDirection(1); setStep(s => Math.min(s + 1, 6)); };
  const prev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Generate community code server-side to avoid RLS issues
      const { data: codeData, error: codeError } = await supabase.rpc('generate_community_code' as any);
      if (codeError) throw codeError;
      const nextCode = codeData as string;

      const { error } = await supabase.from('talents' as any).insert({
        full_name: form.full_name,
        email: form.email,
        country: form.country,
        timezone: form.timezone,
        avatar_url: form.avatar_url || null,
        primary_role: form.primary_role,
        skills: form.skills,
        years_experience: form.years_experience,
        seniority: form.seniority,
        availability: form.availability,
        engagement_type: form.engagement_type,
        work_preference: form.work_preference,
        hourly_rate_range: form.hourly_rate_range || null,
        portfolio_url: form.portfolio_url || null,
        github_url: form.github_url || null,
        projects: form.projects.filter(p => p.title),
        proudest_build: form.proudest_build || null,
        looking_for: form.looking_for,
        willing_to_mentor: form.willing_to_mentor,
        referral_source: form.referral_source || null,
        why_join: form.why_join || null,
        linkedin_url: form.linkedin_url || null,
        community_code: nextCode,
        status: 'pending',
      } as any);

      if (error) throw error;

      // Notify admin via email
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            type: 'talent',
            record: {
              full_name: form.full_name,
              email: form.email,
              country: form.country,
              primary_role: form.primary_role,
              skills: form.skills,
            },
          },
        });
      } catch (_) { /* don't block submission */ }

      setSubmitted(true);
    } catch (e: any) {
      toast({ title: 'Something went wrong', description: e.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          {avatarPreview && <img src={avatarPreview} alt="" className="w-24 h-24 rounded-full mx-auto mb-6 object-cover" />}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: '#5B3FA6' }}>
            <Check className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="font-heading text-2xl font-bold text-white mb-2">{form.full_name}</h1>
          <p className="text-[#666666] text-sm">Application received. We'll be in touch.</p>
        </motion.div>
      </div>
    );
  }

  const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="font-heading text-[32px] font-bold text-white">Let's start with you.</h2>
            <p className="text-[15px]" style={{ color: '#666666' }}>This takes 4 minutes.</p>
            <div className="space-y-4 mt-6">
              <StyledInput placeholder="Your full name" value={form.full_name} onChange={e => update('full_name', e.target.value)} />
              <StyledInput placeholder="your@email.com" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
              <div ref={countryRef} className="relative">
                <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Where are you from?</label>
                <StyledInput
                  placeholder="Your country"
                  value={showCountryDrop ? countrySearch : form.country}
                  onFocus={() => { setShowCountryDrop(true); setCountrySearch(''); }}
                  onChange={e => setCountrySearch(e.target.value)}
                />
                {showCountryDrop && (
                  <div className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-[10px] border border-[#1A1A1A] bg-[#0D0D0D]">
                    {filteredCountries.map(c => (
                      <button key={c} type="button" className="w-full text-left px-4 py-2 text-sm text-[#999] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                        onClick={() => { update('country', c); setShowCountryDrop(false); }}>
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Where are you based?</label>
                <select
                  value={form.timezone}
                  onChange={e => update('timezone', e.target.value)}
                  className="w-full h-12 px-4 rounded-[10px] text-white text-sm border focus:outline-none transition-colors appearance-none"
                  style={{ background: '#0D0D0D', borderColor: '#1A1A1A' }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#5B3FA6'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#1A1A1A'; }}
                >
                  {(Intl as any).supportedValuesOf('timeZone').map((tz: string) => {
                    const parts = tz.split('/');
                    const city = (parts[parts.length - 1] || '').replace(/_/g, ' ');
                    const region = (parts.length > 1 ? parts[parts.length - 2] : '').replace(/_/g, ' ');
                    const friendly = region ? `${city}, ${region}` : city;
                    return <option key={tz} value={tz}>{friendly}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">LinkedIn</label>
                <StyledInput placeholder="linkedin.com/in/yourname" value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} />
              </div>
              <div className="flex items-center gap-4">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) { setAvatarFile(e.target.files[0]); handleAvatarUpload(e.target.files[0]); } }} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-[88px] h-[88px] rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden hover:border-[#5B3FA6] transition-colors"
                  style={{ background: '#0D0D0D', borderColor: '#5B3FA6' }}>
                  {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : <Camera className="w-5 h-5 text-[#444444]" />}
                </button>
                {avatarPreview && (
                  <button type="button" onClick={() => { setAvatarPreview(''); update('avatar_url', ''); setAvatarFile(null); }}
                    className="text-xs text-[#666666] hover:text-white transition-colors">Remove</button>
                )}
                {uploading && <span className="text-xs text-[#666666]">Uploading...</span>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">What do you build?</h2>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Primary role</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map(r => <Pill key={r} label={r} selected={form.primary_role === r} onClick={() => update('primary_role', r)} />)}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ background: '#1A0D2E', border: '1px solid #5B3FA6', color: 'white' }}>
                    {s} <button type="button" onClick={() => update('skills', form.skills.filter(sk => sk !== s))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <StyledInput placeholder="e.g. React, Python, LangChain..." value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-3 block">
                Years of experience — <span className="text-white font-medium normal-case tracking-normal">{form.years_experience === 0 ? '< 1 year' : form.years_experience === 20 ? '20+ years' : `${form.years_experience} years`}</span>
              </label>
              <input type="range" min={0} max={20} step={1} value={form.years_experience}
                onChange={e => update('years_experience', parseInt(e.target.value))}
                className="w-full accent-[#5B3FA6]" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Seniority</label>
              <div className="flex flex-wrap gap-2">
                {SENIORITY.map(s => <Pill key={s} label={s} selected={form.seniority === s} onClick={() => update('seniority', s)} />)}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">How do you operate?</h2>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Availability</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map(a => <Pill key={a.label} label={a.label} selected={form.availability === a.label} onClick={() => update('availability', a.label)} dot={a.color} />)}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Engagement type</label>
              <div className="flex flex-wrap gap-2">
                {ENGAGEMENT.map(e => <Pill key={e} label={e} selected={form.engagement_type === e} onClick={() => update('engagement_type', e)} />)}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Work preference</label>
              <div className="flex flex-wrap gap-2">
                {WORK_PREF.map(w => <Pill key={w} label={w} selected={form.work_preference === w} onClick={() => update('work_preference', w)} />)}
              </div>
            </div>
            <div>
              <StyledInput placeholder="Hourly rate (optional)" value={form.hourly_rate_range} onChange={e => update('hourly_rate_range', e.target.value)} />
              <p className="text-[11px] mt-1.5" style={{ color: '#444444' }}>Private. Only visible to matched projects.</p>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">Show your work.</h2>
            <StyledInput placeholder="yoursite.com" value={form.portfolio_url} onChange={e => update('portfolio_url', e.target.value)} />
            <StyledInput placeholder="github.com/you" value={form.github_url} onChange={e => update('github_url', e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {form.projects.map((p, i) => (
                <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A' }}>
                  <StyledInput placeholder="Project name" value={p.title} onChange={e => {
                    const ps = [...form.projects]; ps[i] = { ...ps[i], title: e.target.value }; update('projects', ps);
                  }} />
                  <StyledInput placeholder="What it does in one sentence" value={p.description} onChange={e => {
                    const ps = [...form.projects]; ps[i] = { ...ps[i], description: e.target.value }; update('projects', ps);
                  }} />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-[#666666] mb-1.5 block">One thing you built that stuck with you.</label>
              <StyledTextarea placeholder="" rows={3} maxLen={200} value={form.proudest_build} onChange={e => update('proudest_build', e.target.value)} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">What are you here for?</h2>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">Looking for</label>
              <div className="flex flex-wrap gap-2">
                {LOOKING_FOR.map(l => (
                  <Pill key={l} label={l} selected={form.looking_for.includes(l)}
                    onClick={() => update('looking_for', form.looking_for.includes(l) ? form.looking_for.filter(x => x !== l) : [...form.looking_for, l])} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-white">I'm open to mentoring others.</span>
              <button type="button" onClick={() => update('willing_to_mentor', !form.willing_to_mentor)}
                className="w-12 h-6 rounded-full relative transition-colors duration-200"
                style={{ background: form.willing_to_mentor ? '#5B3FA6' : '#1A1A1A' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                  style={{ left: form.willing_to_mentor ? '26px' : '2px' }} />
              </button>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.08em] text-[#444444] mb-2 block">How did you find us</label>
              <select value={form.referral_source} onChange={e => update('referral_source', e.target.value)}
                className="w-full h-12 px-4 rounded-[10px] text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors appearance-none">
                <option value="">Select...</option>
                {REFERRAL.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#666666] mb-1.5 block">This is read by humans. Be real.</label>
              <StyledTextarea placeholder="" rows={4} maxLen={300} value={form.why_join} onChange={e => update('why_join', e.target.value)} />
              <p className="text-[12px] mt-1" style={{ color: '#444444' }}>Your answer is the most important part of this application.</p>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h2 className="font-heading text-[32px] font-bold text-white">Ready to send?</h2>
            <p className="text-[15px]" style={{ color: '#666666' }}>Here's what we'll share with the team.</p>
            <div className="rounded-2xl p-6 space-y-4" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A' }}>
              <div className="flex items-center gap-4">
                {avatarPreview && <img src={avatarPreview} alt="" className="w-14 h-14 rounded-full object-cover" />}
                <div>
                  <p className="text-white font-heading font-bold">{form.full_name}</p>
                  <p className="text-sm" style={{ color: '#7C6FE0' }}>{form.primary_role}</p>
                  <p className="text-xs" style={{ color: '#666666' }}>{form.seniority} · {form.country}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div><span className="text-[#444444] text-[11px] uppercase tracking-wider">Skills</span><p className="text-[#999]">{form.skills.join(', ') || '—'}</p></div>
                <div><span className="text-[#444444] text-[11px] uppercase tracking-wider">Availability</span><p className="text-[#999]">{form.availability || '—'}</p></div>
                <div><span className="text-[#444444] text-[11px] uppercase tracking-wider">Engagement</span><p className="text-[#999]">{form.engagement_type || '—'}</p></div>
                <div><span className="text-[#444444] text-[11px] uppercase tracking-wider">Looking for</span><p className="text-[#999]">{form.looking_for.join(', ') || '—'}</p></div>
                <div><span className="text-[#444444] text-[11px] uppercase tracking-wider">Mentor</span><p className="text-[#999]">{form.willing_to_mentor ? 'Yes' : 'No'}</p></div>
                <div><span className="text-[#444444] text-[11px] uppercase tracking-wider">Portfolio</span><p className="text-[#999] truncate">{form.portfolio_url || '—'}</p></div>
                <div><span className="text-[#444444] text-[11px] uppercase tracking-wider">GitHub</span><p className="text-[#999] truncate">{form.github_url || '—'}</p></div>
              </div>
              {form.why_join && (
                <div>
                  <span className="text-[#444444] text-[11px] uppercase tracking-wider">Why join</span>
                  <p className="text-[#999] text-sm mt-1 line-clamp-3">{form.why_join}</p>
                </div>
              )}
            </div>
            <StyledInput placeholder="LinkedIn or personal site (optional)" value={form.linkedin_url} onChange={e => update('linkedin_url', e.target.value)} />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-[52px] rounded-[10px] text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-50"
              style={{ background: '#5B3FA6' }}
            >
              {submitting ? 'Sending...' : 'Send my application'}
            </button>
          </div>
        );
    }
  };

  const canNext = () => {
    if (step === 1) return form.full_name && form.email && form.country;
    if (step === 2) return form.primary_role && form.seniority;
    return true;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top bar */}
      <div className="relative">
        <div className="flex items-center justify-between px-6 py-4 max-w-[560px] mx-auto w-full">
          {step > 1 ? (
            <button type="button" onClick={prev} className="px-3 py-1.5 rounded-[10px] text-sm border border-[#1A1A1A] text-[#666666] hover:border-[#333] hover:text-white transition-all duration-200 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : <div className="w-10" />}
          <span className="text-sm" style={{ color: '#444444' }}>{step} / 6</span>
          <div className="w-10" />
        </div>
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-[#1A1A1A]">
          <motion.div className="h-full" style={{ background: '#5B3FA6' }} animate={{ width: `${(step / 6) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 pt-8 pb-24">
        <div className="w-full max-w-[560px]">
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

      {/* Bottom bar */}
      {step < 6 && (
        <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-black border-t border-[#1A1A1A]">
          <div className="max-w-[560px] mx-auto flex justify-end">
            <button
              type="button"
              onClick={next}
              disabled={!canNext()}
              className="h-12 px-8 rounded-[10px] text-white font-semibold text-sm transition-all duration-200 disabled:opacity-30"
              style={{ background: '#5B3FA6' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
