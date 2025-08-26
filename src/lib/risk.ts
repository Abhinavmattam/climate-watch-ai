export function clamp(v: number, min = 0, max = 100) { return Math.max(min, Math.min(max, v)); }

export function calcHeatIndexC(Tc: number, rh: number): { hiC: number; label: 'Normal' | 'Alert' | 'Danger' } {
	// Convert to Fahrenheit for NOAA formula
	const T = (Tc * 9) / 5 + 32;
	const R = clamp(rh, 0, 100);
	let HI = -42.379 + 2.04901523 * T + 10.14333127 * R - 0.22475541 * T * R - 0.00683783 * T * T - 0.05481717 * R * R + 0.00122874 * T * T * R + 0.00085282 * T * R * R - 0.00000199 * T * T * R * R;
	if (R < 13 && T >= 80 && T <= 112) HI -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
	if (R > 85 && T >= 80 && T <= 87) HI += ((R - 85) / 10) * ((87 - T) / 5);
	const c = ((HI - 32) * 5) / 9;
	const hiC = Math.round(clamp(Math.max(Tc, c), -20, 70));
	const label: 'Normal' | 'Alert' | 'Danger' = hiC >= 40 ? 'Danger' : hiC >= 32 ? 'Alert' : 'Normal';
	return { hiC, label };
}

export function calcFloodRisk(
	{ past24h_mm = 0, next24h_mm = 0, popAvg = 0, humidity = 0 }: { past24h_mm?: number; next24h_mm?: number; popAvg?: number; humidity?: number },
	opts: { rainThreshold?: number } = {}
): { risk: number; label: 'Low' | 'Moderate' | 'High'; parts: { rainScore: number; popScore: number; soilScore: number } } {
	const rainThreshold = opts.rainThreshold ?? 100;
	const rainScore = clamp(((past24h_mm + next24h_mm) / rainThreshold) * 60, 0, 60);
	const popScore = clamp(popAvg * 40, 0, 40);
	const soilScore = clamp(((humidity - 50) / 50) * 10, 0, 10);
	const risk = Math.round(clamp(rainScore + popScore + soilScore, 0, 100));
	const label: 'Low' | 'Moderate' | 'High' = risk >= 70 ? 'High' : risk >= 40 ? 'Moderate' : 'Low';
	// Debug log
	console.log('[RISK] calcFloodRisk', { past24h_mm, next24h_mm, popAvg, humidity, rainScore, popScore, soilScore, risk });
	return { risk, label, parts: { rainScore, popScore, soilScore } };
}

export function calcStormRisk(wind: number, gust?: number): number {
	const risk = clamp(Math.round((wind * 1.5) + ((gust || wind) * 3)), 0, 100);
	return risk;
}

export function toRiskLabel(v: number): 'Low' | 'Moderate' | 'High' {
	if (v >= 70) return 'High';
	if (v >= 40) return 'Moderate';
	return 'Low';
}
