// import { useEffect, useState, useCallback } from 'react';
// import { supabase } from '../lib/supabase';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Zap, Loader2, Sparkles, MessageSquare, RefreshCcw } from 'lucide-react';
// import confetti from 'canvas-confetti';

// export default function Dashboard({ session }) {
//   const [matches, setMatches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [requestingId, setRequestingId] = useState(null);
//   const [error, setError] = useState(null);

//   // Memoize fetchMatches to prevent unnecessary re-renders
//   const fetchMatches = useCallback(async () => {
//     if (!session?.user?.id) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       console.log("🚀 Syncing Neural Matcher for UID:", session.user.id);
      
//       const { data, error: rpcError } = await supabase.rpc('get_potential_matches', { 
//         current_user_id: session.user.id 
//       });

//       if (rpcError) throw rpcError;

//       console.log("✅ Match Results:", data);
//       setMatches(data || []);
//     } catch (err) {
//       console.error("❌ RPC Fetch Failed:", err.message);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [session?.user?.id]);

//   useEffect(() => {
//     fetchMatches();

//     // REAL-TIME: Listen for new profile updates to refresh the feed automatically
//     const channel = supabase
//       .channel('schema-db-changes')
//       .on('postgres_changes', 
//         { event: '*', schema: 'public', table: 'skill_profile_skills' }, 
//         () => fetchMatches()
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [fetchMatches]);

//   const handleRequest = async (targetUserId) => {
//     if (!session?.user?.id) return;
//     setRequestingId(targetUserId);
    
//     try {
//       // 1. Check for Mutual Request (Accepted)
//       const { data: mutual } = await supabase
//         .from('skill_matches')
//         .select('*')
//         .eq('requester_id', targetUserId)
//         .eq('receiver_id', session.user.id)
//         .single();

//       if (mutual) {
//         const { error: updateError } = await supabase
//           .from('skill_matches')
//           .update({ status: 'accepted' })
//           .eq('id', mutual.id);

//         if (updateError) throw updateError;
        
//         triggerSuccess();
//         alert("BOOM! Mutual Match Found! 🚀 Check your Inbox.");
//       } else {
//         // 2. Prevent Duplicate Requests
//         const { data: existing } = await supabase
//           .from('skill_matches')
//           .select('*')
//           .eq('requester_id', session.user.id)
//           .eq('receiver_id', targetUserId)
//           .single();

//         if (existing) {
//           alert("Sequence already initiated. Waiting for their response... ⏳");
//         } else {
//           // 3. Insert New Match Request
//           const { error: insertError } = await supabase
//             .from('skill_matches')
//             .insert({
//               requester_id: session.user.id,
//               receiver_id: targetUserId,
//               status: 'pending'
//             });
            
//           if (insertError) throw insertError;
//           alert("Request broadcasted! ⚡");
//         }
//       }
//     } catch (err) {
//       console.error("Interaction Error:", err.message);
//       alert("System Error: " + err.message);
//     } finally {
//       setRequestingId(null);
//     }
//   };

//   const triggerSuccess = () => {
//     confetti({
//       particleCount: 180,
//       spread: 80,
//       origin: { y: 0.6 },
//       colors: ['#06b6d4', '#ffffff', '#3b82f6', '#1e293b']
//     });
//   };

//   if (loading) return (
//     <div className="h-screen flex flex-col items-center justify-center bg-[#020617]">
//       <div className="relative">
//         <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse" />
//         <Zap className="text-cyan-500 animate-bounce w-16 h-16 relative z-10" />
//       </div>
//       <div className="text-cyan-500 font-black tracking-[0.5em] text-xs mt-10 uppercase">
//         Initializing Neural Sync
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto py-16 px-6 pb-32">
//       <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
//         <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
//           <div className="flex items-center gap-2 mb-3">
//             <div className="w-8 h-[2px] bg-cyan-500" />
//             <span className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.4em]">Algorithm v4.0.2</span>
//           </div>
//           <h1 className="text-7xl font-black text-white italic tracking-tighter leading-none mb-4">
//             FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">YOU</span>
//           </h1>
//           <p className="text-slate-500 font-medium text-lg max-w-md">
//             Architecting connections between your goals and global expertise.
//           </p>
//         </motion.div>
        
//         <button 
//           onClick={fetchMatches}
//           className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
//         >
//           <RefreshCcw className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" size={20} />
//         </button>
//       </header>

//       {error && (
//         <div className="glass p-6 rounded-3xl border-red-500/20 text-red-400 mb-10 text-sm font-bold">
//           CRITICAL ERROR: {error}
//         </div>
//       )}

//       {matches.length === 0 ? (
//         <motion.div 
//           initial={{ opacity: 0 }} 
//           animate={{ opacity: 1 }}
//           className="text-center py-32 glass rounded-[4rem] border-dashed border-white/5 flex flex-col items-center justify-center"
//         >
//           <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mb-6 border border-white/5">
//             <MessageSquare className="w-8 h-8 text-slate-700" />
//           </div>
//           <h2 className="text-2xl font-black text-white mb-2">ZERO SIGNALS DETECTED</h2>
//           <p className="text-slate-500 font-medium max-w-xs mx-auto">
//             Broaden your skill interests in settings to expand your discovery network.
//           </p>
//         </motion.div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           <AnimatePresence mode="popLayout">
//             {matches.map((m, i) => (
//               <motion.div 
//                 layout
//                 initial={{ opacity: 0, scale: 0.9, y: 20 }} 
//                 animate={{ opacity: 1, scale: 1, y: 0 }} 
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ delay: i * 0.08, type: "spring", stiffness: 100 }}
//                 key={m.profile_id} 
//                 className="glass p-10 rounded-[3rem] relative group border-white/5 hover:border-cyan-500/40 transition-all duration-700 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]"
//               >
//                 <div className="absolute top-8 right-8 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
//                   {m.match_score * 20}% Compatibility
//                 </div>

