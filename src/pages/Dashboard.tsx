import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { WeatherCard } from '@/components/dashboard/WeatherCard';
import { GeminiWeather } from '@/components/dashboard/GeminiWeather';
import { ClimateCharts } from '@/components/dashboard/ClimateCharts';
import { ClimateAlert } from '@/components/alerts/ClimateAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';
import { getUserProfile, UserProfile } from '@/integrations/firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { Chatbot } from '@/components/dashboard/Chatbot';
import { useClimateData } from '@/hooks/useClimateData';
import { toRiskLabel } from '@/lib/risk';
import { AlertModal } from '@/components/AlertModal';
import { RefreshButton } from '@/components/RefreshButton';

export const Dashboard = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [city, setCity] = useState<string>('New York');
  const { user } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
      if (profile?.city) {
        setCity(profile.city);
      }
    };
    loadProfile();
  }, [user]);

  const climate = useClimateData(city);

  const kpis = climate.kpis;
  const riskMetrics = [
    {
      title: 'Flood Risk',
      value: kpis.flood,
      status: toRiskLabel(kpis.flood).toLowerCase(),
      trend: '',
      icon: '🌊'
    },
    {
      title: 'Heat Index',
      value: kpis.heatIndex,
      status: kpis.heatIndex >= 40 ? 'high' : kpis.heatIndex >= 32 ? 'moderate' : 'low',
      trend: '',
      icon: '☀️'
    },
    {
      title: 'Air Quality',
      value: kpis.aqi,
      status: kpis.aqi >= 70 ? 'high' : kpis.aqi >= 40 ? 'moderate' : 'good',
      trend: '',
      icon: '🌫️'
    },
    {
      title: 'Storm Risk',
      value: kpis.storm,
      status: toRiskLabel(kpis.storm).toLowerCase(),
      trend: '',
      icon: '⛈️'
    }
  ];

  const hasHigh = useMemo(() => kpis.flood >= 70 || kpis.heatIndex >= 40 || kpis.aqi >= 70, [kpis]);

  useEffect(() => {
    if (!hasHigh) return;
    const key = `alert-seen-${city}-${new Date().toDateString()}`;
    const seen = localStorage.getItem(key);
    if (!seen) {
      setShowAlert(true);
      localStorage.setItem(key, '1');
    }
  }, [hasHigh, city]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-destructive';
      case 'moderate': return 'text-accent';
      case 'good': return 'text-success';
      case 'low': return 'text-primary';
      default: return 'text-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      case 'good': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleNotificationClick = () => {
    setShowAlert(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header hasNotification={hasHigh} onNotificationClick={handleNotificationClick} />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Dashboard Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Climate Risk Dashboard
              </h1>
              <p className="text-foreground/70 text-lg">
                Real-time monitoring and AI-powered predictions for your area
              </p>
            </div>
            <RefreshButton onClick={climate.refetch} updatedAt={climate.updatedAt} loading={climate.isLoading} />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {riskMetrics.map((metric) => (
              <Card key={metric.title} className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl">{metric.icon}</div>
                    <Badge variant={getStatusBadge(metric.status)} className="capitalize">
                      {metric.status}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{metric.title}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                        {metric.trend}
                      </span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, metric.value))} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weather Card */}
            <div className="lg:col-span-1">
              <WeatherCard city={city} />
              <GeminiWeather city={city} />
              
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6"
              >
                <Card className="glass-card border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Model Accuracy</span>
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">95.2%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Freshness</span>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{climate.updatedAt ? new Date(climate.updatedAt).toLocaleTimeString() : '—'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alert System</span>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">{hasHigh ? 'Active' : 'Normal'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="lg:col-span-2">
              <ClimateCharts 
                city={city}
                temp7={climate.daily7}
                rainfallMonthly={climate.rainfallMonthly}
                aqiSeries={climate.aqiSeries}
                areaRisks={climate.areaRisks}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Climate Alert Modal */}
      <AlertModal
        open={showAlert}
        onClose={() => setShowAlert(false)}
        title={hasHigh ? '⚠️ High Risk Detected' : 'Notice'}
        message={hasHigh ? 'High risk conditions detected (heat, flood, or air quality). Please take precautions.' : 'All systems normal.'}
      />

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
};