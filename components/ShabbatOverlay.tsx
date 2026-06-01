
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Star } from 'lucide-react';

interface ShabbatOverlayProps {
  isVisible: boolean;
}

const ShabbatOverlay: React.FC<ShabbatOverlayProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="max-w-md w-full bg-slate-900 border border-purple-500/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/20"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Moon className="w-16 h-16 text-purple-400" />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2"
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </motion.div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4 font-sans tracking-tight">שבת שלום!</h2>
            
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p className="text-lg">
                לקוחות יקרים, אנו נמצאים כעת בהפסקת פעילות לרגל השבת.
              </p>
              <p>
                שירותי המכירה, התמיכה וקבלת מנויי הניסיון יחזרו לפעילות מלאה במוצאי השבת.
              </p>
              <div className="pt-6 border-t border-gray-800">
                <p className="text-sm text-purple-400 font-medium">
                  מאחלים לכם שבת שקטה ומהנה, צוות KINGTVLAND
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShabbatOverlay;
