"use client";

import {
	type KeyboardEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { t } from "@/lib/i18n";

interface ChatInputProps {
	onSend: (message: string, image?: string) => void;
	disabled: boolean;
	language: string;
	enableVoice?: boolean;
}

export default function ChatInput({
	onSend,
	disabled,
	language,
	enableVoice,
}: ChatInputProps) {
	const [text, setText] = useState("");
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageBase64, setImageBase64] = useState<string | null>(null);
	const [listening, setListening] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	// Clean up recognition on unmount
	useEffect(() => {
		return () => {
			recognitionRef.current?.abort();
		};
	}, []);

	const toggleVoice = useCallback(() => {
		if (listening) {
			recognitionRef.current?.stop();
			return;
		}

		const SR =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SR) return;

		const recognition = new SR();
		recognition.lang = "en-US";
		recognition.interimResults = true;
		recognition.continuous = true;

		let finalTranscript = "";

		recognition.onresult = (e: SpeechRecognitionEvent) => {
			let interim = "";
			for (let i = e.resultIndex; i < e.results.length; i++) {
				const transcript = e.results[i][0].transcript;
				if (e.results[i].isFinal) {
					finalTranscript += transcript;
				} else {
					interim += transcript;
				}
			}
			setText(finalTranscript + interim);
		};

		recognition.onend = () => {
			setListening(false);
			recognitionRef.current = null;
		};

		recognition.onerror = () => {
			setListening(false);
			recognitionRef.current = null;
		};

		recognitionRef.current = recognition;
		recognition.start();
		setListening(true);
	}, [listening]);

	const handleImageSelect = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				setImagePreview(result);
				setImageBase64(result.split(",")[1]);
			};
			reader.readAsDataURL(file);
			e.target.value = "";
		},
		[],
	);

	const handleSend = useCallback(() => {
		// Stop voice if active
		if (listening) {
			recognitionRef.current?.stop();
		}
		const trimmed = text.trim();
		if (!trimmed && !imageBase64) return;
		onSend(trimmed || "What is this?", imageBase64 || undefined);
		setText("");
		setImagePreview(null);
		setImageBase64(null);
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}
	}, [text, imageBase64, onSend, listening]);

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
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Camera" role="img">
						<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
						<circle cx="12" cy="13" r="3" />
					</svg>
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
					placeholder={
						listening
							? "Listening..."
							: t(language, "input.placeholder")
					}
					disabled={disabled}
					rows={1}
					className={`max-h-[120px] min-h-[40px] flex-1 resize-none rounded-[20px] border bg-background px-4 py-2.5 text-[15px] text-foreground outline-none transition-colors placeholder:text-text-tertiary focus:border-seoul-blue disabled:opacity-50 ${listening ? "border-hanok-coral" : "border-subtle"}`}
				/>

				{/* Mic button (only on chat pages with enableVoice) */}
				{enableVoice && (
					<button
						type="button"
						onClick={toggleVoice}
						disabled={disabled}
						className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-50 ${
							listening
								? "animate-pulse bg-hanok-coral text-white"
								: "bg-subtle text-text-secondary hover:bg-hover"
						}`}
						aria-label={listening ? "Stop listening" : "Start voice input"}
					>
						{listening ? (
							<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" role="img" aria-label="Stop">
								<rect x="6" y="6" width="12" height="12" rx="2" />
							</svg>
						) : (
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Microphone">
								<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
								<path d="M19 10v2a7 7 0 0 1-14 0v-2" />
								<line x1="12" x2="12" y1="19" y2="22" />
							</svg>
						)}
					</button>
				)}

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
