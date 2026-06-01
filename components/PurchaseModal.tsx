
import React, { useState } from 'react';
import { Plan, CustomerType, OrderData, ServiceLevel } from '../types';
import { getPublicSettings, submitOrder } from '../services/dataService';
import { PAYPAL_EMAIL } from '../constants';
import CryptoPayment from './CryptoPayment';
import Spinner from './Spinner';

interface PurchaseModalProps {
  plan: Plan | null;
  customerType: CustomerType;
  serviceLevel: ServiceLevel;
  isOpen: boolean;
  onClose: () => void;
  initialUsername?: string; // New prop
}

type PaymentMethod = 'paypal' | 'paybox' | 'crypto' | null;

const PurchaseModal: React.FC<PurchaseModalProps> = ({ plan, customerType, serviceLevel, isOpen, onClose, initialUsername }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isRenewal, setIsRenewal] = useState(!!initialUsername); // Auto-set if username provided
  const [targetUsername, setTargetUsername] = useState(initialUsername || ''); // Pre-fill
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  
  // Reset state when modal is closed to prevent persistence
  React.useEffect(() => {
    if (!isOpen) {
      setSubmitted(false);
      setPaymentMethod(null);
      setName('');
      setPhone('');
      setEmail('');
      setTargetUsername(initialUsername || '');
    }
  }, [isOpen, initialUsername]);

  if (!isOpen || !plan) return null;

  const basePrice = customerType === CustomerType.NEW ? plan.priceNew : plan.priceExisting;
  const discount = serviceLevel === ServiceLevel.BASIC ? 50 : 0;
  const finalPrice = basePrice - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Just move to payment selection
    setSubmitted(true);
  };

  const handlePaymentSelection = async (method: PaymentMethod) => {
    setPaymentMethod(method);
    setIsLoading(true);

    const orderData: OrderData = {
      name,
      phone,
      email,
      planId: plan.id,
      customerType,
      serviceType: serviceLevel,
      isRenewal,
      targetUsername: isRenewal ? targetUsername : undefined,
      paymentMethod: method || undefined
    };

    // Submit order using data service (dual write or direct based on configuration)
    const success = await submitOrder(orderData);
    setIsLoading(false);

    if (success) {
      if (method === 'paypal') {
        const itemName = `${plan.name} - ${customerType} (${serviceLevel === ServiceLevel.VIP ? 'VIP' : 'ללא שירות'})`;
        const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${PAYPAL_EMAIL}&item_name=${encodeURIComponent(itemName)}&amount=${finalPrice}&currency_code=ILS&return=${encodeURIComponent(window.location.href)}`;
        window.location.href = paypalUrl;
      }
      // For crypto, the component will be rendered below
      // For paybox, we just show info
    } else {
      alert("אירעה שגיאה בשליחת הטופס. אנא נסה שוב.");
      setSubmitted(false); // Go back
      setPaymentMethod(null);
    }
  };

  const handleBackToMethods = () => {
    setPaymentMethod(null);
  };

  return (
    <div className="fixed inset-0 z-[250] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-slate-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-700 relative w-full max-w-sm mx-auto">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-white z-10 p-2 bg-black/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          {submitted ? (
            <div className="p-6 sm:p-8">
              {!paymentMethod ? (
                // Payment Method Selection
                <div className="text-center space-y-6">
                  <h3 className="text-2xl font-bold text-white">בחר אמצעי תשלום</h3>
                  <p className="text-gray-400">הפרטים נשמרו. איך תרצה לשלם?</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => handlePaymentSelection('paypal')}
                      className="w-full bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.795-9.077 6.795h-2.13a.523.523 0 0 0-.517.452l-.765 4.892a.641.641 0 0 0 .634.74h3.496c.498 0 .92-.382.998-.879l.564-3.606a.376.376 0 0 1 .372-.317h1.06c3.235 0 5.76-1.314 6.54-4.823.023-.105.044-.208.064-.31.573-2.918-.516-4.997-2.903-6.426C16.89 1.436 14.542.924 12.35.924h-6.2c-.22 0-.41.16-.444.378l-3.08 19.68a.376.376 0 0 0 .371.435h4.606c.22 0 .41-.16.444-.378l.429-2.736a.641.641 0 0 0-.633-.74z"/></svg>
                      PayPal (כרטיס אשראי)
                    </button>

                    <button
                      onClick={() => handlePaymentSelection('paybox')}
                      className="w-full bg-[#00AEEF] hover:bg-[#009bd6] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      PayBox
                    </button>

                    <button
                      onClick={() => handlePaymentSelection('crypto')}
                      className="w-full bg-slate-700 hover:bg-slate-600 border border-yellow-500/50 text-yellow-400 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105"
                    >
                      <span>💎</span>
                      קריפטו (USDT)
                    </button>
                  </div>
                  
                  {isLoading && <p className="text-sm text-gray-400 animate-pulse">מעבד הזמנה...</p>}
                  
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-gray-400 hover:text-white text-sm underline"
                  >
                    חזור לעריכת פרטים
                  </button>
                </div>
              ) : (
                // Selected Payment Method View
                <div className="animate-fade-in relative">
                  <button 
                    onClick={handleBackToMethods}
                    className="absolute top-0 right-0 text-gray-400 hover:text-white flex items-center gap-1 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    חזור לאפשרויות תשלום
                  </button>

                  <div className="mt-8">
                    {paymentMethod === 'crypto' && (
                      <>
                        <CryptoPayment plan={plan} serviceLevel={serviceLevel} />
                        <div className="flex flex-col gap-2 mt-4">
                          <button 
                            onClick={handleBackToMethods}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                          >
                            חזור לאפשרויות תשלום נוספות
                          </button>
                          <button 
                            onClick={onClose}
                            className="w-full text-gray-400 hover:text-white text-sm py-2"
                          >
                            ביטול וסגירה
                          </button>
                        </div>
                      </>
                    )}

                    {paymentMethod === 'paybox' && (
                      <div className="text-center space-y-4">
                        <div className="bg-[#00AEEF]/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                           <svg className="w-10 h-10 text-[#00AEEF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">תשלום ב-PayBox</h3>
                        <p className="text-gray-300">
                          אנא בצע העברה ע"ס <span className="font-bold text-white">₪{finalPrice}</span>
                        </p>
                        <div className="bg-slate-900 p-4 rounded-xl border border-gray-700">
                           <p className="text-lg font-mono font-bold text-[#00AEEF]">054-994-6953</p>
                           <p className="text-xs text-gray-500 mt-1">עבור: KINGTVLAND</p>
                        </div>
                        <p className="text-sm text-gray-400">לאחר ההעברה, ההזמנה תאושר ידנית.</p>
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={handleBackToMethods}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                          >
                            חזור לאפשרויות תשלום נוספות
                          </button>
                          <button 
                            onClick={onClose}
                            className="w-full text-gray-400 hover:text-white text-sm py-2"
                          >
                            סיימתי, סגור חלונית
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <h3 className="text-2xl leading-6 font-bold text-white mb-2" id="modal-title">
                רכישת {plan.name}
              </h3>
              <div className="flex justify-between items-center mb-6">
                <p className="text-indigo-400 font-semibold">
                    {customerType}
                </p>
                <div className="text-left">
                    <p className="text-2xl font-black text-white">₪{finalPrice}</p>
                    <p className={`text-xs ${serviceLevel === ServiceLevel.VIP ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {serviceLevel === ServiceLevel.VIP ? '✨ שירות VIP מלא' : '⚠️ ללא שירות (הנחת 50₪)'}
                    </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Subscription Type Toggle */}
                <div className="flex bg-slate-700 p-1 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setIsRenewal(false)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${!isRenewal ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
                  >
                    מנוי חדש
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRenewal(true)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${isRenewal ? 'bg-indigo-600 text-white shadow' : 'text-gray-300 hover:text-white'}`}
                  >
                    חידוש מנוי
                  </button>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">שם מלא</label>
                  <input
                    type="text"
                    id="name"
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full bg-slate-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">אימייל (חובה)</label>
                  <input
                    type="email"
                    id="email"
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full bg-slate-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">טלפון / וואטסאפ</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    disabled={isLoading}
                    className="mt-1 block w-full bg-slate-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {isRenewal && (
                  <div className="animate-fade-in">
                    <label htmlFor="username" className="block text-sm font-medium text-yellow-400">שם משתמש לחידוש (חובה)</label>
                    <input
                      type="text"
                      id="username"
                      required={isRenewal}
                      disabled={isLoading}
                      className="mt-1 block w-full bg-slate-700 border border-yellow-500/50 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm disabled:opacity-50"
                      value={targetUsername}
                      onChange={(e) => setTargetUsername(e.target.value)}
                      placeholder="הכנס את שם המשתמש שלך במערכת"
                    />
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-row-reverse gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-3 bg-[#0070BA] text-base font-bold text-white hover:bg-[#005ea6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                >
                   {isLoading ? <Spinner /> : 'המשך לתשלום'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-3 bg-slate-700 text-base font-medium text-gray-300 hover:text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default PurchaseModal;
