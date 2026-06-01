import React from 'react';
import { Download, CheckCircle, Smartphone, Tv, Monitor, Apple } from 'lucide-react';
import SEO from './SEO';
import { useLanguage } from '../i18n/LanguageContext';

interface DeviceLandingPageProps {
  type: 'android' | 'smart-tv' | 'apple' | 'pc';
  onNavigate: (view: any) => void;
}

const DeviceLandingPage: React.FC<DeviceLandingPageProps> = ({ type, onNavigate }) => {
  const { t } = useLanguage();

  const contentMap = {
    android: {
      title: t('device.android.title'),
      description: t('device.android.desc'),
      icon: <Smartphone className="w-16 h-16 text-green-400" />,
      features: [
        t('device.android.f1'),
        t('device.android.f2'),
        t('device.android.f3'),
        t('device.android.f4')
      ],
      downloadUrl: 'https://kingtvland-iptv.netlify.app/download/android',
      instructions: t('device.android.inst')
    },
    'smart-tv': {
      title: t('device.smart-tv.title'),
      description: t('device.smart-tv.desc'),
      icon: <Tv className="w-16 h-16 text-blue-400" />,
      features: [
        t('device.smart-tv.f1'),
        t('device.smart-tv.f2'),
        t('device.smart-tv.f3'),
        t('device.smart-tv.f4')
      ],
      downloadUrl: '#',
      instructions: t('device.smart-tv.inst')
    },
    apple: {
      title: t('device.apple.title'),
      description: t('device.apple.desc'),
      icon: <Apple className="w-16 h-16 text-gray-200" />,
      features: [
        t('device.apple.f1'),
        t('device.apple.f2'),
        t('device.apple.f3'),
        t('device.apple.f4')
      ],
      downloadUrl: 'https://apps.apple.com/app/iptv-smarters',
      instructions: t('device.apple.inst')
    },
    pc: {
      title: t('device.pc.title'),
      description: t('device.pc.desc'),
      icon: <Monitor className="w-16 h-16 text-purple-400" />,
      features: [
        t('device.pc.f1'),
        t('device.pc.f2'),
        t('device.pc.f3'),
        t('device.pc.f4')
      ],
      downloadUrl: 'https://kingtvland-iptv.netlify.app/webplayer',
      instructions: t('device.pc.inst')
    }
  };

  const content = contentMap[type];

  const applicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": content.title,
    "operatingSystem": type === 'android' ? 'Android' : type === 'apple' ? 'iOS' : type === 'pc' ? 'Windows, macOS' : 'Tizen, WebOS',
    "applicationCategory": "EntertainmentApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "ILS"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250"
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <SEO 
        title={content.title}
        description={content.description}
        keywords={['IPTV', type, 'הורדה', 'מדריך', 'חינם']}
        schema={applicationSchema}
        canonical={`https://kingtvland-iptv.netlify.app/?view=${type}`}
        url={`https://kingtvland-iptv.netlify.app/?view=${type}`}
      />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-800 rounded-full shadow-lg border border-slate-700">
              {content.icon}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{content.title}</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">{content.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700">
            <h3 className="text-2xl font-bold text-white mb-6">{t('device.why')}{type === 'pc' ? 'PC' : type === 'smart-tv' ? 'Smart TV' : type.charAt(0).toUpperCase() + type.slice(1)}?</h3>
            <ul className="space-y-4">
              {content.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-white mb-6">{t('device.instructions')}</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              {content.instructions}
            </p>
            <a 
              href={content.downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-purple-900/20"
            >
              <Download className="w-5 h-5" />
              {t('device.download')}
            </a>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => onNavigate('home')}
            className="text-gray-400 hover:text-white transition-colors underline"
          >
            {t('device.back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceLandingPage;
