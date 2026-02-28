"use client";

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
}

export default function Header({ language, onLanguageChange }: HeaderProps) {
	return (
		<header className="flex shrink-0 items-center justify-between border-b border-subtle bg-surface px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
			<div className="flex items-center gap-2">
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
			</div>
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
		</header>
	);
}
