import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateGeminiContent } from '@/integrations/gemini/client';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, UserProfile } from '@/integrations/firebase/auth';
import { geocodeCity, getAQI, getAQIForecast, getCurrent, getForecast } from '@/lib/openweather';

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const p = await getUserProfile(user.uid);
      setProfile(p);
    };
    load();
  }, [user]);

  const websiteContext = useMemo(() => (
    'Climate Watch AI: Overview\n\nClimate Watch AI delivers weather and climate information. It provides real-time reports and risk alerts. It also offers insights for your location. The goal is to keep you safe and informed.'
  ), []);

  function extractCity(q: string): string | null {
    const lower = q.toLowerCase();
    if (lower.includes('website') || lower.includes('about')) return null;
    const m = q.match(/(?:in|at|for|of)?\s*([A-Za-z][A-Za-z\s\-]{2,})\s*(?:weather|forecast)?/i);
    if (m) return m[1].trim();
    return null;
  }

  async function fetchCityWeather(city: string) {
    const geo = await geocodeCity(city);
    if (!geo) throw new Error('City not found');
    const [cur, fc, aqiNow, aqiFc] = await Promise.all([
      getCurrent(geo.lat, geo.lon),
      getForecast(geo.lat, geo.lon),
      getAQI(geo.lat, geo.lon),
      getAQIForecast(geo.lat, geo.lon),
    ]);
    const next24h_mm = (fc.list || []).slice(0, 8).reduce((a: number, b: any) => a + (b.rain?.['3h'] || 0), 0);
    const popAvg = ((fc.list || []).slice(0, 8).reduce((a: number, b: any) => a + (b.pop || 0), 0) / Math.max(1, Math.min(8, (fc.list || []).length))) || 0;
    const aqi = aqiNow.list?.[0]?.main?.aqi || 1;
    return { city: geo.name || city, current: cur, forecast: fc, aqi, next24h_mm, popAvg };
  }

  const send = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    try {
      const lower = userText.toLowerCase();
      const asksWebsite = lower.includes('website') || lower.includes('about');

      if (asksWebsite) {
        const reply = await generateGeminiContent([{ role: 'user', text: 'Explain the website briefly.' }], {
          includeWebsite: true,
          websiteContext,
        });
        setMessages(prev => [...prev, { role: 'model', text: reply }]);
        return;
      }

      // Determine city for weather
      let city = extractCity(userText);
      if (!city) city = profile?.city || null;
      if (!city) {
        setMessages(prev => [...prev, { role: 'model', text: 'Please tell me the city (e.g., "Mumbai weather").' }]);
        return;
      }

      if (cacheRef.current.has(city)) {
        setMessages(prev => [...prev, { role: 'model', text: cacheRef.current.get(city)! }]);
        return;
      }

      const data = await fetchCityWeather(city);
      const prompt = `Provide a concise 6–12 hour advisory. City: ${data.city}. Current: temp ${Math.round(data.current.main?.temp)}°C, ${data.current.weather?.[0]?.description}, humidity ${data.current.main?.humidity}%. Next24h rain: ${Math.round(data.next24h_mm)} mm. Precip prob avg: ${Math.round(data.popAvg*100)}%. AQI index: ${data.aqi} (1-good, 5-hazardous). Give actionable advice and safety tips if needed. Plain text only.`;

      let reply = '';
      try {
        reply = await generateGeminiContent([{ role: 'user', text: prompt }], {
          includeWebsite: false,
        });
      } catch (e: any) {
        reply = `For ${data.city}: ${Math.round(data.current.main?.temp)}°C, ${data.current.weather?.[0]?.description}. Humidity ${data.current.main?.humidity}%. Next 24h rain ≈ ${Math.round(data.next24h_mm)} mm. AQI ${data.aqi}. Stay hydrated and plan for possible rain.`;
      }
      cacheRef.current.set(city, reply);
      setMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'model', text: e?.message || 'Failed to get response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!open && (
        <Button className="fixed bottom-6 right-6 bg-gradient-primary" size="lg" onClick={() => setOpen(true)}>
          <MessageCircle className="h-5 w-5 mr-2" /> Ask Climate Watch AI
        </Button>
      )}

      {open && (
        <Card className="fixed bottom-6 right-6 w-96 max-w-[95vw] glass-card border-border/50 p-3">
          <div className="flex items-center justify-between pb-2">
            <div className="font-semibold">Climate Watch Assistant</div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="h-64 overflow-y-auto space-y-3 pr-1">
            {messages.length === 0 && (
              <div className="text-sm text-foreground/70">Ask about weather for any city (e.g., "Hyderabad weather", "Mumbai forecast") or ask about the website.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
                <div className={`inline-block rounded-lg px-3 py-2 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background/30'}`}>
                  <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-foreground/70">Thinking…</div>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Ask about weather or the site…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            />
            <Button onClick={send} disabled={loading}>Send</Button>
          </div>
        </Card>
      )}
    </div>
  );
};
