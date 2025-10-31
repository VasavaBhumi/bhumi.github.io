/*
  # JARVIS AI Assistant Database Schema

  This migration creates the database structure for a personal AI assistant that can:
  - Learn and store knowledge from topics provided by the user
  - Maintain conversation history
  - Store user commands and preferences
  - Track learning progress and knowledge areas

  ## New Tables

  ### `knowledge_base`
  Stores learned information organized by topics
  - `id` (uuid, primary key) - Unique identifier
  - `topic` (text) - Main topic or category
  - `content` (text) - The learned information
  - `source` (text) - Where the information came from
  - `keywords` (text[]) - Searchable keywords
  - `created_at` (timestamptz) - When the knowledge was added
  - `updated_at` (timestamptz) - Last update timestamp

  ### `conversations`
  Maintains conversation history with the AI
  - `id` (uuid, primary key) - Unique identifier
  - `user_message` (text) - What the user said
  - `ai_response` (text) - What JARVIS responded
  - `intent` (text) - Detected intent (learn, query, command, chat)
  - `context` (jsonb) - Additional context data
  - `created_at` (timestamptz) - Conversation timestamp

  ### `user_preferences`
  Stores user preferences and settings
  - `id` (uuid, primary key) - Unique identifier
  - `preference_key` (text) - Setting name
  - `preference_value` (jsonb) - Setting value
  - `created_at` (timestamptz) - Created timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `learning_queue`
  Queue for topics that need to be learned
  - `id` (uuid, primary key) - Unique identifier
  - `topic` (text) - Topic to learn about
  - `status` (text) - Status: pending, processing, completed
  - `priority` (integer) - Learning priority
  - `created_at` (timestamptz) - Added timestamp
  - `processed_at` (timestamptz) - When processing completed

  ## Security
  - Enable RLS on all tables
  - Since this is a personal assistant, all policies allow full access to authenticated users
  - Unauthenticated users have no access
*/

-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  content text NOT NULL,
  source text DEFAULT '',
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message text NOT NULL,
  ai_response text NOT NULL,
  intent text DEFAULT 'chat',
  context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_key text UNIQUE NOT NULL,
  preference_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning_queue table
CREATE TABLE IF NOT EXISTS learning_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  status text DEFAULT 'pending',
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_knowledge_topic ON knowledge_base(topic);
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON knowledge_base USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_queue_status ON learning_queue(status, priority DESC);

-- Enable Row Level Security
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_base
CREATE POLICY "Authenticated users can view all knowledge"
  ON knowledge_base FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert knowledge"
  ON knowledge_base FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update knowledge"
  ON knowledge_base FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete knowledge"
  ON knowledge_base FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for conversations
CREATE POLICY "Authenticated users can view all conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for user_preferences
CREATE POLICY "Authenticated users can view preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for learning_queue
CREATE POLICY "Authenticated users can view learning queue"
  ON learning_queue FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert to learning queue"
  ON learning_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update learning queue"
  ON learning_queue FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete from learning queue"
  ON learning_queue FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
