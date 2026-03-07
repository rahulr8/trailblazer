# Firebase → Supabase Migration Plan

## Overview

Complete migration from Firebase to the full Supabase ecosystem for the Trailblazer React Native app. Clean break — no data migration needed.

**Approach:** Layer-by-layer migration. Each layer is a self-contained PR.

**Supabase services replacing Firebase:**

| Firebase Service | Supabase Replacement |
|-----------------|---------------------|
| Firebase Auth (email/password) | Supabase Auth (email/password + Apple Sign In) |
| Firestore | Postgres with RLS |
| Cloud Functions (empty scaffold) | Edge Functions (Deno) |
| — | Supabase Realtime (new: live chat) |

---

## Best Practices Applied

All schema, query, and security decisions follow the [Supabase Postgres Best Practices](./../.agents/skills/supabase-postgres-best-practices/) skill (30 rules across 8 categories). Key rules applied:

| Rule | How Applied |
|------|------------|
| `schema-primary-keys` | `bigint generated always as identity` for all tables; `uuid` only for `profiles.id` (must match `auth.users.id`) |
| `schema-data-types` | `text` not `varchar(n)`, `timestamptz` not `timestamp`, `numeric` for distance/elevation |
| `schema-foreign-key-indexes` | Explicit index on every FK column |
| `schema-lowercase-identifiers` | All snake_case identifiers |
| `schema-constraints` | DO blocks for idempotent constraint creation in migrations |
| `security-rls-basics` | RLS enabled + forced on every user-data table |
| `security-rls-performance` | All policies use `(select auth.uid())` (cached, not per-row) |
| `query-composite-indexes` | Equality columns first, range last: `(user_id, date desc)`, `(user_id, source)` |
| `query-partial-indexes` | Dedup index: `WHERE external_id IS NOT NULL` |
| `data-upsert` | Health sync uses `INSERT ... ON CONFLICT DO NOTHING` for deduplication |
| `data-batch-inserts` | Health sync batches workout inserts |
| `data-pagination` | Cursor-based pagination for activity lists (not OFFSET) |
| `conn-pooling` | Client uses Supabase PgBouncer (transaction mode) |

---

## Phase 1: Supabase Infrastructure

### Goal
Set up local dev environment, Supabase CLI, project config, and type generation.

### Tasks

1. **Install Supabase CLI**
   ```bash
   brew install supabase/tap/supabase
   supabase init
   ```

2. **Configure local development**
   - `supabase/config.toml` with project settings
   - `supabase start` for local Postgres + Auth + Realtime + Edge Functions
   - Add to `.gitignore`: `supabase/.temp/`

3. **Create `lib/supabase.ts`** — Single client instance
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   import { MMKV } from 'react-native-mmkv'
   import type { Database } from '@/types/supabase'

   const mmkv = new MMKV({ id: 'supabase-storage' })

   const mmkvStorageAdapter = {
     getItem: (key: string) => mmkv.getString(key) ?? null,
     setItem: (key: string, value: string) => mmkv.set(key, value),
     removeItem: (key: string) => mmkv.delete(key),
   }

   export const supabase = createClient<Database>(
     process.env.EXPO_PUBLIC_SUPABASE_URL!,
     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
     {
       auth: {
         storage: mmkvStorageAdapter,
         autoRefreshToken: true,
         persistSession: true,
         detectSessionInUrl: false,
       },
     }
   )
   ```

4. **Environment variables**
   ```
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321  # local
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
   ```

5. **Type generation script** in `package.json`
   ```json
   "scripts": {
     "db:types": "supabase gen types typescript --local > types/supabase.ts"
   }
   ```

### Files Changed
- New: `supabase/config.toml`
- New: `lib/supabase.ts`
- New: `types/supabase.ts` (generated)
- Modified: `.env`, `.gitignore`, `package.json`

---

## Phase 2: Database Schema & Migrations

### Goal
Create all Postgres tables, indexes, RLS policies, and database functions.

### Migration: `create_schema`

```sql
-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (replaces Firestore users/{uid})
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  photo_url text,
  membership_tier text not null default 'free'
    check (membership_tier in ('free', 'platinum')),
  total_km numeric(10,2) not null default 0,
  total_minutes integer not null default 0,
  total_steps integer not null default 0,
  current_streak integer not null default 0,
  last_activity_date timestamptz,
  upgraded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Health connections (extracted from nested Firestore field)
