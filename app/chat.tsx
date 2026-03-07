import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Stack, router } from "expo-router";

import * as Haptics from "expo-haptics";
import { Bot, Send, User, X } from "lucide-react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BorderRadius, Spacing } from "@/constants";
import { useChat } from "@/contexts/chat-context";
import { useTheme } from "@/contexts/theme-context";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function TypingIndicator({ color }: { color: string }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const duration = 400;
    dot1.value = withRepeat(
      withSequence(withTiming(-6, { duration }), withTiming(0, { duration })),
      -1
    );
    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(withTiming(-6, { duration }), withTiming(0, { duration })),
        -1
      );
    }, 150);
    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(withTiming(-6, { duration }), withTiming(0, { duration })),
        -1
      );
    }, 300);
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const style2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const style3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { backgroundColor: color }, style1]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: color }, style2]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: color }, style3]} />
    </View>
  );
}

export default function ChatScreen() {
  const { colors, shadows } = useTheme();
  const { messages, isTyping, sendMessage } = useChat();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Inverted FlatList needs reversed data
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(inputText);
    setInputText("");
  }, [inputText, sendMessage]);

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const isUser = item.role === "user";
      // In inverted list, index 0 = newest. Previous message is index+1.
      const nextItem = invertedMessages[index + 1];
      const isFirstInGroup = !nextItem || nextItem.role !== item.role;

      return (
        <Animated.View entering={index === 0 ? FadeIn.duration(200) : undefined}>
          <View
            style={[
              styles.messageRow,
              isUser ? styles.messageRowUser : styles.messageRowAssistant,
              !isFirstInGroup && styles.messageRowGrouped,
            ]}
          >
            {!isUser && (
              <View style={styles.avatarSlot}>
                {isFirstInGroup && (
                  <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
                    <Bot size={18} color={colors.primary} />
                  </View>
                )}
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                isUser
                  ? { backgroundColor: colors.primary }
                  : {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.cardBorder,
                      borderWidth: 1,
                    },
                shadows.sm,
              ]}
            >
              <Text
                style={[styles.messageText, { color: isUser ? "#FFFFFF" : colors.textPrimary }]}
              >
                {item.content}
              </Text>
            </View>
            {isUser && (
              <View style={styles.avatarSlot}>
                {isFirstInGroup && (
                  <View style={[styles.avatar, { backgroundColor: colors.accent + "20" }]}>
                    <User size={18} color={colors.accent} />
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      );
    },
    [colors, shadows, invertedMessages]
  );

  const renderTypingIndicator = useCallback(() => {
    if (!isTyping) return null;
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <View style={[styles.messageRow, styles.messageRowAssistant, { marginBottom: Spacing.md }]}>
          <View style={styles.avatarSlot}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
              <Bot size={18} color={colors.primary} />
            </View>
          </View>
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
                borderWidth: 1,
              },
              shadows.sm,
            ]}
          >
            <TypingIndicator color={colors.textSecondary} />
          </View>
        </View>
      </Animated.View>
    );
  }, [isTyping, colors, shadows]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Parker</Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: colors.glassBg }]}
            accessibilityLabel="Close chat"
          >
            <X size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
        <FlatList
          ref={flatListRef}
          data={invertedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          inverted
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={renderTypingIndicator}
        />

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            { paddingBottom: Math.max(insets.bottom, Spacing.md) },
          ]}
        >
          <TextInput
            style={[styles.input, { backgroundColor: colors.glassBg, color: colors.textPrimary }]}
            placeholder="Ask Parker anything..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.primary : colors.glassBg },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color={inputText.trim() ? "#FFFFFF" : colors.textSecondary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  messageList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAssistant: {
    justifyContent: "flex-start",
  },
  messageRowGrouped: {
    marginTop: -Spacing.sm,
  },
  avatarSlot: {
    width: 32,
    height: 32,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
});
