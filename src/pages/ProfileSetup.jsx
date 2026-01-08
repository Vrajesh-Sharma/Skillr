// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import SkillPicker from '../components/SkillPicker';
// import { 
//   Camera, 
//   Loader2, 
//   Sparkles, 
//   CheckCircle2, 
//   User, 
//   Phone, 
//   FileText,
//   ArrowRight
// } from 'lucide-react';
// import { motion } from 'framer-motion';

// export default function ProfileSetup({ session }) {
//   const [loading, setLoading] = useState(false);
//   const [profile, setProfile] = useState({
//     full_name: '',
//     contact_number: '',
//     bio: '',
//     avatar_url: ''
//   });
//   const [skillsHave, setSkillsHave] = useState([]);
//   const [skillsWant, setSkillsWant] = useState([]);

//   // Fetch existing profile if it exists (for editing)
//   useEffect(() => {
//     const getProfile = async () => {
//       const { data, error } = await supabase
//         .from('skill_profiles')
//         .select(`
//           *,
//           skill_profile_skills(skill_id, association_type, skill_skills(id, name))
//         `)
//         .eq('id', session.user.id)
//         .single();

//       if (data) {
//         setProfile({
//           full_name: data.full_name || '',
//           contact_number: data.contact_number || '',
//           bio: data.bio || '',
//           avatar_url: data.avatar_url || ''
//         });

//         // Filter and set skills
//         const have = data.Skill_profile_skills
//           .filter(s => s.association_type === 'have')
//           .map(s => s.Skill_skills);
//         const want = data.Skill_profile_skills
//           .filter(s => s.association_type === 'want')
//           .map(s => s.Skill_skills);
        
//         setSkillsHave(have);
//         setSkillsWant(want);
//       }
//     };
//     getProfile();
//   }, [session.user.id]);

//   const handleUpload = async (e) => {
//     try {
//       setLoading(true);
//       const file = e.target.files[0];
//       if (!file) return;

//       const fileExt = file.name.split('.').pop();
//       // Path matches the RLS policy: folder (uid) / filename
//       const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

//       const { error: uploadError } = await supabase.storage
//         .from('avatars')
//         .upload(filePath, file, { upsert: true });

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('avatars')
//         .getPublicUrl(filePath);

//       setProfile({ ...profile, avatar_url: publicUrl });
//     } catch (error) {
//       alert('Upload failed: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!profile.full_name || skillsHave.length === 0 || skillsWant.length === 0) {
//       return alert("Please complete your name and select at least one skill for both sections.");
//     }

//     setLoading(true);
    
//     try {
//       // 1. Upsert Profile Data
//       const { error: pError } = await supabase.from('skill_profiles').upsert({
//         id: session.user.id,
//         email: session.user.email,
//         full_name: profile.full_name,
//         contact_number: profile.contact_number,
//         bio: profile.bio,
//         avatar_url: profile.avatar_url,
//         updated_at: new Date()
//       });

//       if (pError) throw pError;

//       // 2. Clear existing skills for this user
//       await supabase.from('skill_profile_skills').delete().eq('profile_id', session.user.id);

//       // 3. Insert new Skill Associations
//       const skillMappings = [
//         ...skillsHave.map(s => ({ 
//           profile_id: session.user.id, 
//           skill_id: s.id, 
//           association_type: 'have' 
//         })),
//         ...skillsWant.map(s => ({ 
//           profile_id: session.user.id, 
//           skill_id: s.id, 
//           association_type: 'want' 
//         }))
//       ];

//       const { error: sError } = await supabase.from('skill_profile_skills').insert(skillMappings);
//       if (sError) throw sError;

//       // Success! Refresh or Redirect
//       window.location.reload(); 

//     } catch (error) {
//       alert(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#020617] py-16 px-4 flex justify-center selection:bg-cyan-500/30">
//       <div className="w-full max-w-5xl">
//         <header className="mb-12 text-center space-y-4">
//           <motion.div 
//             initial={{ scale: 0.8, opacity: 0 }} 
//             animate={{ scale: 1, opacity: 1 }}
//             className="inline-block p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-4"
//           >
//             <Sparkles className="text-cyan-400 w-8 h-8" />
//           </motion.div>
//           <h1 className="text-5xl font-black text-white tracking-tighter">Forge Your Profile</h1>
//           <p className="text-slate-500 font-medium">Define your skills and start matching with learners worldwide.</p>
//         </header>

//         <motion.div 
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           className="bg-slate-900/40 border border-white/5 backdrop-blur-3xl rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden"
//         >
//           {/* Subtle background glow */}
//           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -mr-32 -mt-32" />

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
            
//             {/* Left Column: Avatar & Bio (4 cols) */}
//             <div className="lg:col-span-4 space-y-10">
//               <div className="flex flex-col items-center">
//                 <div className="relative group cursor-pointer">
//                   <div className="w-44 h-44 rounded-[2.5rem] bg-slate-950 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-cyan-500/50 group-hover:scale-[1.02]">
//                     {profile.avatar_url ? (
//                       <img src={profile.avatar_url} className="w-full h-full object-cover" />
//                     ) : (
//                       <Camera className="w-12 h-12 text-slate-700 group-hover:text-cyan-400 transition-colors" />
//                     )}
//                     <input 
//                       type="file" 
//                       accept="image/*"
//                       onChange={handleUpload} 
//                       className="absolute inset-0 opacity-0 cursor-pointer" 
//                     />
//                   </div>
//                   {profile.avatar_url && (
//                     <motion.div 
//                       initial={{ scale: 0 }} 
//                       animate={{ scale: 1 }}
//                       className="absolute -bottom-2 -right-2 bg-cyan-500 rounded-2xl p-2 text-black shadow-lg shadow-cyan-500/40"
//                     >
//                       <CheckCircle2 size={24} />
//                     </motion.div>
//                   )}
//                 </div>
//                 <p className="mt-6 text-[11px] uppercase font-black tracking-[0.3em] text-slate-500">Identity Visual</p>
//               </div>

