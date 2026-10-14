import { wasSendClaimed } from "./newsletterPlan.js";
import { getSupabase } from "./supabaseClient.js";

/**
 * Claims `liturgy_date` before any email is sent.
 * Returns false when the date was already sent, is in progress, or failed
 * after a broadcast id was stored. A failed claim with no broadcast id can
 * be taken again, so a same-day rerun retries that case only.
 */
export async function claimNewsletterSend(liturgyDate: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("claim_newsletter_send", {
    p_date: liturgyDate,
  });
  if (error) throw error;
  return wasSendClaimed(data);
}

export async function recordBroadcastId(
  liturgyDate: string,
  broadcastId: string
): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("newsletter_send")
    .update({ broadcast_id: broadcastId })
    .eq("liturgy_date", liturgyDate)
    .eq("status", "sending")
    .select("liturgy_date");
  if (error) throw error;
  if (!data?.length) {
    throw new Error(
      `Could not store broadcast id for ${liturgyDate}; the send claim is no longer 'sending'.`
    );
  }
}

export async function markNewsletterSent(
  liturgyDate: string,
  broadcastId: string
): Promise<void> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("newsletter_send")
    .update({
      status: "sent",
      broadcast_id: broadcastId,
      sent_at: new Date().toISOString(),
      error: null,
    })
    .eq("liturgy_date", liturgyDate)
    .eq("status", "sending")
    .select("liturgy_date");
  if (error) throw error;
  if (!data?.length) {
    throw new Error(
      `Email for ${liturgyDate} was sent (${broadcastId}) but the claim was no longer 'sending'.`
    );
  }
}

export async function markNewsletterFailed(
  liturgyDate: string,
  failure: unknown
): Promise<void> {
  const message = failure instanceof Error ? failure.message : String(failure);
  const supabase = getSupabase();
  const { error } = await supabase
    .from("newsletter_send")
    .update({
      status: "failed",
      error: message.slice(0, 2000),
    })
    .eq("liturgy_date", liturgyDate)
    .eq("status", "sending");
  if (error) throw error;
}
