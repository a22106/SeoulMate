"use client";

import { useCallback, useRef, useState } from "react";
import { createVoiceSession, type VoiceState } from "@/lib/voice";

interface VoiceButtonProps {
	language: string;
}

export default function VoiceButton({ language }: VoiceButtonProps) {
	const [state, setState] = useState<VoiceState>("idle");
	const sessionRef = useRef<{ start: () => void; stop: () => void } | null>(
		null,
	);

	const toggle = useCallback(() => {
		if (state === "active" || state === "connecting") {
			sessionRef.current?.stop();
			sessionRef.current = null;
		} else {
			const session = createVoiceSession(language, {
				onStateChange: setState,
			});
			sessionRef.current = session;
			session.start();
		}
	}, [state, language]);

	const isActive = state === "active" || state === "connecting";

	return (
		<button
			type="button"
			onClick={toggle}
			className={`fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 ${
				isActive
					? "animate-pulse bg-hanok-coral text-white"
					: "bg-seoul-blue text-white hover:brightness-110"
			}`}
			aria-label={isActive ? "Stop voice chat" : "Start voice chat"}
		>
			{isActive ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="currentColor"
					role="img"
					aria-label="Stop"
				>
					<rect x="6" y="6" width="12" height="12" rx="2" />
				</svg>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					role="img"
					aria-label="Microphone"
				>
					<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
					<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
					<line x1="12" x2="12" y1="19" y2="22" />
				</svg>
			)}
		</button>
	);
}
