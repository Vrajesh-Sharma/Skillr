// import { useState } from 'react';
// import { supabase } from '../lib/supabase';
// import SkillPicker from '../components/SkillPicker';
// import { Camera, Loader2, Sparkles, CheckCircle2, User, Phone, FileText } from 'lucide-react';
// import { motion } from 'framer-motion';

// export default function ProfileSetup({ session }) {
//   const [loading, setLoading] = useState(false);
//   const [profile, setProfile] = useState({ full_name: '', contact_number: '', bio: '', avatar_url: '' });
//   const [skillsHave, setSkillsHave] = useState([]);
//   const [skillsWant, setSkillsWant] = useState([]);

//   const handleUpload = async (e) => {
//     try {
//       setLoading(true);
//       const file = e.target.files[0];
//       const filePath = `${session.user.id}/${Date.now()}.${file.name.split('.').pop()}`;
//       const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
//       if (uploadError) throw uploadError;
//       const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
//       setProfile({ ...profile, avatar_url: publicUrl });
//     } catch (err) { alert(err.message); } finally { setLoading(false); }
//   };

//   const handleSave = async () => {
//     if (!profile.full_name || skillsHave.length === 0 || skillsWant.length === 0) return alert("Please fill everything.");
//     setLoading(true);
//     try {
//       // 1. Profile
//       const { error: pErr } = await supabase.from('skill_profiles').upsert({
//         id: session.user.id, email: session.user.email, ...profile, updated_at: new Date()
//       });
//       if (pErr) throw pErr;

//       // 2. Clear & Save Skills
//       await supabase.from('skill_profile_skills').delete().eq('profile_id', session.user.id);
//       const mappings = [
//         ...skillsHave.map(s => ({ profile_id: session.user.id, skill_id: s.id, association_type: 'have' })),
//         ...skillsWant.map(s => ({ profile_id: session.user.id, skill_id: s.id, association_type: 'want' }))
//       ];
//       const { error: sErr } = await supabase.from('skill_profile_skills').insert(mappings);
//       if (sErr) throw sErr;

//       window.location.reload(); 
//     } catch (err) { alert(err.message); } finally { setLoading(false); }
//   };

//   return (
//     <div className="min-h-screen bg-brand-dark py-20 px-4 flex justify-center">
//       <div className="w-full max-w-5xl">
//         <header className="mb-12 text-center">
//           <h1 className="text-5xl font-black text-white italic tracking-tighter">SKILL IDENTITY</h1>
//         </header>

//         <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-10 rounded-[3rem] shadow-2xl">
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
//             <div className="lg:col-span-4 flex flex-col items-center gap-8">
//               <div className="relative group w-44 h-44 rounded-[2.5rem] bg-slate-950 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-cyan-500/50">
//                 {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-slate-700" />}
//                 <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
//               </div>
//               <textarea placeholder="Your Bio..." className="w-full p-4 bg-slate-950/50 border border-white/5 rounded-3xl h-44 focus:border-cyan-500 outline-none resize-none" onChange={e => setProfile({...profile, bio: e.target.value})} />
//             </div>

//             <div className="lg:col-span-8 space-y-8">
//               <div className="grid grid-cols-2 gap-6">
//                 <input placeholder="Full Name" className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, full_name: e.target.value})} />
//                 <input placeholder="Contact Number" className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, contact_number: e.target.value})} />
//               </div>
//               <div className="grid grid-cols-2 gap-10">
//                 <SkillPicker type="have" selectedSkills={skillsHave} setSelectedSkills={setSkillsHave} />
//                 <SkillPicker type="want" selectedSkills={skillsWant} setSelectedSkills={setSkillsWant} />
//               </div>
//               <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-white text-black font-black rounded-[1.5rem] hover:bg-cyan-400 transition-all flex items-center justify-center gap-3">
//                 {loading ? <Loader2 className="animate-spin" /> : 'INITIALIZE DASHBOARD'}
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import SkillPicker from '../components/SkillPicker';
import { Camera, Loader2, User, Phone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSetup({ session }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    contact_number: '',
    bio: '',
    avatar_url: '',
  });
  const [skillsHave, setSkillsHave] = useState([]);
  const [skillsWant, setSkillsWant] = useState([]);

  const handleUpload = async (e) => {
    try {
      setLoading(true);
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

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name || skillsHave.length === 0 || skillsWant.length === 0) {
      alert('Please add your name and at least one skill you teach and one you want.');
      return;
    }

    setLoading(true);
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

      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] py-14 px-4 flex justify-center">
      <div className="w-full max-w-5xl space-y-8">
        <header className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Skillr · Onboarding
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50">
            Set up your Skillr profile
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A complete profile helps Skillr match you with the people who can best teach
            you—and learn from you.
          </p>
        </header>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-8 md:px-8 md:py-9 shadow-[0_22px_60px_rgba(15,23,42,0.9)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: avatar + bio */}
            <div className="lg:col-span-4 space-y-6 flex flex-col items-center lg:items-start">
              <div className="w-full flex flex-col items-center gap-4">
                <div className="relative h-32 w-32 rounded-3xl bg-slate-950 border border-slate-700 overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-600">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 text-[11px] text-slate-100 gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-4 w-4" />
                    Upload photo
                    <input type="file" onChange={handleUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="w-full space-y-2">
                <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Bio
                </label>
                <textarea
                  placeholder="Describe how you like to work, teach, or learn."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 min-h-[120px] resize-none"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Right: identity + skills */}
            <div className="lg:col-span-8 space-y-7">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Full name
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3">
                    <User className="h-4 w-4 text-slate-500" />
                    <input
                      placeholder="How should Skillr introduce you?"
                      className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile((prev) => ({ ...prev, full_name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                    Contact number
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <input
                      placeholder="Shared only after a mutual match"
                      className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
                      value={profile.contact_number}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          contact_number: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <SkillPicker
                  type="have"
                  selectedSkills={skillsHave}
                  setSelectedSkills={setSkillsHave}
                />
                <SkillPicker
                  type="want"
                  selectedSkills={skillsWant}
                  setSelectedSkills={setSkillsWant}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving your profile…
                  </>
                ) : (
                  'Continue to Skillr'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
