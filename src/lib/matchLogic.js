import { supabase } from './supabase';

export const sendMatchRequest = async (requesterId, receiverId) => {
  // 1. Check if a request already exists to prevent duplicates
  const { data: existing } = await supabase
    .from('skill_matches')
    .select('*')
    .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`)
    .single();

  if (existing) {
    return { error: "Match already pending or exists!" };
  }

  // 2. Create the match request
  const { data, error } = await supabase
    .from('skill_matches')
    .insert([
      { requester_id: requesterId, receiver_id: receiverId, status: 'pending' }
    ]);

  return { data, error };
};