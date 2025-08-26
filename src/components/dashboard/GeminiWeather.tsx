import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateGeminiContent } from '@/integrations/gemini/client';

type Props = {
  city: string;
};

export const GeminiWeather = ({ city }: Props) => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = (import.meta as any).env?.VITE_OPENWEATHER_API_KEY as string | undefined;
  const resolvedCity = city || 'New York';

  const refresh = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        if (!apiKey) throw new Error('Missing OpenWeather API key');
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(resolvedCity)}&appid=${apiKey}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch weather');
        const data = await res.json();

        const parts = [
          `City: ${resolvedCity}`,
          `Now: ${Math.round(data.main.temp)}°C, ${data.weather?.[0]?.description}`,
          `Humidity: ${data.main.humidity}%`,
          `Wind: ${Math.round((data.wind?.speed || 0) * 3.6)} km/h`,
          `Visibility: ${Math.round((data.visibility || 0) / 1000)} km`,
        ].join('\n');

        const prompt = `Using the live weather snapshot below, provide an accurate short-term forecast and practical guidance for the next 6-12 hours. Keep it under 120 words, plain text, no emojis.\n\n${parts}`;

        const reply = await generateGeminiContent([{ role: 'user', text: prompt }], {
          profile: { city: resolvedCity },
          websiteContext: 'This site provides weather insights; focus on precise, actionable details.',
        });
        setText(reply);
      } catch (e: any) {
        setError(e?.message || 'Failed to load AI forecast');
      } finally {
        setLoading(false);
      }
    };
  }, [apiKey, resolvedCity]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300 mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">AI Forecast for {resolvedCity}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-foreground/70">Loading AI forecast…</div>}
        {error && !loading && (
          <div className="text-sm text-destructive">{error}</div>
        )}
        {!loading && !error && (
          <div className="text-sm whitespace-pre-wrap leading-relaxed">{text}</div>
        )}
      </CardContent>
    </Card>
  );
};
