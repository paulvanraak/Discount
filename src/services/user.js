import { supabase } from './supabase'

const STORAGE_KEY = 'bc_user_id'

export function getOrCreateAnonId() {
  let anonId = localStorage.getItem(STORAGE_KEY)
  if (!anonId) {
    anonId = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, anonId)
  }
  return anonId
}

export async function getOrCreateUser() {
  const anonId = getOrCreateAnonId()

  // Kijk of user bestaat
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('anon_id', anonId)
    .single()

  // Anders aanmaken (upsert om duplicate key bij race-condition te voorkomen)
  if (!user) {
    const { data, error } = await supabase
      .from('users')
      .upsert({ anon_id: anonId }, { onConflict: 'anon_id' })
      .select()
      .single()
    if (error) throw error
    user = data
  }

  return user
}

export async function updateUserEmail(userId, email, opts = {}) {
  const { data, error } = await supabase
    .from('users')
    .update({
      email,
      reminder_opt_in: opts.reminder ?? true,
      marketing_opt_in: opts.marketing ?? false,
    })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getLatestCheck(userId) {
  const { data } = await supabase
    .from('checks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}
