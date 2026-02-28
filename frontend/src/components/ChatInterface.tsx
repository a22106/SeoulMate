"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { sendChatMessage, type ChatMessage } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  image?: string;
}

const QUICK_GUIDES = [
  { emoji: "🏠", label: "Housing", question: "How does the housing deposit (전세/월세) system work in Seoul? What should I check before signing a lease?" },
  { emoji: "🗑️", label: "Recycling", question: "How do I sort recycling in Seoul? What are the rules for food waste and regular trash?" },
  { emoji: "🏥", label: "Healthcare", question: "How do I sign up for Korean health insurance (건강보험) as a foreigner? How do I visit a hospital?" },
  { emoji: "📄", label: "Visa & Admin", question: "What do I need to know about extending my visa in Korea? Where is the immigration office?" },
  { emoji: "🚇", label: "Transport", question: "How do I get a transportation card and use the subway and bus system in Seoul?" },
  { emoji: "💰", label: "Banking", question: "How do I open a bank account in Korea as a foreigner? What documents do I need?" },
];

interface ChatInterfaceProps {
  language: string;
}

export default function ChatInterface({ language }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(
    (text: string, image?: string) => {
      if (isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text,
        image: image ? `data:image/jpeg;base64,${image}` : undefined,
      };

      const assistantId = (Date.now() + 1).toString();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        text: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      // Build history from previous messages (exclude current)
      const history: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      sendChatMessage(
        { message: text, image, language, history },
        // onChunk
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: m.text + chunk } : m
            )
          );
        },
        // onDone
        () => {
          setIsLoading(false);
        },
        // onError
        (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, text: `Sorry, something went wrong: ${err.message}` }
                : m
            )
          );
          setIsLoading(false);
        }
      );
    },
    [isLoading, messages, language]
  );

  const handleQuickGuide = useCallback(
    (question: string) => {
      handleSend(question);
    },
    [handleSend]
  );

  const showWelcome = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-8">
            {/* Welcome logo */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] bg-seoul-blue text-2xl text-white shadow-[0_0_24px_rgba(37,99,235,0.3)]">
              S
            </div>
            <h2
              className="mb-2 text-2xl font-bold tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Seoul<span className="text-seoul-blue">Mate</span>
            </h2>
            <p className="mb-8 max-w-sm text-center text-sm text-text-secondary">
              Your AI assistant for navigating life in Seoul. Ask a question or
              snap a photo of any Korean document.
            </p>

            {/* Quick guides */}
            <div className="grid w-full max-w-sm grid-cols-2 gap-2 sm:grid-cols-3">
              {QUICK_GUIDES.map((guide) => (
                <button
                  key={guide.label}
                  onClick={() => handleQuickGuide(guide.question)}
                  className="flex flex-col items-center gap-1.5 rounded-[12px] border border-subtle bg-surface p-3 text-center transition-all hover:border-seoul-blue hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
                >
                  <span className="text-2xl">{guide.emoji}</span>
                  <span className="text-xs font-medium text-text-secondary">
                    {guide.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                text={msg.text}
                image={msg.image}
                isStreaming={
                  msg.role === "assistant" && !msg.text && isLoading
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
