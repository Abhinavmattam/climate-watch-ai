type ChartJSON = {
	city: string;
	temperatureTrend: { day: string; temp: number; forecast: number }[];
	rainfallMonthly: { month: string; rainfall: number }[];
	aqiDistribution: { name: string; value: number; color?: string }[];
	riskByArea: { area: string; flood: number; heat: number; pollution: number }[];
};

function buildSchemaInstruction(city: string, snapshot: string) {
	return `You are generating structured weather analytics JSON strictly in this schema:
{
  "city": string,
  "temperatureTrend": Array<{"day": string, "temp": number, "forecast": number}> length 7 for the next 7 days,
  "rainfallMonthly": Array<{"month": string, "rainfall": number}> length 6 for next 6 months,
  "aqiDistribution": Array<{"name": "Good"|"Moderate"|"Unhealthy"|"Hazardous", "value": number}> values sum to 100,
  "riskByArea": Array<{"area": string, "flood": number, "heat": number, "pollution": number}> length 4.
}
Use current live conditions to keep numbers realistic for ${city}.
IMPORTANT: Output ONLY raw JSON that conforms to the schema. Do not include code fences, comments, or any extra text.`;
}

function tryExtractJson(text: string): string | null {
	if (!text) return null;
	// Trim code fences if present
	const fenced = text.trim().replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
	try {
		JSON.parse(fenced);
		return fenced;
	} catch {}
	// Fallback: find the first '{' and the last '}' and attempt to parse
	const first = text.indexOf('{');
	const last = text.lastIndexOf('}');
	if (first !== -1 && last !== -1 && last > first) {
		const candidate = text.slice(first, last + 1);
		try {
			JSON.parse(candidate);
			return candidate;
		} catch {}
	}
	return null;
}

async function callGeminiJson(prompt: string): Promise<string> {
	const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
	const key = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;
	if (!key) throw new Error('Missing VITE_GEMINI_API_KEY');
	const body = {
		contents: [
			{ parts: [{ text: prompt }] }
		],
		generationConfig: {
			response_mime_type: 'application/json',
			max_output_tokens: 1024
		}
	};
	const r = await fetch(`${endpoint}?key=${encodeURIComponent(key)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!r.ok) {
		const txt = await r.text().catch(() => '');
		throw new Error(`Gemini error ${r.status}: ${txt}`);
	}
	const j = await r.json();
	const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('\n');
	if (!text) throw new Error('Empty Gemini response');
	return text as string;
}

function toInt(n: any, def = 0): number {
	const num = Number(n);
	return Number.isFinite(num) ? Math.round(num) : def;
}

export async function getStructuredWeatherForCity(city: string): Promise<ChartJSON> {
	const apiKey = (import.meta as any).env?.VITE_OPENWEATHER_API_KEY as string | undefined;
	if (!apiKey) throw new Error('Missing OpenWeather API key');
	const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
	const res = await fetch(url);
	if (!res.ok) throw new Error('Failed to fetch weather');
	const data = await res.json();
	const snapshot = [
		`Temp: ${Math.round(data.main.temp)}°C`,
		`Desc: ${data.weather?.[0]?.description}`,
		`Humidity: ${data.main.humidity}%`,
		`Wind: ${Math.round((data.wind?.speed || 0) * 3.6)} km/h`,
	].join(', ');

	const instruction = buildSchemaInstruction(city, snapshot);

	let text = await callGeminiJson(instruction + "\n\nLive snapshot: " + snapshot);
	let jsonString = tryExtractJson(text);
	if (!jsonString) {
		// Retry once with a stronger reminder
		const retryPrompt = instruction + "\n\nRespond with ONLY JSON. Live snapshot: " + snapshot;
		text = await callGeminiJson(retryPrompt);
		jsonString = tryExtractJson(text);
	}
	if (!jsonString) {
		throw new Error('Failed to parse Gemini JSON');
	}
	let parsed: any = {};
	try {
		parsed = JSON.parse(jsonString);
	} catch {
		throw new Error('Failed to parse Gemini JSON');
	}

	// Sanitize and provide safe defaults
	const temperatureTrend = Array.isArray(parsed.temperatureTrend) ? parsed.temperatureTrend.slice(0, 7).map((d: any) => ({
		day: String(d?.day ?? ''),
		temp: toInt(d?.temp),
		forecast: toInt(d?.forecast)
	})) : [];

	const rainfallMonthly = Array.isArray(parsed.rainfallMonthly) ? parsed.rainfallMonthly.slice(0, 6).map((d: any) => ({
		month: String(d?.month ?? ''),
		rainfall: toInt(d?.rainfall)
	})) : [];

	const aqiDistributionRaw = Array.isArray(parsed.aqiDistribution) ? parsed.aqiDistribution.map((d: any) => ({
		name: String(d?.name ?? ''),
		value: toInt(d?.value)
	})) : [];
	// Normalize AQI values to sum to 100 if non-zero
	const sum = aqiDistributionRaw.reduce((s, x) => s + (Number.isFinite(x.value) ? x.value : 0), 0);
	const aqiDistribution = sum > 0 ? aqiDistributionRaw.map(x => ({ ...x, value: Math.max(0, Math.round((x.value / sum) * 100)) })) : aqiDistributionRaw;

	const riskByArea = Array.isArray(parsed.riskByArea) ? parsed.riskByArea.slice(0, 4).map((d: any) => ({
		area: String(d?.area ?? ''),
		flood: toInt(d?.flood),
		heat: toInt(d?.heat),
		pollution: toInt(d?.pollution)
	})) : [];

	return {
		city: typeof parsed.city === 'string' && parsed.city.trim() ? parsed.city : city,
		temperatureTrend,
		rainfallMonthly,
		aqiDistribution,
		riskByArea,
	};
}
