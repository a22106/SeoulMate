"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ChatHistoryPanel from "@/components/ChatHistoryPanel";
import type { Attachment } from "@/components/ChatInput";
import ChatInterface from "@/components/ChatInterface";
import Header from "@/components/Header";
import SOSModal from "@/components/SOSModal";
import { uploadFile } from "@/lib/api";

interface ActiveChat {
	prompt: string;
	attachment: Attachment;
}

const DEMO_CONTRACTS = [
	{
		filename: "부동산 매매 계약서.jpg",
		label: "Real Estate Purchase Contract",
		labelKr: "부동산 매매 계약서",
		icon: "🏠",
		prompt:
			"I'm uploading a Korean real estate purchase contract (부동산 매매 계약서). Please analyze the key terms, purchase price, conditions, and anything I should be careful about as a foreign buyer.",
	},
	{
		filename: "오피스텔 월세 계약서.jpg",
		label: "Officetel Monthly Rent",
		labelKr: "오피스텔 월세 계약서",
		icon: "🏢",
		prompt:
			"I'm uploading a Korean officetel monthly rent contract (오피스텔 월세 계약서). Please analyze the key terms including deposit, monthly rent, contract period, and anything I should watch out for as a foreign tenant.",
	},
	{
		filename: "연봉 계약서.jpg",
		label: "Salary Contract",
		labelKr: "연봉 계약서",
		icon: "💼",
		prompt:
			"I'm uploading a Korean salary contract (연봉 계약서). Please analyze the key terms including salary, working hours, benefits, and anything I should watch out for as a foreign worker.",
	},
	{
		filename: "연봉계약서2.jpg",
		label: "Salary Contract (2)",
		labelKr: "연봉계약서",
		icon: "💼",
		prompt:
			"I'm uploading a Korean salary contract (연봉계약서). Please analyze the key terms including salary, working hours, benefits, and anything I should watch out for as a foreign worker.",
	},
	{
		filename: "산후조리원 계약서.jpg",
		label: "Postpartum Care Center",
		labelKr: "산후조리원 계약서",
		icon: "🏥",
		prompt:
			"I'm uploading a Korean postpartum care center contract (산후조리원 계약서). Please analyze the key terms including services, costs, duration, and anything I should be careful about.",
	},
	{
		filename: "임다채 계약서.jpg",
		label: "Lease Contract",
		labelKr: "임다채 계약서",
		icon: "🏠",
		prompt:
			"I'm uploading a Korean lease contract (임대차 계약서). Please analyze the key terms including deposit, rent, contract period, and anything I should watch out for as a foreign tenant.",
	},
];

export default function DemoPage() {
	const router = useRouter();
	const [language, setLanguage] = useState("English");
	const [showSOS, setShowSOS] = useState(false);
	const [showHistory, setShowHistory] = useState(false);
	const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
	const [uploading, setUploading] = useState(false);

	const handleNewChat = useCallback(() => {
		router.push("/chat/new");
	}, [router]);

	const handleCardClick = useCallback(
		async (contract: (typeof DEMO_CONTRACTS)[number]) => {
			setUploading(true);
			try {
				const res = await fetch(`/docs/${contract.filename}`);
				const blob = await res.blob();
				const file = new File([blob], contract.filename, {
					type: blob.type,
				});

				const uploaded = await uploadFile(file);

				// Read base64 for image display
				const base64: string = await new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = () =>
						resolve((reader.result as string).split(",")[1]);
					reader.readAsDataURL(blob);
				});

				setActiveChat({
					prompt: contract.prompt,
					attachment: {
						image: base64,
						file_url: uploaded.file_url,
						file_mime_type: uploaded.mime_type,
						file_name: uploaded.original_name,
					},
				});
			} catch {
				// Upload failed — ignore
			} finally {
				setUploading(false);
			}
		},
		[],
	);

	return (
		<div className="flex h-dvh flex-col bg-background">
			<Header
				language={language}
				onLanguageChange={setLanguage}
				onNewChat={handleNewChat}
				onSOS={() => setShowSOS(true)}
				onHistory={() => setShowHistory(true)}
				onDemo={() => setActiveChat(null)}
			/>
			{activeChat ? (
				<ChatInterface
					key={activeChat.prompt}
					language={language}
					initialMessage={activeChat.prompt}
					initialAttachment={activeChat.attachment}
					enableVoice
				/>
			) : (
				<div className="flex-1 overflow-y-auto px-4 py-8">
					<div className="mx-auto max-w-lg">
						<h2
							className="mb-2 text-center text-2xl font-bold tracking-tight text-foreground"
							style={{ fontFamily: "var(--font-outfit)" }}
						>
							Demo Documents
						</h2>
						<p className="mb-6 text-center text-sm text-text-secondary">
							Select a Korean contract to analyze
						</p>

						{uploading && (
							<div className="mb-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-seoul-blue border-t-transparent" />
								Uploading document...
							</div>
						)}

						<div className="grid grid-cols-2 gap-3">
							{DEMO_CONTRACTS.map((contract) => (
								<button
									type="button"
									key={contract.filename}
									onClick={() => handleCardClick(contract)}
									disabled={uploading}
									className="flex flex-col items-center gap-2 rounded-[16px] border border-subtle bg-surface p-3 transition-all hover:border-seoul-blue hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] disabled:opacity-50"
								>
									<img
										src={`/docs/${contract.filename}`}
										alt={contract.label}
										className="h-24 w-full rounded-[8px] object-cover"
									/>
									<span className="text-xl">{contract.icon}</span>
									<span className="text-xs font-medium text-foreground">
										{contract.label}
									</span>
									<span className="text-xs text-text-tertiary">
										{contract.labelKr}
									</span>
								</button>
							))}
						</div>
					</div>
				</div>
			)}
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