create table public.health_connections (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_authorized boolean not null default false,
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  unique(user_id)
);

-- Activities (replaces Firestore users/{uid}/activities)
create table public.activities (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null check (source in ('manual', 'apple_health')),
  external_id text,
  type text not null,
  duration integer not null,       -- seconds
  distance numeric(10,3) not null default 0,  -- km
  location text,
  date timestamptz not null,
  elapsed_time integer,
  elevation_gain numeric(8,2),
  name text,
  sport_type text,
  created_at timestamptz not null default now(),
  unique(user_id, source, external_id)  -- deduplication constraint
);

-- Saved adventures (replaces Firestore users/{uid}/savedAdventures)
create table public.saved_adventures (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  adventure_id text not null,
  adventure_data jsonb not null,
  saved_at timestamptz not null default now(),
  unique(user_id, adventure_id)
);

-- Conversations (replaces Firestore conversations/{sessionId})
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  message_count integer not null default 0
);

-- Messages (replaces Firestore conversations/{sessionId}/messages)
create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES (per schema-foreign-key-indexes, query-composite-indexes, query-partial-indexes)
-- ============================================================

-- FK indexes (Postgres does NOT auto-index FKs)
create index health_connections_user_id_idx on health_connections (user_id);
create index activities_user_id_idx on activities (user_id);
create index saved_adventures_user_id_idx on saved_adventures (user_id);
create index conversations_user_id_idx on conversations (user_id);
create index messages_conversation_id_idx on messages (conversation_id);

-- Composite indexes for common query patterns
create index activities_user_date_idx on activities (user_id, date desc);
create index activities_user_source_idx on activities (user_id, source);
create index messages_conversation_time_idx on messages (conversation_id, created_at);

-- Partial index for Apple Health deduplication
create index activities_dedup_idx on activities (user_id, external_id)
  where external_id is not null;

-- ============================================================
-- ROW LEVEL SECURITY (per security-rls-basics, security-rls-performance)
-- All policies use (select auth.uid()) for cached evaluation
-- ============================================================

-- Profiles
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy profiles_select on profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update on profiles
  for update to authenticated
  using ((select auth.uid()) = id);

-- Health connections
alter table public.health_connections enable row level security;
alter table public.health_connections force row level security;

create policy health_connections_all on health_connections
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Activities
alter table public.activities enable row level security;
alter table public.activities force row level security;

create policy activities_select on activities
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy activities_insert on activities
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy activities_update on activities
  for update to authenticated
  using ((select auth.uid()) = user_id);

create policy activities_delete on activities
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Saved adventures
alter table public.saved_adventures enable row level security;
alter table public.saved_adventures force row level security;

create policy saved_adventures_all on saved_adventures
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Conversations
alter table public.conversations enable row level security;
alter table public.conversations force row level security;

create policy conversations_own on conversations
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy conversations_anon_insert on conversations
  for insert to anon
  with check (user_id is null);

-- Messages
alter table public.messages enable row level security;
alter table public.messages force row level security;

create policy messages_own on messages
  for all to authenticated
  using (
    conversation_id in (
      select id from conversations where user_id = (select auth.uid())
    )
  );

