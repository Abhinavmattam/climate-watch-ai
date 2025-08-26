import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClimateAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'flood' | 'heatwave' | 'pollution' | 'storm';
}

export const ClimateAlert = ({ isOpen, onClose, title, message, type }: ClimateAlertProps) => {
  const getIcon = () => {
    switch (type) {
      case 'flood':
        return '🌊';
      case 'heatwave':
        return '☀️';
      case 'pollution':
        return '🌫️';
      case 'storm':
        return '⛈️';
      default:
        return '⚠️';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Alert Modal */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="glass-alert rounded-2xl p-6 border border-destructive/30">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl animate-pulse-glow">
                    {getIcon()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-destructive-foreground">
                      {title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive font-medium">
                        HIGH RISK ALERT
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-destructive-foreground hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Message */}
              <p className="text-foreground/90 mb-6 leading-relaxed">
                {message}
              </p>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button
                  variant="destructive"
                  onClick={onClose}
                  className="flex-1"
                >
                  Mark as Read
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-destructive/30 text-destructive-foreground hover:bg-destructive/10"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};