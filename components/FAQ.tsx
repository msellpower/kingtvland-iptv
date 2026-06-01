import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import SEO from './SEO';
import { useLanguage } from '../i18n/LanguageContext';

const FAQ: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4')
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5')
    },
    {
      question: t('faq.q6'),
      answer: t('faq.a6')
    },
    {
      question: t('faq.q7'),
      answer: t('faq.a7')
    },
    {
      question: t('faq.q8'),
      answer: t('faq.a8')
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <SEO 
        title={t('faq.title')}
        description={t('faq.subtitle')}
        keywords={language === 'he' ? ['שאלות ותשובות IPTV', 'תמיכה טכנית IPTV', 'מדריך IPTV', 'בעיות בשידור'] : ['IPTV Q&A', 'IPTV Technical Support', 'IPTV Guide', 'Streaming Issues']}
        schema={faqSchema}
        canonical="https://kingtvland-iptv.netlify.app/?view=faq"
        url="https://kingtvland-iptv.netlify.app/?view=faq"
      />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('faq.title')}</h1>
          <p className="text-gray-400">{t('faq.subtitle')}</p>
        </div>

        <div className="relative mb-8">
          <input
            type="text"
            placeholder={t('faq.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 ${isRTL ? 'pr-12' : 'pl-12'} text-white focus:outline-none focus:border-purple-500 transition-colors`}
          />
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 text-gray-400 w-5 h-5`} />
        </div>

        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-600"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full flex items-center justify-between p-4 ${isRTL ? 'text-right' : 'text-left'} focus:outline-none`}
              >
                <span className="font-medium text-white text-lg">{faq.question}</span>
                {openIndex === index ? (
                   <ChevronUp className="w-5 h-5 text-purple-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="p-4 pt-0 text-gray-300 border-t border-slate-700/50 mt-2 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              {t('faq.noResults')} "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
