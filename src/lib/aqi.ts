export type AQIComponents = { pm2_5?: number; pm10?: number; no2?: number; o3?: number; so2?: number };
export type AQIBreakdown = { pm25AQI?: number; pm10AQI?: number; no2AQI?: number; o3AQI?: number; so2AQI?: number };

export function clamp(v: number, min = 0, max = 500) { return Math.max(min, Math.min(max, v)); }

// EPA breakpoints for PM2.5 (µg/m3)
const PM25_BREAKS = [
	{ CpLo: 0.0, CpHi: 12.0, Il: 0, Ih: 50 },
	{ CpLo: 12.1, CpHi: 35.4, Il: 51, Ih: 100 },
	{ CpLo: 35.5, CpHi: 55.4, Il: 101, Ih: 150 },
	{ CpLo: 55.5, CpHi: 150.4, Il: 151, Ih: 200 },
	{ CpLo: 150.5, CpHi: 250.4, Il: 201, Ih: 300 },
	{ CpLo: 250.5, CpHi: 350.4, Il: 301, Ih: 400 },
	{ CpLo: 350.5, CpHi: 500.4, Il: 401, Ih: 500 },
];

// EPA breakpoints for PM10 (µg/m3)
const PM10_BREAKS = [
	{ CpLo: 0, CpHi: 54, Il: 0, Ih: 50 },
	{ CpLo: 55, CpHi: 154, Il: 51, Ih: 100 },
	{ CpLo: 155, CpHi: 254, Il: 101, Ih: 150 },
	{ CpLo: 255, CpHi: 354, Il: 151, Ih: 200 },
	{ CpLo: 355, CpHi: 424, Il: 201, Ih: 300 },
	{ CpLo: 425, CpHi: 504, Il: 301, Ih: 400 },
	{ CpLo: 505, CpHi: 604, Il: 401, Ih: 500 },
];

function piecewiseAQI(Cp: number, breaks: { CpLo: number; CpHi: number; Il: number; Ih: number }[]): number | undefined {
	for (const b of breaks) {
		if (Cp >= b.CpLo && Cp <= b.CpHi) {
			const aqi = ((b.Ih - b.Il) / (b.CpHi - b.CpLo)) * (Cp - b.CpLo) + b.Il;
			return Math.round(aqi);
		}
	}
	return undefined;
}

export function pmToAQI(pmValue: number, type: 'pm25' | 'pm10'): number | undefined {
	if (pmValue == null || !Number.isFinite(pmValue)) return undefined;
	return type === 'pm25' ? piecewiseAQI(pmValue, PM25_BREAKS) : piecewiseAQI(pmValue, PM10_BREAKS);
}

export function componentsToAQI(components: AQIComponents): { aqi: number; dominant: string; breakdown: AQIBreakdown } {
	const pm25AQI = components.pm2_5 != null ? pmToAQI(components.pm2_5!, 'pm25') : undefined;
	const pm10AQI = components.pm10 != null ? pmToAQI(components.pm10!, 'pm10') : undefined;
	// Basic mapping for gases if needed (approximate to 0-200 linear scaling when present)
	const no2AQI = components.no2 != null ? clamp(Math.round((components.no2! / 200) * 200), 0, 200) : undefined;
	const o3AQI = components.o3 != null ? clamp(Math.round((components.o3! / 200) * 200), 0, 200) : undefined;
	const so2AQI = components.so2 != null ? clamp(Math.round((components.so2! / 200) * 200), 0, 200) : undefined;
	const list = [
		{ key: 'pm2_5', v: pm25AQI },
		{ key: 'pm10', v: pm10AQI },
		{ key: 'no2', v: no2AQI },
		{ key: 'o3', v: o3AQI },
		{ key: 'so2', v: so2AQI },
	].filter(x => typeof x.v === 'number') as { key: string; v: number }[];
	if (list.length === 0) {
		return { aqi: 0, dominant: 'unknown', breakdown: {} };
	}
	const dominantEntry = list.reduce((a, b) => (b.v > a.v ? b : a));
	const aqi = clamp(dominantEntry.v, 0, 500);
	const breakdown: AQIBreakdown = { pm25AQI, pm10AQI, no2AQI, o3AQI, so2AQI };
	return { aqi, dominant: dominantEntry.key, breakdown };
}

export function mapAQIToCategory(aqi: number): { category: string; color: string } {
	if (aqi <= 50) return { category: 'Good', color: '#16a34a' };
	if (aqi <= 100) return { category: 'Moderate', color: '#eab308' };
	if (aqi <= 150) return { category: 'Unhealthy Sensitive', color: '#f97316' };
	if (aqi <= 200) return { category: 'Unhealthy', color: '#ef4444' };
	if (aqi <= 300) return { category: 'Very Unhealthy', color: '#9f1239' };
	return { category: 'Hazardous', color: '#7e0221' };
}

// Example tests (commented):
// console.log('pm2.5 10 =>', pmToAQI(10, 'pm25')); // ~ 40
// console.log('pm10 80 =>', pmToAQI(80, 'pm10')); // ~ 80-90
