import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PortalNavProps {
  activeTab: 'collective' | 'profile';
  talentName?: string;
  avatarUrl?: string | null;
}

export default function PortalNav({ activeTab, talentName, avatarUrl }: PortalNavProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const initials = talentName
    ? talentName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-[#1A1A1A] px-6 h-14 flex items-center justify-between">
      <span className="font-heading text-[15px] text-white font-bold">OpenMinds AI</span>

      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/collective')}
          className="relative text-sm font-medium transition-colors pb-1"
          style={{ color: activeTab === 'collective' ? 'white' : '#666666' }}
        >
          The Collective
          {activeTab === 'collective' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5B3FA6]" />
          )}
        </button>
        <button
          onClick={() => navigate('/collective/profile')}
          className="relative text-sm font-medium transition-colors pb-1"
          style={{ color: activeTab === 'profile' ? 'white' : '#666666' }}
        >
          My Profile
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5B3FA6]" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ background: '#1A0D2E' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[11px] font-heading font-bold" style={{ color: '#7C6FE0' }}>
              {initials}
            </div>
          )}
        </div>
        <span className="text-white text-sm hidden md:block">{talentName}</span>
        <button
          onClick={async () => { await signOut(); navigate('/'); }}
          className="text-[12px] transition-colors hover:text-white"
          style={{ color: '#444444' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
