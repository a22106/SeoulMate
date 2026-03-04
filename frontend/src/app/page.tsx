"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ChatHistoryPanel from "@/components/ChatHistoryPanel";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import SOSModal from "@/components/SOSModal";

export default function Home() {
	const [language, setLanguage] = useState("English");
	const [showSOS, setShowSOS] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const router = useRouter();

	const handleNewChat = useCallback(() => {
		router.push("/chat/new");
	}, [router]);

	return (
		<div className="flex h-dvh flex-col bg-background">
			<Header
				language={language}
				onLanguageChange={setLanguage}
				onNewChat={handleNewChat}
				onSOS={() => setShowSOS(true)}
				onHistory={() => setShowHistory(true)}
				onDemo={
					process.env.NEXT_PUBLIC_ENABLE_DEMO === "true"
						? () => router.push("/demo")
						: undefined
				}
			/>
			<ChatInterface language={language} />
			<footer className="shrink-0 border-t border-black/5 bg-surface px-4 py-2 text-center text-xs text-text-tertiary">
				이 프로젝트는 Gemini 3 서울 해커톤을 위해 제작된 프로젝트로써, 기능이
				제한적입니다.
			</footer>
			{showSOS && (
				<SOSModal language={language} onClose={() => setShowSOS(false)} />
			)}
			{showHistory && (
				<ChatHistoryPanel
					language={language}
					onClose={() => setShowHistory(false)}
				/>
			)}
		</div>
	);
}
