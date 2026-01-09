import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import SkillPicker from '../components/SkillPicker';
import { Camera, Loader2, Edit3, Save, X, User, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', contact_number: '', bio: '', avatar_url: '' });
  const [skillsHave, setSkillsHave] = useState([]);
  const [skillsWant, setSkillsWant] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, [session.user.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // 1. Fetch Profile Data
      const { data: pData, error: pErr } = await supabase
        .from('skill_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (pErr) throw pErr;
      if (pData) setProfile(pData);

      // 2. Fetch Skills with Details
      const { data: sData, error: sErr } = await supabase
        .from('skill_profile_skills')
        .select('association_type, skill_skills(*)')
        .eq('profile_id', session.user.id);

      if (sErr) throw sErr;

      if (sData) {
        setSkillsHave(sData.filter(s => s.association_type === 'have').map(s => s.skill_skills));
        setSkillsWant(sData.filter(s => s.association_type === 'want').map(s => s.skill_skills));
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    try {
      setSaving(true);
      const file = e.target.files[0];
      const filePath = `${session.user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
        // 1. Update Profile - Now including the required email field
        const { error: pErr } = await supabase.from('skill_profiles').upsert({
        id: session.user.id,
        email: session.user.email, // <--- ADD THIS LINE
        full_name: profile.full_name,
        contact_number: profile.contact_number,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        updated_at: new Date()
        });
        
        if (pErr) throw pErr;

        // 2. Update Skills (Delete & Re-insert logic)
        await supabase.from('skill_profile_skills').delete().eq('profile_id', session.user.id);
        
        const mappings = [
        ...skillsHave.map(s => ({ 
            profile_id: session.user.id, 
            skill_id: s.id, 
            association_type: 'have' 
        })),
        ...skillsWant.map(s => ({ 
            profile_id: session.user.id, 
            skill_id: s.id, 
            association_type: 'want' 
        }))
        ];
        
        const { error: sErr } = await supabase.from('skill_profile_skills').insert(mappings);
        if (sErr) throw sErr;

        setIsEditing(false);
        alert("Profile Synchronized! ⚡");
    } catch (err) { 
        alert(err.message); 
    } finally { 
        setSaving(false); 
    }
    };

  if (loading) return <div className="h-screen flex items-center justify-center text-cyan-500 font-black animate-pulse">RECALLING IDENTITY...</div>;

  return (
    <div className="min-h-screen bg-[#020617] py-20 px-6 pb-40">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black text-white italic tracking-tighter">MY PROFILE</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your skills and public presence.</p>
          </motion.div>
          
          <button 
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            disabled={saving}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${
              isEditing ? 'bg-cyan-500 text-black hover:bg-cyan-400' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {saving ? <Loader2 className="animate-spin" /> : isEditing ? <><Save size={20}/> SAVE CHANGES</> : <><Edit3 size={20}/> EDIT PROFILE</>}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Panel: Visuals & Bio */}
          <motion.div layout className="lg:col-span-4 space-y-8">
            <div className="glass p-8 rounded-[3rem] flex flex-col items-center">
              <div className="relative group w-48 h-48 rounded-[2.5rem] bg-slate-950 border-2 border-white/5 flex items-center justify-center overflow-hidden">
                <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`} className="w-full h-full object-cover" />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white" />
                    <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
              <h2 className="mt-6 text-2xl font-black text-white">{profile.full_name}</h2>
              <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Verified Member</p>
            </div>

            <div className="glass p-8 rounded-[2.5rem] space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <FileText size={12}/> Bio / Mission
               </label>
               {isEditing ? (
                 <textarea 
                   className="w-full bg-slate-950 p-4 rounded-2xl border border-white/5 outline-none focus:border-cyan-500 h-40 resize-none text-sm"
                   value={profile.bio}
                   onChange={e => setProfile({...profile, bio: e.target.value})}
                 />
               ) : (
                 <p className="text-slate-400 text-sm leading-relaxed">{profile.bio || "No bio established yet."}</p>
               )}
            </div>
          </motion.div>

          {/* Right Panel: Fields & Skills */}
          <motion.div layout className="lg:col-span-8 space-y-8">
            <div className="glass p-10 rounded-[3rem] space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Identity</label>
                  <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                    <User size={18} className="text-slate-600" />
                    {isEditing ? (
                      <input className="bg-transparent outline-none w-full text-white" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                    ) : (
                      <span className="text-white font-bold">{profile.full_name}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Contact</label>
                  <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                    <Phone size={18} className="text-slate-600" />
                    {isEditing ? (
                      <input className="bg-transparent outline-none w-full text-white" value={profile.contact_number} onChange={e => setProfile({...profile, contact_number: e.target.value})} />
                    ) : (
                      <span className="text-white font-bold">{profile.contact_number || "Not set"}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 pt-4">
                <div className="space-y-6">
                  {isEditing ? (
                    <SkillPicker type="have" selectedSkills={skillsHave} setSelectedSkills={setSkillsHave} />
                  ) : (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expertise</label>
                      <div className="flex flex-wrap gap-2">
                        {skillsHave.map(s => <span key={s.id} className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-xl">{s.name}</span>)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  {isEditing ? (
                    <SkillPicker type="want" selectedSkills={skillsWant} setSelectedSkills={setSkillsWant} />
                  ) : (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {skillsWant.map(s => <span key={s.id} className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-xl">{s.name}</span>)}
                      </div>
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