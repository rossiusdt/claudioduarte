/*
  # Create analytics_events table

  1. New Tables
    - `analytics_events`
      - `id` (uuid, primary key)
      - `event` (text) - event name: page_view, ticket_add, ticket_remove, checkout_open, pix_generated, pix_copied, payment_success, payment_error
      - `data` (jsonb) - extra data (ticket name, amount, error message, etc.)
      - `session_id` (text) - anonymous session identifier
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Allow anonymous inserts (public tracking)
    - Restrict reads to authenticated users only (for the dashboard)
*/

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  session_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (true);
