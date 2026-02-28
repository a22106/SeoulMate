"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import { SOS_CATEGORIES, type SOSCategory } from "@/lib/sos";

interface SOSModalProps {
	language: string;
	onClose: () => void;
}

export default function SOSModal({ language, onClose }: SOSModalProps) {
	const [activeTab, setActiveTab] = useState<SOSCategory["id"]>("police");
	const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

	const category =
		SOS_CATEGORIES.find((c) => c.id === activeTab) ?? SOS_CATEGORIES[0];

	const handleCopy = (text: string, idx: number) => {
		navigator.clipboard.writeText(text);
		setCopiedIdx(idx);
		setTimeout(() => setCopiedIdx(null), 1500);
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-col bg-red-600 text-white safe-area-inset">
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3">
				<h1 className="text-2xl font-bold">SOS {t(language, "sos.title")}</h1>
				<button
					type="button"
					onClick={onClose}
					className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur"
				>
					{t(language, "sos.close")}
				</button>
			</div>

			{/* Category Tabs */}
			<div className="flex gap-2 px-4 pb-3">
				{SOS_CATEGORIES.map((cat) => (
					<button
						key={cat.id}
						type="button"
						onClick={() => setActiveTab(cat.id)}
						className={`flex-1 rounded-xl py-3 text-center text-sm font-bold transition-colors ${
							activeTab === cat.id
								? "bg-white text-red-600"
								: "bg-white/20 text-white"
						}`}
					>
						<span className="block text-2xl">{t(language, cat.iconKey)}</span>
						<span className="block">{t(language, cat.titleKey)}</span>
					</button>
				))}
			</div>

			{/* Call Button */}
			<div className="px-4 pb-3">
				<a
					href={`tel:${category.number}`}
					className="flex items-center justify-center gap-3 rounded-2xl bg-white py-4 text-xl font-bold text-red-600 shadow-lg active:scale-95 transition-transform"
				>
					<span className="text-2xl">📞</span>
					{t(language, "sos.call")} {category.number}
				</a>
			</div>

			{/* Scripts */}
			<div className="flex-1 overflow-y-auto px-4 pb-6">
				<p className="mb-3 text-sm font-medium text-white/80">
					{t(language, "sos.tapToCopy")}
				</p>
				<div className="flex flex-col gap-3">
					{category.scripts.map((script, idx) => (
						<button
							key={script.translationKey}
							type="button"
							onClick={() => handleCopy(script.korean, idx)}
							className="rounded-2xl bg-white/15 p-4 text-left backdrop-blur transition-colors active:bg-white/25"
						>
							<p className="text-2xl font-bold leading-snug">{script.korean}</p>
							<p className="mt-1 text-sm text-white/70">{script.romanized}</p>
							<p className="mt-1 text-sm text-white/90">
								{t(language, script.translationKey)}
							</p>
							{copiedIdx === idx && (
								<p className="mt-1 text-xs font-semibold text-yellow-300">
									{t(language, "copied")}
								</p>
							)}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
