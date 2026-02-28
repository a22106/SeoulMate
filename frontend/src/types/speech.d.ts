// Web Speech API types for browsers that use vendor prefix
interface Window {
	SpeechRecognition: typeof globalThis.SpeechRecognition;
	webkitSpeechRecognition: typeof globalThis.SpeechRecognition;
}

// Ensure SpeechRecognition is available globally for TypeScript
declare let SpeechRecognition: {
	prototype: SpeechRecognition;
	new (): SpeechRecognition;
};

interface SpeechRecognition extends EventTarget {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onend: (() => void) | null;
	onerror: ((event: Event) => void) | null;
	start(): void;
	stop(): void;
	abort(): void;
}

interface SpeechRecognitionEvent extends Event {
	resultIndex: number;
	results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
	length: number;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	length: number;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	transcript: string;
	confidence: number;
}
