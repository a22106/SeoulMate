"use client";

import { useCallback, useState } from "react";
import { t } from "@/lib/i18n";

interface MessageBubbleProps {
	role: "user" | "assistant";
	text: string;
	image?: string;
	file_url?: string;
	file_mime_type?: string;
	file_name?: string;
	language: string;
	isStreaming?: boolean;
}

function escapeHtml(s: string) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderMarkdown(text: string) {
	// Extract fenced code blocks first to protect them from other transforms
	const codeBlocks: string[] = [];
	const processed = text.replace(
		/```(\w*)\n([\s\S]*?)```/g,
		(_match, lang: string, code: string) => {
			const idx = codeBlocks.length;
			const escaped = escapeHtml(code.replace(/\n$/, ""));
			const langAttr = lang ? ` data-lang="${escapeHtml(lang)}"` : "";
			codeBlocks.push(
				`<div class="code-block"><pre${langAttr}><code>${escaped}</code></pre></div>`,
			);
			return `\n%%CODE_BLOCK_${idx}%%\n`;
		},
	);

	// Process line-by-line for block elements
	const lines = processed.split("\n");
	const out: string[] = [];
	let inUl = false;
	let inOl = false;
	let inBlockquote = false;
	let bqLines: string[] = [];
	let tableRows: string[] = [];

	function closeList() {
		if (inUl) {
			out.push("</ul>");
			inUl = false;
		}
		if (inOl) {
			out.push("</ol>");
			inOl = false;
		}
	}

	function closeBlockquote() {
		if (inBlockquote) {
			out.push(
				`<blockquote>${renderInline(bqLines.join("<br/>"))}</blockquote>`,
			);
			bqLines = [];
			inBlockquote = false;
		}
	}

	function parseCells(row: string) {
		return row
			.replace(/^\|/, "")
			.replace(/\|$/, "")
			.split("|")
			.map((c) => c.trim());
	}

	function closeTable() {
		if (tableRows.length === 0) return;
		// Detect separator row (2nd row with :?---+:? pattern)
		let headerEnd = 0;
		const aligns: string[] = [];
		if (tableRows.length >= 2) {
			const sepCells = parseCells(tableRows[1]);
			const isSep = sepCells.every((c) => /^:?-{2,}:?$/.test(c));
			if (isSep) {
				headerEnd = 1;
				for (const c of sepCells) {
					if (c.startsWith(":") && c.endsWith(":")) aligns.push("center");
					else if (c.endsWith(":")) aligns.push("right");
					else aligns.push("left");
				}
			}
		}

		let html = '<div class="table-wrap"><table>';
		if (headerEnd > 0) {
			const cells = parseCells(tableRows[0]);
			html += "<thead><tr>";
			for (let i = 0; i < cells.length; i++) {
				const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : "";
				html += `<th${align}>${renderInline(cells[i])}</th>`;
			}
			html += "</tr></thead>";
		}
		html += "<tbody>";
		const start = headerEnd > 0 ? 2 : 0;
		for (let r = start; r < tableRows.length; r++) {
			const cells = parseCells(tableRows[r]);
			html += "<tr>";
			for (let i = 0; i < cells.length; i++) {
				const align = aligns[i] ? ` style="text-align:${aligns[i]}"` : "";
				html += `<td${align}>${renderInline(cells[i])}</td>`;
			}
			html += "</tr>";
		}
		html += "</tbody></table></div>";
		out.push(html);
		tableRows = [];
	}

	function renderInline(line: string) {
		let s = escapeHtml(line);
		// Bold + italic
		s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
		// Bold
		s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
		// Italic
		s = s.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<em>$1</em>");
		// Inline code
		s = s.replace(/`([^`]+)`/g, (_m, code: string) => `<code>${code}</code>`);
		// Links
		s = s.replace(
			/\[([^\]]+)\]\(([^)]+)\)/g,
			'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
		);
		return s;
	}

	for (const line of lines) {
		const trimmed = line.trim();

		// Table rows: lines that start and end with |
		if (/^\|.+\|$/.test(trimmed)) {
			closeList();
			closeBlockquote();
			tableRows.push(trimmed);
			continue;
		}
		closeTable();

		// Code block placeholder
		const codeMatch = trimmed.match(/^%%CODE_BLOCK_(\d+)%%$/);
		if (codeMatch) {
			closeList();
			closeBlockquote();
			out.push(codeBlocks[Number(codeMatch[1])]);
			continue;
		}

		// Horizontal rule — but skip if it looks like a table separator row already consumed
		if (/^[-*_]{3,}$/.test(trimmed)) {
			closeList();
			closeBlockquote();
			out.push("<hr/>");
			continue;
		}

		// Blockquote
		if (trimmed.startsWith("&gt; ") || trimmed === "&gt;") {
			// Already escaped — won't happen. Check raw.
		}
		if (line.trimStart().startsWith("> ") || line.trimStart() === ">") {
			closeList();
			inBlockquote = true;
			bqLines.push(line.trimStart().replace(/^>\s?/, ""));
			continue;
		}
		if (inBlockquote) {
			closeBlockquote();
		}

		// Headers
		const h3 = trimmed.match(/^### (.+)$/);
		if (h3) {
			closeList();
			out.push(`<h3>${renderInline(h3[1])}</h3>`);
			continue;
		}
		const h2 = trimmed.match(/^## (.+)$/);
		if (h2) {
			closeList();
			out.push(`<h2>${renderInline(h2[1])}</h2>`);
			continue;
		}
		const h1 = trimmed.match(/^# (.+)$/);
		if (h1) {
			closeList();
			out.push(`<h1>${renderInline(h1[1])}</h1>`);
			continue;
		}

		// Unordered list
		const ulMatch = trimmed.match(/^[*-] (.+)$/);
		if (ulMatch) {
			if (inOl) {
				out.push("</ol>");
				inOl = false;
			}
			if (!inUl) {
				out.push("<ul>");
				inUl = true;
			}
			out.push(`<li>${renderInline(ulMatch[1])}</li>`);
			continue;
		}

		// Ordered list
		const olMatch = trimmed.match(/^\d+\. (.+)$/);
		if (olMatch) {
			if (inUl) {
				out.push("</ul>");
				inUl = false;
			}
			if (!inOl) {
				out.push("<ol>");
				inOl = true;
			}
			out.push(`<li>${renderInline(olMatch[1])}</li>`);
			continue;
		}

		// Close open lists on non-list line
		closeList();

		// Empty line = paragraph break
		if (trimmed === "") {
			out.push("");
			continue;
		}

		// Normal text
		out.push(renderInline(trimmed));
	}

	closeList();
	closeBlockquote();
	closeTable();

	// Join and wrap in paragraphs
	let html = "";
	let paragraph: string[] = [];

	function flushParagraph() {
		if (paragraph.length > 0) {
			html += `<p>${paragraph.join("<br/>")}</p>`;
			paragraph = [];
		}
	}

	for (const item of out) {
		if (item === "") {
			flushParagraph();
		} else if (
			item.startsWith("<h") ||
			item.startsWith("<ul") ||
			item.startsWith("<ol") ||
			item.startsWith("</") ||
			item.startsWith("<li") ||
			item.startsWith("<hr") ||
			item.startsWith("<blockquote") ||
			item.startsWith("<div") ||
			item.startsWith("<table")
		) {
			flushParagraph();
			html += item;
		} else {
			paragraph.push(item);
		}
	}
	flushParagraph();

	return html;
}

function fileIcon(mime?: string) {
	if (mime === "application/pdf") return "\u{1F4C4}";
	if (
		mime ===
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	)
		return "\u{1F4DD}";
	return "\u{1F4CE}";
}

export default function MessageBubble({
	role,
	text,
	image,
	file_url,
	file_mime_type,
	file_name,
	language,
	isStreaming,
}: MessageBubbleProps) {
	const isUser = role === "user";
	const [copied, setCopied] = useState(false);
	const [showLightbox, setShowLightbox] = useState(false);

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
						<button
							type="button"
							onClick={() => setShowLightbox(true)}
							className="block"
						>
							<img
								src={image}
								alt="Uploaded"
								className="max-h-48 cursor-pointer rounded-[12px] object-cover transition-opacity hover:opacity-80"
							/>
						</button>
					</div>
				)}
				{!image && file_url && isUser && (
					<div className="p-2 pb-0">
						<div className="flex items-center gap-2 rounded-[12px] bg-white/20 px-3 py-2 text-sm">
							<span className="text-xl">{fileIcon(file_mime_type)}</span>
							<span className="max-w-[180px] truncate">
								{file_name || "File"}
							</span>
						</div>
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
								className={`ai-markdown text-[15px] leading-relaxed${isStreaming ? " streaming" : ""}`}
								dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
							/>
							{!isStreaming && (
								<button
									type="button"
									onClick={handleCopy}
									className="mt-1.5 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
								>
									{copied ? t(language, "copied") : t(language, "copy")}
								</button>
							)}
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
			{showLightbox && image && (
				<button
					type="button"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
					onClick={() => setShowLightbox(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setShowLightbox(false);
					}}
				>
					<img
						src={image}
						alt="Uploaded"
						className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain"
					/>
				</button>
			)}
		</div>
	);
}
