import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ParticleBackground } from '@/components/ui/particles';
import { loginWithEmail } from '@/integrations/firebase/auth';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(formData.email, formData.password);
      window.location.href = '/dashboard';
    } catch (error: any) {
      const message = error?.code === 'auth/email-not-verified'
        ? 'Please verify your email before logging in.'
        : (error?.code ?? 'auth/error').replace('auth/', '').replace(/-/g, ' ');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center">
      <ParticleBackground />
      
      {/* Back to Home */}
      <motion.div
        className="absolute top-8 left-8 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button variant="ghost" asChild className="text-foreground/80 hover:text-foreground">
          <a href="/">← Back to Home</a>
        </Button>
      </motion.div>

      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-card border-border/50 shadow-glass">
            <CardHeader className="text-center pb-2">
              <motion.div
                className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-2xl">🌍</span>
              </motion.div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <p className="text-foreground/70">Sign in to your Climate Watch account</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground/90">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 glass-primary border-border/50 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground/90">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 glass-primary border-border/50 focus:border-primary/50"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-foreground/50 hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="text-sm text-red-500">{errorMessage}</div>
                )}

                {/* Forgot Password */}
                <div className="text-right">
                  <Button type="button" variant="link" className="text-primary hover:text-primary/80 p-0 h-auto">
                    Forgot password?
                  </Button>
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </motion.div>
              </form>

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-foreground/70">
                  Don't have an account?{' '}
                  <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto" asChild>
                    <a href="/signup">Create one here</a>
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};