//               <div className="space-y-6">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bio / Mission</label>
//                   <div className="relative">
//                     <FileText className="absolute left-4 top-4 text-slate-600 w-5 h-5" />
//                     <textarea 
//                       value={profile.bio}
//                       onChange={e => setProfile({...profile, bio: e.target.value})}
//                       className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-3xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all h-44 resize-none font-medium text-slate-300" 
//                       placeholder="What can you teach the world?"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column: Info & Skills (8 cols) */}
//             <div className="lg:col-span-8 space-y-10">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Full Name</label>
//                   <div className="relative">
//                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
//                     <input 
//                       value={profile.full_name}
//                       onChange={e => setProfile({...profile, full_name: e.target.value})}
//                       className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-medium text-white" 
//                       placeholder="e.g. Vrajesh Sharma"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Contact Number</label>
//                   <div className="relative">
//                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-5 h-5" />
//                     <input 
//                       value={profile.contact_number}
//                       onChange={e => setProfile({...profile, contact_number: e.target.value})}
//                       className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-medium text-white" 
//                       placeholder="+91 XXXXX XXXXX"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
//                 <SkillPicker 
//                   type="have" 
//                   selectedSkills={skillsHave} 
//                   setSelectedSkills={setSkillsHave} 
//                 />
//                 <SkillPicker 
//                   type="want" 
//                   selectedSkills={skillsWant} 
//                   setSelectedSkills={setSkillsWant} 
//                 />
//               </div>

//               <div className="pt-8">
//                 <button 
//                   onClick={handleSave} 
//                   disabled={loading}
//                   className="w-full py-6 bg-white text-black font-black rounded-3xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 group"
//                 >
//                   {loading ? (
//                     <Loader2 className="animate-spin w-6 h-6" />
//                   ) : (
//                     <>
//                       INITIALIZE ACCOUNT
//                       <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         <footer className="mt-12 text-center">
//           <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">
//             Your data is encrypted and secure with Supabase Auth
//           </p>
//         </footer>
//       </div>
//     </div>
//   );
// }






import { useState } from 'react';
import { supabase } from '../lib/supabase';
import SkillPicker from '../components/SkillPicker';
import { Camera, Loader2, Sparkles, CheckCircle2, User, Phone, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSetup({ session }) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', contact_number: '', bio: '', avatar_url: '' });
  const [skillsHave, setSkillsHave] = useState([]);
  const [skillsWant, setSkillsWant] = useState([]);

  const handleUpload = async (e) => {
    try {
      setLoading(true);
      const file = e.target.files[0];
      const filePath = `${session.user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!profile.full_name || skillsHave.length === 0 || skillsWant.length === 0) return alert("Please fill everything.");
    setLoading(true);
    try {
      // 1. Profile
      const { error: pErr } = await supabase.from('skill_profiles').upsert({
        id: session.user.id, email: session.user.email, ...profile, updated_at: new Date()
      });
      if (pErr) throw pErr;

      // 2. Clear & Save Skills
      await supabase.from('skill_profile_skills').delete().eq('profile_id', session.user.id);
      const mappings = [
        ...skillsHave.map(s => ({ profile_id: session.user.id, skill_id: s.id, association_type: 'have' })),
        ...skillsWant.map(s => ({ profile_id: session.user.id, skill_id: s.id, association_type: 'want' }))
      ];
      const { error: sErr } = await supabase.from('skill_profile_skills').insert(mappings);
      if (sErr) throw sErr;

      window.location.reload(); 
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-dark py-20 px-4 flex justify-center">
      <div className="w-full max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-white italic tracking-tighter">SKILL IDENTITY</h1>
        </header>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass p-10 rounded-[3rem] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 flex flex-col items-center gap-8">
              <div className="relative group w-44 h-44 rounded-[2.5rem] bg-slate-950 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-cyan-500/50">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-slate-700" />}
                <input type="file" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <textarea placeholder="Your Bio..." className="w-full p-4 bg-slate-950/50 border border-white/5 rounded-3xl h-44 focus:border-cyan-500 outline-none resize-none" onChange={e => setProfile({...profile, bio: e.target.value})} />
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <input placeholder="Full Name" className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, full_name: e.target.value})} />
                <input placeholder="Contact Number" className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl focus:border-cyan-500 outline-none" onChange={e => setProfile({...profile, contact_number: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-10">
                <SkillPicker type="have" selectedSkills={skillsHave} setSelectedSkills={setSkillsHave} />
                <SkillPicker type="want" selectedSkills={skillsWant} setSelectedSkills={setSkillsWant} />
              </div>
              <button onClick={handleSave} disabled={loading} className="w-full py-5 bg-white text-black font-black rounded-[1.5rem] hover:bg-cyan-400 transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : 'INITIALIZE DASHBOARD'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}