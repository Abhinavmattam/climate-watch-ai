import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { ParticleBackground } from '@/components/ui/particles';
import { ClimateAlert } from '@/components/alerts/ClimateAlert';
import { GeminiWeather } from '@/components/dashboard/GeminiWeather';
import { useAuth } from '@/hooks/use-auth';

export const Home = () => {
  const [showAlert, setShowAlert] = useState(false);
  const { user } = useAuth();

  const climateRisks = [
    {
      icon: '🌊',
      title: 'Flood Risk',
      description: 'AI-powered flood prediction with 95% accuracy',
      color: 'text-blue-400'
    },
    {
      icon: '☀️',
      title: 'Heatwave Warning',
      description: 'Early heatwave detection to protect communities',
      color: 'text-orange-400'
    },
    {
      icon: '🌫️',
      title: 'Air Quality',
      description: 'Real-time pollution monitoring and forecasts',
      color: 'text-gray-400'
    }
  ];

  const handleNotificationClick = () => {
    setShowAlert(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <ParticleBackground />
      <Header hasNotification={true} onNotificationClick={handleNotificationClick} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="text-foreground">
                Climate Risk Prediction
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to predict, prepare, and protect 
              against climate risks with unprecedented accuracy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                asChild
              >
                <a href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              
              {!user && (
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6 glass-primary border-primary/30 hover:bg-primary/10"
                  asChild
                >
                  <a href="/signup">
                    Create Account
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live AI Forecast Preview */}
      <section className="pb-6 px-4">
        <div className="container mx-auto max-w-2xl">
          <GeminiWeather city={''} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Climate Risks We Monitor
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Our AI system continuously monitors and predicts various climate threats 
              to keep you informed and prepared.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {climateRisks.map((risk, index) => (
              <motion.div
                key={risk.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4 animate-float">{risk.icon}</div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {risk.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed">
                      {risk.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-card rounded-3xl p-8 md:p-16 border-border/50"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary mr-2" />
                  <span className="text-4xl font-bold text-primary">95%</span>
                </div>
                <p className="text-lg font-medium">Prediction Accuracy</p>
                <p className="text-foreground/70">AI-powered climate modeling</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-secondary mr-2" />
                  <span className="text-4xl font-bold text-secondary">24/7</span>
                </div>
                <p className="text-lg font-medium">Real-time Monitoring</p>
                <p className="text-foreground/70">Continuous climate surveillance</p>
              </div>
              
              <div>
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-accent mr-2" />
                  <span className="text-4xl font-bold text-accent">5min</span>
                </div>
                <p className="text-lg font-medium">Alert Response Time</p>
                <p className="text-foreground/70">Instant risk notifications</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Climate Alert Modal */}
      <ClimateAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="High Flood Risk Alert"
        message="⚠️ Our AI models predict a high probability of flooding in your area within the next 24 hours. Water levels are expected to rise significantly due to heavy rainfall. Please take necessary precautions and stay safe."
        type="flood"
      />
    </div>
  );
};