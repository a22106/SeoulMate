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
			/>
			<ChatInterface language={language} />
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
