import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

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

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm Parker, your BC Parks trail guide. Ask me about trails, wildlife, weather conditions, or anything else about your outdoor adventures!",
  },
];

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Clear any pending simulated response
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    // Simulate AI response
    typingTimeout.current = setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "That's a great question! I'm still being connected to my knowledge base, but soon I'll be able to help you with trail recommendations, weather updates, and more.",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      typingTimeout.current = null;
    }, 1500);
  }, []);

  const clearMessages = useCallback(() => {
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    setMessages(INITIAL_MESSAGES);
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
