"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	type ChatMessage,
	createConversation,
	getConversation,
	sendChatMessage,
} from "@/lib/api";
import { t } from "@/lib/i18n";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

interface Message {
	id: string;
	role: "user" | "assistant";
	text: string;
	image?: string;
}

const QUICK_GUIDES = [
	{
		emoji: "🏠",
		i18nKey: "guide.housing",
		question:
			"How does the housing deposit (전세/월세) system work in Seoul? What should I check before signing a lease?",
	},
	{
		emoji: "🗑️",
		i18nKey: "guide.recycling",
		question:
			"How do I sort recycling in Seoul? What are the rules for food waste and regular trash?",
	},
	{
		emoji: "🏥",
		i18nKey: "guide.healthcare",
		question:
			"How do I sign up for Korean health insurance (건강보험) as a foreigner? How do I visit a hospital?",
	},
	{
		emoji: "📄",
		i18nKey: "guide.visa",
		question:
			"What do I need to know about extending my visa in Korea? Where is the immigration office?",
	},
	{
		emoji: "🚇",
		i18nKey: "guide.transport",
		question:
			"How do I get a transportation card and use the subway and bus system in Seoul?",
	},
	{
		emoji: "💰",
		i18nKey: "guide.banking",
		question:
			"How do I open a bank account in Korea as a foreigner? What documents do I need?",
	},
];

interface ChatInterfaceProps {
	language: string;
	conversationId?: string;
}

export default function ChatInterface({
	language,
	conversationId,
}: ChatInterfaceProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingHistory, setIsLoadingHistory] = useState(!!conversationId);
	const [convId, setConvId] = useState<string | undefined>(conversationId);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const ctaFileInputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	// Load existing conversation messages
	useEffect(() => {
		if (!conversationId) return;
		let cancelled = false;

		(async () => {
			try {
				const detail = await getConversation(conversationId);
				if (cancelled) return;
				const loaded: Message[] = detail.messages.map((m) => ({
					id: m.id,
					role: m.role as "user" | "assistant",
					text: m.text,
				}));
				setMessages(loaded);
			} catch {
				// 404 or error — redirect handled by parent page
			} finally {
				if (!cancelled) setIsLoadingHistory(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [conversationId]);

	const handleSend = useCallback(
		async (text: string, image?: string) => {
			if (isLoading) return;

			// Create conversation on first message if needed
			let activeConvId = convId;
			if (!activeConvId) {
				try {
					const conv = await createConversation(language);
					activeConvId = conv.id;
					setConvId(activeConvId);
					window.history.replaceState(null, "", `/chat/${activeConvId}`);
				} catch {
					// Continue without persistence if creation fails
				}
			}

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
				{
					message: text,
					image,
					language,
					history,
					conversation_id: activeConvId,
				},
				// onChunk
				(chunk) => {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId ? { ...m, text: m.text + chunk } : m,
						),
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
								: m,
						),
					);
					setIsLoading(false);
				},
			);
		},
		[isLoading, messages, language, convId],
	);

	const handleQuickGuide = useCallback(
		(question: string) => {
			handleSend(question);
		},
		[handleSend],
	);

	const handleCtaImage = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				const base64 = result.split(",")[1];
				handleSend("What is this?", base64);
			};
			reader.readAsDataURL(file);
			e.target.value = "";
		},
		[handleSend],
	);

	if (isLoadingHistory) {
		return (
			<div className="flex min-h-0 flex-1 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-seoul-blue border-t-transparent" />
			</div>
		);
	}

	const showWelcome = messages.length === 0;

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			{/* Messages area */}
			<div className="flex-1 overflow-y-auto">
				{showWelcome ? (
					<div className="flex h-full flex-col items-center justify-center px-4 py-8">
						{/* Welcome logo */}
						<div
							className="mb-4 flex h-16 w-16 items-center justify-center rounded-[24px] text-2xl text-white shadow-[0_0_24px_rgba(37,99,235,0.3)]"
							style={{
								background: "linear-gradient(135deg, #2563EB, #7C3AED)",
							}}
						>
							S
						</div>
						<h2
							className="mb-2 text-2xl font-bold tracking-tight text-foreground"
							style={{ fontFamily: "var(--font-outfit)" }}
						>
							Seoul<span className="text-seoul-blue">Mate</span>
						</h2>
						<p className="mb-6 max-w-sm text-center text-sm text-text-secondary">
							{t(language, "welcome.subtitle")}
						</p>

						{/* Camera CTA */}
						<button
							type="button"
							onClick={() => ctaFileInputRef.current?.click()}
							className="mb-2 flex items-center gap-2 rounded-[16px] bg-seoul-blue px-6 py-3 text-base font-semibold text-white shadow-[0_0_24px_rgba(37,99,235,0.3)] transition-all hover:brightness-110"
						>
							{t(language, "welcome.cta")}
						</button>
						<p className="mb-8 text-xs text-text-tertiary">
							{t(language, "welcome.cta.sub")}
						</p>
						<input
							ref={ctaFileInputRef}
							type="file"
							accept="image/*"
							capture="environment"
							onChange={handleCtaImage}
							className="hidden"
						/>

						{/* Quick guides */}
						<div className="grid w-full max-w-sm grid-cols-2 gap-2 sm:grid-cols-3">
							{QUICK_GUIDES.map((guide) => (
								<button
									type="button"
									key={guide.i18nKey}
									onClick={() => handleQuickGuide(guide.question)}
									className="flex flex-col items-center gap-1.5 rounded-[12px] border border-subtle bg-surface p-3 text-center transition-all hover:border-hanok-coral hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
								>
									<span className="text-2xl">{guide.emoji}</span>
									<span className="text-xs font-medium text-text-secondary">
										{t(language, guide.i18nKey)}
									</span>
								</button>
							))}
						</div>

						{/* Disclaimer */}
						<p className="mt-8 max-w-sm text-center text-xs text-text-tertiary">
							{t(language, "disclaimer")}
						</p>
					</div>
				) : (
					<div className="py-4">
						{messages.map((msg) => (
							<MessageBubble
								key={msg.id}
								role={msg.role}
								text={msg.text}
								image={msg.image}
								language={language}
								isStreaming={msg.role === "assistant" && !msg.text && isLoading}
							/>
						))}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Input */}
			<ChatInput onSend={handleSend} disabled={isLoading} language={language} />
		</div>
	);
}
