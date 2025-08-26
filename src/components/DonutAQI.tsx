import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export type DonutAQIProps = {
	aqi: number | null;
	category: string | null;
	color: string;
	breakdown?: { pm2_5?: number; pm10?: number; no2?: number; o3?: number; so2?: number };
	updatedAt?: number | null;
};

export function DonutAQI({ aqi, category, color, breakdown, updatedAt }: DonutAQIProps) {
	const hasData = aqi != null && Number.isFinite(aqi);
	const value = hasData ? Math.max(0, Math.min(500, Math.round(aqi!))) : 0;
	const percent = Math.round((value / 500) * 100);
	const data = hasData ? [{ name: 'AQI', value: percent }, { name: 'rest', value: 100 - percent }] : [{ name: 'empty', value: 100 }];

	return (
		<div className="relative w-full h-64">
			<ResponsiveContainer>
				<PieChart>
					<Pie
						data={data}
						innerRadius={70}
						outerRadius={95}
						startAngle={90}
						endAngle={-270}
						dataKey="value"
						isAnimationActive
						stroke="none"
					>
						{data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={hasData ? (index === 0 ? color : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.06)'} />
						))}
					</Pie>
					<Tooltip
						contentStyle={{ backgroundColor: '#0b1220', border: 'none', borderRadius: 8, color: '#e6eef8' }}
						formatter={(v: any, n: any) => {
							if (!hasData) return ['No AQI data', ''];
							if (n === 'AQI') return [`${value} (${category})`, 'AQI'];
							return ['', ''];
						}}
						labelFormatter={() => 'Air Quality'}
					/>
				</PieChart>
			</ResponsiveContainer>
			<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
				{hasData ? (
					<>
						<div className="text-3xl font-bold" style={{ color }}>{value}</div>
						<div className="text-sm text-foreground/80">{category}</div>
						{updatedAt && (
							<div className="text-[10px] text-foreground/60 mt-1">Data from OpenWeather · {new Date(updatedAt).toLocaleTimeString()}</div>
						)}
					</>
				) : (
					<div className="text-sm text-foreground/70">No AQI data available</div>
				)}
			</div>
			{hasData && breakdown && (
				<div className="mt-2 grid grid-cols-3 gap-2 text-xs text-foreground/80">
					<div>PM2.5: {breakdown.pm2_5 ?? '—'}</div>
					<div>PM10: {breakdown.pm10 ?? '—'}</div>
					<div>NO2: {breakdown.no2 ?? '—'}</div>
					<div>O3: {breakdown.o3 ?? '—'}</div>
					<div>SO2: {breakdown.so2 ?? '—'}</div>
				</div>
			)}
		</div>
	);
}
