import { supabase } from './supabase.js';

export class KnowledgeManager {
  async saveKnowledge(topic, content, keywords = []) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert([
          {
            topic,
            content,
            keywords,
            source: 'user_input'
          }
        ])
        .select()
        .maybeSingle();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error saving knowledge:', error);
      return { success: false, error: error.message };
    }
  }

  async getKnowledge(searchTerm = null) {
    try {
      let query = supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`topic.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,keywords.cs.{${searchTerm}}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error getting knowledge:', error);
      return { success: false, error: error.message };
    }
  }

  async searchKnowledge(keywords) {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .or(keywords.map(kw => `keywords.cs.{${kw}}`).join(','))
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error searching knowledge:', error);
      return { success: false, error: error.message };
    }
  }

  async getKnowledgeCount() {
    try {
      const { count, error } = await supabase
        .from('knowledge_base')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting knowledge count:', error);
      return 0;
    }
  }

  async deleteKnowledge(id) {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      return { success: false, error: error.message };
    }
  }

  async exportKnowledge() {
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('topic', { ascending: true });

      if (error) throw error;

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jarvis-knowledge-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error exporting knowledge:', error);
      return { success: false, error: error.message };
    }
  }
}
