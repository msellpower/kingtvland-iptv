import React from 'react';
import { motion } from 'motion/react';
import { Shield, Award, Users, Clock, CheckCircle, Target, Zap, Globe, Cpu, Server, Code, Layers } from 'lucide-react';
import SEO from './SEO';
import { useLanguage } from '../i18n/LanguageContext';

interface AboutProps {
  onStartNow?: () => void;
}

const About: React.FC<AboutProps> = ({ onStartNow }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'he';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#0f0c29] pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SEO 
        title={t('about.title')}
        description={t('about.subtitle')}
        keywords={isRTL ? ['אודות KINGTVLAND', 'מי אנחנו', 'ספק IPTV אמין', 'שירות לקוחות IPTV'] : ['About KINGTVLAND', 'Who we are', 'Reliable IPTV provider', 'IPTV customer service']}
        canonical="https://kingtvland-iptv.netlify.app/?view=about"
        url="https://kingtvland-iptv.netlify.app/?view=about"
      />

      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-24"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter"
          >
            {isRTL ? (
              <>המהפכה של <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200">KINGTVLAND</span></>
            ) : (
              <>The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200">KINGTVLAND</span> Revolution</>
            )}
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            {t('about.subtitle')}
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-32"
        >
          {[
            { icon: Users, label: t('about.stats.satisfied'), value: '15,000+', color: 'text-blue-400' },
            { icon: Clock, label: t('about.stats.experience'), value: '7', color: 'text-purple-400' },
            { icon: CheckCircle, label: t('about.stats.channels'), value: '12,000+', color: 'text-green-400' },
            { icon: Award, label: t('about.stats.uptime'), value: '99.9%', color: 'text-yellow-400' },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center hover:border-white/20 transition-all group"
            >
              <div className="flex justify-center mb-6">
                <div className={`p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Story & Mission Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-32">
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-10 rounded-[40px] border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Globe className="w-32 h-32 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                <Layers className="w-6 h-6" />
              </div>
              {t('about.story.title')}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed italic">
              "{t('about.story.desc')}"
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-10 rounded-[40px] border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <Target className="w-32 h-32 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
                <Target className="w-6 h-6" />
              </div>
              {t('about.mission.title')}
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('about.mission.desc')}
            </p>
          </motion.div>
        </div>

        {/* Values Block */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mb-32"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('about.values.title')}</h2>
            <div className="w-24 h-1.5 bg-[#D4AF37] mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t('about.values.item1'), desc: t('about.values.item1.desc'), icon: Shield, color: 'bg-green-500/20 text-green-400' },
              { title: t('about.values.item2'), desc: t('about.values.item2.desc'), icon: Zap, color: 'bg-yellow-500/20 text-yellow-400' },
              { title: t('about.values.item3'), desc: t('about.values.item3.desc'), icon: Users, color: 'bg-blue-500/20 text-blue-400' },
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-all text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${value.color}`}>
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Us & Commitment Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-32 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-tight">{t('about.why.title')}</h2>
            <div className="space-y-4">
              {[
                { text: t('about.why.item1'), icon: CheckCircle },
                { text: t('about.why.item2'), icon: CheckCircle },
                { text: t('about.why.item3'), icon: CheckCircle },
                { text: t('about.why.item4'), icon: CheckCircle },
                { text: t('about.why.item5'), icon: CheckCircle }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all"
                >
                  <item.icon className="w-6 h-6 text-[#D4AF37]" />
                  <span className="text-lg text-gray-200 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/5 p-10 rounded-[40px] border border-white/10 order-1 lg:order-2"
          >
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
              <Shield className="w-8 h-8 text-green-400" />
              {t('about.commitment.title')}
            </h2>
            <div className="space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed">
                {t('about.commitment.desc1')}
              </p>
              <p className="text-gray-300 text-lg leading-relaxed border-l-4 border-[#D4AF37] pl-6 py-2 italic font-light">
                {t('about.commitment.desc2')}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Tech Stack Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-12 rounded-[50px] border border-white/10"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-4">
              <Cpu className="w-10 h-10 text-blue-400" />
              {t('about.tech.title')}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              {t('about.tech.desc1')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { label: 'CDN Edge Nodes', value: '45+', icon: Server },
              { label: 'Network Capacity', value: '100 Gbps', icon: Zap },
              { label: 'Codec Support', value: 'H.265 / HEVC', icon: Code },
              { label: 'Active Clusters', value: 'Global', icon: Globe },
            ].map((tech, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-all group-hover:scale-110">
                  <tech.icon className="w-8 h-8 text-white/50" />
                </div>
                <div className="text-2xl font-black text-white">{tech.value}</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">{tech.label}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-8 bg-black/30 rounded-3xl text-center border border-white/5">
            <p className="text-gray-400 text-lg leading-relaxed">
              {t('about.tech.desc2')}
            </p>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8">
            {isRTL ? 'מוכנים להצטרף למשפחה?' : 'Ready to join the family?'}
          </h2>
          <button 
            className="px-12 py-5 bg-[#D4AF37] text-black font-black rounded-full text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)]"
            onClick={() => onStartNow ? onStartNow() : window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {t('hero.cta.start')}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
