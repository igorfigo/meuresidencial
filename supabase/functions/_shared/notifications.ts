
import { supabaseAdmin } from './supabase-admin.ts';

export async function createNotification(
  matricula: string,
  message: string,
  type: 'announcement' | 'document' | 'garage_listing'
) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        matricula,
        message,
        type
      });
    
    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
}
