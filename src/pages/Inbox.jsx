import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Mail } from 'lucide-react';

export default function Inbox({ session }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // Queries requests where the current user is the RECEIVER
    const { data } = await supabase
      .from('Skill_matches')
      .select('*, requester:Skill_profiles!requester_id(*)')
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending');
    setRequests(data || []);
  };

  const handleAction = async (matchId, newStatus) => {
    await supabase
      .from('Skill_matches')
      .update({ status: newStatus })
      .eq('id', matchId);
    
    fetchRequests(); // Refresh
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <h2 className="text-3xl font-black text-white mb-10 flex items-center gap-3">
        <Mail className="text-cyan-400" /> Incoming Requests
      </h2>
      
      <div className="space-y-4">
        {requests.length === 0 && <p className="text-slate-500 italic">No pending requests yet...</p>}
        {requests.map(req => (
          <div key={req.id} className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={req.requester.avatar_url} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h4 className="font-bold text-white">{req.requester.full_name}</h4>
                <p className="text-xs text-slate-500 uppercase">Wants to learn from you</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAction(req.id, 'accepted')} className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500 hover:text-black transition-all">
                <Check size={20} />
              </button>
              <button onClick={() => handleAction(req.id, 'rejected')} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}