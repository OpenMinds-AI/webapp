import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

interface Talent {
  id: string;
  full_name: string;
  email: string;
  country: string;
  timezone: string;
  avatar_url: string | null;
  primary_role: string;
  skills: string[];
  years_experience: number;
  seniority: string;
  availability: string;
  engagement_type: string;
  work_preference: string;
  hourly_rate_range: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  projects: { title: string; description: string }[];
  proudest_build: string | null;
  looking_for: string[];
  willing_to_mentor: boolean;
  referral_source: string | null;
  why_join: string | null;
  linkedin_url: string | null;
  community_code: string | null;
  status: string;
  created_at: string;
}

const Field = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="py-3 border-b border-[#1A1A1A]">
    <span className="text-[11px] uppercase tracking-[0.08em] text-[#444444]">{label}</span>
    <p className="text-[#CCCCCC] text-sm mt-0.5">{value || '—'}</p>
  </div>
);

export default function AdminReview() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('talents' as any).select('*').eq('id', id).single();
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else setTalent(data as any);
      setLoading(false);
    };
    load();

    // Auto-action from email link
    const action = searchParams.get('action');
    if (action === 'approve' || action === 'reject') {
      // Will be handled after talent loads
    }
  }, [id]);

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!talent) return;
    setActing(true);
    const { error } = await supabase.from('talents' as any).update({ status: action } as any).eq('id', talent.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setDone(action);
      toast({ title: action === 'approved' ? 'Approved ✓' : 'Rejected' });
    }
    setActing(false);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#5B3FA6] border-t-transparent rounded-full animate-spin" /></div>;
  if (!talent) return <div className="min-h-screen bg-black flex items-center justify-center text-[#666666]">Talent not found</div>;

  const avDot = talent.availability === 'Open to work' ? '#22C55E' : talent.availability === 'Building something' ? '#EAB308' : '#EF4444';

  return (
    <div className="min-h-screen bg-black py-12 px-6">
      <div className="max-w-[720px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-5 mb-8">
          {talent.avatar_url ? (
            <img src={talent.avatar_url} alt="" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#0D0D0D] border border-[#1A1A1A]" />
          )}
          <div>
            <h1 className="font-heading text-[28px] font-bold text-white">{talent.full_name}</h1>
            {talent.community_code && <span className="text-sm" style={{ color: '#5B3FA6' }}>{talent.community_code}</span>}
            <div className="flex items-center gap-2 mt-1 text-sm text-[#999]">
              <span>{talent.primary_role}</span>
              <span>·</span>
              <span>{talent.seniority}</span>
              <span>·</span>
              <span>{talent.country}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ background: avDot }} />
              <span className="text-xs text-[#666666]">{talent.availability}</span>
            </div>
          </div>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl p-6" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A' }}>
          <Field label="Email" value={talent.email} />
          <Field label="Timezone" value={talent.timezone} />
          <Field label="Skills" value={talent.skills?.join(', ')} />
          <Field label="Experience" value={`${talent.years_experience} years`} />
          <Field label="Engagement" value={talent.engagement_type} />
          <Field label="Work preference" value={talent.work_preference} />
          <Field label="Hourly rate" value={talent.hourly_rate_range} />
          <Field label="Looking for" value={talent.looking_for?.join(', ')} />
          <Field label="Willing to mentor" value={talent.willing_to_mentor ? 'Yes' : 'No'} />
          <Field label="Portfolio" value={talent.portfolio_url} />
          <Field label="GitHub" value={talent.github_url} />
          <Field label="LinkedIn" value={talent.linkedin_url} />
          <Field label="Referral" value={talent.referral_source} />

          {talent.projects?.length > 0 && talent.projects.some((p: any) => p.title) && (
            <div className="py-3 border-b border-[#1A1A1A]">
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#444444]">Projects</span>
              {talent.projects.map((p: any, i: number) => p.title && (
                <p key={i} className="text-[#CCCCCC] text-sm mt-1"><strong>{p.title}</strong> — {p.description}</p>
              ))}
            </div>
          )}

          {talent.proudest_build && (
            <div className="py-3 border-b border-[#1A1A1A]">
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#444444]">Proudest build</span>
              <p className="text-[#CCCCCC] text-sm mt-0.5">{talent.proudest_build}</p>
            </div>
          )}

          {/* Why join - highlighted */}
          {talent.why_join && (
            <div className="py-3 pl-4 my-4 rounded-r-lg" style={{ borderLeft: '3px solid #5B3FA6' }}>
              <span className="text-[11px] uppercase tracking-[0.08em] text-[#444444]">Why do you want in?</span>
              <p className="text-white text-sm mt-1 leading-relaxed">{talent.why_join}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {done ? (
          <div className="mt-8 text-center py-4 rounded-xl" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A' }}>
            <p className="text-white font-medium">{done === 'approved' ? '✓ Approved' : '✗ Rejected'}</p>
          </div>
        ) : talent.status === 'pending' ? (
          <div className="flex gap-4 mt-8">
            <button onClick={() => handleAction('approved')} disabled={acting}
              className="flex-1 h-12 rounded-[10px] text-white font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#5B3FA6' }}>
              <Check className="w-4 h-4" /> Approve
            </button>
            <button onClick={() => handleAction('rejected')} disabled={acting}
              className="flex-1 h-12 rounded-[10px] font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2 border disabled:opacity-50"
              style={{ borderColor: '#EF4444', color: '#EF4444', background: 'transparent' }}>
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        ) : (
          <div className="mt-8 text-center text-[#666666] text-sm">Status: {talent.status}</div>
        )}
      </div>
    </div>
  );
}
