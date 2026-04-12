import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Home, Users, Compass, Flame, LayoutGrid, LogOut, X, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Section = 'overview' | 'talents' | 'projects' | 'partners' | 'collective';

interface TalentRow {
  id: string; full_name: string; email: string; country: string; primary_role: string | null;
  seniority: string | null; skills: string[] | null; status: string; created_at: string;
  availability: string | null; community_code: string | null; avatar_url: string | null;
  timezone: string | null; years_experience: number | null; engagement_type: string | null;
  work_preference: string | null; hourly_rate_range: string | null; portfolio_url: string | null;
  github_url: string | null; linkedin_url: string | null; proudest_build: string | null;
  looking_for: string[] | null; willing_to_mentor: boolean | null; referral_source: string | null;
  why_join: string | null;
}

interface VentureRow {
  id: string; full_name: string; email: string; company_name: string | null;
  intent_group: string | null; sub_intents: string[] | null; budget_range: string | null;
  timeline: string | null; description: string | null; status: string; created_at: string;
  referral_source: string | null;
}

interface PartnerRow {
  id: string; full_name: string; email: string; company_name: string;
  tool_description: string | null; what_they_offer: string[] | null; what_they_want: string[] | null;
  goals: string | null; stage: string | null; status: string; created_at: string;
  offer_details: string | null; referral_source: string | null;
}

// ─── Shared Components ───

const StatusPill = ({ status }: { status: string }) => {
  const styles: Record<string, { border: string; color: string }> = {
    pending: { border: '#444', color: '#666' },
    approved: { border: '#22C55E', color: '#22C55E' },
    rejected: { border: '#EF4444', color: '#EF4444' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span className="text-[11px] px-2.5 py-0.5 rounded-full border font-medium"
      style={{ borderColor: s.border, color: s.color, background: 'transparent' }}>
      {status}
    </span>
  );
};

const SlideField = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="py-2.5 border-b" style={{ borderColor: '#1A1A1A' }}>
      <span className="text-[11px] uppercase tracking-[0.08em] block" style={{ color: '#444', fontFamily: 'Inter, sans-serif' }}>{label}</span>
      <p className="text-sm mt-0.5" style={{ color: '#ccc', fontFamily: 'Inter, sans-serif' }}>{value}</p>
    </div>
  );
};

