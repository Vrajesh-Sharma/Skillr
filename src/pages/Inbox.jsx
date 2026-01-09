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
    // 1. Fetch Incoming Pending Requests
    const { data: incoming } = await supabase
      .from('skill_matches')
      .select('*, requester:skill_profiles!requester_id(*)')
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending');

    // 2. Fetch Mutual Matches (Accepted)
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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <div className="text-cyan-500 font-black animate-pulse tracking-widest">DECRYPTING SIGNALS...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 space-y-20 pb-40">
      
      {/* SECTION 1: INCOMING REQUESTS */}
      <section>
        <h2 className="text-3xl font-black mb-8 italic tracking-tighter flex items-center gap-3">
          <Zap size={24} className="text-cyan-400" /> PENDING REQUESTS
        </h2>
        <div className="space-y-4">
          {pendingRequests.length === 0 && (
            <p className="text-slate-500 italic glass p-6 rounded-2xl border-dashed">No incoming signals...</p>
          )}
          <AnimatePresence>
            {pendingRequests.map((req) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={req.id} 
                className="glass p-6 rounded-[2rem] flex items-center justify-between border-white/5">
                <div className="flex items-center gap-4">
                  <img src={req.requester.avatar_url} className="w-14 h-14 rounded-2xl object-cover" />
                  <div>
                    <h4 className="font-bold text-white">{req.requester.full_name}</h4>
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Wants to Swap</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req.id, 'accepted')} className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-black transition-all"><Check /></button>
                  <button onClick={() => handleAction(req.id, 'rejected')} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 transition-all"><X /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* SECTION 2: MUTUAL MATCHES (Identity Revealed) */}
      <section>
        <h2 className="text-3xl font-black mb-8 italic tracking-tighter flex items-center gap-3">
          <MessageSquare size={24} className="text-purple-400" /> ESTABLISHED SYNC
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {mutualMatches.length === 0 && (
            <p className="text-slate-500 italic glass p-6 rounded-2xl border-dashed">No mutual connections established yet.</p>
          )}
          {mutualMatches.map((match) => {
            // Determine which profile is the OTHER person
            const partner = match.requester_id === session.user.id ? match.receiver : match.requester;
            return (
              <motion.div key={match.id} className="glass p-8 rounded-[2.5rem] border-cyan-500/20 bg-cyan-500/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <img src={partner.avatar_url} className="w-20 h-20 rounded-3xl object-cover border-2 border-cyan-500/30" />
                    <div>
                      <h4 className="text-2xl font-black text-white">{partner.full_name}</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs line-clamp-1">{partner.bio}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                      <Phone size={16} className="text-cyan-400" />
                      <span className="text-sm font-bold">{partner.contact_number || 'No number provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                      <Mail size={16} className="text-cyan-400" />
                      <span className="text-sm font-bold">{partner.email}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}