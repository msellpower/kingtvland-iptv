import React, { useState, useEffect } from 'react';
import { registerUser, sendEmailCode } from '../services/sheetService';
import Spinner from './Spinner';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (name: string, email: string, phone: string, username: string, password: string, emailCode: string, birthday?: string) => Promise<boolean>;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    setIsLoading(true);
    setError('');
    const result = await sendEmailCode(email);
    setIsLoading(false);
    if (result.success) {
      setEmailSent(true);
      setCountdown(60); // Start 60-second countdown
    } else {
      setError(result.error || 'שליחת אימייל נכשלה');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await onRegister(name, email, phone, username, password, emailCode, birthday);
    setIsLoading(false);
    if (success) {
      onClose();
    } else {
      setError('הרישום נכשל. ייתכן שהאימייל כבר קיים או שקוד האימות שגוי.');
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity backdrop-blur-sm" onClick={onClose}></div>
        <div className="inline-block align-middle bg-slate-800 rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full border border-gray-600 relative w-full max-w-sm mx-auto">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-white z-10 p-2 bg-black/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4">
            <h3 className="text-xl font-bold text-white pr-8">רישום משתמש חדש</h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm">{error}</div>}
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" required disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="אימייל" required disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="טלפון" required disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
            <div className="relative">
              <label className="block text-gray-400 text-xs mb-1 mr-1">תאריך לידה (לקבלת הטבות יום הולדת 🎁)</label>
              <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
            </div>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="שם משתמש" required disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמה" disabled={isLoading} className="hidden" />
            
            {emailSent && (
              <input type="text" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="קוד אימות (נשלח לאימייל)" required disabled={isLoading} className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50" />
            )}

            <div className="mt-6 flex flex-row-reverse gap-3">
              {!emailSent ? (
                <button type="button" onClick={handleSendEmail} disabled={isLoading || countdown > 0} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? <Spinner /> : (countdown > 0 ? `שלח שוב בעוד ${countdown} שניות` : 'שלח קוד אימות')}
                </button>
              ) : (
                <button type="submit" disabled={isLoading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50">
                  {isLoading ? <Spinner /> : 'הירשם'}
                </button>
              )}
              <button type="button" onClick={onClose} className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition-all">
                ביטול
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
