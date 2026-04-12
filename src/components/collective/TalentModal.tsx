import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { TalentData } from './TalentCard';

const avDotColor = (a: string | null) =>
  a === 'Open to work' ? '#22C55E' : a === 'Building something' ? '#EAB308' : '#EF4444';

const initials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

interface Props {
  talent: TalentData | null;
  onClose: () => void;
}

export default function TalentModal({ talent, onClose }: Props) {
  return (
    <AnimatePresence>
      {talent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-[20px] p-10 relative border border-[#1A1A1A]"
            style={{ background: '#0D0D0D' }}
          >
            <button onClick={onClose} className="absolute top-5 right-5 text-[#444444] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative flex-shrink-0">
                {talent.avatar_url ? (
                  <img src={talent.avatar_url} alt="" className="w-[88px] h-[88px] rounded-full object-cover" />
                ) : (
                  <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-heading text-2xl font-bold" style={{ background: '#1A0D2E', color: '#7C6FE0' }}>
                    {initials(talent.full_name)}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full ring-2 ring-[#0D0D0D]" style={{ background: avDotColor(talent.availability) }} />
              </div>
              <div>
                <h2 className="font-heading text-[26px] font-bold text-white">{talent.full_name}</h2>
                <p className="text-sm" style={{ color: '#5B3FA6' }}>{talent.community_code}</p>
                <p className="text-sm text-[#666666]">{talent.primary_role} · {talent.seniority} · {talent.country}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: avDotColor(talent.availability) }} />
                  <span className="text-xs text-[#666666]">{talent.availability}</span>
                </div>
              </div>
            </div>

            <div className="space-y-5 text-sm">
              {/* Skills */}
              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {talent.skills?.map(s => (
                    <span key={s} className="text-[11px] uppercase tracking-[0.06em] text-[#999] px-2 py-[3px] rounded border border-[#1A1A1A]">{s}</span>
                  ))}
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Engagement</Label><p className="text-[#999] mt-0.5">{talent.engagement_type}</p></div>
                <div><Label>Work preference</Label><p className="text-[#999] mt-0.5">{talent.work_preference}</p></div>
                <div><Label>Looking for</Label><p className="text-[#999] mt-0.5">{talent.looking_for?.join(', ')}</p></div>
                <div><Label>Mentor</Label><p className="text-[#999] mt-0.5">{talent.willing_to_mentor ? 'Yes' : 'No'}</p></div>
              </div>

              {/* Links */}
              {talent.portfolio_url && <div><Label>Portfolio</Label><p className="mt-0.5"><a href={talent.portfolio_url} target="_blank" rel="noopener" className="text-[#7C6FE0] hover:underline">{talent.portfolio_url}</a></p></div>}
              {talent.github_url && <div><Label>GitHub</Label><p className="mt-0.5"><a href={talent.github_url} target="_blank" rel="noopener" className="text-[#7C6FE0] hover:underline">{talent.github_url}</a></p></div>}
              {talent.linkedin_url && <div><Label>LinkedIn</Label><p className="mt-0.5"><a href={talent.linkedin_url} target="_blank" rel="noopener" className="text-[#7C6FE0] hover:underline">{talent.linkedin_url}</a></p></div>}

              {/* Projects */}
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

              {talent.proudest_build && <div><Label>Proudest build</Label><p className="text-[#999] mt-0.5">{talent.proudest_build}</p></div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] uppercase tracking-[0.08em] text-[#444444]">{children}</span>;
}
