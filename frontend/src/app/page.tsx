"use client";

import { useCallback, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";

export default function Home() {
	const [language, setLanguage] = useState("English");
	const [chatKey, setChatKey] = useState(0);

	const handleNewChat = useCallback(() => {
		setChatKey((k) => k + 1);
	}, []);

	return (
		<div className="flex h-dvh flex-col bg-background">
			<Header
				language={language}
				onLanguageChange={setLanguage}
				onNewChat={handleNewChat}
			/>
			<ChatInterface key={chatKey} language={language} />
		</div>
	);
}