//                 <div className="flex flex-col items-start gap-6 mb-8">
//                   <div className="relative">
//                     <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-[2.5rem] blur opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
//                     <img 
//                       src={m.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}`} 
//                       className="w-28 h-28 rounded-[2.2rem] object-cover border-2 border-white/10 relative z-10" 
//                     />
//                     <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-[6px] border-[#020617] rounded-full z-20" />
//                   </div>
//                   <div>
//                     <h3 className="text-3xl font-black text-white leading-none tracking-tighter mb-2">
//                       {m.full_name}
//                     </h3>
//                     <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em]">Verified Expert</p>
//                   </div>
//                 </div>

//                 <p className="text-slate-400 text-sm leading-relaxed min-h-[4.5rem] mb-10 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
//                   {m.bio || "Crafting digital experiences. Seeking collaborative growth in emerging tech."}
//                 </p>
                
//                 <div className="space-y-8">
//                   <div className="flex flex-wrap gap-2">
//                     {m.shared_skills.map(s => (
//                       <span key={s} className="px-4 py-2 bg-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 border border-white/5 transition-all group-hover:border-cyan-500/30">
//                         {s}
//                       </span>
//                     ))}
//                   </div>

//                   <button 
//                     onClick={() => handleRequest(m.profile_id)}
//                     disabled={requestingId === m.profile_id}
//                     className="w-full py-5 bg-white text-black font-black rounded-3xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_20px_40px_rgba(0,0,0,0.3)] group/btn"
//                   >
//                     {requestingId === m.profile_id ? (
//                       <Loader2 className="animate-spin w-6 h-6" />
//                     ) : (
//                       <>
//                         <Zap size={20} className="fill-current group-hover/btn:scale-125 transition-transform" />
//                         INITIATE SYNC
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
import { Zap, Loader2, MessageSquare, RefreshCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard({ session }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchMatches = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase.rpc('get_potential_matches', { 
        current_user_id: session.user.id 
      });

      if (rpcError) throw rpcError;
      setMatches(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
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
        alert("Mutual match on Skillr. Check your inbox to connect.");
      } else {
        const { data: existing } = await supabase
          .from('skill_matches')
          .select('*')
          .eq('requester_id', session.user.id)
          .eq('receiver_id', targetUserId)
          .single();

        if (existing) {
          alert("You have already requested this profile. Waiting for their response.");
        } else {
          const { error: insertError } = await supabase
            .from('skill_matches')
            .insert({
              requester_id: session.user.id,
              receiver_id: targetUserId,
              status: 'pending'
            });
          
          if (insertError) throw insertError;
          alert("Request sent via Skillr.");
        }
      }
    } catch (err) {
      alert("System error: " + err.message);
    } finally {
      setRequestingId(null);
    }
  };

  const triggerSuccess = () => {
    confetti({
      particleCount: 140,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#16a34a', '#e5e7eb']
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center">
            <Zap className="w-5 h-5 text-slate-300 animate-spin" />
          </div>
          <span className="text-sm font-medium text-slate-300">
            Skillr is preparing your matches
          </span>
        </div>
        <div className="w-40 h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full w-1/2 bg-slate-300 animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-14 px-4 md:px-6 lg:px-0 space-y-10">
      {/* Top bar */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Skillr · Discovery
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-50">
            Curated experts for your next skill jump
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            This dashboard shows people whose strengths align with what you want to learn.
            Each connection is designed to be actionable, not just another profile.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh matches
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Empty state */}
      {matches.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 px-8 py-16 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700">
            <MessageSquare className="h-5 w-5 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-2">
            No suggestions yet
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Update the skills you want to learn in your profile. Skillr will use that to
            surface mentors and peers who are a meaningful match.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {matches.map((m, i) => (
              <motion.article
                key={m.profile_id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="rounded-3xl border border-slate-800 bg-[color:var(--color-surface)] px-6 py-6 flex flex-col gap-5 shadow-[0_18px_40px_rgba(15,23,42,0.7)] hover:border-slate-600 hover:bg-[color:var(--color-surface-soft)] transition-colors"
              >
                {/* Top row: avatar + score */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        m.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.full_name}&backgroundColor=111827`
                      }
                      alt={m.full_name}
                      className="h-14 w-14 rounded-2xl object-cover border border-slate-700 bg-slate-900"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-slate-50">
                        {m.full_name}
                      </h3>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 mt-1">
                        Skillr mentor candidate
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-slate-400 uppercase tracking-[0.16em]">
                      Match score
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-50">
                        {Math.round(m.match_score * 100)}%
                      </span>
                      <div className="h-1.5 w-20 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[color:var(--color-accent)]"
                          style={{ width: `${Math.min(Math.round(m.match_score * 100), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-slate-300 leading-relaxed">
                  {m.bio ||
                    "Focused on sharing practical experience and helping people grow with clear, structured learning journeys."}
                </p>

                {/* Shared skills */}
                <div className="flex flex-wrap gap-2">
                  {m.shared_skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] font-medium text-slate-200"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => handleRequest(m.profile_id)}
                    disabled={requestingId === m.profile_id}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-slate-50 hover:bg-[color:var(--color-accent-soft)] disabled:bg-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {requestingId === m.profile_id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending request…
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Request introduction
                      </>
                    )}
                  </button>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}
