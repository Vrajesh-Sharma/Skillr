import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, MessageSquare, RefreshCcw, Star } from 'lucide-react';
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
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-slate-50">
                        {/* Ensure we parse as a float to catch 0 or null correctly */}
                        {m.avg_rating && parseFloat(m.avg_rating) > 0 
                          ? parseFloat(m.avg_rating).toFixed(1) 
                          : "New"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium ml-1">
                        ({m.total_matches_completed || 0} swaps)
                      </span>
                    </div>
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
