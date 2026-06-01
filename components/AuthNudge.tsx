import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Lock, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AuthNudgeProps {
  user: any;
  onLogin: () => void;
  onRegister: () => void;
  onLockChange: (isLocked: boolean) => void;
}

const AuthNudge: React.FC<AuthNudgeProps> = ({ user, onLogin, onRegister, onLockChange }) => {
  const { t, isRTL } = useLanguage();
  const [showPopup, setShowPopup] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (user) {
      setShowPopup(false);
      setIsLocked(false);
      onLockChange(false);
      return;
    }

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (user) return;

    if (elapsedSeconds === 30) {
      setShowPopup(true);
    } else if (elapsedSeconds === 60) {
      setShowPopup(true);
      setIsLocked(true);
      onLockChange(true);
    }
  }, [elapsedSeconds, user, onLockChange]);

  const handleClose = () => {
    // If not locked, we can close it
    if (!isLocked) {
      setShowPopup(false);
    }
  };

  if (user) return null;

  return (
    <>
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 bg-black/80 backdrop-blur-md ${isLocked ? 'cursor-not-allowed' : ''}`}
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {!isLocked && (
                <button 
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="flex flex-col items-center text-center">
                <div className={`mb-6 p-5 rounded-2xl ${isLocked ? 'bg-red-500/20 text-red-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                  {isLocked ? <Lock className="w-10 h-10" /> : <LogIn className="w-10 h-10" />}
                </div>

                <h2 className="text-2xl font-black text-white mb-2">
                  {isLocked 
                    ? (isRTL ? 'המערכת נעולה' : 'System Locked')
                    : (isRTL ? 'הצטרפו לקהילת המלכים!' : 'Join the King Community!')
                  }
                </h2>

                <p className="text-gray-400 mb-8 max-w-xs">
                  {isLocked
                    ? (isRTL ? 'כדי להמשיך להשתמש במערכת, עליך להתחבר או להירשם.' : 'To continue using the system, you must log in or register.')
                    : (isRTL ? 'אל תפספסו את התוכן החם ביותר. הירשמו עכשיו כדי ליהנות מחוויה מלאה.' : 'Don\'t miss out on the hottest content. Register now to enjoy the full experience.')
                  }
                </p>

                <div className="grid grid-cols-1 gap-3 w-full">
                  <button
                    onClick={() => { onLogin(); setShowPopup(false); }}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <LogIn className="w-5 h-5" />
                    {isRTL ? 'התחברות למערכת' : 'Log In to System'}
                  </button>

                  <button
                    onClick={() => { onRegister(); setShowPopup(false); }}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <UserPlus className="w-5 h-5" />
                    {isRTL ? 'יצירת חשבון חדש' : 'Create New Account'}
                  </button>
                </div>

                {isLocked && (
                  <p className="mt-6 text-xs text-red-500/60 font-medium">
                    {isRTL ? '* הגישה הוגבלה עד לביצוע פעולה' : '* Access restricted until action is taken'}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthNudge;
