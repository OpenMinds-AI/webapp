import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import NeuralCanvas from '@/components/NeuralCanvas';
import PortalNav from '@/components/collective/PortalNav';

const AVAIL_OPTIONS = ['Open to work', 'Building something', 'Unavailable'];

const avDotColor = (a: string | null) =>
  a === 'Open to work' ? '#22C55E' : a === 'Building something' ? '#EAB308' : '#EF4444';

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] uppercase tracking-[0.08em] text-[#444444] block mb-1">{children}</span>;
}

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [talent, setTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }

    const load = async () => {
      const { data } = await supabase.from('talents' as any).select('*').eq('email', user.email).single();
      if (!data || (data as any).status !== 'approved') {
        navigate('/pending');
        return;
      }
      setTalent(data);
      setForm(data);
      setLoading(false);
    };
    load();
  }, [user, authLoading]);

  const updateAvailability = async (av: string) => {
    const { error } = await supabase.from('talents' as any).update({ availability: av } as any).eq('id', talent.id);
    if (!error) {
      setTalent({ ...talent, availability: av });
      setForm({ ...form, availability: av });
      toast.success('Availability updated');
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from('talents' as any).update({
      full_name: form.full_name,
      primary_role: form.primary_role,
      seniority: form.seniority,
      country: form.country,
      skills: form.skills,
      engagement_type: form.engagement_type,
      work_preference: form.work_preference,
      looking_for: form.looking_for,
      willing_to_mentor: form.willing_to_mentor,
      proudest_build: form.proudest_build,
      portfolio_url: form.portfolio_url,
      github_url: form.github_url,
      linkedin_url: form.linkedin_url,
    } as any).eq('id', talent.id);
    setSaving(false);
    if (!error) {
      setTalent({ ...talent, ...form });
      setEditing(false);
      toast.success('Profile updated');
    } else {
      toast.error('Failed to save');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5B3FA6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!talent) return null;

  return (
    <div className="min-h-screen bg-black relative">
      <NeuralCanvas />
      <div className="relative z-10">
        <PortalNav
          activeTab="profile"
          talentName={talent.full_name}
          avatarUrl={talent.avatar_url}
        />

        <div className="max-w-[800px] mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-[32px] font-bold text-white">My Profile</h1>
              <p className="text-[#666666] text-[15px]">This is how the network sees you.</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-lg text-sm border border-[#1A1A1A] text-[#666666] hover:text-white hover:border-[#5B3FA6] transition-all"
              >
                Edit profile
              </button>
            )}
          </div>

          {/* Availability toggle */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: avDotColor(talent.availability) }} />
              <span className="text-white text-sm font-medium">{talent.availability}</span>
              <span className="text-[#444444] text-[12px] ml-2">Visible to the network</span>
            </div>
            <div className="flex gap-2">
              {AVAIL_OPTIONS.map(a => (
                <button
                  key={a}
                  onClick={() => updateAvailability(a)}
                  className="px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.08em] font-medium border transition-all duration-200"
                  style={{
                    background: talent.availability === a ? '#1A0D2E' : 'transparent',
                    borderColor: talent.availability === a ? '#5B3FA6' : '#1A1A1A',
                    color: talent.availability === a ? 'white' : '#666666',
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: avDotColor(a) }} />
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Profile content */}
          <div className="rounded-[20px] border border-[#1A1A1A] p-8" style={{ background: '#0D0D0D' }}>
            {/* Avatar + Name */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative flex-shrink-0">
                {talent.avatar_url ? (
                  <img src={talent.avatar_url} alt="" className="w-[88px] h-[88px] rounded-full object-cover" />
                ) : (
                  <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-heading text-2xl font-bold" style={{ background: '#1A0D2E', color: '#7C6FE0' }}>
                    {initials(talent.full_name)}
                  </div>
                )}
              </div>
              <div>
                {editing ? (
                  <input
                    value={form.full_name}
                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                    className="bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white font-heading text-xl font-bold focus:border-[#5B3FA6] focus:outline-none w-full"
                  />
                ) : (
                  <h2 className="font-heading text-[26px] font-bold text-white">{talent.full_name}</h2>
                )}
                <p className="text-sm" style={{ color: '#5B3FA6' }}>{talent.community_code}</p>
                <p className="text-sm text-[#666666]">{talent.primary_role} · {talent.seniority} · {talent.country}</p>
              </div>
            </div>

            <div className="space-y-5 text-sm">
              {/* Role & Seniority */}
              {editing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Role</Label>
                    <input value={form.primary_role || ''} onChange={e => setForm({ ...form, primary_role: e.target.value })}
                      className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none" />
                  </div>
                  <div>
                    <Label>Seniority</Label>
                    <select value={form.seniority || ''} onChange={e => setForm({ ...form, seniority: e.target.value })}
                      className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none appearance-none">
                      <option value="Junior">Junior</option>
                      <option value="Mid">Mid</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </div>
                  <div>
                    <Label>Country</Label>
                    <input value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })}
                      className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none" />
                  </div>
                  <div>
                    <Label>Engagement type</Label>
                    <input value={form.engagement_type || ''} onChange={e => setForm({ ...form, engagement_type: e.target.value })}
                      className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Skills */}
                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {talent.skills?.map((s: string) => (
                        <span key={s} className="text-[11px] uppercase tracking-[0.06em] text-[#999] px-2 py-[3px] rounded border border-[#1A1A1A]">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Engagement</Label><p className="text-[#999]">{talent.engagement_type}</p></div>
                    <div><Label>Work preference</Label><p className="text-[#999]">{talent.work_preference}</p></div>
                    <div><Label>Looking for</Label><p className="text-[#999]">{talent.looking_for?.join(', ')}</p></div>
                    <div><Label>Mentor</Label><p className="text-[#999]">{talent.willing_to_mentor ? 'Yes' : 'No'}</p></div>
                  </div>
                </>
              )}

              {/* Skills edit */}
              {editing && (
                <div>
                  <Label>Skills (comma-separated)</Label>
                  <input
                    value={(form.skills || []).join(', ')}
                    onChange={e => setForm({ ...form, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                    className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none"
                  />
                </div>
              )}

              {/* Links */}
              {editing ? (
                <div className="space-y-3">
                  <div><Label>Portfolio URL</Label><input value={form.portfolio_url || ''} onChange={e => setForm({ ...form, portfolio_url: e.target.value })}
                    className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none" /></div>
                  <div><Label>GitHub URL</Label><input value={form.github_url || ''} onChange={e => setForm({ ...form, github_url: e.target.value })}
                    className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none" /></div>
                  <div><Label>LinkedIn URL</Label><input value={form.linkedin_url || ''} onChange={e => setForm({ ...form, linkedin_url: e.target.value })}
                    className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none" /></div>
                  <div><Label>Proudest build</Label><textarea value={form.proudest_build || ''} onChange={e => setForm({ ...form, proudest_build: e.target.value })}
                    className="w-full bg-[#111] border border-[#1A1A1A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#5B3FA6] focus:outline-none resize-none" rows={3} /></div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.willing_to_mentor || false} onChange={e => setForm({ ...form, willing_to_mentor: e.target.checked })}
                      className="rounded border-[#1A1A1A] bg-[#111] text-[#5B3FA6] focus:ring-[#5B3FA6]" />
                    <span className="text-sm text-[#999]">Open to mentoring</span>
                  </div>
                </div>
              ) : (
                <>
                  {talent.portfolio_url && <div><Label>Portfolio</Label><a href={talent.portfolio_url} target="_blank" rel="noopener" className="text-[#7C6FE0] hover:underline">{talent.portfolio_url}</a></div>}
                  {talent.github_url && <div><Label>GitHub</Label><a href={talent.github_url} target="_blank" rel="noopener" className="text-[#7C6FE0] hover:underline">{talent.github_url}</a></div>}
                  {talent.linkedin_url && <div><Label>LinkedIn</Label><a href={talent.linkedin_url} target="_blank" rel="noopener" className="text-[#7C6FE0] hover:underline">{talent.linkedin_url}</a></div>}
                  {talent.proudest_build && <div><Label>Proudest build</Label><p className="text-[#999]">{talent.proudest_build}</p></div>}
                  {talent.projects?.some((p: any) => p.title) && (
                    <div>
                      <Label>Projects</Label>
                      <div className="space-y-2 mt-1">
                        {talent.projects.map((p: any, i: number) => p.title && (
                          <div key={i} className="p-3 rounded-lg border border-[#1A1A1A]" style={{ background: '#111' }}>
                            <p className="text-white font-medium">{p.title}</p>
                            <p className="text-[#666666] text-xs mt-0.5">{p.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Save / Cancel */}
              {editing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
                    style={{ background: '#5B3FA6' }}
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    onClick={() => { setForm(talent); setEditing(false); }}
                    className="px-4 py-2.5 rounded-lg text-sm text-[#666666] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
