"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import SOSModal from "@/components/SOSModal";
import VoiceButton from "@/components/VoiceButton";

export default function Home() {
	const [language, setLanguage] = useState("English");
	const [showSOS, setShowSOS] = useState(false);
	const router = useRouter();

	const handleNewChat = useCallback(() => {
		router.push("/");
	}, [router]);

	return (
		<div className="flex h-dvh flex-col bg-background">
			<Header
				language={language}
				onLanguageChange={setLanguage}
				onNewChat={handleNewChat}
				onSOS={() => setShowSOS(true)}
			/>
			<ChatInterface language={language} />
			<VoiceButton language={language} />
			{showSOS && (
				<SOSModal language={language} onClose={() => setShowSOS(false)} />
			)}
		</div>
	);
}
