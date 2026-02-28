const WS_URL = `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
	.replace("http://", "ws://")
	.replace("https://", "wss://")}/api/voice`;

export type VoiceState = "idle" | "connecting" | "active" | "error";

interface VoiceSessionCallbacks {
	onStateChange: (state: VoiceState) => void;
	onTurnComplete?: () => void;
}

export function createVoiceSession(
	language: string,
	{ onStateChange, onTurnComplete }: VoiceSessionCallbacks,
) {
	let ws: WebSocket | null = null;
	let audioCtx: AudioContext | null = null;
	let mediaStream: MediaStream | null = null;
	let processor: ScriptProcessorNode | null = null;
	let playbackCtx: AudioContext | null = null;
	let nextPlayTime = 0;

	function playAudioChunk(pcmData: ArrayBuffer) {
		if (!playbackCtx) {
			playbackCtx = new AudioContext({ sampleRate: 24000 });
			nextPlayTime = playbackCtx.currentTime;
		}

		const int16 = new Int16Array(pcmData);
		const float32 = new Float32Array(int16.length);
		for (let i = 0; i < int16.length; i++) {
			float32[i] = int16[i] / 32768;
		}

		const buffer = playbackCtx.createBuffer(1, float32.length, 24000);
		buffer.copyToChannel(float32, 0);

		const source = playbackCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(playbackCtx.destination);

		const now = playbackCtx.currentTime;
		if (nextPlayTime < now) nextPlayTime = now;
		source.start(nextPlayTime);
		nextPlayTime += buffer.duration;
	}

	async function start() {
		onStateChange("connecting");

		try {
			mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					sampleRate: 16000,
					channelCount: 1,
					echoCancellation: true,
					noiseSuppression: true,
				},
			});

			audioCtx = new AudioContext({ sampleRate: 16000 });
			const source = audioCtx.createMediaStreamSource(mediaStream);
			processor = audioCtx.createScriptProcessor(4096, 1, 1);

			ws = new WebSocket(`${WS_URL}?language=${encodeURIComponent(language)}`);
			ws.binaryType = "arraybuffer";

			ws.onopen = () => {
				onStateChange("active");
				if (!processor || !audioCtx) return;

				processor.onaudioprocess = (e) => {
					if (ws?.readyState !== WebSocket.OPEN) return;
					const float32 = e.inputBuffer.getChannelData(0);
					const int16 = new Int16Array(float32.length);
					for (let i = 0; i < float32.length; i++) {
						const s = Math.max(-1, Math.min(1, float32[i]));
						int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
					}
					ws.send(int16.buffer);
				};

				source.connect(processor);
				processor.connect(audioCtx.destination);
			};

			ws.onmessage = (event) => {
				if (typeof event.data === "string") {
					if (event.data === "TURN_COMPLETE") {
						onTurnComplete?.();
					}
				} else {
					playAudioChunk(event.data);
				}
			};

			ws.onerror = () => {
				onStateChange("error");
				stop();
			};

			ws.onclose = () => {
				onStateChange("idle");
			};
		} catch {
			onStateChange("error");
			stop();
		}
	}

	function stop() {
		processor?.disconnect();
		processor = null;

		if (mediaStream) {
			for (const track of mediaStream.getTracks()) track.stop();
			mediaStream = null;
		}

		audioCtx?.close();
		audioCtx = null;

		playbackCtx?.close();
		playbackCtx = null;
		nextPlayTime = 0;

		if (ws && ws.readyState <= WebSocket.OPEN) {
			ws.close();
		}
		ws = null;

		onStateChange("idle");
	}

	return { start, stop };
}
