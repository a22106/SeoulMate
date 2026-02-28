"use client";

import { type KeyboardEvent, useCallback, useRef, useState } from "react";

interface ChatInputProps {
	onSend: (message: string, image?: string) => void;
	disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
	const [text, setText] = useState("");
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageBase64, setImageBase64] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleImageSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				setImagePreview(result);
				// Strip data:image/...;base64, prefix
				setImageBase64(result.split(",")[1]);
			};
			reader.readAsDataURL(file);
			// Reset so same file can be selected again
			e.target.value = "";
		},
		[],
	);

	const handleSend = useCallback(() => {
		const trimmed = text.trim();
		if (!trimmed && !imageBase64) return;
		onSend(trimmed || "What is this?", imageBase64 || undefined);
		setText("");
		setImagePreview(null);
		setImageBase64(null);
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [text, imageBase64, onSend]);

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleInput = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	};

	const removeImage = () => {
		setImagePreview(null);
		setImageBase64(null);
	};

	return (
		<div className="shrink-0 border-t border-subtle bg-surface px-4 pb-[env(safe-area-inset-bottom)] pt-2">
			{/* Image preview */}
			{imagePreview && (
				<div className="mb-2 flex items-start gap-2">
					<div className="relative">
						<img
							src={imagePreview}
							alt="Preview"
							className="h-16 w-16 rounded-[12px] border border-subtle object-cover"
						/>
						<button
							type="button"
							onClick={removeImage}
							className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white"
						>
							×
						</button>
					</div>
				</div>
			)}

			<div className="flex items-end gap-2 pb-2">
				{/* Camera button */}
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={disabled}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-subtle text-lg text-text-secondary transition-colors hover:bg-hover disabled:opacity-50"
				>
					📷
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					capture="environment"
					onChange={handleImageSelect}
					className="hidden"
				/>

				{/* Text input */}
				<textarea
					ref={textareaRef}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					placeholder="Ask about life in Seoul..."
					disabled={disabled}
					rows={1}
					className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-[20px] border border-subtle bg-background px-4 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-text-tertiary focus:border-seoul-blue disabled:opacity-50"
				/>

				{/* Send button */}
				<button
					type="button"
					onClick={handleSend}
					disabled={disabled || (!text.trim() && !imageBase64)}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-seoul-blue text-white shadow-[0_0_24px_rgba(37,99,235,0.3)] transition-all hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-label="Send"
						role="img"
					>
						<path d="M22 2L11 13" />
						<path d="M22 2L15 22L11 13L2 9L22 2Z" />
					</svg>
				</button>
			</div>
		</div>
	);
}
