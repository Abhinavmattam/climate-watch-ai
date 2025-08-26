import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Droplets, Wind, AlertTriangle } from 'lucide-react';

type TempPoint = { label: string; value: number };
type SeriesPoint = { label: string; value: number };
type AreaRisk = { area: string; flood: number; heat: number; pollution: number };
type AQIBucket = { name: string; value: number; color: string };

const palette = {
  flood: '#1f77b4', // blue
  heat: '#ff7f0e',  // orange
  pollution: '#2ca02c', // green
};

export const ClimateCharts = ({
  city = 'Your Area',
  temp7 = [],
  rainfallMonthly = [],
  aqiSeries = [],
  aqiDistribution = [],
  areaRisks = []
}: {
  city?: string;
  temp7?: TempPoint[];
  rainfallMonthly?: SeriesPoint[];
  aqiSeries?: SeriesPoint[];
  aqiDistribution?: AQIBucket[];
  areaRisks?: AreaRisk[];
}) => {
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const hasAnyData = (arr?: unknown[]) => Array.isArray(arr) && arr.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Temperature Trend */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              7-Day Temperature Trend ({city})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyData(temp7) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={temp7}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--foreground))" />
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
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                    name="Temp (°C)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-foreground/70">No temperature data</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rainfall Prediction */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Droplets className="h-5 w-5 mr-2 text-blue-400" />
              Rainfall (Upcoming Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyData(rainfallMonthly) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={rainfallMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Rainfall (mm)"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-foreground/70">No rainfall data</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AQI Distribution */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Wind className="h-5 w-5 mr-2 text-gray-400" />
              Air Quality Index Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyData(aqiDistribution) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={aqiDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {aqiDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-foreground/70">No AQI data</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Risk by Area */}
      <motion.div
        variants={chartVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="h-5 w-5 mr-2 text-accent" />
              Climate Risk by Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAnyData(areaRisks) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={areaRisks} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--foreground))" domain={[0, 100]} />
                  <YAxis dataKey="area" type="category" stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="flood" stackId="a" fill={palette.flood} name="Flood Risk">
                    <LabelList dataKey="flood" position="right" fill="hsl(var(--foreground))" fontSize={12} />
                  </Bar>
                  <Bar dataKey="heat" stackId="a" fill={palette.heat} name="Heat Risk">
                    <LabelList dataKey="heat" position="right" fill="hsl(var(--foreground))" fontSize={12} />
                  </Bar>
                  <Bar dataKey="pollution" stackId="a" fill={palette.pollution} name="Pollution Risk">
                    <LabelList dataKey="pollution" position="right" fill="hsl(var(--foreground))" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-foreground/70">No risk data</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};