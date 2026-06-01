import React, { useState } from 'react';
import Spinner from './Spinner';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestReset: (email: string) => Promise<void>;
  onPerformReset: (token: string, newPassword: string) => Promise<boolean>;
  resetToken: string | null;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onRequestReset, onPerformReset, resetToken }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    await onRequestReset(email);
    setIsLoading(false);
    setMessage('אם האימייל קיים במערכת, נשלח אליך קישור לאיפוס סיסמה.');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    setIsLoading(true);
    setError('');
    const success = await onPerformReset(resetToken, newPassword);
    setIsLoading(false);
    if (success) {
      setMessage('הסיסמה אופסה בהצלחה. ניתן כעת להתחבר עם הסיסמה החדשה.');
      setTimeout(onClose, 3000);
    } else {
      setError('איפוס הסיסמה נכשל. ייתכן שהקישור פג תוקף.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity backdrop-blur-sm" onClick={onClose}></div>
        <div className="inline-block align-middle bg-slate-800 rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full border border-gray-600 relative w-full max-w-sm mx-auto">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white z-10 p-2 bg-black/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4">
            <h3 className="text-xl font-bold text-white">איפוס סיסמה</h3>
          </div>
          <div className="p-6 space-y-4">
            {message && <div className="bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-2 rounded-lg text-sm">{message}</div>}
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">{error}</div>}
            
            {resetToken ? (
              <form onSubmit={handleResetSubmit}>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="סיסמה חדשה" required disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white mb-4 disabled:opacity-50" />
                <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
                  {isLoading ? <Spinner /> : 'אפס סיסמה'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestSubmit}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="אימייל" required disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white mb-4 disabled:opacity-50" />
                <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">
                  {isLoading ? <Spinner /> : 'שלח קישור לאיפוס'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
