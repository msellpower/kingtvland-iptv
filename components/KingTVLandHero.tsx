
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useLanguage } from "../i18n/LanguageContext";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

interface HeroProps {
  onNavigate?: (view: any, anchor?: string) => void;
  onStartNow?: (action: () => void) => void;
}

const KingTVLandHero: React.FC<HeroProps> = ({ onNavigate, onStartNow }) => {
  const { t, language } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isStorming, setIsStorming] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    
      const ctx = gsap.context(() => {
        try {
        const isMobile = window.innerWidth < 768;

        // Main Timeline for the stacked reveal
        const mainTl = gsap.timeline({
          scrollTrigger: isMobile ? undefined : {
            trigger: containerRef.current,
            start: () => "top " + (document.querySelector('header')?.getBoundingClientRect().bottom || 64) + "px",
            end: "+=120%", 
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          }
        });

        // Scene 1: Intro Animations (Logo scale and Headline typing)
        const introTl = gsap.timeline({ delay: 0.2 });
        introTl
          .fromTo(".parallax-bg",
            { scale: 1.2, opacity: 0 },
            { scale: 1, opacity: 0.6, duration: 2, ease: "power2.out" }
          )
          .fromTo(".intro-logo", 
            { scale: 0.5, opacity: 0, y: 30 }, 
            { scale: 1, opacity: 1, y: 0, duration: 1, ease: "power4.out" },
            "-=1.5"
          )
          .to(".intro-headline", {
            duration: 1.5,
            text: t('hero.headline'),
            ease: "none",
          }, "-=0.5");

        if (isMobile) {
          // On mobile, run the sequence automatically
          mainTl
            .to(".parallax-bg", {
              yPercent: 20,
              ease: "none",
              duration: 1,
              delay: 3
            }, 0)
            .to(".layer-1", {
              yPercent: -100,
              ease: "power2.inOut",
              duration: 1,
              delay: 3 // Give time to see the intro
            }, 0)
            .set(".layer-1", { pointerEvents: "none" })
            .from(".feature-card", {
              y: 30,
              opacity: 0,
              stagger: 0.15,
              duration: 0.6,
              ease: "power3.out"
            })
            .to(".layer-2", {
              scale: 0.9,
              opacity: 0,
              filter: "blur(10px)",
              ease: "power2.inOut",
              duration: 0.8,
              delay: 2
            })
            .set(".layer-2", { pointerEvents: "none" })
            .from(".cta-content-inner", {
              y: 30,
              opacity: 0,
              duration: 0.6,
              ease: "power3.out"
            });
        } else {
          // Desktop scrubbed sequence
          mainTl
            .to(".parallax-bg", {
              yPercent: 30,
              ease: "none",
              duration: 1
            }, 0)
            .to(".layer-1", {
              yPercent: -100,
              opacity: 0, // Fade out as it slides up to avoid visual clutter/overlap
              ease: "power2.inOut",
              duration: 1
            }, 0)
            .set(".layer-1", { pointerEvents: "none" })
            .from(".feature-card", {
              y: 50,
              opacity: 0,
              stagger: 0.2,
              duration: 0.8,
              ease: "power3.out"
            }, "-=0.5")
            .to(".layer-2", {
              scale: 0.8,
              opacity: 0,
              filter: "blur(20px)",
              ease: "power2.inOut",
              duration: 1
            }, "+=0.5")
            .set(".layer-2", { pointerEvents: "none" })
            .from(".cta-content-inner", {
              y: 50,
              opacity: 0,
              duration: 0.8,
              ease: "power3.out"
            }, "-=0.5");
        }

          // Individual counter animations - Runs automatically after a delay
          const counters = containerRef.current.querySelectorAll(".cta-counter");
          counters.forEach((el: any) => {
            const finalValue = parseInt(el.getAttribute('data-target') || '0');
            const counterProxy = { value: 0 };
            
            gsap.to(counterProxy, {
              value: finalValue,
              duration: 4,
              delay: 1, 
              ease: "power2.out",
              onUpdate: () => {
                el.innerText = Math.floor(counterProxy.value).toLocaleString();
              }
            });
          });
            
          // Refresh ScrollTrigger after setup
          ScrollTrigger.refresh();

        } catch (error) {
          console.error("GSAP Initialization Error:", error);
        }
      }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [t, language]);

  const handleStartNow = () => {
    if (!containerRef.current) return;

    const startAction = () => {
      setIsStorming(true);

      // Storm / Vortex 3D effect
      const tl = gsap.timeline({
        onComplete: () => {
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            setIsStorming(false);
            gsap.set(containerRef.current, { clearProps: "all" });
          }, 1000);
        }
      });

      // Set 3D perspective
      gsap.set(containerRef.current, { perspective: 1000, transformStyle: "preserve-3d" });

      // Lightning Flashes
      const lightningTl = gsap.timeline({ repeat: 5 });
      lightningTl.to(".storm-flash", { opacity: 0.8, duration: 0.05 })
                 .to(".storm-flash", { opacity: 0, duration: 0.1 });

      tl.to(containerRef.current, {
        rotationY: 1080,
        rotationX: 180,
        z: -3000,
        scale: 0.2,
        filter: "blur(10px) brightness(200%)",
        duration: 2.5,
        ease: "power2.in"
      })
      .to(".storm-vortex", {
        scale: 5,
        rotation: 1440,
        opacity: 1,
        duration: 2,
        ease: "power2.in"
      }, 0);
    };

    if (onStartNow) {
      onStartNow(startAction);
    } else {
      startAction();
    }
  };

  return (
    <div id="hero" className="hero-section-outer relative scroll-mt-[200px] md:scroll-mt-[120px]" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {/* Storm Overlay */}
      {isStorming && (
        <div className="fixed inset-0 z-[1000] pointer-events-none overflow-hidden">
          {/* Lightning Flash */}
          <div className="storm-flash absolute inset-0 bg-white opacity-0 mix-blend-overlay"></div>
          
          {/* Vortex Effect */}
          <div className="storm-vortex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-0">
            <div className="absolute inset-0 rounded-full border-[100px] border-indigo-500/20 blur-[100px] animate-spin-slow"></div>
            <div className="absolute inset-0 rounded-full border-[50px] border-purple-500/30 blur-[50px] animate-spin-reverse"></div>
          </div>

          {/* Wind Particles */}
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white/40 rounded-full blur-[1px]"
              style={{
                width: Math.random() * 100 + 50 + 'px',
                height: '2px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `storm-wind ${Math.random() * 0.5 + 0.2}s linear infinite`
              }}
            ></div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes storm-wind {
          0% { transform: translateX(-1000px) scaleX(1); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(1000px) scaleX(2); opacity: 0; }
        }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        .animate-spin-reverse { animation: spin 2s linear reverse infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <div ref={containerRef} className="relative bg-black text-white w-full h-screen md:h-[100dvh] overflow-hidden">
      
      {/* Layer 1: Intro & Atmosphere */}
      <section className="layer-1 absolute inset-0 z-30 flex flex-col items-center justify-start pt-20 md:pt-32 lg:justify-center lg:pt-0 bg-transparent will-change-transform overflow-hidden">
        
        {/* Parallax Background Images */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           {/* TV Screen / Mountain image */}
           <img 
              className="parallax-bg object-cover w-full h-[160%] absolute top-[-30%] left-0 opacity-50 mix-blend-screen"
              src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=2000"
              alt="TV Background Mountain"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-[#06060c]/60 via-[#0a0a1a]/80 to-black"></div>
        </div>

        <div className="z-10 flex flex-col items-center text-center px-4">
          <div className="intro-logo flex flex-col items-center mb-6 md:mb-12 lg:mb-20">
            <img 
              className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6 lg:mb-10 transition-transform duration-500 hover:scale-110 object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
              src="/logo.svg" 
              alt="KINGTV Logo" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/logo.svg';
              }}
            />
            <h1 className="text-4xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white mb-2 md:mb-4 lg:mb-6 leading-none">KINGTVLAND</h1>
            <p className="text-[#D4AF37] text-xs md:text-xl lg:text-2xl font-bold tracking-[0.4em] uppercase opacity-90 transition-all">Premium Streaming</p>
          </div>
          <h2 className="intro-headline text-lg md:text-3xl lg:text-5xl font-bold text-white h-10 md:h-14 lg:h-20 mb-4 lg:mb-8"></h2>
          <p className="text-gray-400 text-sm md:text-xl lg:text-2xl max-w-2xl animate-pulse font-light tracking-wide">{t('hero.scroll')}</p>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
        </div>
      </section>

      {/* Layer 2: Features */}
      <section className="layer-2 absolute inset-0 z-20 flex items-center justify-center bg-[#050505] overflow-hidden will-change-transform">
        <div className="max-w-7xl mx-auto px-4 w-full py-8 lg:py-0">
          <div className="text-center mb-6 md:mb-10 lg:mb-12">
            <h2 className="text-xl md:text-4xl lg:text-6xl font-black mb-2 md:mb-3 lg:mb-4">{t('hero.powerhouse')}</h2>
            <div className="h-1 w-12 md:w-20 lg:w-24 bg-[#D4AF37] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-xs md:max-w-none mx-auto">
            {/* Card 1 */}
            <div className="feature-card bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-[#D4AF37]/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-6">
                <svg className="w-5 h-5 md:w-8 md:h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-4">{t('hero.f1.title')}</h3>
              <p className="text-gray-400 text-xs md:text-base">{t('hero.f1.desc')}</p>
            </div>
            {/* Card 2 */}
            <div className="feature-card bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-[#D4AF37]/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-6">
                <svg className="w-5 h-5 md:w-8 md:h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-4">{t('hero.f2.title')}</h3>
              <p className="text-gray-400 text-xs md:text-base">{t('hero.f2.desc')}</p>
            </div>
            {/* Card 3 */}
            <div className="feature-card bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center text-center">
              <div className="w-10 h-10 md:w-16 md:h-16 bg-[#D4AF37]/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-6">
                <svg className="w-5 h-5 md:w-8 md:h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-4">{t('hero.f3.title')}</h3>
              <p className="text-gray-400 text-xs md:text-base">{t('hero.f3.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Layer 3: CTA */}
      <section className="layer-3 absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050505] bg-gradient-to-t from-[#0a0a1a] to-black px-4 will-change-transform">
        <div className="cta-content-inner text-center max-w-6xl w-full">
          <div className="mb-6 md:mb-12 lg:mb-16">
            <h2 className="text-lg md:text-3xl lg:text-5xl font-bold text-white mb-6 md:mb-8 lg:mb-12">{t('hero.subscribers')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              <div className="flex flex-col items-center">
                <span className="cta-counter text-4xl md:text-6xl lg:text-8xl font-black text-[#D4AF37]" data-target="2700">0</span>
                <span className="text-sm md:text-xl lg:text-2xl font-bold text-gray-300 mt-1">{t('hero.kingSub')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="cta-counter text-4xl md:text-6xl lg:text-8xl font-black text-cyan-400" data-target="2148">0</span>
                <span className="text-sm md:text-xl lg:text-2xl font-bold text-gray-300 mt-1">{t('hero.israeliSub')}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="cta-counter text-4xl md:text-6xl lg:text-8xl font-black text-purple-500" data-target="720">0</span>
                <span className="text-sm md:text-xl lg:text-2xl font-bold text-gray-300 mt-1">{t('hero.premiumSub')}</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs md:text-lg lg:text-2xl text-gray-400 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('hero.joinThousands')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8">
            <button 
              onClick={handleStartNow}
              className="group relative px-10 py-4 md:px-16 md:py-6 bg-[#D4AF37] text-black text-xl md:text-2xl font-black rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] w-full sm:w-auto"
            >
              <span className="relative z-10 tracking-widest uppercase">{t('hero.cta.start')}</span>
            </button>

            <div className="flex gap-3 md:gap-4 w-full sm:w-auto">
              <button 
                onClick={() => onNavigate?.('guides')}
                className="flex-1 sm:flex-none px-8 py-3 md:px-10 md:py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white font-bold transition-all hover:border-[#D4AF37]/50 text-sm md:text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {t('nav.guides')}
              </button>
              <button 
                onClick={() => onNavigate?.('home', 'pricing')}
                className="flex-1 sm:flex-none px-8 py-3 md:px-10 md:py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white font-bold transition-all hover:border-[#D4AF37]/50 text-sm md:text-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                {t('nav.pricing')}
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
    </div>
  );
};

export default KingTVLandHero;
