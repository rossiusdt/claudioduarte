/*
  # Allow anon to read analytics_events for the dashboard

  The dashboard page uses the anon key (no auth), so we need to allow
  anon reads. The data is non-sensitive (no PII stored).
*/

DROP POLICY IF EXISTS "Authenticated users can read analytics" ON analytics_events;

CREATE POLICY "Anyone can read analytics events"
  ON analytics_events
  FOR SELECT
  TO anon, authenticated
  USING (true);
