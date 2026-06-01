import React from 'react';

const ThankYouPage: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const packageId = urlParams.get('package');
  const amount = urlParams.get('amount');
  const userId = urlParams.get('userId');

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-green-500/30">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">תודה על הרכישה!</h1>
        <p className="text-gray-400 mb-8">התשלום בוצע בהצלחה ו-USDT ייכנס לכתובת שלנו.</p>
        
        <div className="bg-slate-900/50 rounded-xl p-4 space-y-3 mb-8 text-right border border-slate-700">
          <div className="flex justify-between">
            <span className="text-white font-mono">{packageId}</span>
            <span className="text-gray-400">חבילה:</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-400 font-bold">{amount} USDT</span>
            <span className="text-gray-400">סכום:</span>
          </div>
          {userId && (
             <div className="flex justify-between">
                <span className="text-gray-300 font-mono text-xs">{userId}</span>
                <span className="text-gray-400">מזהה לקוח:</span>
             </div>
          )}
        </div>

        <button 
          onClick={() => {
            // Clear URL params
            window.history.replaceState({}, document.title, window.location.pathname);
            onNavigate('home');
          }}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
        >
          חזרה לדף הבית
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;
