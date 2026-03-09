import {
  createContext,
  useCallback,
  useContext,
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

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(uid);
        setConversationId(convId);
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
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

        const responseText =
          data?.response ?? "Sorry, I couldn't generate a response.";

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: responseText,
          },
        ]);
      } catch (err) {
        console.error("[Chat] Send error:", err);
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
    [uid, conversationId, isTyping],
  );

  const clearMessages = useCallback(() => {
    setConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setIsTyping(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{ messages, isTyping, sendMessage, clearMessages }}
    >
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