create policy messages_anon_read on messages
  for select to anon
  using (
    conversation_id in (
      select id from conversations where user_id is null
    )
  );

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic stats increment (replaces Firestore increment())
create or replace function public.increment_user_stats(
  p_user_id uuid,
  p_km_delta numeric default 0,
  p_minutes_delta integer default 0,
  p_steps_delta integer default 0
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set
    total_km = total_km + p_km_delta,
    total_minutes = total_minutes + p_minutes_delta,
    total_steps = total_steps + p_steps_delta,
    updated_at = now()
  where id = p_user_id;
$$;

-- Recalculate stats from activities (replaces client-side recalculation)
create or replace function public.recalculate_user_stats(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total_km numeric;
  v_total_minutes integer;
begin
  select
    coalesce(sum(distance), 0),
    coalesce(sum(duration) / 60, 0)
  into v_total_km, v_total_minutes
  from public.activities
  where user_id = p_user_id;

  update public.profiles
  set
    total_km = v_total_km,
    total_minutes = v_total_minutes,
    updated_at = now()
  where id = p_user_id;
end;
$$;

-- Update streak logic (replaces client-side streak calculation)
create or replace function public.update_streak(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_last_date date;
  v_today date := current_date;
begin
  select last_activity_date::date into v_last_date
  from public.profiles where id = p_user_id;

  if v_last_date = v_today then
    -- Already logged today, no change
    return;
  elsif v_last_date = v_today - 1 then
    -- Consecutive day, increment streak
    update public.profiles
    set current_streak = current_streak + 1,
        last_activity_date = now(),
        updated_at = now()
    where id = p_user_id;
  else
    -- Streak broken, reset to 1
    update public.profiles
    set current_streak = 1,
        last_activity_date = now(),
        updated_at = now()
    where id = p_user_id;
  end if;
end;
$$;

-- Updated_at trigger for all tables
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
```

### Files Changed
- New: `supabase/migrations/00001_create_schema.sql`

---

## Phase 3: Auth Migration

### Goal
Replace Firebase Auth with Supabase Auth. Support email/password + Apple Sign In.

### Tasks

1. **Rewrite `contexts/AuthContext.tsx`**
   ```typescript
   // Replace Firebase onAuthStateChanged with Supabase
   const { data: { subscription } } = supabase.auth.onAuthStateChange(
     (event, session) => {
       setUser(session?.user ?? null)
       setIsLoading(false)
     }
   )
   ```

2. **Rewrite `components/auth/LoginScreen.tsx`**
   - Sign up: `supabase.auth.signUp({ email, password })`
   - Sign in: `supabase.auth.signInWithPassword({ email, password })`
   - Profile auto-created via database trigger (no client-side `createUser()`)

3. **Implement Apple Sign In**
   ```typescript
   import * as AppleAuthentication from 'expo-apple-authentication'

   const credential = await AppleAuthentication.signInAsync({
     requestedScopes: [
       AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
       AppleAuthentication.AppleAuthenticationScope.EMAIL,
     ],
   })

   const { data, error } = await supabase.auth.signInWithIdToken({
     provider: 'apple',
     token: credential.identityToken!,
   })

   // Capture full name (Apple only provides on first auth)
   if (credential.fullName) {
     await supabase.auth.updateUser({
       data: {
         display_name: `${credential.fullName.givenName} ${credential.fullName.familyName}`,
       },
     })
   }
   ```

4. **Update sign-out flow**
   ```typescript
   await supabase.auth.signOut()
   // Clear AsyncStorage flags as before
   router.replace('/login')
   ```

5. **Enable Apple provider in Supabase Dashboard**
   - Configure Apple Developer credentials in Supabase Auth settings

### Files Changed
- Rewrite: `contexts/AuthContext.tsx`
- Rewrite: `components/auth/LoginScreen.tsx`
- Delete: `lib/firebase.ts`
- Modified: `app/_layout.tsx` (import supabase instead of firebase auth)

---

## Phase 4: Database Operations Rewrite

### Goal
Replace all Firestore operations in `lib/db/` with Supabase client queries.

### Operation Mapping

#### `lib/db/users.ts` → `lib/db/profiles.ts`

| Firestore | Supabase |
|-----------|----------|
| `createUser(uid, input)` | Handled by database trigger — **delete this function** |
| `getUser(uid)` | `supabase.from('profiles').select().eq('id', uid).single()` |
| `userExists(uid)` | `supabase.from('profiles').select('id').eq('id', uid).maybeSingle()` |
| `getUserStats(uid)` | `supabase.from('profiles').select('total_km, total_minutes, total_steps, current_streak').eq('id', uid).single()` |
| `incrementUserStats(uid, deltas)` | `supabase.rpc('increment_user_stats', { p_user_id: uid, ...deltas })` |
| `updateStreak(uid)` | `supabase.rpc('update_streak', { p_user_id: uid })` |
| `recalculateUserStats(uid)` | `supabase.rpc('recalculate_user_stats', { p_user_id: uid })` |
| `updateMembershipTier(uid, tier)` | `supabase.from('profiles').update({ membership_tier: tier }).eq('id', uid)` |
| `upgradeToPlatinum(uid)` | `supabase.from('profiles').update({ membership_tier: 'platinum', upgraded_at: new Date().toISOString() }).eq('id', uid)` |
| `resetUserChallenge(uid)` | `supabase.from('activities').delete().eq('user_id', uid)` + `supabase.from('saved_adventures').delete().eq('user_id', uid)` + stats reset |

#### `lib/db/activities.ts`

| Firestore | Supabase |
|-----------|----------|
| `logActivity(uid, input)` | `supabase.from('activities').insert({ user_id: uid, source: 'manual', ...input })` then `rpc('increment_user_stats')` + `rpc('update_streak')` |
| `getUserActivities(uid, options)` | `supabase.from('activities').select().eq('user_id', uid).order('date', { ascending: false }).limit(n)` |
| `getRecentActivities(uid, limit)` | Same as above with limit |
| `getWeeklyActivityCount(uid)` | `supabase.from('activities').select('*', { count: 'exact', head: true }).eq('user_id', uid).gte('date', startOfWeek)` |
| `deleteActivitiesBySource(uid, source)` | `supabase.from('activities').delete().eq('user_id', uid).eq('source', source)` |

#### `lib/db/savedAdventures.ts`

| Firestore | Supabase |
|-----------|----------|
| `saveAdventure(uid, adventure)` | `supabase.from('saved_adventures').upsert({ user_id: uid, adventure_id: adventure.id, adventure_data: adventure })` |
| `removeSavedAdventure(uid, adventureId)` | `supabase.from('saved_adventures').delete().eq('user_id', uid).eq('adventure_id', adventureId)` |
| `getSavedAdventures(uid)` | `supabase.from('saved_adventures').select().eq('user_id', uid)` |
| `isAdventureSaved(uid, adventureId)` | `supabase.from('saved_adventures').select('id').eq('user_id', uid).eq('adventure_id', adventureId).maybeSingle()` |

#### `lib/db/chatLogs.ts` → `lib/db/conversations.ts`

| Firestore | Supabase |
|-----------|----------|
| `logChatMessage(input)` | `supabase.from('messages').insert({ conversation_id, role, content })` + update conversation `message_count` and `last_message_at` |
| `getConversations(limit)` | `supabase.from('conversations').select().eq('user_id', uid).order('last_message_at', { ascending: false }).limit(n)` |
| `getConversationMessages(sessionId)` | `supabase.from('messages').select().eq('conversation_id', sessionId).order('created_at')` |

### Health Sync Changes

Replace query-then-insert dedup with upsert:

```typescript
// Before (Firestore): query for existing, then insert if not found
const existing = await getDocs(query(activitiesRef, where('externalId', '==', workout.uuid)))
if (existing.empty) { await addDoc(activitiesRef, data) }

// After (Supabase): single atomic upsert per best practices (data-upsert)
const { error } = await supabase
  .from('activities')
  .insert(workouts.map(w => ({
    user_id: uid,
    source: 'apple_health',
    external_id: w.uuid,
    type: mapWorkoutType(w),
    duration: w.duration,
    distance: w.distance,
    date: w.startDate,
    name: w.activityName,
    sport_type: w.activityName,
  })))
  .onConflict('user_id,source,external_id')  // UNIQUE constraint handles dedup
```

This also applies `data-batch-inserts` — all workouts inserted in one batch instead of one at a time.

### Files Changed
- Rewrite: `lib/db/users.ts` → `lib/db/profiles.ts`
- Rewrite: `lib/db/activities.ts`
- Rewrite: `lib/db/savedAdventures.ts`
- Rewrite: `lib/db/chatLogs.ts` → `lib/db/conversations.ts`
- Rewrite: `lib/health/sync.ts` (upsert pattern)
- Rewrite: `hooks/useHealthConnection.ts` (Supabase queries instead of Firestore)

---

## Phase 5: Edge Functions (Chat AI Backend)

### Goal
Create a Supabase Edge Function for AI-powered chat, replacing the empty Cloud Functions scaffold.

### Tasks

1. **Create Edge Function: `supabase/functions/chat/index.ts`**
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   Deno.serve(async (req) => {
     const { conversation_id, message } = await req.json()
     const authHeader = req.headers.get('Authorization')!

     // Create authenticated client
     const supabase = createClient(
       Deno.env.get('SUPABASE_URL')!,
       Deno.env.get('SUPABASE_ANON_KEY')!,
       { global: { headers: { Authorization: authHeader } } }
     )

     // Store user message
     await supabase.from('messages').insert({
       conversation_id,
       role: 'user',
       content: message,
     })

     // Call AI API (Claude or OpenAI)
     const aiResponse = await callAI(message, conversationHistory)

     // Store assistant message
     await supabase.from('messages').insert({
       conversation_id,
       role: 'assistant',
       content: aiResponse,
     })

     // Update conversation metadata
     await supabase.from('conversations').update({
       last_message_at: new Date().toISOString(),
       message_count: /* increment */,
     }).eq('id', conversation_id)

     return new Response(JSON.stringify({ response: aiResponse }))
   })
   ```

2. **Environment variables for Edge Function**
   ```
   AI_API_KEY=<claude-or-openai-key>
   ```

### Files Changed
- New: `supabase/functions/chat/index.ts`
- Delete: `functions/` directory (Firebase Cloud Functions)

---

## Phase 6: Realtime Chat

### Goal
Wire up Supabase Realtime for live chat message delivery.

### Tasks

1. **Enable Realtime on `messages` table**
   ```sql
   -- In Supabase Dashboard or migration
   alter publication supabase_realtime add table messages;
   ```

2. **Rewrite `contexts/ChatContext.tsx`** (or `ChatProvider`)
   ```typescript
   // Subscribe to new messages in active conversation
   const channel = supabase
     .channel(`conversation:${conversationId}`)
     .on(
       'postgres_changes',
       {
         event: 'INSERT',
         schema: 'public',
         table: 'messages',
         filter: `conversation_id=eq.${conversationId}`,
       },
       (payload) => {
         setMessages(prev => [...prev, payload.new as Message])
       }
     )
     .subscribe()

   // Cleanup on unmount
   return () => { supabase.removeChannel(channel) }
   ```

3. **Update chat UI** to use persistent messages from Supabase instead of in-memory state

### Files Changed
- Rewrite: `contexts/ChatContext.tsx` (or equivalent chat provider)
- Modified: Chat UI components to use Realtime subscription
- New migration: `supabase/migrations/00002_enable_realtime.sql`

---

## Phase 7: Firebase Cleanup

### Goal
Remove all Firebase dependencies and configuration.

### Tasks

1. **Remove packages**
   ```bash
   bun remove firebase @react-native-firebase/app @react-native-firebase/auth
   # Remove any other @react-native-firebase/* packages
   ```

2. **Delete files**
   - `lib/firebase.ts`
   - `firebase/` directory (`firestore.rules`, `firestore.indexes.json`)
   - `firebase.json`
   - `functions/` directory
   - `GoogleService-Info.plist` (if present)
   - `google-services.json` (if present)

3. **Remove environment variables**
   - Delete all `EXPO_PUBLIC_FIREBASE_*` vars from `.env`

4. **Update `app/_layout.tsx`**
   - Remove Firebase imports
   - Ensure all providers use Supabase

5. **Run type check**
   ```bash
   bunx tsc --noEmit
   ```

### Files Changed
- Delete: `lib/firebase.ts`, `firebase/`, `firebase.json`, `functions/`
- Modified: `.env` (remove Firebase vars)
- Modified: Any remaining imports of Firebase modules

---

## Implementation Order

```
Phase 1: Infrastructure     ─┐
Phase 2: Schema & Migrations ─┤  Foundation (no user-facing changes)
                               │
Phase 3: Auth Migration      ─┤  Core auth swap
Phase 4: DB Operations       ─┤  Data layer swap
                               │
Phase 5: Edge Functions      ─┤  New backend capability
Phase 6: Realtime Chat       ─┤  New feature
                               │
Phase 7: Firebase Cleanup    ─┘  Remove old code
```

Each phase is a separate PR. Phases 1-2 can be merged without affecting the running app. Phase 3-4 is the critical swap. Phases 5-6 add new capabilities. Phase 7 is cleanup.

---

## Risk Mitigation

- **Auth tokens**: Users will need to re-authenticate after migration (clean break)
- **Data loss**: No existing data to lose (clean break)
- **Rollback**: Keep Firebase deps until Phase 7 confirms everything works
- **Testing**: Each phase tested independently before merge
- **Type safety**: `supabase gen types` ensures TypeScript types match schema exactly
