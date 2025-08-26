export type GeminiMessage = {
	role: 'user' | 'model' | 'system';
	text: string;
};

export type GenerateOptions = {
	profile?: { displayName?: string | null; email?: string | null; country?: string | null; city?: string | null };
	websiteContext?: string;
	includeWebsite?: boolean;
};

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function buildSystemInstruction(profile?: GenerateOptions['profile'], websiteContext?: string, includeWebsite?: boolean): string {
	const name = profile?.displayName || '';
	const city = profile?.city || '';
	const country = profile?.country || '';
	const userLine = [name && `User Name: ${name}`, city && `User City: ${city}`, country && `User Country: ${country}`].filter(Boolean).join(' | ');
	return [
		"You are Climate Watch AI's assistant.",
		"Respond ONLY about: weather reports for the user's location and brief explanations about this website (Climate Watch AI).",
		"Plain text only. Do not use markdown, asterisks, bullets, or emojis.",
		"Keep answers concise and structured with short sentences.",
		userLine ? `Context: ${userLine}.` : '',
		includeWebsite && websiteContext ? (websiteContext) : ''
	].filter(Boolean).join(' ');
}

export async function generateGeminiContent(messages: GeminiMessage[], opts?: GenerateOptions): Promise<string> {
	const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
	if (!apiKey) {
		throw new Error('Missing VITE_GEMINI_API_KEY');
	}

	const systemInstruction = buildSystemInstruction(opts?.profile, opts?.websiteContext, opts?.includeWebsite);
	const lastUser = messages.filter(m => m.role === 'user').map(m => m.text).join('\n');
	const preface = systemInstruction ? `${systemInstruction}\n\n` : '';
	const prompt = preface + lastUser + '\n\nPlain text only. No markdown.';

	const body = {
		contents: [
			{
				parts: [
					{ text: prompt }
				]
			}
		],
		generationConfig: {
			response_mime_type: 'text/plain',
			max_output_tokens: 512
		}
	};

	const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Gemini API error ${res.status}: ${text}`);
	}
	const data = await res.json();
	const candidate = data?.candidates?.[0];
	const parts = candidate?.content?.parts || [];
	const text = parts.map((p: any) => p?.text).filter(Boolean).join('\n').trim();
	return text || 'Sorry, I could not generate a response right now.';
}