const Avatar = ({ name, url, size = 32 }: { name: string; url?: string | null; size?: number }) => {
  if (url) return <img src={url} className="rounded-full object-cover" style={{ width: size, height: size }} alt="" />;
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-medium"
      style={{ width: size, height: size, background: '#1A1A1A', color: '#666' }}>
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// ─── Main Component ───

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const [section, setSection] = useState<Section>('overview');
  const [talents, setTalents] = useState<TalentRow[]>([]);
  const [ventures, setVentures] = useState<VentureRow[]>([]);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [slideOver, setSlideOver] = useState<{ type: string; data: any } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const [t, v, p] = await Promise.all([
      supabase.from('talents').select('*').order('created_at', { ascending: false }),
      supabase.from('ventures').select('*').order('created_at', { ascending: false }),
      supabase.from('partner_applications').select('*').order('created_at', { ascending: false }),
    ]);
    if (t.data) setTalents(t.data as any);
    if (v.data) setVentures(v.data as any);
    if (p.data) setPartners(p.data as any);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAction = async (table: string, id: string, status: 'approved' | 'rejected') => {
    setActing(id);
    const { error } = await supabase.from(table as any).update({ status } as any).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(status === 'approved' ? 'Approved ✓' : 'Rejected');
      fetchAll();
    }
    setActing(null);
  };

  // Counts
  const pendingTalents = talents.filter(t => t.status === 'pending').length;
  const pendingVentures = ventures.filter(v => v.status === 'pending').length;
  const pendingPartners = partners.filter(p => p.status === 'pending').length;
  const approvedTalents = talents.filter(t => t.status === 'approved').length;
  const approvedPartners = partners.filter(p => p.status === 'approved').length;
  const totalPending = pendingTalents + pendingVentures + pendingPartners;

  // Activity feed
  const activityFeed = useMemo(() => {
    const events: { text: string; time: string; created_at: string }[] = [];
    talents.forEach(t => events.push({ text: `New talent application — ${t.full_name}`, time: timeAgo(t.created_at), created_at: t.created_at }));
    ventures.forEach(v => events.push({ text: `Project submitted — ${v.full_name}`, time: timeAgo(v.created_at), created_at: v.created_at }));
    partners.forEach(p => events.push({ text: `Partner application — ${p.company_name}`, time: timeAgo(p.created_at), created_at: p.created_at }));
    return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);
  }, [talents, ventures, partners]);

  // Filtered items for table views
  const filterItems = <T extends { status: string }>(items: T[], searchFn: (item: T) => string) => {
    let filtered = statusFilter === 'all' ? items : items.filter(i => i.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i => searchFn(i).toLowerCase().includes(q));
    }
    return filtered;
  };

  const navItems: { key: Section; label: string; icon: typeof Home; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: Home },
    { key: 'talents', label: 'Talents', icon: Users, badge: pendingTalents },
    { key: 'projects', label: 'Projects', icon: Compass, badge: pendingVentures },
    { key: 'partners', label: 'Partners', icon: Flame, badge: pendingPartners },
    { key: 'collective', label: 'Collective', icon: LayoutGrid },
  ];

  const tableName = section === 'talents' ? 'talents' : section === 'projects' ? 'ventures' : 'partner_applications';

  // ─── Sidebar ───
  const Sidebar = () => (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] z-30"
      style={{ background: '#080808', borderRight: '1px solid #1A1A1A' }}>
      <div className="px-5 pt-6 pb-0" style={{ marginBottom: 40 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>OpenMinds AI</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#444', margin: '4px 0 0' }}>Admin panel</p>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {navItems.map(item => {
          const active = section === item.key;
          return (
            <button key={item.key}
              onClick={() => { setSection(item.key); setSearchQuery(''); setStatusFilter('all'); setSlideOver(null); }}
              className="flex items-center gap-3 w-full text-left transition-colors duration-150"
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: active ? '#fff' : '#666',
                background: active ? '#0D0D0D' : 'transparent',
                borderLeft: active ? '2px solid #5B3FA6' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget.style.color = '#fff'); }}
              onMouseLeave={e => { if (!active) (e.currentTarget.style.color = '#666'); }}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium"
                  style={{ background: '#5B3FA6', color: '#fff' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-5 pb-6 mt-auto">
        <p className="truncate" style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#444', margin: '0 0 6px' }}>
          {user?.email || 'admin'}
        </p>
        <button onClick={() => signOut()}
          className="flex items-center gap-1.5 transition-colors duration-150 hover:text-red-500"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#666' }}>
          <LogOut className="w-3 h-3" /> Sign out
        </button>
      </div>
    </aside>
  );

  // ─── Mobile Tab Bar ───
  const MobileTabBar = () => (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 overflow-x-auto"
      style={{ background: '#080808', borderBottom: '1px solid #1A1A1A' }}>
      <div className="flex gap-0 min-w-max px-2 py-2">
        {navItems.map(item => {
          const active = section === item.key;
          return (
            <button key={item.key}
              onClick={() => { setSection(item.key); setSearchQuery(''); setStatusFilter('all'); setSlideOver(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap"
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500,
                color: active ? '#fff' : '#666',
                background: active ? '#0D0D0D' : 'transparent',
              }}>
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className="text-[9px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center"
                  style={{ background: '#5B3FA6', color: '#fff' }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ─── Search & Filter Bar ───
  const TableToolbar = () => (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#444' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none transition-colors focus:border-[#333]"
          style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', color: '#ccc', fontFamily: 'Inter, sans-serif' }}
        />
      </div>
      <div className="relative">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="appearance-none rounded-lg px-4 py-2.5 pr-10 text-sm outline-none cursor-pointer"
          style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#444' }} />
      </div>
    </div>
  );

  // ─── Metric Card ───
  const MetricCard = ({ label, value, sublabel, color = '#fff' }: { label: string; value: number; sublabel: string; color?: string }) => (
    <div className="rounded-xl" style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', padding: '20px 24px' }}>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#444', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>{value}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#444', margin: '8px 0 0' }}>{sublabel}</p>
    </div>
  );

  // ─── Action Buttons (table row) ───
  const ActionBtns = ({ table, id, status }: { table: string; id: string; status: string }) =>
    status === 'pending' ? (
      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={() => handleAction(table, id, 'approved')} disabled={acting === id}
          className="text-xs font-medium px-2 py-1 rounded transition-colors hover:bg-white/5 disabled:opacity-50"
          style={{ color: '#22C55E' }}>Approve</button>
        <button onClick={() => handleAction(table, id, 'rejected')} disabled={acting === id}
          className="text-xs font-medium px-2 py-1 rounded transition-colors hover:bg-white/5 disabled:opacity-50"
          style={{ color: '#EF4444' }}>Reject</button>
      </div>
    ) : <StatusPill status={status} />;

  // ─── Skeleton ───
  const Skeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#0D0D0D' }} />
      ))}
    </div>
  );

  // ─── Overview Section ───
  const OverviewSection = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Builders" value={approvedTalents} sublabel="approved" />
        <MetricCard label="Pending Review" value={totalPending} sublabel="need action" color="#EAB308" />
        <MetricCard label="Active Projects" value={ventures.length} sublabel="submitted" />
        <MetricCard label="Partners" value={approvedPartners} sublabel="in network" />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Applications */}
        <div>
          <div className="mb-4">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>Needs your attention</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#444', margin: '4px 0 0' }}>{totalPending} pending applications</p>
          </div>
          <div className="space-y-2">
            {talents.filter(t => t.status === 'pending').slice(0, 5).map(t => (
              <div key={t.id}
                onClick={() => setSlideOver({ type: 'talents', data: t })}
                className="flex items-center gap-3 cursor-pointer transition-colors rounded-[10px]"
                style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', padding: '12px 16px' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1A1A1A')}>
                <Avatar name={t.full_name} url={t.avatar_url} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{t.full_name}</p>
                  <p className="text-xs truncate" style={{ color: '#666' }}>{t.primary_role || 'No role'} · {t.country}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: '#444' }}>{timeAgo(t.created_at)}</span>
                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleAction('talents', t.id, 'approved')} disabled={acting === t.id}
                    className="text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors disabled:opacity-50"
                    style={{ color: '#22C55E' }}>Approve</button>
                  <button onClick={() => handleAction('talents', t.id, 'rejected')} disabled={acting === t.id}
                    className="text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors disabled:opacity-50"
                    style={{ color: '#EF4444' }}>Reject</button>
                </div>
              </div>
            ))}
            {pendingTalents > 5 && (
              <button onClick={() => { setSection('talents'); setStatusFilter('pending'); }}
                className="text-xs mt-2 transition-colors hover:text-white"
                style={{ color: '#5B3FA6', fontFamily: 'Inter, sans-serif' }}>
                View all →
              </button>
            )}
            {pendingTalents === 0 && (
              <p className="py-8 text-center" style={{ color: '#333', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>All caught up ✓</p>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 600, color: '#fff' }}>Activity</h2>
          <div className="space-y-0">
            {activityFeed.map((event, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b" style={{ borderColor: '#111' }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#5B3FA6' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate" style={{ color: '#666', fontFamily: 'Inter, sans-serif' }}>{event.text}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: '#333', fontFamily: 'Inter, sans-serif' }}>{event.time}</span>
              </div>
            ))}
            {activityFeed.length === 0 && (
              <p className="py-8 text-center" style={{ color: '#333', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ─── Table Section (Talents / Projects / Partners) ───
  const TableSection = () => {
    const title = section === 'talents' ? 'Talents' : section === 'projects' ? 'Projects' : 'Partners';
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="mb-6" style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: '#fff' }}>{title}</h1>
        <TableToolbar />

        {loading ? <Skeleton /> : (
          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid #1A1A1A' }}>
            <table className="w-full min-w-[700px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <thead>
                <tr style={{ background: '#0A0A0A' }}>
                  {section === 'talents' && ['Name', 'Role', 'Country', 'Status', 'Applied', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-medium" style={{ color: '#444', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                  {section === 'projects' && ['Name', 'Company', 'Intent', 'Budget', 'Timeline', 'Status', 'Applied', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-medium" style={{ color: '#444', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                  {section === 'partners' && ['Company', 'Stage', 'They offer', 'They want', 'Status', 'Applied', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-medium" style={{ color: '#444', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section === 'talents' && filterItems(talents, t => `${t.full_name} ${t.primary_role || ''} ${t.country}`).map(t => (
                  <tr key={t.id}
                    onClick={() => setSlideOver({ type: 'talents', data: t })}
                    className="border-t cursor-pointer transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: '#1A1A1A', opacity: t.status !== 'pending' ? 0.5 : 1 }}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={t.full_name} url={t.avatar_url} />
                        <span className="text-sm text-white font-medium truncate max-w-[140px]">{t.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{t.primary_role || '—'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{t.country}</td>
                    <td className="py-3 px-4"><StatusPill status={t.status} /></td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>{formatDate(t.created_at)}</td>
                    <td className="py-3 px-4"><ActionBtns table="talents" id={t.id} status={t.status} /></td>
                  </tr>
                ))}
                {section === 'projects' && filterItems(ventures, v => `${v.full_name} ${v.company_name || ''} ${v.intent_group || ''}`).map(v => (
                  <tr key={v.id}
                    onClick={() => setSlideOver({ type: 'projects', data: v })}
                    className="border-t cursor-pointer transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: '#1A1A1A', opacity: v.status !== 'pending' ? 0.5 : 1 }}>
                    <td className="py-3 px-4 text-sm text-white font-medium">{v.full_name}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{v.company_name || '—'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{v.intent_group || '—'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{v.budget_range || '—'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{v.timeline || '—'}</td>
                    <td className="py-3 px-4"><StatusPill status={v.status} /></td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>{formatDate(v.created_at)}</td>
                    <td className="py-3 px-4"><ActionBtns table="ventures" id={v.id} status={v.status} /></td>
                  </tr>
                ))}
                {section === 'partners' && filterItems(partners, p => `${p.company_name} ${p.full_name} ${p.stage || ''}`).map(p => (
                  <tr key={p.id}
                    onClick={() => setSlideOver({ type: 'partners', data: p })}
                    className="border-t cursor-pointer transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: '#1A1A1A', opacity: p.status !== 'pending' ? 0.5 : 1 }}>
                    <td className="py-3 px-4 text-sm text-white font-medium">{p.company_name}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{p.stage || '—'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{p.what_they_offer?.join(', ') || '—'}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#999' }}>{p.what_they_want?.join(', ') || '—'}</td>
                    <td className="py-3 px-4"><StatusPill status={p.status} /></td>
                    <td className="py-3 px-4 text-sm" style={{ color: '#666' }}>{formatDate(p.created_at)}</td>
                    <td className="py-3 px-4"><ActionBtns table="partner_applications" id={p.id} status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Empty state */}
            {!loading && (
              (section === 'talents' && filterItems(talents, t => `${t.full_name} ${t.primary_role || ''}`).length === 0) ||
              (section === 'projects' && filterItems(ventures, v => `${v.full_name} ${v.company_name || ''}`).length === 0) ||
              (section === 'partners' && filterItems(partners, p => `${p.company_name} ${p.full_name}`).length === 0)
            ) && (
              <div className="text-center py-16" style={{ color: '#444', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>
                Nothing here yet.
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  // ─── Collective Section ───
  const CollectiveSection = () => {
    const approved = talents.filter(t => t.status === 'approved');
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="mb-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, color: '#fff' }}>Collective</h1>
        <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#444' }}>{approved.length} approved builders</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {approved.map(t => (
            <div key={t.id}
              onClick={() => setSlideOver({ type: 'talents', data: t })}
              className="flex items-center gap-3 cursor-pointer rounded-xl transition-colors"
              style={{ background: '#0D0D0D', border: '1px solid #1A1A1A', padding: '16px 20px' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1A1A1A')}>
              <Avatar name={t.full_name} url={t.avatar_url} size={40} />
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{t.full_name}</p>
                <p className="text-xs truncate" style={{ color: '#666' }}>{t.primary_role || '—'} · {t.country}</p>
              </div>
              {t.community_code && (
                <span className="ml-auto text-xs shrink-0" style={{ color: '#5B3FA6' }}>{t.community_code}</span>
              )}
            </div>
          ))}
          {approved.length === 0 && (
            <p className="col-span-2 text-center py-12" style={{ color: '#333', fontFamily: 'Inter, sans-serif', fontSize: 13 }}>No approved builders yet.</p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <MobileTabBar />

      {/* Main content */}
      <main className="md:ml-[220px] min-h-screen pt-14 md:pt-0"
        style={{ padding: '40px 24px', }}
      >
        <div className="max-w-[1200px] mx-auto md:px-6">
          <AnimatePresence mode="wait">
            {loading && section === 'overview' ? <Skeleton key="skeleton" /> :
              section === 'overview' ? <OverviewSection key="overview" /> :
              section === 'collective' ? <CollectiveSection key="collective" /> :
              <TableSection key={section} />
            }
          </AnimatePresence>
        </div>
      </main>

      {/* Slide-over panel */}
      <AnimatePresence>
        {slideOver && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              onClick={() => setSlideOver(null)} className="fixed inset-0 bg-black z-40" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 overflow-y-auto"
              style={{ background: '#080808', borderLeft: '1px solid #1A1A1A' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 600, color: '#fff' }}>
                    {slideOver.type === 'talents' ? 'Talent Profile' : slideOver.type === 'projects' ? 'Project Brief' : 'Partner Application'}
                  </h2>
                  <button onClick={() => setSlideOver(null)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <X className="w-4 h-4" style={{ color: '#666' }} />
                  </button>
                </div>

                <div className="mb-4"><StatusPill status={slideOver.data.status} /></div>

                {slideOver.type === 'talents' && (() => {
                  const t = slideOver.data as TalentRow;
                  return (
                    <>
                      <div className="flex items-center gap-3 pb-4 mb-2 border-b" style={{ borderColor: '#1A1A1A' }}>
                        <Avatar name={t.full_name} url={t.avatar_url} size={48} />
                        <div>
                          <p className="text-white font-medium">{t.full_name}</p>
                          <p className="text-sm" style={{ color: '#666' }}>{t.email}</p>
                        </div>
                      </div>
                      <SlideField label="Role" value={t.primary_role} />
                      <SlideField label="Country" value={t.country} />
                      <SlideField label="Timezone" value={t.timezone} />
                      <SlideField label="Seniority" value={t.seniority} />
                      <SlideField label="Experience" value={t.years_experience?.toString()} />
                      <SlideField label="Skills" value={t.skills?.join(', ')} />
                      <SlideField label="Availability" value={t.availability} />
                      <SlideField label="Engagement" value={t.engagement_type} />
                      <SlideField label="Work preference" value={t.work_preference} />
                      <SlideField label="Rate" value={t.hourly_rate_range} />
                      <SlideField label="Portfolio" value={t.portfolio_url} />
                      <SlideField label="GitHub" value={t.github_url} />
                      <SlideField label="LinkedIn" value={t.linkedin_url} />
                      <SlideField label="Proudest build" value={t.proudest_build} />
                      <SlideField label="Looking for" value={t.looking_for?.join(', ')} />
                      <SlideField label="Mentor" value={t.willing_to_mentor ? 'Yes' : 'No'} />
                      <SlideField label="Why join" value={t.why_join} />
                      <SlideField label="Referral" value={t.referral_source} />
                      <SlideField label="Code" value={t.community_code} />
                    </>
                  );
                })()}

                {slideOver.type === 'projects' && (() => {
                  const v = slideOver.data as VentureRow;
                  return (
                    <>
                      <SlideField label="Name" value={v.full_name} />
                      <SlideField label="Email" value={v.email} />
                      <SlideField label="Company" value={v.company_name} />
                      <SlideField label="Intent" value={v.intent_group} />
                      <SlideField label="Sub-intents" value={v.sub_intents?.join(', ')} />
                      <SlideField label="Budget" value={v.budget_range} />
                      <SlideField label="Timeline" value={v.timeline} />
                      <SlideField label="Description" value={v.description} />
                      <SlideField label="Referral" value={v.referral_source} />
                    </>
                  );
                })()}

                {slideOver.type === 'partners' && (() => {
                  const p = slideOver.data as PartnerRow;
                  return (
                    <>
                      <SlideField label="Contact" value={p.full_name} />
                      <SlideField label="Email" value={p.email} />
                      <SlideField label="Company" value={p.company_name} />
                      <SlideField label="Stage" value={p.stage} />
                      <SlideField label="Tool" value={p.tool_description} />
                      <SlideField label="They offer" value={p.what_they_offer?.join(', ')} />
                      <SlideField label="They want" value={p.what_they_want?.join(', ')} />
                      <SlideField label="Offer details" value={p.offer_details} />
                      <SlideField label="Goals" value={p.goals} />
                      <SlideField label="Referral" value={p.referral_source} />
                    </>
                  );
                })()}

                {slideOver.data.status === 'pending' && (
                  <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: '#1A1A1A' }}>
                    <button
                      onClick={() => { handleAction(tableName, slideOver.data.id, 'approved'); setSlideOver(null); }}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors"
                      style={{ background: '#22C55E', color: '#000' }}>Approve</button>
                    <button
                      onClick={() => { handleAction(tableName, slideOver.data.id, 'rejected'); setSlideOver(null); }}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
                      style={{ borderColor: '#333', color: '#999' }}>Reject</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
