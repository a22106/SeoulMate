"use client";

import { t } from "@/lib/i18n";

const LANGUAGES = [
	{ code: "English", label: "EN" },
	{ code: "한국어", label: "KR" },
	{ code: "中文", label: "CN" },
	{ code: "Tiếng Việt", label: "VN" },
	{ code: "日本語", label: "JP" },
];

interface HeaderProps {
	language: string;
	onLanguageChange: (lang: string) => void;
	onNewChat: () => void;
	onSOS: () => void;
}

export default function Header({
	language,
	onLanguageChange,
	onNewChat,
	onSOS,
}: HeaderProps) {
	return (
		<header className="flex shrink-0 items-center justify-between border-b border-subtle bg-surface px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
			<button
				type="button"
				onClick={onNewChat}
				className="flex items-center gap-2"
			>
				<div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-seoul-blue text-sm text-white">
					S
				</div>
				<h1
					className="text-xl font-bold tracking-tight text-foreground"
					style={{ fontFamily: "var(--font-outfit)" }}
				>
					Seoul
					<span className="text-seoul-blue">Mate</span>
				</h1>
			</button>
			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onNewChat}
					className="rounded-[6px] border border-subtle bg-surface px-2.5 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-hover"
				>
					{t(language, "newChat")}
				</button>
				<button
					type="button"
					onClick={onSOS}
					className="rounded-[6px] bg-red-600 px-2.5 py-1.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
				>
					🚨 SOS
				</button>
				<select
					value={language}
					onChange={(e) => onLanguageChange(e.target.value)}
					className="rounded-[6px] border border-subtle bg-surface px-2 py-1.5 text-sm text-foreground outline-none focus:border-seoul-blue"
				>
					{LANGUAGES.map((lang) => (
						<option key={lang.code} value={lang.code}>
							{lang.label}
						</option>
					))}
				</select>
			</div>
		</header>
	);
}
