/*
  # Smart Todo List Database Schema

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text)
      - `status` (text, enum: pending, in_progress, completed)
      - `priority` (integer, 1-5 scale)
      - `category` (text)
      - `deadline` (timestamptz)
      - `estimated_duration` (integer, minutes)
      - `complexity_score` (integer, 1-10 scale)
      - `ai_enhanced_description` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `completed_at` (timestamptz)

    - `context_entries`
      - `id` (uuid, primary key)
      - `content` (text, required)
      - `type` (text, enum: email, message, note, document)
      - `source` (text)
      - `metadata` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `color` (text)
      - `description` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

    - `ai_suggestions`
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `suggestion_type` (text, enum: priority, deadline, category, description)
      - `original_value` (text)
      - `suggested_value` (text)
      - `confidence_score` (decimal)
      - `reasoning` (text)
      - `applied` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
</sql>

-- Create custom types
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE context_type AS ENUM ('email', 'message', 'note', 'document');
CREATE TYPE suggestion_type AS ENUM ('priority', 'deadline', 'category', 'description');

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status task_status DEFAULT 'pending',
  priority integer DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  category text,
  deadline timestamptz,
  estimated_duration integer, -- in minutes
  complexity_score integer CHECK (complexity_score >= 1 AND complexity_score <= 10),
  ai_enhanced_description text,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Context entries table
CREATE TABLE IF NOT EXISTS context_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  type context_type NOT NULL,
  source text,
  metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  description text,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, user_id)
);

-- AI suggestions table
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  suggestion_type suggestion_type NOT NULL,
  original_value text,
  suggested_value text NOT NULL,
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reasoning text,
  applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Context entries policies
CREATE POLICY "Users can manage their own context entries"
  ON context_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can manage their own categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI suggestions policies
CREATE POLICY "Users can view suggestions for their tasks"
  ON ai_suggestions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = ai_suggestions.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "System can create AI suggestions"
  ON ai_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = ai_suggestions.task_id 
    AND tasks.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_deadline_idx ON tasks(deadline);
CREATE INDEX IF NOT EXISTS context_entries_user_id_idx ON context_entries(user_id);
CREATE INDEX IF NOT EXISTS context_entries_type_idx ON context_entries(type);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS ai_suggestions_task_id_idx ON ai_suggestions(task_id);

-- Insert default categories
INSERT INTO categories (name, color, description, user_id)
SELECT 
  category.name,
  category.color,
  category.description,
  auth.uid()
FROM (
  VALUES 
    ('Work', '#3B82F6', 'Professional tasks and projects'),
    ('Personal', '#10B981', 'Personal activities and goals'),
    ('Health', '#EF4444', 'Health and wellness related tasks'),
    ('Learning', '#8B5CF6', 'Education and skill development'),
    ('Finance', '#F59E0B', 'Financial planning and management'),
    ('Home', '#6B7280', 'Household and maintenance tasks')
) AS category(name, color, description)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (name, user_id) DO NOTHING;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();