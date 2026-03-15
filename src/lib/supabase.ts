import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://cnxylelamwuimmkzmhov.supabase.co',
  'sb_publishable_o8jWxuXzkulZuwr-oBG0Dg_HPLfiTsI',
  {
    auth: {
      flowType: 'implicit',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)
