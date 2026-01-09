// import { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { Check, X, MessageSquare, Phone, Mail, Zap } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// export default function Inbox({ session }) {
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [mutualMatches, setMutualMatches] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchAllData();
//     }
//   }, [session?.user?.id]);

//   const fetchAllData = async () => {
//     setLoading(true);
//     // 1. Fetch Incoming Pending Requests
//     const { data: incoming } = await supabase
//       .from('skill_matches')
//       .select('*, requester:skill_profiles!requester_id(*)')
//       .eq('receiver_id', session.user.id)
//       .eq('status', 'pending');

//     // 2. Fetch Mutual Matches (Accepted)
//     const { data: accepted } = await supabase
//       .from('skill_matches')
//       .select(`
//         *,
//         requester:skill_profiles!requester_id(*),
//         receiver:skill_profiles!receiver_id(*)
//       `)
//       .eq('status', 'accepted')
//       .or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

//     setPendingRequests(incoming || []);
//     setMutualMatches(accepted || []);
//     setLoading(false);
//   };

//   const handleAction = async (matchId, newStatus) => {
//     const { error } = await supabase
//       .from('skill_matches')
//       .update({ status: newStatus })
//       .eq('id', matchId);

//     if (!error) fetchAllData();
//   };

//   if (loading) return (
//     <div className="h-screen flex items-center justify-center bg-[#020617]">
//       <div className="text-cyan-500 font-black animate-pulse tracking-widest">DECRYPTING SIGNALS...</div>
//     </div>
//   );

//   return (
//     <div className="max-w-4xl mx-auto py-20 px-6 space-y-20 pb-40">
      
//       {/* SECTION 1: INCOMING REQUESTS */}
//       <section>
//         <h2 className="text-3xl font-black mb-8 italic tracking-tighter flex items-center gap-3">
//           <Zap size={24} className="text-cyan-400" /> PENDING REQUESTS
//         </h2>
//         <div className="space-y-4">
//           {pendingRequests.length === 0 && (
//             <p className="text-slate-500 italic glass p-6 rounded-2xl border-dashed">No incoming signals...</p>
//           )}
//           <AnimatePresence>
//             {pendingRequests.map((req) => (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={req.id} 
//                 className="glass p-6 rounded-[2rem] flex items-center justify-between border-white/5">
//                 <div className="flex items-center gap-4">
//                   <img src={req.requester.avatar_url} className="w-14 h-14 rounded-2xl object-cover" />
//                   <div>
//                     <h4 className="font-bold text-white">{req.requester.full_name}</h4>
//                     <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Wants to Swap</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button onClick={() => handleAction(req.id, 'accepted')} className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-black transition-all"><Check /></button>
//                   <button onClick={() => handleAction(req.id, 'rejected')} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 transition-all"><X /></button>
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//       </section>

//       {/* SECTION 2: MUTUAL MATCHES (Identity Revealed) */}
//       <section>
//         <h2 className="text-3xl font-black mb-8 italic tracking-tighter flex items-center gap-3">
//           <MessageSquare size={24} className="text-purple-400" /> ESTABLISHED SYNC
//         </h2>
//         <div className="grid grid-cols-1 gap-6">
//           {mutualMatches.length === 0 && (
//             <p className="text-slate-500 italic glass p-6 rounded-2xl border-dashed">No mutual connections established yet.</p>
//           )}
//           {mutualMatches.map((match) => {
//             // Determine which profile is the OTHER person
//             const partner = match.requester_id === session.user.id ? match.receiver : match.requester;
//             return (
//               <motion.div key={match.id} className="glass p-8 rounded-[2.5rem] border-cyan-500/20 bg-cyan-500/5">
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//                   <div className="flex items-center gap-5">
//                     <img src={partner.avatar_url} className="w-20 h-20 rounded-3xl object-cover border-2 border-cyan-500/30" />
//                     <div>
//                       <h4 className="text-2xl font-black text-white">{partner.full_name}</h4>
//                       <p className="text-xs text-slate-400 mt-1 max-w-xs line-clamp-1">{partner.bio}</p>
//                     </div>
//                   </div>
                  
//                   <div className="flex flex-col gap-3">
//                     <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
//                       <Phone size={16} className="text-cyan-400" />
//                       <span className="text-sm font-bold">{partner.contact_number || 'No number provided'}</span>
//                     </div>
//                     <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
//                       <Mail size={16} className="text-cyan-400" />
//                       <span className="text-sm font-bold">{partner.email}</span>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             );
//           })}
//         </div>
//       </section>
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, MessageSquare, Phone, Mail, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Inbox({ session }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mutualMatches, setMutualMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData();
    }
  }, [session?.user?.id]);

  const fetchAllData = async () => {
    setLoading(true);

    const { data: incoming } = await supabase
      .from('skill_matches')
      .select('*, requester:skill_profiles!requester_id(*)')
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending');

    const { data: accepted } = await supabase
      .from('skill_matches')
      .select(`
        *,
        requester:skill_profiles!requester_id(*),
        receiver:skill_profiles!receiver_id(*)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

    setPendingRequests(incoming || []);
    setMutualMatches(accepted || []);
    setLoading(false);
  };

  const handleAction = async (matchId, newStatus) => {
    const { error } = await supabase
      .from('skill_matches')
      .update({ status: newStatus })
      .eq('id', matchId);

    if (!error) fetchAllData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-slate-300 animate-pulse" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Loading your Skillr inbox
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-14 px-4 md:px-6 lg:px-0 space-y-14">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Skillr · Inbox
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-50">
          Manage introductions and confirmed matches
        </h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Review who requested time with you and access verified contact details for
          accepted Skillr connections.
        </p>
      </header>

      {/* Section 1: Pending */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">
            Pending requests
          </h2>
          <span className="text-xs text-slate-500">
            {pendingRequests.length} waiting decision
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-8 text-sm text-slate-400 flex items-center gap-3">
            <MessageSquare className="h-4 w-4 text-slate-500" />
            No one has requested a Skillr introduction yet.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        req.requester.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester.full_name}`
                      }
                      alt={req.requester.full_name}
                      className="h-11 w-11 rounded-2xl object-cover border border-slate-700 bg-slate-950"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-50">
                        {req.requester.full_name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Requested to connect via Skillr
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(req.id, 'accepted')}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/20 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600/5 text-red-400 border border-red-500/30 hover:bg-red-600/15 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Section 2: Mutual matches */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">
            Confirmed connections
          </h2>
          <span className="text-xs text-slate-500">
            {mutualMatches.length} ready to contact
          </span>
        </div>

        {mutualMatches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-8 text-sm text-slate-400 flex items-center gap-3">
            <Zap className="h-4 w-4 text-slate-500" />
            Once a request is accepted on both sides, Skillr will reveal verified
            contact details here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {mutualMatches.map((match) => {
              const partner =
                match.requester_id === session.user.id
                  ? match.receiver
                  : match.requester;

              return (
                <article
                  key={match.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-6 flex flex-col gap-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          partner.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.full_name}`
                        }
                        alt={partner.full_name}
                        className="h-14 w-14 rounded-2xl object-cover border border-slate-700 bg-slate-950"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-50">
                          {partner.full_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-md">
                          {partner.bio || 'No public bio set yet.'}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-full border border-emerald-600/40 bg-emerald-600/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                      Connected via Skillr
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                          Phone
                        </span>
                        <span className="text-sm font-medium text-slate-100">
                          {partner.contact_number || 'Not provided'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-500 uppercase tracking-[0.16em]">
                          Email
                        </span>
                        <span className="text-sm font-medium text-slate-100">
                          {partner.email || 'Not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
