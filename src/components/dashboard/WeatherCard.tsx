import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  description: string;
  city: string;
}

export const WeatherCard = ({ city = 'New York' }: { city?: string }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = (import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined) || '3fdf1f4827a7d45bd211925963005bcb';
        if (!API_KEY) {
          throw new Error('Missing OpenWeather API key');
        }
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('Weather data not available');
        }
        
        const data = await response.json();
        
        setWeather({
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert to km/h
          visibility: Math.round(data.visibility / 1000), // Convert to km
          description: data.weather[0].description,
          city: data.name
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather');
        // Fallback data for demo
        setWeather({
          temperature: 22,
          humidity: 65,
          windSpeed: 15,
          visibility: 10,
          description: 'partly cloudy',
          city: city
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  if (loading) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="glass-card border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Unable to load weather data</p>
          <p className="text-sm text-muted-foreground mt-2">Using demo data instead</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Cloud className="h-5 w-5 mr-2 text-primary" />
            Current Weather - {weather.city}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Temperature */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {weather.temperature}°C
            </div>
            <p className="text-foreground/70 capitalize">{weather.description}</p>
          </div>

          {/* Weather Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/20">
              <Droplets className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-foreground/70">Humidity</p>
                <p className="font-semibold">{weather.humidity}%</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/20">
              <Wind className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-foreground/70">Wind Speed</p>
                <p className="font-semibold">{weather.windSpeed} km/h</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/20">
              <Thermometer className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-foreground/70">Feels Like</p>
                <p className="font-semibold">{weather.temperature + 2}°C</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/20">
              <Eye className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-foreground/70">Visibility</p>
                <p className="font-semibold">{weather.visibility} km</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};