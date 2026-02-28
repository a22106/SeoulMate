const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
	role: "user" | "assistant";
	text: string;
	image?: string;
}

interface ChatRequest {
	message: string;
	image?: string;
	language: string;
	history: ChatMessage[];
}

export async function sendChatMessage(
	req: ChatRequest,
	onChunk: (text: string) => void,
	onDone: () => void,
	onError: (err: Error) => void,
) {
	try {
		const res = await fetch(`${API_URL}/api/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(req),
		});

		if (!res.ok) {
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
		onError(err instanceof Error ? err : new Error(String(err)));
	}
}
