
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitResellerRegistration } from '../services/sheetService';
import Spinner from './Spinner';

interface ResellerRegisterModalProps {
    planName: string;
    onClose: () => void;
}

const ResellerRegisterModal: React.FC<ResellerRegisterModalProps> = ({ planName, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        isExistingCustomer: false,
        packageType: 'King' as 'King' | 'Israeli' | 'Premium',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await submitResellerRegistration({
            ...formData,
            planType: planName
        });
        if (result) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 3000);
        } else {
            alert('שגיאה בשליחת הטופס. נא לנסות שוב.');
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[250] overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
                    onClick={onClose}
                    aria-hidden="true"
                ></div>
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="inline-block align-middle bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden my-8"
                >
                    {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 blur-3xl rounded-full"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-white">הרשמה לתוכנית זכיינות</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <p className="text-indigo-400 font-bold mb-6">חבילה נבחרת: {planName}</p>

                    {success ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h4 className="text-2xl font-bold text-white">הבקשה התקבלה!</h4>
                            <p className="text-gray-400">נציג שלנו יחזור אליך בהקדם להשלמת התהליך.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1 mr-1">שם מלא</label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="ישראל ישראלי"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1 mr-1">אימייל</label>
                                    <input 
                                        required
                                        type="email" 
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="example@mail.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1 mr-1">מספר טלפון</label>
                                    <input 
                                        required
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-left"
                                        placeholder="050-0000000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1 mr-1">האם לקוח קיים?</label>
                                    <select 
                                        value={formData.isExistingCustomer ? 'yes' : 'no'}
                                        onChange={e => setFormData({...formData, isExistingCustomer: e.target.value === 'yes'})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    >
                                        <option value="no" className="bg-slate-900">לא, אני לקוח חדש</option>
                                        <option value="yes" className="bg-slate-900">כן, אני לקוח קיים</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1 mr-1">סוג חבילה מבוקש</label>
                                    <select 
                                        value={formData.packageType}
                                        onChange={e => setFormData({...formData, packageType: e.target.value as any})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    >
                                        <option value="King" className="bg-slate-900">King</option>
                                        <option value="Israeli" className="bg-slate-900">Israeli</option>
                                        <option value="Premium" className="bg-slate-900">Premium (+60% עלות)</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center"
                            >
                                {loading ? <Spinner /> : 'שלח בקשת הצטרפות'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    </div>
);
};

export default ResellerRegisterModal;
