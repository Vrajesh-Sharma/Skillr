import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SkillPicker from '../components/SkillPicker';
import { Camera, Loader2, Edit3, Save, User, Phone, FileText, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    contact_number: '',
    bio: '',
    avatar_url: '',
  });
  const [skillsHave, setSkillsHave] = useState([]);
  const [skillsWant, setSkillsWant] = useState([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session.user.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data: pData, error: pErr } = await supabase
        .from('skill_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (pErr) throw pErr;
      if (pData) setProfile(pData);

      const { data: sData, error: sErr } = await supabase
        .from('skill_profile_skills')
        .select('association_type, skill_skills(*)')
        .eq('profile_id', session.user.id);

      if (sErr) throw sErr;

      if (sData) {
        setSkillsHave(
          sData.filter((s) => s.association_type === 'have').map((s) => s.skill_skills)
        );
        setSkillsWant(
          sData.filter((s) => s.association_type === 'want').map((s) => s.skill_skills)
        );
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpload = async (e) => {
    try {
      setSaving(true);
      const file = e.target.files[0];
      if (!file) return;

      const ext = file.name.split('.').pop();
      const filePath = `${session.user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { error: pErr } = await supabase.from('skill_profiles').upsert({
        id: session.user.id,
        email: session.user.email,
        full_name: profile.full_name,
        contact_number: profile.contact_number,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        updated_at: new Date(),
      });

      if (pErr) throw pErr;

      await supabase
        .from('skill_profile_skills')
        .delete()
        .eq('profile_id', session.user.id);

      const mappings = [
        ...skillsHave.map((s) => ({
          profile_id: session.user.id,
          skill_id: s.id,
          association_type: 'have',
        })),
        ...skillsWant.map((s) => ({
          profile_id: session.user.id,
          skill_id: s.id,
          association_type: 'want',
        })),
      ];

      if (mappings.length > 0) {
        const { error: sErr } = await supabase
          .from('skill_profile_skills')
          .insert(mappings);
        if (sErr) throw sErr;
      }

      setIsEditing(false);
      alert('Profile updated on Skillr.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-300 text-sm">
        Loading your Skillr profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] py-14 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Skillr · Profile
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold text-slate-50">
              Control how people see you
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Your profile powers how Skillr introduces you to mentors, peers, and learners.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => (isEditing ? handleUpdate() : setIsEditing(true))}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit profile
                </>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:border-red-500/60 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <motion.div layout className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 flex flex-col items-center gap-5">
              <div className="relative h-32 w-32 rounded-3xl bg-slate-950 border border-slate-700 overflow-hidden">
                <img
                  src={
                    profile.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name || 'Skillr'}`
                  }
                  alt={profile.full_name}
                  className="h-full w-full object-cover"
                />
                {isEditing && (
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-xs text-slate-100 gap-1">
                    <Camera className="h-4 w-4" />
                    Update photo
                    <input
                      type="file"
                      onChange={handleUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-50">
                  {profile.full_name || 'Unnamed Skillr user'}
                </p>
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                  Skillr member
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 space-y-3">
              <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Bio
              </label>
              {isEditing ? (
                <textarea
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 min-h-[120px] resize-none"
                  value={profile.bio || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {profile.bio ||
                    'Add a short description of how you work, teach, or like to learn.'}
                </p>
              )}
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div layout className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Full name
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3">
                    <User className="h-4 w-4 text-slate-500" />
                    {isEditing ? (
                      <input
                        className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
                        value={profile.full_name || ''}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                      />
                    ) : (
                      <span className="text-sm text-slate-100">
                        {profile.full_name || 'Not set'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Contact number
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                    {isEditing ? (
                      <input
                        className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
                        value={profile.contact_number || ''}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            contact_number: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <span className="text-sm text-slate-100">
                        {profile.contact_number || 'Not set'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Skills you can teach
                  </label>
                  {isEditing ? (
                    <SkillPicker
                      type="have"
                      selectedSkills={skillsHave}
                      setSelectedSkills={setSkillsHave}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skillsHave.length === 0 && (
                        <span className="text-xs text-slate-500">
                          Add at least one teaching skill to get better matches.
                        </span>
                      )}
                      {skillsHave.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] font-medium text-slate-100"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Skills you want to learn
                  </label>
                  {isEditing ? (
                    <SkillPicker
                      type="want"
                      selectedSkills={skillsWant}
                      setSelectedSkills={setSkillsWant}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skillsWant.length === 0 && (
                        <span className="text-xs text-slate-500">
                          Tell Skillr what you want to learn to unlock better recommendations.
                        </span>
                      )}
                      {skillsWant.map((s) => (
                        <span
                          key={s.id}
                          className="inline-flex items-center rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] font-medium text-slate-100"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
