"use client";

import {
	type MutableRefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	type ChatMessage,
	createConversation,
	getConversation,
	sendChatMessage,
	uploadFile,
} from "@/lib/api";
import { t } from "@/lib/i18n";
import type { Attachment } from "./ChatInput";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

interface Message {
	id: string;
	role: "user" | "assistant";
	text: string;
	image?: string;
	file_url?: string;
	file_mime_type?: string;
	file_name?: string;
}

const DOCUMENT_CATEGORIES = [
	{
		i18nKey: "doc.lease",
		icon: "🏠",
		prompt:
			"I'm uploading a Korean housing lease/rental contract (전세 or 월세 계약서). Please analyze the key terms, important clauses, potential risks, and anything I should be careful about as a foreign tenant.",
	},
	{
		i18nKey: "doc.employment",
		icon: "💼",
		prompt:
			"I'm uploading a Korean employment contract (근로계약서). Please analyze the key terms including salary, working hours, benefits, and anything I should watch out for as a foreign worker.",
	},
	{
		i18nKey: "doc.bill",
		icon: "🧾",
		prompt:
			"I'm uploading a Korean utility bill or tax notice (공과금/세금 고지서). Please explain what this bill is for, the amount due, payment deadline, and how to pay it.",
	},
	{
		i18nKey: "doc.government",
		icon: "🏛️",
		prompt:
			"I'm uploading an official Korean government document or notice (관공서 서류). Please explain what this document says, what action I need to take, and any deadlines.",
	},
	{
		i18nKey: "doc.medical",
		icon: "🏥",
		prompt:
			"I'm uploading a Korean medical or insurance document (의료/보험 서류). Please explain the diagnosis, treatment, costs, and any follow-up actions needed.",
	},
	{
		i18nKey: "doc.other",
		icon: "📄",
		prompt:
			"I'm uploading a Korean document. Please analyze and explain what this document is about, the key information, and any actions I need to take.",
	},
];

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
	enableVoice?: boolean;
}

export default function ChatInterface({
	language,
	conversationId,
	enableVoice,
}: ChatInterfaceProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingHistory, setIsLoadingHistory] = useState(!!conversationId);
	const [convId, setConvId] = useState<string | undefined>(conversationId);
	const [selectedCategory, setSelectedCategory] = useState(0);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const ctaFileInputRef = useRef<HTMLInputElement>(null);
	const abortRef: MutableRefObject<AbortController | null> = useRef(null);

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
		async (text: string, attachment?: Attachment) => {
			if (isLoading) return;

			// Build history from current messages BEFORE state update
			const history: ChatMessage[] = messages.map((m) => ({
				role: m.role,
				text: m.text,
				file_url: m.file_url,
				file_mime_type: m.file_mime_type,
			}));

			const userMsg: Message = {
				id: Date.now().toString(),
				role: "user",
				text,
				image: attachment?.image
					? `data:image/jpeg;base64,${attachment.image}`
					: undefined,
				file_url: attachment?.file_url,
				file_mime_type: attachment?.file_mime_type,
				file_name: attachment?.file_name,
			};

			const assistantId = (Date.now() + 1).toString();
			const assistantMsg: Message = {
				id: assistantId,
				role: "assistant",
				text: "",
			};

			// Immediate UI feedback: show messages + loading state
			setMessages((prev) => [...prev, userMsg, assistantMsg]);
			setIsLoading(true);

			// Create conversation on first message (user already sees typing dots)
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

			const controller = new AbortController();
			abortRef.current = controller;

			sendChatMessage(
				{
					message: text,
					image: attachment?.image,
					file_url: attachment?.file_url,
					file_mime_type: attachment?.file_mime_type,
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
					abortRef.current = null;
					setIsLoading(false);
				},
				// onError
				(err) => {
					abortRef.current = null;
					setMessages((prev) =>
						prev.map((m) =>
							m.id === assistantId
								? { ...m, text: `Sorry, something went wrong: ${err.message}` }
								: m,
						),
					);
					setIsLoading(false);
				},
				controller.signal,
			);
		},
		[isLoading, messages, language, convId],
	);

	const handleStop = useCallback(() => {
		abortRef.current?.abort();
	}, []);

	const handleQuickGuide = useCallback(
		(question: string) => {
			handleSend(question);
		},
		[handleSend],
	);

	const handleCtaFile = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			e.target.value = "";

			try {
				const resp = await uploadFile(file);
				const att: Attachment = {
					file_url: resp.file_url,
					file_mime_type: resp.mime_type,
					file_name: resp.original_name,
				};
				// Include base64 for image display
				if (file.type.startsWith("image/")) {
					const reader = new FileReader();
					reader.onload = () => {
						att.image = (reader.result as string).split(",")[1];
						handleSend(DOCUMENT_CATEGORIES[selectedCategory].prompt, att);
					};
					reader.readAsDataURL(file);
				} else {
					handleSend(DOCUMENT_CATEGORIES[selectedCategory].prompt, att);
				}
			} catch {
				// Upload failed — ignore
			}
		},
		[handleSend, selectedCategory],
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

						{/* Document category tabs */}
						<div className="mb-4 flex w-full max-w-sm flex-wrap justify-center gap-2">
							{DOCUMENT_CATEGORIES.map((cat, idx) => (
								<button
									type="button"
									key={cat.i18nKey}
									onClick={() => setSelectedCategory(idx)}
									className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
										selectedCategory === idx
											? "border-seoul-blue bg-seoul-blue text-white"
											: "border-subtle bg-surface text-text-secondary hover:border-seoul-blue/40"
									}`}
								>
									{cat.icon} {t(language, cat.i18nKey)}
								</button>
							))}
						</div>

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
							accept="image/*,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
							onChange={handleCtaFile}
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
						{messages.map((msg, idx) => (
							<MessageBubble
								key={msg.id}
								role={msg.role}
								text={msg.text}
								image={msg.image}
								file_url={msg.file_url}
								file_mime_type={msg.file_mime_type}
								file_name={msg.file_name}
								language={language}
								isStreaming={
									msg.role === "assistant" &&
									isLoading &&
									idx === messages.length - 1
								}
							/>
						))}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Input */}
			<ChatInput
				onSend={handleSend}
				onStop={handleStop}
				disabled={isLoading}
				language={language}
				enableVoice={enableVoice}
			/>
		</div>
	);
}
