"use client";

import { useCallback, useState } from "react";
import { t } from "@/lib/i18n";

interface MessageBubbleProps {
	role: "user" | "assistant";
	text: string;
	image?: string;
	language: string;
	isStreaming?: boolean;
}

function renderMarkdown(text: string) {
	// Simple markdown: bold, headers, lists, links, line breaks
	let html = text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

	// Headers
	html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
	html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
	html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

	// Bold
	html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

	// Inline code
	html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

	// Links
	html = html.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
	);

	// Unordered lists
	html = html.replace(/^[*-] (.+)$/gm, "<li>$1</li>");
	html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

	// Numbered lists
	html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

	// Line breaks (double newline = paragraph, single = br)
	html = html.replace(/\n\n/g, "</p><p>");
	html = html.replace(/\n/g, "<br/>");
	html = `<p>${html}</p>`;

	// Clean up empty paragraphs
	html = html.replace(/<p><\/p>/g, "");
	html = html.replace(/<p>(<h[123]>)/g, "$1");
	html = html.replace(/(<\/h[123]>)<\/p>/g, "$1");
	html = html.replace(/<p>(<ul>)/g, "$1");
	html = html.replace(/(<\/ul>)<\/p>/g, "$1");

	return html;
}

export default function MessageBubble({
	role,
	text,
	image,
	language,
	isStreaming,
}: MessageBubbleProps) {
	const isUser = role === "user";
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, [text]);

	return (
		<div
			className={`animate-message-in flex ${isUser ? "justify-end" : "justify-start"} mb-3 px-4`}
		>
			<div
				className={`max-w-[85%] sm:max-w-[75%] ${
					isUser
						? "rounded-[16px_16px_4px_16px] bg-seoul-blue text-white"
						: "rounded-[16px_16px_16px_4px] bg-subtle text-foreground"
				}`}
			>
				{image && isUser && (
					<div className="p-2 pb-0">
						<img
							src={image}
							alt="Uploaded"
							className="max-h-48 rounded-[12px] object-cover"
						/>
					</div>
				)}
				<div className="px-4 py-2.5">
					{isUser ? (
						<p className="text-[15px] leading-relaxed whitespace-pre-wrap">
							{text}
						</p>
					) : text ? (
						<>
							<div
								className="ai-markdown text-[15px] leading-relaxed"
								dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
							/>
							<button
								type="button"
								onClick={handleCopy}
								className="mt-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
							>
								{copied ? t(language, "copied") : t(language, "copy")}
							</button>
						</>
					) : isStreaming ? (
						<div className="flex items-center gap-1 py-1">
							<span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:0ms]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:150ms]" />
							<span className="h-2 w-2 animate-bounce rounded-full bg-text-tertiary [animation-delay:300ms]" />
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
