import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Target, Globe } from 'lucide-react';

// Sample data for long-term trends
const temperatureTrend = [
  { year: '2020', temp: 14.8, projection: 14.9 },
  { year: '2021', temp: 15.1, projection: 15.2 },
  { year: '2022', temp: 15.3, projection: 15.4 },
  { year: '2023', temp: 15.6, projection: 15.7 },
  { year: '2024', temp: 15.8, projection: 15.9 },
  { year: '2025', temp: null, projection: 16.1 },
  { year: '2026', temp: null, projection: 16.4 },
  { year: '2027', temp: null, projection: 16.7 },
  { year: '2028', temp: null, projection: 17.0 },
  { year: '2029', temp: null, projection: 17.3 },
  { year: '2030', temp: null, projection: 17.6 },
];

const extremeEvents = [
  { year: '2020', heatwaves: 12, floods: 8, storms: 15 },
  { year: '2021', heatwaves: 15, floods: 10, storms: 18 },
  { year: '2022', heatwaves: 18, floods: 12, storms: 20 },
  { year: '2023', heatwaves: 22, floods: 15, storms: 25 },
  { year: '2024', heatwaves: 26, floods: 18, storms: 28 },
  { year: '2025', heatwaves: 30, floods: 22, storms: 32 },
  { year: '2026', heatwaves: 35, floods: 26, storms: 36 },
  { year: '2027', heatwaves: 40, floods: 30, storms: 40 },
  { year: '2028', heatwaves: 45, floods: 35, storms: 45 },
  { year: '2029', heatwaves: 50, floods: 40, storms: 50 },
  { year: '2030', heatwaves: 55, floods: 45, storms: 55 },
];

const sdgImpacts = [
  {
    goal: 'SDG 3: Good Health',
    impact: 'High',
    description: 'Climate change affects air quality and disease patterns',
    trend: 'Worsening',
    icon: '🏥'
  },
  {
    goal: 'SDG 11: Sustainable Cities',
    impact: 'Critical',
    description: 'Urban areas face increased flooding and heat island effects',
    trend: 'Critical',
    icon: '🏙️'
  },
  {
    goal: 'SDG 13: Climate Action',
    impact: 'High',
    description: 'Urgent action needed to reduce greenhouse gas emissions',
    trend: 'Improving',
    icon: '🌱'
  }
];

export const Trends = () => {
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Future Climate Trends
            </h1>
            <p className="text-foreground/70 text-lg">
              Long-term projections and impact analysis through 2030
            </p>
          </motion.div>

          {/* Temperature Projections */}
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-xl">
                  <TrendingUp className="h-6 w-6 mr-2 text-primary" />
                  Global Temperature Projections (2020-2030)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={temperatureTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                      name="Historical Temperature (°C)"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projection" 
                      stroke="hsl(var(--destructive))" 
                      strokeWidth={3}
                      strokeDasharray="8 8"
                      dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 6 }}
                      name="AI Projection (°C)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Extreme Events */}
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-accent" />
                    Extreme Weather Events Frequency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={extremeEvents}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="heatwaves" 
                        stackId="1" 
                        stroke="#F59E0B" 
                        fill="#F59E0B" 
                        fillOpacity={0.6}
                        name="Heatwaves"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="floods" 
                        stackId="1" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.6}
                        name="Floods"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="storms" 
                        stackId="1" 
                        stroke="#6B7280" 
                        fill="#6B7280" 
                        fillOpacity={0.6}
                        name="Storms"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Target className="h-5 w-5 mr-2 text-secondary" />
                    Climate Risk Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 rounded-full bg-accent mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-sm">2024-2025</h4>
                        <p className="text-sm text-foreground/70">Moderate increase in extreme weather events</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 rounded-full bg-destructive mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-sm">2026-2027</h4>
                        <p className="text-sm text-foreground/70">Critical period - significant temperature rise</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-sm">2028-2030</h4>
                        <p className="text-sm text-foreground/70">Potential adaptation measures take effect</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* SDG Impact */}
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-xl">
                  <Globe className="h-6 w-6 mr-2 text-secondary" />
                  Sustainable Development Goals Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {sdgImpacts.map((sdg, index) => (
                    <div key={sdg.goal} className="p-4 rounded-lg bg-background/20 border border-border/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{sdg.icon}</span>
                        <Badge 
                          variant={sdg.impact === 'Critical' ? 'destructive' : sdg.impact === 'High' ? 'secondary' : 'outline'}
                        >
                          {sdg.impact} Impact
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2 text-sm">{sdg.goal}</h3>
                      <p className="text-sm text-foreground/70 mb-3">{sdg.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-foreground/60">Trend:</span>
                        <span className={`text-xs font-medium ${
                          sdg.trend === 'Critical' ? 'text-destructive' : 
                          sdg.trend === 'Worsening' ? 'text-accent' : 'text-success'
                        }`}>
                          {sdg.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};