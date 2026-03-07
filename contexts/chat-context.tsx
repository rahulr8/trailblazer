import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "./auth-context";
import { createConversation } from "@/lib/db/conversations";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatContextValue {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (text: string) => void;
  clearMessages: () => void;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm Parker, your BC Parks trail guide. Ask me about trails, wildlife, weather conditions, or anything else about your outdoor adventures!",
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to realtime messages when we have a conversation
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: number;
            role: string;
            content: string;
          };
          if (row.role === "assistant") {
            setMessages((prev) => {
              // Deduplicate by checking if this message ID already exists
              if (prev.some((m) => m.id === row.id.toString())) return prev;
              return [
                ...prev,
                {
                  id: row.id.toString(),
                  role: "assistant",
                  content: row.content,
                },
              ];
            });
            setIsTyping(false);
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Create conversation on first message
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(uid);
        setConversationId(convId);
      }

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const { data, error } = await supabase.functions.invoke("chat", {
          body: {
            conversation_id: convId,
            message: trimmed,
          },
        });

        if (error) throw error;

        // Fallback: if realtime hasn't delivered the message yet, add it
        if (data?.response) {
          setMessages((prev) => {
            const hasResponse = prev.some(
              (m) => m.role === "assistant" && m.content === data.response,
            );
            if (hasResponse) return prev;
            return [
              ...prev,
              {
                id: `fallback-${Date.now()}`,
                role: "assistant" as const,
                content: data.response,
              },
            ];
          });
        }
      } catch (error) {
        console.error("[Chat] Send error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Sorry, I had trouble responding. Please try again.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [uid, conversationId],
  );

  const clearMessages = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setIsTyping(false);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isTyping, sendMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
