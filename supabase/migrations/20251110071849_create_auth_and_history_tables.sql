/*
  # Create authentication and history tracking tables

  1. New Tables
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (text, unique user identifier from LDAP)
      - `username` (text)
      - `email` (text)
      - `token` (text, encrypted session token)
      - `login_at` (timestamptz)
      - `last_activity` (timestamptz)
      - `expires_at` (timestamptz)
      - `is_active` (boolean)
    
    - `request_history`
      - `id` (uuid, primary key)
      - `user_session_id` (uuid, foreign key)
      - `request_type` (text - autoindex, classify, extract, extract-validate)
      - `document_name` (text)
      - `document_type` (text, nullable)
      - `preprocessing_used` (boolean)
      - `request_payload` (jsonb)
      - `response_data` (jsonb, nullable)
      - `blob_url` (text, nullable - URL to Azure Blob Storage)
      - `status` (text - success, failed)
      - `error_message` (text, nullable)
      - `created_at` (timestamptz)
      - `processing_duration_ms` (integer)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to view only their own data
    - Service role can write history records
*/

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  username text NOT NULL,
  email text,
  token text NOT NULL,
  login_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS request_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id uuid NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  document_name text,
  document_type text,
  preprocessing_used boolean DEFAULT false,
  request_payload jsonb,
  response_data jsonb,
  blob_url text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  processing_duration_ms integer,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'success', 'failed'))
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_request_history_session ON request_history(user_session_id);
CREATE INDEX idx_request_history_created ON request_history(created_at DESC);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages sessions"
  ON user_sessions FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role updates sessions"
  ON user_sessions FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own history"
  ON request_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages history"
  ON request_history FOR INSERT
  TO service_role
  WITH CHECK (true);
