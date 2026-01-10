import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, MessageSquare, Phone, Mail, Zap, Star, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENT: FINISH MATCH MODAL ---
function FinishModal({ match, userId, onClose, onComplete }) {
  const [rating, setRating] = useState(0);
  const [learnedIds, setLearnedIds] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // FIXED: Partner identification using userId from props
  const partner = match.requester_id === userId ? match.receiver : match.requester;

  useEffect(() => {
    async function fetchSharedSkills() {
      // 1. Get IDs of skills the partner HAS
      const { data: partnerSkills } = await supabase
        .from('skill_profile_skills')
        .select('skill_id')
        .eq('profile_id', partner.id)
        .eq('association_type', 'have');

      if (!partnerSkills || partnerSkills.length === 0) {
        setAvailableSkills([]);
        return;
      }

      const partnerSkillIds = partnerSkills.map(s => s.skill_id);

      // 2. Fetch skills current user WANTS that the partner actually has
      const { data } = await supabase
        .from('skill_profile_skills')
        .select('skill_id, skill_skills(name)')
        .eq('profile_id', userId)
        .eq('association_type', 'want')
        .in('skill_id', partnerSkillIds);
      
      setAvailableSkills(data?.map(d => ({ id: d.skill_id, name: d.skill_skills.name })) || []);
    }
    fetchSharedSkills();
  }, [userId, partner.id]);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please rate your partner's expertise.");
    setSubmitting(true);

    const isRequester = match.requester_id === userId;
    
    // Explicit update for the specific handshake side
    const updates = isRequester ? {
      requester_finished: true,
      requester_rating: rating,
      requester_learned_ids: learnedIds
    } : {
      receiver_finished: true,
      receiver_rating: rating,
      receiver_learned_ids: learnedIds
    };

    const { error } = await supabase
      .from('skill_matches')
      .update(updates)
      .eq('id', match.id);

    if (error) alert(error.message);
    else onComplete();
    
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-lg bg-[#0b0d14] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl space-y-8"
      >
        <div className="text-center space-y-2">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-50">Mastery Confirmation</h2>
          <p className="text-sm text-slate-400">Rate {partner.full_name} and confirm the skills you have mastered.</p>
        </div>

        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90 focus:outline-none">
              <Star className={`w-10 h-10 ${rating >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-800'}`} />
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1 text-center md:text-left">
            Manual Skill Evolution
          </p>
          <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {availableSkills.length > 0 ? availableSkills.map(skill => (
              <label key={skill.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/40 cursor-pointer hover:border-slate-600 transition-colors">
                <span className="text-sm font-medium text-slate-200">{skill.name}</span>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500" 
                  onChange={(e) => {
                    if(e.target.checked) setLearnedIds([...learnedIds, skill.id]);
                    else setLearnedIds(learnedIds.filter(id => id !== skill.id));
                  }}
                />
              </label>
            )) : (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                No matching "Wanted" skills found for this session.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl border border-slate-800 text-sm font-semibold text-slate-400 hover:bg-slate-900 transition-colors">Not yet</button>
          <button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="flex-1 py-4 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Finalize Swap"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Inbox({ session }) {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [mutualMatches, setMutualMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData();

      // Listen for handshake updates in skill_matches
      const channel = supabase
        .channel('match-updates')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'skill_matches' }, 
          () => fetchAllData()
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
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
      .in('status', ['accepted', 'completed'])
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
        <MessageSquare className="w-8 h-8 text-slate-700 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-14 px-4 md:px-6 space-y-14 pb-32">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Skillr · Inbox</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-50">Introductions & Skill Syncs</h1>
        <p className="text-sm text-slate-400 max-w-xl">Verify requests and finalize completed learning swaps.</p>
      </header>

      {/* Pending requests section */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold text-slate-200">Pending requests ({pendingRequests.length})</h2>
        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-8 text-sm text-slate-400">
            No incoming connection requests.
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {pendingRequests.map((req) => (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={req.id} 
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={req.requester.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester.full_name}`} className="h-11 w-11 rounded-2xl object-cover border border-slate-700 bg-slate-950" alt="" />
                    <div>
                      <p className="text-sm font-semibold text-slate-50">{req.requester.full_name}</p>
                      <p className="text-[11px] text-slate-400">Incoming match signal</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(req.id, 'accepted')} className="h-9 w-9 flex items-center justify-center rounded-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/20 transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => handleAction(req.id, 'rejected')} className="h-9 w-9 flex items-center justify-center rounded-full bg-red-600/5 text-red-400 border border-red-500/30 hover:bg-red-600/15 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Established syncs section */}
      <section className="space-y-5">
        <h2 className="text-sm font-semibold text-slate-200">Established Syncs</h2>
        <div className="grid grid-cols-1 gap-5">
          {mutualMatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-8 text-sm text-slate-400">No active or completed connections.</div>
          ) : mutualMatches.map((match) => {
            const isRequester = match.requester_id === session.user.id;
            const partner = isRequester ? match.receiver : match.requester;
            
            const userFinished = isRequester ? match.requester_finished : match.receiver_finished;
            const partnerFinished = isRequester ? match.receiver_finished : match.requester_finished;
            const isCompleted = match.status === 'completed';

            return (
              <article key={match.id} className={`rounded-3xl border ${isCompleted ? 'border-emerald-900/30 bg-emerald-900/5' : 'border-slate-800 bg-slate-900/80'} px-6 py-6 flex flex-col gap-6`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={partner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.full_name}`} className="h-14 w-14 rounded-2xl object-cover border border-slate-700 bg-slate-950" alt="" />
                    <div>
                      <p className="text-sm font-semibold text-slate-50">{partner.full_name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {isCompleted ? "SYNC COMPLETE" : "ACTIVE SESSION"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isCompleted && partnerFinished && !userFinished && (
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                          {partner.full_name} requested to finish
                        </span>
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="bg-amber-500 text-black px-5 py-2 rounded-full text-xs font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                        >
                          Accept Handshake
                        </button>
                      </div>
                    )}

                    {!isCompleted && !partnerFinished && !userFinished && (
                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="bg-slate-50 text-slate-950 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-white transition-all shadow-xl active:scale-95"
                      >
                        Finish Swap
                      </button>
                    )}

                    {userFinished && !isCompleted && (
                      <span className="text-[11px] font-bold text-slate-500 italic tracking-wide">
                        Waiting for {partner.full_name}'s handshake...
                      </span>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Trophy size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Mastered</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Identity Reveal Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-300">{partner.contact_number || 'Identity Private'}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-300">{partner.email}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <AnimatePresence>
        {selectedMatch && (
          <FinishModal 
            match={selectedMatch} 
            userId={session.user.id} 
            onClose={() => setSelectedMatch(null)} 
            onComplete={() => {
              setSelectedMatch(null);
              fetchAllData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}