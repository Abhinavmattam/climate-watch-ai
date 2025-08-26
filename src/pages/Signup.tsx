import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParticleBackground } from '@/components/ui/particles';
import { signUpWithEmail } from '@/integrations/firebase/auth';

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    city: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Japan', 'Australia', 'India', 'Brazil', 'Mexico'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpWithEmail({
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
        country: formData.country,
        city: formData.city,
      });
      setSuccessMessage('Verification email sent. Please check your inbox and verify before logging in.');
      // Redirect to login after a short delay so the user can see the message
      setTimeout(() => {
        window.location.href = '/login';
      }, 1200);
    } catch (error: any) {
      const code = error?.code ?? 'auth/error';
      setErrorMessage(code.replace('auth/', '').replace(/-/g, ' '));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center py-8">
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
              <CardTitle className="text-2xl font-bold">Join Climate Watch</CardTitle>
              <p className="text-foreground/70">Create your account to start monitoring climate risks</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/90">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10 glass-primary border-border/50 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

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

                {/* Location Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-foreground/90">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger className="glass-primary border-border/50 focus:border-primary/50">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-border/50">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground/90">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                      <Input
                        id="city"
                        type="text"
                        placeholder="Your city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="pl-10 glass-primary border-border/50 focus:border-primary/50"
                        required
                      />
                    </div>
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
                      placeholder="Create a password"
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground/90">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10 glass-primary border-border/50 focus:border-primary/50"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-foreground/50 hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Inline Messages */}
                {errorMessage && (
                  <div className="text-sm text-red-500">{errorMessage}</div>
                )}
                {successMessage && (
                  <div className="text-sm text-green-500">{successMessage}</div>
                )}

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
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </motion.div>
              </form>

              {/* Sign In Link */}
              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-foreground/70">
                  Already have an account?{' '}
                  <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto" asChild>
                    <a href="/login">Sign in here</a>
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