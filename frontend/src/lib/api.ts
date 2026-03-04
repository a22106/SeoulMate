const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
	role: "user" | "assistant";
	text: string;
	image?: string;
	file_url?: string;
	file_mime_type?: string;
	file_name?: string;
}

interface ChatRequest {
	message: string;
	image?: string;
	file_url?: string;
	file_mime_type?: string;
	language: string;
	history: ChatMessage[];
	conversation_id?: string;
}

export interface UploadResponse {
	file_url: string;
	mime_type: string;
	original_name: string;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append("file", file);
	const res = await fetch(`${API_URL}/api/upload`, {
		method: "POST",
		body: formData,
	});
	if (!res.ok) {
		const detail = await res.text();
		throw new Error(detail || `Upload failed: ${res.status}`);
	}
	return res.json();
}

export interface ConversationResponse {
	id: string;
	language: string;
	created_at: string;
	updated_at: string;
}

export interface MessageResponse {
	id: string;
	conversation_id: string;
	role: "user" | "assistant";
	text: string;
	image_included: boolean;
	created_at: string;
}

export interface ConversationDetail {
	conversation: ConversationResponse;
	messages: MessageResponse[];
}

export interface ConversationListItem {
	id: string;
	language: string;
	preview: string | null;
	created_at: string;
	updated_at: string;
}

export async function listConversations(): Promise<ConversationListItem[]> {
	const res = await fetch(`${API_URL}/api/conversations`);
	if (!res.ok) throw new Error(`API error: ${res.status}`);
	return res.json();
}

export async function createConversation(
	language: string,
): Promise<ConversationResponse> {
	const res = await fetch(`${API_URL}/api/conversations`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ language }),
	});
	if (!res.ok) throw new Error(`API error: ${res.status}`);
	return res.json();
}

export async function getConversation(id: string): Promise<ConversationDetail> {
	const res = await fetch(`${API_URL}/api/conversations/${id}`);
	if (!res.ok) {
		if (res.status === 404) throw new Error("NOT_FOUND");
		throw new Error(`API error: ${res.status}`);
	}
	return res.json();
}

export async function sendChatMessage(
	req: ChatRequest,
	onChunk: (text: string) => void,
	onDone: () => void,
	onError: (err: Error) => void,
	signal?: AbortSignal,
) {
	try {
		const res = await fetch(`${API_URL}/api/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(req),
			signal,
		});

		if (!res.ok) {
			if (res.status === 429) {
				const body = await res.json().catch(() => null);
				throw new Error(
					body?.detail ||
						"Daily question limit reached. Please try again tomorrow.",
				);
			}
			throw new Error(`API error: ${res.status}`);
		}

		const reader = res.body?.getReader();
		if (!reader) throw new Error("No response body");

		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() || "";

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed.startsWith("data: ")) continue;
				const data = trimmed.slice(6);
				if (data === "[DONE]") {
					onDone();
					return;
				}
				try {
					const parsed = JSON.parse(data);
					if (parsed.content) {
						onChunk(parsed.content);
					}
				} catch {
					// skip malformed chunks
				}
			}
		}
		onDone();
	} catch (err) {
		if (err instanceof DOMException && err.name === "AbortError") {
			onDone();
			return;
		}
		onError(err instanceof Error ? err : new Error(String(err)));
	}
}
