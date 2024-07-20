import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import type { Database, Tables } from "types/Supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

interface WebhookPayload {
  type: "INSERT";
  table: "messages";
  record: Tables<"messages">;
  schema: "public";
  old_record: null | Tables<"messages">;
}

const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
) as SupabaseClient<Database>;

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const query = supabase.from("pushTokens").select("expoPushToken");

  if (payload.record.receiverId) {
    query.eq("userId", payload.record.receiverId);
  } else {
    query.eq("teamId", payload.record.teamId).neq("userId", payload.record.senderId);
  }

  const { data } = await query;

  if (!data) {
    return new Response("No data found", { status: 404 });
  }
  const textBody = payload.record.text;
  const mediaBody =
    payload.record.mediaUrl && payload.record.mediaType
      ? payload.record.mediaType === "image"
        ? `📷 Image`
        : `🎙️ Audio`
      : null;

  const body = [mediaBody, textBody].filter(Boolean).join("\n");

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
    },
    body: JSON.stringify({
      to: data.map((t) => t.expoPushToken),
      sound: "default",
      title: payload.record.senderName,
      body,
      data: { type: "message", message: payload.record },
    }),
  }).then((res) => res.json());

  return new Response(JSON.stringify(res), {
    headers: { "Content-Type": "application/json" },
  });
});
