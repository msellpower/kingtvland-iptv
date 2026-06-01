import React, { useState } from 'react';
import { requestTrial } from '../services/dataService';
import { submitSubscription } from '../services/sheetService';
import { Plan } from '../types';
import Spinner from './Spinner';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan;
  isTrial?: boolean;
}

const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose, plan, isTrial }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for success & credentials
  const [credentials, setCredentials] = useState<{username: string, password: string, portal?: string} | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isTrial && plan) {
        const result = await requestTrial(name, email, phone, dob, plan.id);
        setIsLoading(false);
        if (result.success) {
            if (result.credentials) {
                setCredentials(result.credentials);
            } else {
                setSuccessMessage(result.message || 'בקשתך התקבלה בהצלחה!');
            }
        } else {
            alert(result.error || 'אירעה שגיאה. אנא נסה שוב מאוחר יותר.');
        }
    } else {
        const result = await submitSubscription(name, phone, email);
        setIsLoading(false);
        if (result.success && result.credentials) {
            setCredentials(result.credentials);
        } else if (result.success) {
            alert("הפרטים התקבלו, אך לא נוצרו פרטי התחברות. נציג יצור קשר.");
            onClose();
        } else {
            alert('אירעה שגיאה. אנא נסה שוב מאוחר יותר.');
        }
    }
  };

  const copyAll = () => {
    if (!credentials) return;
    let text = `פרטי התחברות KINGTVLAND:\nאימייל: ${email}\nשם משתמש: ${credentials.username}\nסיסמה: ${credentials.password}`;
    if (credentials.portal) {
        text += `\nפורטל: ${credentials.portal}`;
    }
    navigator.clipboard.writeText(text);
    alert('הפרטים הועתקו ללוח!');
  };

  const handleClose = () => {
    setCredentials(null);
    setSuccessMessage(null);
    setName('');
    setPhone('');
    setEmail('');
    setDob('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 transition-opacity backdrop-blur-sm" onClick={handleClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-middle bg-slate-800 rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-md sm:w-full border border-gray-600 relative w-full max-w-sm mx-auto">
          {/* Close Button */}
          <button 
            onClick={handleClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white z-10 p-2 bg-black/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-6">
            <h3 className="text-2xl font-black text-white pr-8">
                {isTrial ? `בקשת ניסיון - ${plan?.name}` : 'הצטרפות ל-KINGTV 🚀'}
            </h3>
            <p className="text-pink-100 mt-1">
                {isTrial ? 'מלא את הפרטים ונשלח אליך גישה לניסיון' : 'השאירו פרטים ונחזור אליכם לחיבור מהיר'}
            </p>
          </div>
          
          {successMessage ? (
              <div className="p-8 text-center animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">בקשתך התקבלה!</h3>
                <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                  {successMessage}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg"
                >
                  סגור
                </button>
              </div>
          ) : credentials ? (
             <div className="p-8 text-center animate-fade-in">
               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                 <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <h3 className="text-2xl leading-6 font-bold text-white mb-2">נרשמת בהצלחה!</h3>
               <p className="text-gray-300 mb-6 text-sm">
                 אלו פרטי ההתחברות הזמניים שלך לאתר ולמערכת. 
                 <br/>
                 השתמש ב<strong>אימייל שלך</strong> וב<strong>שם המשתמש</strong> כדי להתחבר לאזור האישי.
               </p>

               <div className="bg-slate-900/80 rounded-xl p-4 border border-gray-700 text-right space-y-3 mb-6 relative">
                 <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                   <span className="text-gray-400 text-xs">אימייל (להתחברות)</span>
                   <span className="text-white font-mono font-bold select-all">{email}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                   <span className="text-gray-400 text-xs">שם משתמש (להתחברות)</span>
                   <span className="text-green-400 font-mono font-bold select-all">{credentials.username}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                   <span className="text-gray-400 text-xs">סיסמה זמנית</span>
                   <span className="text-pink-400 font-mono font-bold select-all">{credentials.password}</span>
                 </div>
                 {credentials.portal && (
                   <div className="flex justify-between items-center">
                     <span className="text-gray-400 text-xs">כתובת פורטל</span>
                     <span className="text-cyan-400 font-mono font-bold select-all text-[10px]">{credentials.portal}</span>
                   </div>
                 )}
               </div>

               <div className="space-y-3">
                 <button
                   onClick={copyAll}
                   className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                   העתק הכל
                 </button>
                 
                 <button
                   onClick={handleClose}
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
                 >
                   סגור ועבור להתחברות
                 </button>
               </div>
           </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">שם מלא</label>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 disabled:opacity-50"
                  placeholder="ישראל ישראלי"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">טלפון</label>
                <input
                  type="tel"
                  required
                  disabled={isLoading}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 disabled:opacity-50"
                  placeholder="050-0000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">אימייל</label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>

              {isTrial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">תאריך לידה (אופציונלי - לקבלת הטבות)</label>
                    <input
                      type="date"
                      disabled={isLoading}
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500 disabled:opacity-50"
                    />
                  </div>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 transform hover:-translate-y-1 flex items-center justify-center"
                >
                  {isLoading ? <Spinner /> : (isTrial ? 'שלח בקשת ניסיון' : 'הרשמה מהירה')}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full mt-3 text-gray-400 hover:text-white font-medium py-2 transition-colors text-sm"
                >
                  ביטול
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinModal;