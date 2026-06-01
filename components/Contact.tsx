import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import SEO from './SEO';
import Spinner from './Spinner';
import * as sheetService from '../services/sheetService';
import { toast } from 'react-hot-toast';
import { SystemSettings } from '../utils/timeLogic';
import { useLanguage } from '../i18n/LanguageContext';

interface ContactProps {
  systemSettings: SystemSettings | null;
}

const Contact: React.FC<ContactProps> = ({ systemSettings }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, you would send this to your backend or Google Sheets
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(t('contact.form.success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(t('contact.form.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title={t('contact.title') + " - KINGTVLAND"}
        description={t('contact.subtitle')}
        keywords={language === 'he' ? ['צור קשר IPTV', 'תמיכה טכנית', 'שירות לקוחות', 'פנייה לנציג'] : ['Contact IPTV', 'Technical Support', 'Customer Service', 'Contact Agent']}
        canonical="https://kingtvland-iptv.netlify.app/?view=contact"
        url="https://kingtvland-iptv.netlify.app/?view=contact"
      />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-gray-400">{t('contact.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">{t('contact.info.title')}</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{t('contact.info.email')}</h4>
                    <p className="text-gray-400">{systemSettings?.CONTACT_EMAIL || 'kingtvland@gmail.com'}</p>
                    <p className="text-gray-500 text-sm mt-1">{t('contact.info.emailResponse')}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{t('contact.info.whatsapp')}</h4>
                    <p className="text-gray-400">
                      {systemSettings?.WHATSAPP_NUMBER ? `+${systemSettings.WHATSAPP_NUMBER}` : '+972-50-000-0000'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{t('contact.info.whatsappHours')}</p>
                  </div>
                </div>

                {systemSettings?.TELEGRAM_LINK && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                      <Send className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">{t('contact.info.telegram')}</h4>
                      <a 
                        href={systemSettings.TELEGRAM_LINK} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        {systemSettings.TELEGRAM_LINK.replace('https://t.me/', '@')}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">{t('contact.info.address')}</h4>
                    <p className="text-gray-400">{t('contact.info.addressValue')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900 p-8 rounded-2xl border border-purple-500/30">
              <h3 className="text-xl font-bold text-white mb-4">{t('contact.hours.title')}</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex justify-between">
                  <span>{t('contact.hours.weekday')}</span>
                  <span>{t('contact.hours.weekday.value')}</span>
                </li>
                <li className="flex justify-between">
                  <span>{t('contact.hours.friday')}</span>
                  <span>{t('contact.hours.friday.value')}</span>
                </li>
                <li className="flex justify-between text-gray-500">
                  <span>{t('contact.hours.shabbat')}</span>
                  <span>{t('contact.hours.shabbat.value')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6">{t('contact.form.title')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">{t('contact.form.name')}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  disabled={loading}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  placeholder={t('contact.form.namePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">{t('contact.form.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">{t('contact.form.subject')}</label>
                <select
                  id="subject"
                  name="subject"
                  required
                  disabled={loading}
                  value={formData.subject}
                  onChange={(e: any) => handleChange(e)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                >
                  <option value="" disabled>{t('contact.form.subjectPlaceholder')}</option>
                  <option value="support">{t('contact.form.subject.support')}</option>
                  <option value="sales">{t('contact.form.subject.sales')}</option>
                  <option value="billing">{t('contact.form.subject.billing')}</option>
                  <option value="partnership">{t('contact.form.subject.partnership')}</option>
                  <option value="other">{t('contact.form.subject.other')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">{t('contact.form.message')}</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  disabled={loading}
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none disabled:opacity-50"
                  placeholder={t('contact.form.messagePlaceholder')}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t('contact.form.send')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
