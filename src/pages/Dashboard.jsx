// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { motion, AnimatePresence } from 'framer-motion';
// import { User, Zap, Check, Loader2 } from 'lucide-react';
// import confetti from 'canvas-confetti';

// export default function Dashboard({ session }) {
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [requestingId, setRequestingId] = useState(null);

//   useEffect(() => {
//     fetchMatches();
//   }, []);

//   const fetchMatches = async () => {
//     const { data, error } = await supabase.rpc('get_potential_matches', { 
//       current_user_id: session.user.id 
//     });
//     if (!error) setMatches(data);
//     setLoading(false);
//   };

//   const handleRequest = async (targetUserId) => {
//     setRequestingId(targetUserId);
    
//     try {
//       // 1. Check if they already requested YOU
//       const { data: existingRequest } = await supabase
//         .from('Skill_matches')
//         .select('*')
//         .eq('requester_id', targetUserId)
//         .eq('receiver_id', session.user.id)
//         .single();

//       if (existingRequest) {
//         // IT'S A MATCH! Update status to 'accepted'
//         const { error } = await supabase
//           .from('Skill_matches')
//           .update({ status: 'accepted' })
//           .eq('id', existingRequest.id);

//         if (!error) {
//           triggerConfetti();
//           alert("Boom! It's a mutual match! 🚀 Check your inbox for contact details.");
//         }
//       } else {
//         // 2. Normal Request: Check if you already requested them to avoid duplicates
//         const { data: sentRequest } = await supabase
//           .from('Skill_matches')
//           .select('*')
//           .eq('requester_id', session.user.id)
//           .eq('receiver_id', targetUserId)
//           .single();

//         if (sentRequest) {
//           alert("Request already sent! Waiting for them to respond.");
//         } else {
//           await supabase.from('Skill_matches').insert({
//             requester_id: session.user.id,
//             receiver_id: targetUserId,
//             status: 'pending'
//           });
//           alert("Match request sent! ⚡");
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setRequestingId(null);
//     }
//   };

//   const triggerConfetti = () => {
//     confetti({
//       particleCount: 150,
//       spread: 70,
//       origin: { y: 0.6 },
//       colors: ['#06b6d4', '#ffffff', '#3b82f6']
//     });
//   };

//   if (loading) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
//       <Zap className="text-cyan-500 animate-bounce w-12 h-12 mb-4" />
//       <div className="text-cyan-500 font-black tracking-widest text-xl">SCANNING NEURAL NETWORK...</div>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto py-12 px-6 pb-32">
//       <header className="mb-16 flex justify-between items-end">
//         <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
//           <h1 className="text-5xl font-black text-white tracking-tighter italic">FOR YOU</h1>
//           <p className="text-slate-500 mt-2 font-medium">Top profiles matching your desired skills</p>
//         </motion.div>
//         <button 
//           onClick={() => supabase.auth.signOut()} 
//           className="px-6 py-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all text-sm font-bold"
//         >
//           LOGOUT
//         </button>
//       </header>

//       {matches.length === 0 ? (
//         <div className="text-center py-20 glass rounded-[3rem]">
//           <p className="text-slate-500 text-xl">No potential matches found yet. Try adding more "Skills Wanted" in your profile!</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
//           <AnimatePresence>
//             {matches.map((m, i) => (
//               <motion.div 
//                 layout
//                 initial={{ opacity: 0, scale: 0.9 }} 
//                 animate={{ opacity: 1, scale: 1 }} 
//                 transition={{ delay: i * 0.05 }}
//                 key={m.profile_id} 
//                 className="glass p-8 rounded-[2.5rem] relative group hover:border-cyan-500/30 transition-all duration-500"
//               >
//                 {/* Compatibility Badge */}
//                 <div className="absolute top-6 right-6 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2">
//                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
//                   {m.match_score * 20}% SYNC
//                 </div>

//                 <div className="flex items-center gap-6 mb-8">
//                   <img 
//                     src={m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}`} 
//                     className="w-24 h-24 rounded-[2rem] object-cover border-2 border-white/5 group-hover:border-cyan-500/50 transition-all duration-500" 
//                   />
//                   <div>
//                     <h3 className="text-2xl font-black text-white leading-tight">{m.full_name}</h3>
//                     <p className="text-cyan-500/60 text-xs font-bold uppercase tracking-widest mt-1">Available to Teach</p>
//                   </div>
//                 </div>

