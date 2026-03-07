import { supabase } from "@/lib/supabase";
import type { Conversation, Message, LogMessageInput } from "./types";

export async function logChatMessage(input: LogMessageInput): Promise<number> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
    })
    .select("id")
    .single();

  if (error) throw error;

  // Update conversation last_message_at and increment count
  const conversation = await supabase
    .from("conversations")
    .select("message_count")
    .eq("id", input.conversationId)
    .single();

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      message_count: (conversation.data?.message_count ?? 0) + 1,
    })
    .eq("id", input.conversationId);

  return data.id;
}

export async function createConversation(userId: string | null): Promise<string> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function getConversations(
  uid: string,
  limitCount?: number,
): Promise<Conversation[]> {
  let query = supabase
    .from("conversations")
    .select()
    .eq("user_id", uid)
    .order("last_message_at", { ascending: false });

  if (limitCount) {
    query = query.limit(limitCount);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    startedAt: new Date(row.started_at),
    lastMessageAt: new Date(row.last_message_at),
    messageCount: row.message_count,
  }));
}

export async function getConversationMessages(
  conversationId: string,
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select()
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    role: row.role as "user" | "assistant",
    content: row.content,
    createdAt: new Date(row.created_at),
  }));
}
