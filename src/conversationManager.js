import { supabase } from './supabase.js';

export class ConversationManager {
  async saveConversation(userMessage, aiResponse, intent = 'chat', context = {}) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_message: userMessage,
            ai_response: aiResponse,
            intent,
            context
          }
        ])
        .select()
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving conversation:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecentConversations(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting conversations:', error);
      return { success: false, error: error.message };
    }
  }

  async clearConversations() {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error clearing conversations:', error);
      return { success: false, error: error.message };
    }
  }
}
