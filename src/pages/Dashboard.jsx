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







import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Sparkles, MessageSquare, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard({ session }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [error, setError] = useState(null);

  // Memoize fetchMatches to prevent unnecessary re-renders
  const fetchMatches = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("🚀 Syncing Neural Matcher for UID:", session.user.id);
      
      const { data, error: rpcError } = await supabase.rpc('get_potential_matches', { 
        current_user_id: session.user.id 
      });

      if (rpcError) throw rpcError;

      console.log("✅ Match Results:", data);
      setMatches(data || []);
    } catch (err) {
      console.error("❌ RPC Fetch Failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchMatches();

    // REAL-TIME: Listen for new profile updates to refresh the feed automatically
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'skill_profile_skills' }, 
        () => fetchMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMatches]);

  const handleRequest = async (targetUserId) => {
    if (!session?.user?.id) return;
    setRequestingId(targetUserId);
    
    try {
      // 1. Check for Mutual Request (Accepted)
      const { data: mutual } = await supabase
        .from('skill_matches')
        .select('*')
        .eq('requester_id', targetUserId)
        .eq('receiver_id', session.user.id)
        .single();

      if (mutual) {
        const { error: updateError } = await supabase
          .from('skill_matches')
          .update({ status: 'accepted' })
          .eq('id', mutual.id);

        if (updateError) throw updateError;
        
        triggerSuccess();
        alert("BOOM! Mutual Match Found! 🚀 Check your Inbox.");
      } else {
        // 2. Prevent Duplicate Requests
        const { data: existing } = await supabase
          .from('skill_matches')
          .select('*')
          .eq('requester_id', session.user.id)
          .eq('receiver_id', targetUserId)
          .single();

        if (existing) {
          alert("Sequence already initiated. Waiting for their response... ⏳");
        } else {
          // 3. Insert New Match Request
          const { error: insertError } = await supabase
            .from('skill_matches')
            .insert({
              requester_id: session.user.id,
              receiver_id: targetUserId,
              status: 'pending'
            });
            
          if (insertError) throw insertError;
          alert("Request broadcasted! ⚡");
        }
      }
    } catch (err) {
      console.error("Interaction Error:", err.message);
      alert("System Error: " + err.message);
    } finally {
      setRequestingId(null);
    }
  };

  const triggerSuccess = () => {
    confetti({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#ffffff', '#3b82f6', '#1e293b']
    });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
        <Zap className="text-cyan-500 animate-bounce w-16 h-16 relative z-10" />
      </div>
      <div className="text-cyan-500 font-black tracking-[0.5em] text-xs mt-10 uppercase">
        Initializing Neural Sync
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 pb-32">
      <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-[2px] bg-cyan-500" />
            <span className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.4em]">Algorithm v4.0.2</span>
          </div>
          <h1 className="text-7xl font-black text-white italic tracking-tighter leading-none mb-4">
            FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">YOU</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-md">
            Architecting connections between your goals and global expertise.
          </p>
        </motion.div>
        
        <button 
          onClick={fetchMatches}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
        >
          <RefreshCcw className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" size={20} />
        </button>
      </header>

      {error && (
        <div className="glass p-6 rounded-3xl border-red-500/20 text-red-400 mb-10 text-sm font-bold">
          CRITICAL ERROR: {error}
        </div>
      )}

      {matches.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-center py-32 glass rounded-[4rem] border-dashed border-white/5 flex flex-col items-center justify-center"
        >
          <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <MessageSquare className="w-8 h-8 text-slate-700" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">ZERO SIGNALS DETECTED</h2>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">
            Broaden your skill interests in settings to expand your discovery network.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {matches.map((m, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
                key={m.profile_id} 
                className="glass p-10 rounded-[3rem] relative group border-white/5 hover:border-cyan-500/40 transition-all duration-700 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]"
              >
                <div className="absolute top-8 right-8 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                  {m.match_score * 20}% Compatibility
                </div>

                <div className="flex flex-col items-start gap-6 mb-8">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-[2.5rem] blur opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                    <img 
                      src={m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}`} 
                      className="w-28 h-28 rounded-[2.2rem] object-cover border-2 border-white/10 relative z-10" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-[6px] border-[#020617] rounded-full z-20" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white leading-none tracking-tighter mb-2">
                      {m.full_name}
                    </h3>
                    <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em]">Verified Expert</p>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed min-h-[4.5rem] mb-10 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                  {m.bio || "Crafting digital experiences. Seeking collaborative growth in emerging tech."}
                </p>
                
                <div className="space-y-8">
                  <div className="flex flex-wrap gap-2">
                    {m.shared_skills.map(s => (
                      <span key={s} className="px-4 py-2 bg-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 border border-white/5 transition-all group-hover:border-cyan-500/30">
                        {s}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleRequest(m.profile_id)}
                    disabled={requestingId === m.profile_id}
                    className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_20px_40px_rgba(0,0,0,0.3)] group/btn"
                  >
                    {requestingId === m.profile_id ? (
                      <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                      <>
                        <Zap size={20} className="fill-current group-hover/btn:scale-125 transition-transform" />
                        INITIATE SYNC
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