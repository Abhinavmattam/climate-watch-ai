import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geocodeCity, getAQI, getAQIForecast, getCurrent, getForecast } from '@/lib/openweather';
import { calcFloodRisk, calcHeatIndexC, calcStormRisk, clamp } from '@/lib/risk';

export type KPISet = { flood: number; heatIndex: number; aqi: number; storm: number };
export type TempPoint = { label: string; value: number };
export type SeriesPoint = { label: string; value: number };
export type AreaRisk = { area: string; flood: number; heat: number; pollution: number };
export type AQIBucket = { name: string; value: number; color: string };

export function useClimateData(city: string) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [updatedAt, setUpdatedAt] = useState<number | null>(null);

	const [current, setCurrent] = useState<any | null>(null);
	const [daily7, setDaily7] = useState<TempPoint[]>([]);
	const [rainfallMonthly, setRainfallMonthly] = useState<SeriesPoint[]>([]);
	const [aqiSeries, setAqiSeries] = useState<SeriesPoint[]>([]);
	const [aqiDistribution, setAqiDistribution] = useState<AQIBucket[]>([]);
	const [areaRisks, setAreaRisks] = useState<AreaRisk[]>([]);
	const [kpis, setKpis] = useState<KPISet>({ flood: 0, heatIndex: 0, aqi: 0, storm: 0 });

	const running = useRef(false);

	const load = useCallback(async () => {
		if (running.current) return;
		running.current = true;
		setIsLoading(true);
		setError(null);
		try {
			if (!city) throw new Error('No city provided');
			const geo = await geocodeCity(city);
			console.log('[CLIMATE] geocode', city, geo);
			if (!geo) throw new Error('City not found');

			const [cur, fc, aqiNow, aqiFc] = await Promise.all([
				getCurrent(geo.lat, geo.lon),
				getForecast(geo.lat, geo.lon),
				getAQI(geo.lat, geo.lon),
				getAQIForecast(geo.lat, geo.lon),
			]);
			console.log('[CLIMATE] current', cur);
			console.log('[CLIMATE] forecast len', fc.list?.length);

			// Current
			setCurrent(cur);

			// 7-day temperature from 3h buckets -> daily average
			const byDay = new Map<string, number[]>();
			for (const item of fc.list || []) {
				const dt = new Date(item.dt * 1000);
				const day = dt.toLocaleDateString(undefined, { weekday: 'short' });
				const arr = byDay.get(day) || [];
				arr.push(item.main?.temp);
				byDay.set(day, arr);
			}
			const temp7: TempPoint[] = Array.from(byDay.entries()).slice(0, 7).map(([day, temps]) => ({
				label: day,
				value: Math.round(temps.reduce((a, b) => a + b, 0) / Math.max(1, temps.length)),
			}));
			setDaily7(temp7);

			// Rainfall weekly bins from forecast rain.3h
			const rainList = (fc.list || []).map((x: any) => x.rain?.['3h'] || 0);
			const weeks = 4;
			const perWeek = Array.from({ length: weeks }, () => 0);
			for (let i = 0; i < rainList.length; i++) perWeek[i % weeks] += rainList[i];
			const rainSeries: SeriesPoint[] = perWeek.map((v, i) => ({ label: `Week ${i + 1}`, value: Math.round(v) }));
			setRainfallMonthly(rainSeries);

			// AQI series next ~48h and distribution buckets
			const aqiPoints: SeriesPoint[] = (aqiFc.list || []).slice(0, 16).map((x: any) => ({
				label: new Date(x.dt * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
				value: clamp(Math.round(((x.main?.aqi || 1) - 1) * 25), 0, 100),
			}));
			setAqiSeries(aqiPoints);
			// Distribution by OpenWeather AQI 1..5 mapped
			const distCounts = [0, 0, 0, 0, 0];
			for (const x of (aqiFc.list || []).slice(0, 24)) {
				const idx = Math.max(1, Math.min(5, x.main?.aqi || 1)) - 1;
				distCounts[idx] += 1;
			}
			const distTotal = distCounts.reduce((a, b) => a + b, 0) || 1;
			const mapping = [
				{ name: 'Good', color: '#10B981' },
				{ name: 'Moderate', color: '#F59E0B' },
				{ name: 'Unhealthy', color: '#EF4444' },
				{ name: 'Very Unhealthy', color: '#7C2D12' },
				{ name: 'Hazardous', color: '#6B21A8' },
			];
			const dist = mapping.map((m, i) => ({ name: m.name, value: Math.round((distCounts[i] / distTotal) * 100), color: m.color }));
			setAqiDistribution(dist);

			// KPIs
			const { hiC } = calcHeatIndexC(cur.main?.temp ?? 0, cur.main?.humidity ?? 0);
			const popAvg = ((fc.list || []).slice(0, 8).reduce((a: number, b: any) => a + (b.pop || 0), 0) / Math.max(1, Math.min(8, (fc.list || []).length))) || 0;
			const mm24hPast = (fc.list || []).slice(0, 8).reduce((a: number, b: any) => a + (b.rain?.['3h'] || 0), 0);
			const mm24hNext = (fc.list || []).slice(8, 16).reduce((a: number, b: any) => a + (b.rain?.['3h'] || 0), 0);
			const floodObj = calcFloodRisk({ past24h_mm: mm24hPast, next24h_mm: mm24hNext, popAvg, humidity: cur.main?.humidity ?? 0 });
			const storm = clamp(calcStormRisk(cur.wind?.speed || 0, cur.wind?.gust), 0, 100);
			const aqiScaled = clamp(Math.round(((aqiNow.list?.[0]?.main?.aqi || 1) - 1) * 25), 0, 100);
			setKpis({ flood: floodObj.risk, heatIndex: hiC, aqi: aqiScaled, storm });

			// Area risks
			const base = floodObj.risk;
			const wards = 5;
			const areas: AreaRisk[] = Array.from({ length: wards }, (_, i) => ({
				area: `Ward ${String.fromCharCode(65 + i)}`,
				flood: clamp(Math.round(base + (Math.random() * 14 - 7)), 0, 100),
				heat: clamp(Math.round(hiC + (Math.random() * 10 - 5)), 0, 100),
				pollution: clamp(Math.round(aqiScaled + (Math.random() * 10 - 5)), 0, 100),
			}));
			setAreaRisks(areas);

			setUpdatedAt(Date.now());
			console.log('[CLIMATE] temp7', temp7);
			console.log('[CLIMATE] rainfall', rainSeries);
			console.log('[CLIMATE] aqiSeries', aqiPoints);
			console.log('[CLIMATE] aqiDistribution', dist);
			console.log('[CLIMATE] KPIs', { flood: floodObj.risk, heatIndex: hiC, aqi: aqiScaled, storm });
			console.log('[CLIMATE] areaRisks', areas);
		} catch (e: any) {
			console.error('[CLIMATE] error', e);
			setError(e?.message || 'Failed to load climate data');
		} finally {
			setIsLoading(false);
			running.current = false;
		}
	}, [city]);

	useEffect(() => {
		load();
		const id = setInterval(load, 10 * 60 * 1000);
		const onFocus = () => load();
		window.addEventListener('focus', onFocus);
		return () => { clearInterval(id); window.removeEventListener('focus', onFocus); };
	}, [load]);

	const refetch = useCallback(() => load(), [load]);

	return { current, daily7, rainfallMonthly, aqiSeries, aqiDistribution, areaRisks, kpis, updatedAt, error, isLoading, refetch };
}
