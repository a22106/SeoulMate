"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ChatHistoryPanel from "@/components/ChatHistoryPanel";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import SOSModal from "@/components/SOSModal";
import { getConversation } from "@/lib/api";

export default function ChatPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [language, setLanguage] = useState("English");
	const [showSOS, setShowSOS] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [valid, setValid] = useState<boolean | null>(null);

	const isNew = params.id === "new";

	useEffect(() => {
		if (isNew) {
			setValid(true);
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const detail = await getConversation(params.id);
				if (cancelled) return;
				setLanguage(detail.conversation.language);
				setValid(true);
			} catch {
				if (!cancelled) {
					router.replace("/");
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [params.id, isNew, router]);

	const handleNewChat = useCallback(() => {
		if (isNew) {
			window.location.href = "/chat/new";
		} else {
			router.push("/chat/new");
		}
	}, [isNew, router]);

	if (valid === null) {
		return (
			<div className="flex h-dvh items-center justify-center bg-background">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-seoul-blue border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex h-dvh flex-col bg-background">
			<Header
				language={language}
				onLanguageChange={setLanguage}
				onNewChat={handleNewChat}
				onSOS={() => setShowSOS(true)}
				onHistory={() => setShowHistory(true)}
			/>
			<ChatInterface
				language={language}
				conversationId={isNew ? undefined : params.id}
				enableVoice
			/>
			{showSOS && (
				<SOSModal language={language} onClose={() => setShowSOS(false)} />
			)}
			{showHistory && (
				<ChatHistoryPanel
					language={language}
					currentId={params.id}
					onClose={() => setShowHistory(false)}
				/>
			)}
		</div>
	);
}
