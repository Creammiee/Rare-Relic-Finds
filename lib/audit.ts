import type { SupabaseClient } from '@supabase/supabase-js'

export async function logAction(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  details: Record<string, unknown> = {},
  ipAddress?: string
) {
  try {
    const { error } = await supabase.from('activity_logs').insert({
      admin_id: adminId,
      action,
      details,
      ip_address: ipAddress || null,
    })

    if (error) {
      console.error('Failed to write audit log:', error)
    }
  } catch (err) {
    console.error('Audit logging error:', err)
  }
}
