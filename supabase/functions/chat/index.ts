import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { conversation_id, message } = await req.json();
    const authHeader = req.headers.get("Authorization")!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store user message
    const { error: insertError } = await supabase.from("messages").insert({
      conversation_id,
      role: "user",
      content: message,
    });
    if (insertError) {
      return new Response(
        JSON.stringify({ error: "Failed to store message: " + insertError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get conversation history for context
    const { data: history, error: historyError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true })
      .limit(20);
    if (historyError) {
      return new Response(
        JSON.stringify({ error: "Failed to load history: " + historyError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Call AI API
    const aiApiKey = Deno.env.get("AI_API_KEY");
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": aiApiKey!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system:
          "You are Parker, a friendly BC Parks trail guide AI. Help users discover trails, plan outdoor adventures, and stay motivated on their fitness journey. Be encouraging, knowledgeable about BC parks, and concise.",
        messages: (history ?? []).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const aiData = await aiResponse.json();
    const assistantMessage =
      aiData.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";

    // Store assistant message
    const { error: assistantInsertError } = await supabase.from("messages").insert({
      conversation_id,
      role: "assistant",
      content: assistantMessage,
    });
    if (assistantInsertError) {
      console.error("Failed to store assistant message:", assistantInsertError.message);
    }

    // Update conversation metadata
    const { data: convData, error: convReadError } = await supabase
      .from("conversations")
      .select("message_count")
      .eq("id", conversation_id)
      .single();

    if (!convReadError && convData) {
      const { error: convUpdateError } = await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          message_count: convData.message_count + 2,
        })
        .eq("id", conversation_id);
      if (convUpdateError) {
        console.error("Failed to update conversation:", convUpdateError.message);
      }
    }

    return new Response(JSON.stringify({ response: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