//                 <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 min-h-[4.5rem] mb-6 font-medium">
//                   {m.bio || "No bio provided."}
//                 </p>
                
//                 <div className="space-y-4">
//                   <div className="flex flex-wrap gap-2">
//                     {m.shared_skills.map(s => (
//                       <span key={s} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-400 border border-white/5 group-hover:border-cyan-500/20 transition-all">
//                         {s}
//                       </span>
//                     ))}
//                   </div>

//                   <button 
//                     onClick={() => handleRequest(m.profile_id)}
//                     disabled={requestingId === m.profile_id}
//                     className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {requestingId === m.profile_id ? (
//                       <Loader2 className="animate-spin w-5 h-5" />
//                     ) : (
//                       <>
//                         <Zap size={18} className="fill-current" />
//                         REQUEST MATCH
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//       )}
//     </div>
//   );
// }







import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard({ session }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    // Calling the PostgreSQL function we created earlier
    const { data, error } = await supabase.rpc('get_potential_matches', { 
      current_user_id: session.user.id 
    });
    
    if (error) console.error("RPC Error:", error.message);
    else setMatches(data || []);
    setLoading(false);
  };

  const handleRequest = async (targetUserId) => {
    setRequestingId(targetUserId);
    
    try {
      // 1. Check if they already requested YOU (Lowercase table)
      const { data: mutual } = await supabase
        .from('skill_matches')
        .select('*')
        .eq('requester_id', targetUserId)
        .eq('receiver_id', session.user.id)
        .single();

      if (mutual) {
        // Mutual Match Found -> Update status to 'accepted'
        await supabase
          .from('skill_matches')
          .update({ status: 'accepted' })
          .eq('id', mutual.id);

        triggerSuccess();
        alert("It's a Match! 🚀 Check your Inbox for their contact info.");
      } else {
        // 2. Check if you already sent a request to them
        const { data: existing } = await supabase
          .from('skill_matches')
          .select('*')
          .eq('requester_id', session.user.id)
          .eq('receiver_id', targetUserId)
          .single();

        if (existing) {
          alert("Request already pending! ⏳");
        } else {
          // 3. New Request
          await supabase.from('skill_matches').insert({
            requester_id: session.user.id,
            receiver_id: targetUserId,
            status: 'pending'
          });
          alert("Request sent! ⚡");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRequestingId(null);
    }
  };

  const triggerSuccess = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#ffffff', '#3b82f6']
    });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
        <Zap className="text-cyan-500 animate-bounce w-12 h-12 relative z-10" />
      </div>
      <div className="text-cyan-500 font-black tracking-widest text-sm mt-6">SYNCING NEURAL NETWORK...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-cyan-400 w-4 h-4" />
            <span className="text-cyan-500 font-bold text-xs uppercase tracking-[0.3em]">Neural Matcher</span>
          </div>
          <h1 className="text-6xl font-black text-white italic tracking-tighter">FOR YOU</h1>
          <p className="text-slate-500 mt-3 font-medium text-lg">Recommended learning partners nearby.</p>
        </motion.div>
      </header>

      {matches.length === 0 ? (
        <div className="text-center py-24 glass rounded-[3rem] border-dashed border-white/5">
          <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-xl font-medium px-8">No potential matches found. <br/> Try adding more skills to your "Wanted" list!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {matches.map((m, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }}
                key={m.profile_id} 
                className="glass p-8 rounded-[2.5rem] relative group border-white/5 hover:border-cyan-500/30 transition-all duration-500"
              >
                {/* Score Badge */}
                <div className="absolute top-6 right-6 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest">
                  {m.match_score * 20}% SYNC
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <img 
                      src={m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}`} 
                      className="w-24 h-24 rounded-[2rem] object-cover border-2 border-white/5 group-hover:border-cyan-500/50 transition-all duration-500" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#020617] rounded-full" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white leading-tight mb-2">{m.full_name}</h3>
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 min-h-[4.5rem] mb-6 font-medium">
                  {m.bio || "No bio provided."}
                </p>
                
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {m.shared_skills.map(s => (
                      <span key={s} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-400 border border-white/5 group-hover:border-cyan-500/20 transition-all">
                        {s}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleRequest(m.profile_id)}
                    disabled={requestingId === m.profile_id}
                    className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-black/20"
                  >
                    {requestingId === m.profile_id ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        <Zap size={18} className="fill-current" />
                        INITIATE SWAP
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}