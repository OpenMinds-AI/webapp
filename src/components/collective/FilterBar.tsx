import { Search } from 'lucide-react';

const ROLE_OPTIONS = ['All', 'AI Engineer', 'Full-Stack Dev', 'Backend Dev', 'Frontend Dev', 'Data Scientist', 'ML Engineer', 'Product Designer', 'No-Code Builder'];
const SENIORITY_OPTIONS = ['All', 'Junior', 'Mid', 'Senior', 'Lead'];
const AVAIL_OPTIONS = ['All', 'Open to work', 'Building something', 'Unavailable'];

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  seniority: string;
  onSeniorityChange: (v: string) => void;
  availability: string;
  onAvailabilityChange: (v: string) => void;
  allSkills: string[];
  selectedSkills: string[];
  onSkillsChange: (v: string[]) => void;
}

export default function FilterBar({
  search, onSearchChange,
  role, onRoleChange,
  seniority, onSeniorityChange,
  availability, onAvailabilityChange,
  allSkills, selectedSkills, onSkillsChange,
}: Props) {
  const toggleSkill = (s: string) => {
    onSkillsChange(
      selectedSkills.includes(s)
        ? selectedSkills.filter(x => x !== s)
        : [...selectedSkills, s]
    );
  };

  return (
    <div className="sticky top-14 z-30 bg-black py-4 border-b border-[#1A1A1A] flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1 max-w-[240px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444444]" />
        <input
          placeholder="Search builders..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg text-white text-sm bg-[#0D0D0D] border border-[#1A1A1A] focus:border-[#5B3FA6] focus:outline-none transition-colors placeholder:text-[#444444]"
        />
      </div>

      {/* Role */}
      <select
        value={role}
        onChange={e => onRoleChange(e.target.value)}
        className="h-10 px-3 rounded-lg text-sm bg-[#0D0D0D] border border-[#1A1A1A] text-[#999] focus:border-[#5B3FA6] focus:outline-none appearance-none cursor-pointer"
      >
        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
      </select>

      {/* Seniority */}
      <select
        value={seniority}
        onChange={e => onSeniorityChange(e.target.value)}
        className="h-10 px-3 rounded-lg text-sm bg-[#0D0D0D] border border-[#1A1A1A] text-[#999] focus:border-[#5B3FA6] focus:outline-none appearance-none cursor-pointer"
      >
        {SENIORITY_OPTIONS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Levels' : s}</option>)}
      </select>

      {/* Availability pills */}
      <div className="flex gap-1">
        {AVAIL_OPTIONS.map(a => (
          <button
            key={a}
            onClick={() => onAvailabilityChange(a)}
            className="px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-[0.08em] font-medium border transition-all duration-200"
            style={{
              background: availability === a ? '#1A0D2E' : 'transparent',
              borderColor: availability === a ? '#5B3FA6' : '#1A1A1A',
              color: availability === a ? 'white' : '#666666',
            }}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Skills multi-select */}
      {allSkills.length > 0 && (
        <div className="relative group">
          <button className="h-10 px-3 rounded-lg text-sm bg-[#0D0D0D] border border-[#1A1A1A] text-[#999] hover:border-[#5B3FA6] transition-colors">
            Skills {selectedSkills.length > 0 && `(${selectedSkills.length})`}
          </button>
          <div className="absolute top-full left-0 mt-1 w-56 max-h-60 overflow-y-auto rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] p-2 hidden group-hover:block z-50 shadow-xl">
            {allSkills.map(s => (
              <label key={s} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#1A1A1A] cursor-pointer text-xs text-[#999]">
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(s)}
                  onChange={() => toggleSkill(s)}
                  className="rounded border-[#1A1A1A] bg-[#111] text-[#5B3FA6] focus:ring-[#5B3FA6]"
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
