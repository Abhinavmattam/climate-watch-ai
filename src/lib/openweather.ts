export type Geo = { lat: number; lon: number; name?: string; country?: string };
export type CurrentWeather = any;
export type ForecastWeather = any;
export type AQIResponse = any;

const DEFAULT_TIMEOUT_MS = 12000;

function getKey(): string {
	const vite = (import.meta as any).env?.VITE_OPENWEATHER_API_KEY as string | undefined;
	// For Next.js environments (not used in Vite, but kept per requirement)
	const next = (import.meta as any).env?.NEXT_PUBLIC_OPENWEATHER_API_KEY as string | undefined;
	const key = vite || next;
	if (!key) throw new Error('[OW] Missing API key env (VITE_OPENWEATHER_API_KEY or NEXT_PUBLIC_OPENWEATHER_API_KEY)');
	return key;
}

async function fetchJson(url: string, opts?: { retries?: number; timeoutMs?: number; tag?: string }): Promise<any> {
	const retries = opts?.retries ?? 2;
	const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, { signal: controller.signal });
		if (res.status === 429 && retries > 0) {
			const delay = 800 * (3 - retries);
			await new Promise(r => setTimeout(r, delay));
			return fetchJson(url, { retries: retries - 1, timeoutMs, tag: opts?.tag });
		}
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`[OW] ${res.status} ${res.statusText} ${text}`);
		}
		return await res.json();
	} finally {
		clearTimeout(timeout);
	}
}

export async function geocodeCity(city: string): Promise<Geo | null> {
	const key = getKey();
	const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${key}`;
	const arr = await fetchJson(url, { tag: 'geocode' });
	if (Array.isArray(arr) && arr.length) {
		return { lat: arr[0].lat, lon: arr[0].lon, name: arr[0].name, country: arr[0].country };
	}
	return null;
}

export async function getCurrent(lat: number, lon: number): Promise<CurrentWeather> {
	const key = getKey();
	const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
	return fetchJson(url, { tag: 'current' });
}

export async function getForecast(lat: number, lon: number): Promise<ForecastWeather> {
	const key = getKey();
	const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
	return fetchJson(url, { tag: 'forecast' });
}

export async function getAQI(lat: number, lon: number): Promise<AQIResponse> {
	const key = getKey();
	const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
	return fetchJson(url, { tag: 'aqi' });
}

export async function getAQIForecast(lat: number, lon: number): Promise<AQIResponse> {
	const key = getKey();
	const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${key}`;
	return fetchJson(url, { tag: 'aqi-forecast' });
}
