import { supabase } from './supabase';

const SESSION_KEY = 'analytics_session_id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export type AnalyticsEvent =
  | 'page_view'
  | 'ticket_add'
  | 'ticket_remove'
  | 'checkout_open'
  | 'pix_generated'
  | 'pix_copied'
  | 'payment_success'
  | 'payment_error';

export async function track(event: AnalyticsEvent, data: Record<string, unknown> = {}) {
  try {
    await supabase.from('analytics_events').insert({
      event,
      data,
      session_id: getSessionId(),
    });
  } catch {
    // never block the UI on analytics failures
  }
}
