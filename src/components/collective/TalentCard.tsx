import { motion } from 'framer-motion';

export interface TalentData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  primary_role: string | null;
  community_code: string | null;
  seniority: string | null;
  availability: string | null;
  skills: string[];
  willing_to_mentor: boolean | null;
  country: string;
  engagement_type: string | null;
  work_preference: string | null;
  looking_for: string[];
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  proudest_build: string | null;
  projects: { title: string; description: string }[];
}

const avDotColor = (a: string | null) =>
  a === 'Open to work' ? '#22C55E' : a === 'Building something' ? '#EAB308' : '#EF4444';

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

interface Props {
  talent: TalentData;
  index: number;
  onClick: () => void;
}

export default function TalentCard({ talent: t, index, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onClick}
      className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group border border-[#1A1A1A] hover:border-[#5B3FA6]"
      style={{ background: '#0D0D0D' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-shrink-0">
          {t.avatar_url ? (
            <img src={t.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-heading text-lg font-bold" style={{ background: '#1A0D2E', color: '#7C6FE0' }}>
              {initials(t.full_name)}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full ring-2 ring-[#0D0D0D]" style={{ background: avDotColor(t.availability) }} />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-bold text-white truncate">{t.full_name}</p>
          <p className="text-[12px]" style={{ color: '#5B3FA6' }}>{t.community_code}</p>
          <p className="text-[13px]" style={{ color: '#7C6FE0' }}>{t.primary_role}</p>
        </div>
      </div>

      <div className="h-px bg-[#1A1A1A] my-3" />

      <div className="flex flex-wrap gap-1.5 mb-3">
        {t.skills?.slice(0, 3).map(s => (
          <span key={s} className="text-[11px] uppercase tracking-[0.06em] px-2 py-[3px] rounded border border-[#1A1A1A]" style={{ color: '#666666', background: '#111111' }}>
            {s}
          </span>
        ))}
        {t.skills?.length > 3 && (
          <span className="text-[11px] uppercase tracking-[0.06em] px-2 py-[3px] rounded border border-[#1A1A1A]" style={{ color: '#666666', background: '#111111' }}>
            +{t.skills.length - 3}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <span className="text-[11px] uppercase tracking-[0.06em] px-2 py-[3px] rounded border border-[#1A1A1A]" style={{ color: '#444444' }}>
          {t.seniority}
        </span>
        {t.willing_to_mentor && (
          <span className="text-[11px] uppercase tracking-[0.06em] px-2 py-[3px] rounded border" style={{ borderColor: '#5B3FA6', color: '#7C6FE0' }}>
            Mentor
          </span>
        )}
      </div>
    </motion.div>
  );
}
