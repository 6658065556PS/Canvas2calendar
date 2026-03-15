import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://cnxylelamwuimmkzmhov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNueHlsZWxhbXd1aW1ta3ptaG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDUxMjgsImV4cCI6MjA4OTAyMTEyOH0.r0Ro2uuDa9oPvloOwuUWJF_w_oz3qOUmT1HwGzRN-Yw',
  {
    auth: {
      flowType: 'implicit',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)
