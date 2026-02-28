"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type ConversationListItem, listConversations } from "@/lib/api";
import { t } from "@/lib/i18n";

interface ChatHistoryPanelProps {
	language: string;
	currentId?: string;
	onClose: () => void;
}

function relativeTime(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export default function ChatHistoryPanel({
	language,
	currentId,
	onClose,
}: ChatHistoryPanelProps) {
	const router = useRouter();
	const [conversations, setConversations] = useState<ConversationListItem[]>(
		[],
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		listConversations()
			.then((data) => {
				if (!cancelled) setConversations(data);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const handleSelect = (id: string) => {
		onClose();
		router.push(`/chat/${id}`);
	};

	return (
		<div className="fixed inset-0 z-50 flex justify-end">
			<button
				type="button"
				className="absolute inset-0 bg-black/30"
				onClick={onClose}
				aria-label="Close"
			/>
			<div className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col bg-surface shadow-xl transition-transform duration-200">
				<div className="flex items-center justify-between border-b border-subtle px-4 py-3">
					<h2 className="text-lg font-bold text-foreground">
						{t(language, "history")}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-[6px] p-1 text-text-secondary transition-colors hover:bg-hover"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Close</title>
							<path d="M18 6L6 18" />
							<path d="M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div className="flex-1 overflow-y-auto">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="h-6 w-6 animate-spin rounded-full border-2 border-seoul-blue border-t-transparent" />
						</div>
					) : conversations.length === 0 ? (
						<p className="px-4 py-8 text-center text-sm text-text-secondary">
							No conversations yet
						</p>
					) : (
						<ul>
							{conversations.map((conv) => (
								<li key={conv.id}>
									<button
										type="button"
										onClick={() => handleSelect(conv.id)}
										className={`w-full border-b border-subtle px-4 py-3 text-left transition-colors hover:bg-hover ${
											conv.id === currentId ? "bg-hover" : ""
										}`}
									>
										<p className="truncate text-sm font-medium text-foreground">
											{conv.preview || "New conversation"}
										</p>
										<div className="mt-1 flex items-center gap-2">
											<span className="rounded bg-seoul-blue/10 px-1.5 py-0.5 text-xs font-medium text-seoul-blue">
												{conv.language}
											</span>
											<span className="text-xs text-text-secondary">
												{relativeTime(conv.updated_at)}
											</span>
										</div>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
