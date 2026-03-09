import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  GoogleGenAI,
  HarmCategory,
  HarmBlockThreshold,
} from "https://esm.sh/@google/genai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PARKER_SYSTEM_INSTRUCTION = `You are Parker, the official bear mascot for BC Parks Trailblazer+.
You are a specialized Guide, NOT a general AI assistant.

YOUR KNOWLEDGE BASE:
You have access to a specific database of BC Parks, trails, and campsites via the 'File Search' tool.
ALWAYS check this tool first when asked about specific locations.

YOUR DIRECTIVES:
1. **STRICTLY ON-TOPIC ONLY:** You ONLY answer questions about:
   - British Columbia hiking trails, parks, and campsites.
   - Outdoor safety (bears, weather, gear).
   - Flora and fauna of BC.
   - Fitness related to hiking.
   - The user's activity stats, streak, and progress in the Trailblazer+ app.

2. **REFUSAL PROTOCOL:** If a user asks about math, coding, politics, creative writing, or general life advice unrelated to the outdoors, you must politely refuse.
   - CORRECT RESPONSE: "I'm just a bear who loves hiking! I can't help with coding, but I can recommend a great trail near Squamish?"

3. **FACTUAL GROUNDING:** When suggesting a hike, you MUST verify it exists in your provided context files if possible.
   - Include specific details from the data: Difficulty, Length (km), Dog rules, and Safety notes.
   - If the user asks for a map, look for the 'MAP LINK' or 'GPX' field in your data and provide it.

4. **PERSONALIZATION:** You have access to the user's Trailblazer+ profile and recent activities.
   - Reference their stats naturally when relevant (e.g., "With your 7-day streak, you're on fire!").
   - Suggest trails appropriate to their fitness level based on recent activity distances.
   - Don't dump all their stats unprompted — weave them in when relevant.

5. **TONE:**
   - Warm, encouraging, and "bear-like" (use occasional puns).
   - Concise. Do not start every message with "Hello". Jump straight to the answer.

CONTEXTUAL DATA:
Use the provided File Search context as your primary source of truth. If the information isn't in the files, you may use general knowledge about BC outdoors, but state that you are speaking generally.`;

function buildUserContext(
  profile: Record<string, unknown> | null,
  activities: Record<string, unknown>[],
): string {
  if (!profile) return "";

  const lines = ["\n\nUSER CONTEXT:"];
  lines.push(`Name: ${profile.display_name || "Unknown"}`);
  lines.push(`Membership: ${profile.membership_tier || "free"}`);
  lines.push(`Total Distance: ${profile.total_km ?? 0} km`);
  lines.push(`Total Time: ${profile.total_minutes ?? 0} minutes`);
  lines.push(`Current Streak: ${profile.current_streak ?? 0} days`);

  if (activities.length > 0) {
    lines.push("\nRecent Activities:");
    for (const a of activities) {
      const date = new Date(a.date as string).toLocaleDateString("en-CA");
      lines.push(
        `- ${date}: ${a.type} — ${a.distance ?? 0} km, ${Math.round(((a.duration as number) ?? 0) / 60)} min${a.location ? `, at ${a.location}` : ""}`,
      );
    }
  }

  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { conversation_id, message } = await req.json();
    const authHeader = req.headers.get("Authorization")!;

    // User-scoped client (respects RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    // Service-role client (bypasses RLS for reading profile/activities)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
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
        JSON.stringify({
          error: "Failed to store message: " + insertError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Fetch conversation history, user profile, and recent activities in parallel
    const [historyResult, profileResult, activitiesResult] = await Promise.all([
      supabase
        .from("messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: true })
        .limit(20),
      supabaseAdmin
        .from("profiles")
        .select(
          "display_name, membership_tier, total_km, total_minutes, current_streak",
        )
        .eq("id", user.id)
        .single(),
      supabaseAdmin
        .from("activities")
        .select("type, distance, duration, date, location")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(5),
    ]);

    if (historyResult.error) {
      return new Response(
        JSON.stringify({
          error: "Failed to load history: " + historyResult.error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Build system prompt with user context
    const userContext = buildUserContext(
      profileResult.data,
      activitiesResult.data ?? [],
    );
    const systemPrompt = PARKER_SYSTEM_INSTRUCTION + userContext;

    // Convert history to Gemini format (Gemini uses "model" instead of "assistant")
    const contents = (historyResult.data ?? []).map(
      (m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }),
    );

    // Call Gemini
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const storeId = Deno.env.get("BC_PARKS_STORE_ID");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 1000,
        temperature: 0.3,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        tools: storeId
          ? [{ fileSearch: { fileSearchStoreNames: [storeId] } }]
          : [],
      },
    });

    const assistantMessage =
      response.text ?? "Sorry, I couldn't generate a response.";

    // Store assistant message
    const { error: assistantInsertError } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        role: "assistant",
        content: assistantMessage,
      });
    if (assistantInsertError) {
      console.error(
        "Failed to store assistant message:",
        assistantInsertError.message,
      );
    }

    // Increment message count (single call — fixes previous double-call bug)
    const { error: countError } = await supabase.rpc(
      "increment_message_count",
      { p_conversation_id: conversation_id },
    );
    if (countError) {
      console.error("Failed to update conversation:", countError.message);
    }

    return new Response(JSON.stringify({ response: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
