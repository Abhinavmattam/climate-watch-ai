import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

interface HeaderProps {
  hasNotification?: boolean;
  onNotificationClick?: () => void;
}

export const Header = ({ hasNotification = false, onNotificationClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch {
      // ignore signout errors
    }
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">🌍</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Climate Watch AI
            </h1>
          </div>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-foreground/80 hover:text-foreground transition-colors">
            Home
          </a>
          <a href="/dashboard" className="text-foreground/80 hover:text-foreground transition-colors">
            Dashboard
          </a>
          <a href="/trends" className="text-foreground/80 hover:text-foreground transition-colors">
            Climate Trends
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className={`relative ${hasNotification ? 'notification-dot animate-bell-ring' : ''}`}
            onClick={onNotificationClick}
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Auth Buttons / User Info */}
          <div className="hidden md:flex items-center space-x-2">
            {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <a href="/login">Login</a>
                </Button>
                <Button variant="default" asChild>
                  <a href="/signup">Sign Up</a>
                </Button>
              </>
            ) : (
              <>
                <span className="text-foreground/80 text-sm mr-2">{user.displayName || user.email}</span>
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          className="md:hidden glass-card border-t border-border/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <a href="/" className="block text-foreground/80 hover:text-foreground transition-colors">
              Home
            </a>
            <a href="/dashboard" className="block text-foreground/80 hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="/trends" className="block text-foreground/80 hover:text-foreground transition-colors">
              Climate Trends
            </a>
            <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
              {!user ? (
                <>
                  <Button variant="ghost" asChild>
                    <a href="/login">Login</a>
                  </Button>
                  <Button variant="default" asChild>
                    <a href="/signup">Sign Up</a>
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};