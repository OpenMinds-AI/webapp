import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NeuralCanvas from '@/components/NeuralCanvas';
import PortalNav from '@/components/collective/PortalNav';
import FilterBar from '@/components/collective/FilterBar';
import TalentCard, { type TalentData } from '@/components/collective/TalentCard';
import TalentModal from '@/components/collective/TalentModal';

export default function Collective() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState<TalentData[]>([]);
  const [myTalent, setMyTalent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [selected, setSelected] = useState<TalentData | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [seniority, setSeniority] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/auth'); return; }

    const check = async () => {
      const { data } = await supabase.from('talents' as any).select('*').eq('email', user.email).single();
      if (data && (data as any).status === 'approved') {
        setAuthorized(true);
        setMyTalent(data);
        const { data: all } = await supabase.from('talents' as any).select('*').eq('status', 'approved');
        setTalents((all || []) as any);
      } else if (data && (data as any).status === 'pending') {
        navigate('/pending');
        return;
      } else {
        navigate('/pending');
        return;
      }
      setLoading(false);
    };
    check();
  }, [user, authLoading]);

  const allSkills = useMemo(() => {
    const set = new Set<string>();
    talents.forEach(t => t.skills?.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [talents]);

  const filtered = useMemo(() => {
    return talents.filter(t => {
      if (search) {
        const q = search.toLowerCase();
        if (!t.full_name.toLowerCase().includes(q) && !t.skills?.some(s => s.toLowerCase().includes(q))) return false;
      }
      if (role !== 'All' && t.primary_role !== role) return false;
      if (seniority !== 'All' && t.seniority !== seniority) return false;
      if (availability !== 'All' && t.availability !== availability) return false;
      if (selectedSkills.length > 0 && !selectedSkills.some(s => t.skills?.includes(s))) return false;
      return true;
    });
  }, [talents, search, role, seniority, availability, selectedSkills]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#5B3FA6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-black relative">
      <NeuralCanvas />
      <div className="relative z-10">
        <PortalNav
          activeTab="collective"
          talentName={myTalent?.full_name}
          avatarUrl={myTalent?.avatar_url}
        />

        <div className="px-6 py-8 max-w-[1200px] mx-auto">
          <h1 className="font-heading text-[40px] font-bold text-white">The Collective</h1>
          <p className="mt-1">
            <span style={{ color: '#5B3FA6' }} className="font-semibold">{talents.length}</span>{' '}
            <span className="text-[#666666]">builders worldwide</span>
          </p>

          <FilterBar
            search={search} onSearchChange={setSearch}
            role={role} onRoleChange={setRole}
            seniority={seniority} onSeniorityChange={setSeniority}
            availability={availability} onAvailabilityChange={setAvailability}
            allSkills={allSkills}
            selectedSkills={selectedSkills}
            onSkillsChange={setSelectedSkills}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {filtered.map((t, i) => (
              <TalentCard key={t.id} talent={t} index={i} onClick={() => setSelected(t)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-[#444444] mt-16">No builders match your filters.</p>
          )}
        </div>
      </div>

      <TalentModal talent={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
