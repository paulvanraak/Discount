import { supabase } from './supabase'

export async function saveCheck({ userId, answers, results, totalSavings, score }) {
  const shareId = generateShareId()
  const { data, error } = await supabase
    .from('checks')
    .insert({
      user_id: userId,
      answers,
      results,
      total_savings: totalSavings,
      score,
      share_id: shareId,
    })
    .select()
    .single()
  if (error) throw error

  await supabase
    .from('users')
    .update({ last_check_at: new Date().toISOString() })
    .eq('id', userId)

  return data
}

export async function getCheckById(id) {
  const { data } = await supabase
    .from('checks')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function getCheckByShareId(shareId) {
  const { data } = await supabase
    .from('checks')
    .select('*')
    .eq('share_id', shareId)
    .single()
  return data
}

function generateShareId() {
  return Math.random().toString(36).substring(2, 10)
}
