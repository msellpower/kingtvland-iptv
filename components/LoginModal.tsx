import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginAttempt: (email: string, username: string, password: string, twoFactorCode?: string, rememberDevice?: boolean) => Promise<{ success: boolean, twoFactorRequired?: boolean }>;
  onForgotPassword: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginAttempt, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      setError('');
      setTwoFactorRequired(false);
      setTwoFactorCode('');
      setPassword('');
      setShowPassword(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

        const result = await onLoginAttempt(email, username, password, twoFactorRequired ? twoFactorCode : undefined, rememberDevice);

    if (result.success) {
      // On successful login (either with or without 2FA), close the modal.
      onClose();
    } else if (result.twoFactorRequired) {
      // If 2FA is required, stay on the modal and show the 2FA input.
      setTwoFactorRequired(true);
    } else {
      // If login fails for any other reason, show a generic error.
      // Specific errors are shown via toast from App.tsx
      setError('פרטי התחברות שגויים או שהחשבון נעול.');
      // If the user failed 2FA, we keep them on the 2FA screen.
      if (!twoFactorRequired) {
          setTwoFactorRequired(false); // Reset to password screen if initial login fails
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity backdrop-blur-sm" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-middle bg-slate-800 rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full border border-gray-600 relative w-full max-w-sm mx-auto">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-white z-10 p-2 bg-black/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-6 py-4">
            <h3 className="text-xl font-bold text-white pr-8">התחברות לאזור אישי</h3>
            <p className="text-indigo-200 text-sm">צפה בכל המנויים והמבצעים שלך</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4 text-sm text-gray-400">
              הזן את האימייל, שם המשתמש והסיסמה כדי להתחבר לחבילות שלך. אם נדרש אימות דו-שלבי, המערכת תבקש את הקוד בשלב הבא.
            </div>
            {error && (
              <div aria-live="polite" className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
            {twoFactorRequired ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-purple-500/20 bg-purple-950/60 p-4">
                  <p className="text-sm text-purple-200 mb-2 font-semibold">אימות דו-שלבי נדרש</p>
                  <p className="text-xs text-gray-400">הזן קוד אחד ששולח אליך בהודעת SMS או באפליקציית האימות.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">קוד אימות 2FA</label>
                  <input type="text" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="6 ספרות" required className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="flex items-center">
                  <input id="remember-device" type="checkbox" checked={rememberDevice} onChange={(e) => setRememberDevice(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <label htmlFor="remember-device" className="ml-2 block text-sm text-gray-400">זכור מכשיר זה למשך 30 יום</label>
                </div>
                <div className="mt-6 flex flex-row-reverse gap-3">
                  <button type="submit" disabled={isLoading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50">
                    {isLoading ? <Spinner /> : 'אמת'}
                  </button>
                  <button type="button" onClick={() => setTwoFactorRequired(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-gray-300 font-bold py-2 px-4 rounded-lg transition-all">
                    חזור
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1">אימייל</label>
                    <input
                      id="login-email"
                      type="email"
                      autoFocus
                      required
                      disabled={isLoading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      placeholder="האימייל איתו נרשמת"
                    />
                  </div>
                  <div>
                    <label htmlFor="login-username" className="block text-sm font-medium text-gray-300 mb-1">שם משתמש</label>
                    <input
                      id="login-username"
                      type="text"
                      required
                      disabled={isLoading}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      placeholder="השם שמופיע בחשבון"
                    />
                  </div>
                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1">סיסמה</label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 text-white pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        placeholder="הסיסמה שלך"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-white"
                        tabIndex={-1}
                      >
                        {showPassword ? 'הסתר' : 'הצג'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={onForgotPassword}
                      className="mt-2 text-xs text-indigo-300 hover:text-white transition-colors"
                    >
                      שכחת סיסמה?
                    </button>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Spinner /> : 'התחבר'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-gray-300 font-bold py-3 rounded-lg transition-all"
                  >
                    ביטול
                  </button>
                </div>
              </>
            )}
            {/* Password not required for now */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;