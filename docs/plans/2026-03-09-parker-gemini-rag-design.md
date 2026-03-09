# Parker Chat: Gemini + RAG + User Context

## Summary

Replace Anthropic Claude in the chat edge function with Google Gemini + file search RAG (reusing the BC Parks store from the POC). Inject user context (profile stats, recent activities) into the system prompt for personalized responses.

## Architecture

```
App (chat.tsx) → ChatContext → Supabase Edge Function (chat)
                                  ├── Auth + fetch user context (profile, recent activities)
                                  ├── Gemini API (gemini-2.5-flash + fileSearch RAG)
                                  └── Store messages in Supabase DB
```

## Edge Function Changes

- Replace Anthropic API with Gemini (`@google/genai` SDK via esm.sh)
- Port POC's system prompt (scoped to BC outdoors, refusal protocol, factual grounding)
- Add user context: fetch profile stats + last 5 activities, inject into system prompt
- Enable fileSearch tool with `BC_PARKS_STORE_ID`
- Fix double `increment_message_count` bug
- Env vars: `GEMINI_API_KEY`, `BC_PARKS_STORE_ID` (replacing `AI_API_KEY`)

## User Context Injection

Fetched from Supabase before calling Gemini:
- `profiles`: displayName, totalKm, totalMinutes, currentStreak, membershipTier
- `activities`: last 5 activities (type, distance, duration, date, location)

Appended to system prompt as a `USER CONTEXT` section.

## What Stays The Same

- Chat UI (`app/chat.tsx`)
- ChatContext + Realtime subscription
- Conversation/message DB schema
- ParkerFAB navigation
- No streaming, no markdown rendering (follow-up tasks)

## Setup

```bash
supabase secrets set GEMINI_API_KEY=<key>
supabase secrets set BC_PARKS_STORE_ID=<store_id>
supabase functions deploy chat
```
