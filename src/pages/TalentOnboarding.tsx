import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Linkedin, ArrowRight, ArrowLeft, Check, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SKILLS_LIST = [
  // Tech
  'AI/ML', 'Full-Stack', 'Frontend', 'Backend', 'Mobile', 'DevOps',
  'Data Science', 'Blockchain', 'Cybersecurity', 'Cloud Architecture',
  'API Development', 'Open Source',
  // Non-tech
  'Product Management', 'UX/UI Design', 'Marketing', 'Growth',
  'Finance', 'Operations', 'Community Building', 'Content Strategy',
];

const TalentOnboarding = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Profile
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Step 2: Availability
  const [available, setAvailable] = useState(true);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const canAdvanceStep1 = photo && name.trim() && title.trim() && bio.trim() && selectedSkills.length > 0;

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      // Upload photo
      let photoUrl = '';
      if (photo) {
        const ext = photo.name.split('.').pop();
        const path = `talent-photos/${user.id}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, photo, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
        photoUrl = publicUrl;
      }

      // Insert user record
      const { error: userError } = await (supabase as any).from('users').upsert({
        id: user.id,
        email: user.email,
        role: 'talent',
        status: 'pending',
      });
      if (userError) throw userError;

      // Insert talent profile
      const { error: profileError } = await (supabase as any).from('talent_profiles').upsert({
        user_id: user.id,
        photo_url: photoUrl,
        name,
        title,
        bio,
        linkedin,
        availability: available,
        badge_level: 'apprentice',
        reputation_score: 0,
      });
      if (profileError) throw profileError;

      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: 'Something went wrong',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-surface rounded-2xl p-10 max-w-md text-center"
        >
          <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
            You're in the queue
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We'll review your profile and be in touch. Every builder matters — we just need to make sure you're the real deal.
          </p>
          <p className="text-muted-foreground text-xs mt-6">Welcome to the force.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 py-16">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* STEP 1: Profile */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-surface rounded-2xl p-8"
              >
                <p className="text-muted-foreground text-xs font-medium mb-1 uppercase tracking-wider">Step 1 of 3</p>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Your profile</h2>

                {/* Photo */}
                <div className="mb-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors mx-auto"
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <p className="text-center text-muted-foreground text-xs mt-2">
                    Real photo required. No avatars.
                  </p>
                </div>

                {/* Name */}
                <div className="mb-4">
                  <label className="text-sm text-foreground font-medium mb-1 block">Full name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-body"
                  />
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="text-sm text-foreground font-medium mb-1 block">One-liner title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI Engineer & Open Source Builder"
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-body"
                  />
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <label className="text-sm text-foreground font-medium mb-1 block">Bio (4 lines max)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="What do you build? What drives you?"
                    rows={4}
                    maxLength={400}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-body resize-none"
                  />
                </div>

                {/* LinkedIn */}
                <div className="mb-6">
                  <label className="text-sm text-foreground font-medium mb-1 block">LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/you"
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-body"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <label className="text-sm text-foreground font-medium mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_LIST.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                          selectedSkills.includes(skill)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!canAdvanceStep1}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Availability */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-surface rounded-2xl p-8"
              >
                <p className="text-muted-foreground text-xs font-medium mb-1 uppercase tracking-wider">Step 2 of 3</p>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Availability</h2>
                <p className="text-muted-foreground text-sm mb-8">Are you currently open to work?</p>

                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => setAvailable(true)}
                    className={`flex-1 card-surface rounded-xl p-6 text-center transition-all duration-200 ${
                      available ? 'ring-2 ring-primary glow-violet' : 'hover:border-primary/30'
                    }`}
                  >
                    <Circle className="w-6 h-6 mx-auto mb-3 fill-green-500 text-green-500" />
                    <p className="font-heading font-semibold text-foreground">Open</p>
                    <p className="text-muted-foreground text-xs mt-1">Ready for opportunities</p>
                  </button>

                  <button
                    onClick={() => setAvailable(false)}
                    className={`flex-1 card-surface rounded-xl p-6 text-center transition-all duration-200 ${
                      !available ? 'ring-2 ring-primary glow-violet' : 'hover:border-primary/30'
                    }`}
                  >
                    <Circle className="w-6 h-6 mx-auto mb-3 fill-muted-foreground text-muted-foreground" />
                    <p className="font-heading font-semibold text-foreground">Not now</p>
                    <p className="text-muted-foreground text-xs mt-1">Just joining the network</p>
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-lg border border-border text-foreground font-heading font-medium hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-surface rounded-2xl p-8"
              >
                <p className="text-muted-foreground text-xs font-medium mb-1 uppercase tracking-wider">Step 3 of 3</p>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Review & submit</h2>

                {/* Preview card */}
                <div className="card-surface rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-4">
                    {photoPreview && (
                      <img src={photoPreview} alt="You" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-foreground text-lg">{name}</h3>
                      <p className="text-secondary text-sm">{title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Circle className={`w-3 h-3 ${available ? 'fill-green-500 text-green-500' : 'fill-muted-foreground text-muted-foreground'}`} />
                        <span className="text-muted-foreground text-xs">{available ? 'Open to work' : 'Not available'}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mt-4 leading-relaxed">{bio}</p>

                  {linkedin && (
                    <p className="text-primary text-xs mt-3 truncate">{linkedin}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {selectedSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 bg-primary/15 text-primary text-xs rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-lg border border-border text-foreground font-heading font-medium hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 glow-violet disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Submit Application
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TalentOnboarding;
