
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Calendar, RefreshCw, Star, Play, X, Search, Film, TrendingUp, Clock, Share2, Filter } from 'lucide-react';
import { BlogPost } from '../types';
import { fetchLatestMovieNews, fetchMoviesByCategory, getArticleDetails } from '../services/newsService';
import Skeleton from './Skeleton';
import DOMPurify from 'dompurify';
import SEO from './SEO';
import StarRating from './StarRating';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'now_playing' | 'popular' | 'upcoming'>('news');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  const CACHE_KEY_PREFIX = 'blog_posts_v1_';
  const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  const loadNews = async () => {
    setLoading(true);
    
    // Check cache
    const cacheKey = `${CACHE_KEY_PREFIX}${activeTab}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
        try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) {
                setPosts(data);
                setFilteredPosts(data);
                setLoading(false);
                return;
            }
        } catch (e) {
            console.error("Error parsing cache", e);
            localStorage.removeItem(cacheKey);
        }
    }

    let news: BlogPost[] = [];
    
    try {
        switch (activeTab) {
            case 'news':
                news = await fetchLatestMovieNews();
                break;
            case 'now_playing':
                news = await fetchMoviesByCategory('now_playing');
                break;
            case 'popular':
                news = await fetchMoviesByCategory('popular');
                break;
            case 'upcoming':
                news = await fetchMoviesByCategory('upcoming');
                break;
        }
        
        if (news.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify({ data: news, timestamp: Date.now() }));
        }
        
        setPosts(news);
        setFilteredPosts(news);
    } catch (error) {
        console.error("Error loading news", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [activeTab]);

  // Update URL when selectedPost changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedPost) {
      url.searchParams.set('post', selectedPost.id);
    } else {
      url.searchParams.delete('post');
    }
    // Only update if the post param actually changed to avoid redundant history entries
    if (url.toString() !== window.location.href) {
      window.history.pushState({}, '', url.toString());
    }
  }, [selectedPost]);

  // Initial load from URL
  useEffect(() => {
    if (posts.length > 0) {
      const url = new URL(window.location.href);
      const postId = url.searchParams.get('post');
      if (postId && !selectedPost) {
        const post = posts.find(p => p.id === postId);
        if (post) {
          setSelectedPost(post);
        }
      }
    }
  }, [posts]);

  // Fetch details when a post is selected
  useEffect(() => {
      if (selectedPost && !selectedPost.extraDetails) {
          const fetchDetails = async () => {
              // Only attempt fetch for supported sources (currently Seret)
              if (!selectedPost.url.includes('seret.co.il')) return;

              const cacheKey = `article_details_${selectedPost.id}`;
              const cached = localStorage.getItem(cacheKey);
              
              if (cached) {
                  try {
                      const { data, timestamp } = JSON.parse(cached);
                      if (Date.now() - timestamp < CACHE_TTL) {
                          setSelectedPost(prev => prev ? ({ ...prev, ...data }) : null);
                          return;
                      }
                  } catch (e) {
                      localStorage.removeItem(cacheKey);
                  }
              }

              setDetailsLoading(true);
              try {
                  const details = await getArticleDetails(selectedPost.url);
                  if (details && Object.keys(details).length > 0) {
                      localStorage.setItem(cacheKey, JSON.stringify({ data: details, timestamp: Date.now() }));
                      setSelectedPost(prev => prev ? ({ ...prev, ...details }) : null);
                  }
              } catch (error) {
                  console.error("Error fetching details", error);
              } finally {
                  setDetailsLoading(false);
              }
          };
          fetchDetails();
      }
  }, [selectedPost?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let result = posts;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.summary.toLowerCase().includes(q)
        );
      }

      if (minRating > 0) {
          result = result.filter(p => (p.rating || 0) >= minRating);
      }

      setFilteredPosts(result);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, posts, minRating]);

  const handleShare = async (post: BlogPost) => {
      const shareUrl = `${window.location.origin}${window.location.pathname}?view=blog&post=${post.id}`;
      
      if (navigator.share) {
          try {
              await navigator.share({
                  title: post.title,
                  text: post.summary,
                  url: shareUrl
              });
          } catch (error) {
              console.log('Error sharing:', error);
          }
      } else {
          // Fallback: Copy to clipboard
          navigator.clipboard.writeText(`${post.title}\n${post.summary}\n${shareUrl}`);
          alert('הקישור הועתק ללוח!');
      }
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "חדשות הקולנוע והסרטים | KINGTVLAND",
    "description": "חדשות הקולנוע החמות ביותר, טריילרים לסרטים חדשים ודירוגי TMDB מעודכנים."
  };

  const currentSEO = selectedPost ? {
    title: selectedPost.title,
    description: selectedPost.summary,
    canonical: `${window.location.origin}${window.location.pathname}?view=blog&post=${selectedPost.id}`,
    schema: {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": selectedPost.title,
        "image": [selectedPost.image],
        "datePublished": selectedPost.date,
        "author": {
            "@type": "Organization",
            "name": "KINGTVLAND Experts"
        }
    }
  } : {
    title: "חדשות קולנוע וסרטים חדשים",
    description: "חדשות הקולנוע החמות ביותר, טריילרים לסרטים חדשים ודירוגי TMDB מעודכנים.",
    canonical: `${window.location.origin}${window.location.pathname}?view=blog`,
    schema: blogSchema
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-[#0f0c29]" dir="rtl">
      <SEO {...currentSEO} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-right">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-4">
              חדשות הקולנוע והסרטים 🎬
              <Newspaper className="w-10 h-10 text-indigo-500" />
            </h1>
            <p className="text-gray-400 text-lg">
              סרטים חדשים בקולנוע, טריילרים ודירוגים מעודכנים מ-TMDB
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={loadNews}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-full border border-indigo-500/30 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              עדכן נתונים
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
                { id: 'news', label: 'חדשות ועדכונים', icon: Newspaper },
                { id: 'now_playing', label: 'בקולנוע', icon: Film },
                { id: 'popular', label: 'פופולרי', icon: TrendingUp },
                { id: 'upcoming', label: 'בקרוב', icon: Clock },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                        activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mb-12">
            <div className="relative flex-grow">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                    type="text"
                    placeholder="חפש סרט או כתבה..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pr-12 pl-6 text-white text-right outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
                />
            </div>
            
            <div className="relative min-w-[200px]">
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pr-12 pl-6 text-white text-right outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg appearance-none cursor-pointer"
                >
                    <option value="0">כל הדירוגים</option>
                    <option value="5">מעל 5 ⭐</option>
                    <option value="7">מעל 7 ⭐</option>
                    <option value="8">מעל 8 ⭐</option>
                    <option value="9">מעל 9 ⭐</option>
                </select>
            </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl h-[500px] border border-white/10 p-6 flex flex-col gap-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <div className="flex gap-3 mt-auto">
                  <Skeleton className="h-12 flex-1 rounded-xl" />
                  <Skeleton className="h-12 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col content-section"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {post.rating && post.rating > 0 && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-yellow-500/30">
                        <StarRating rating={post.rating} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 text-gray-500 text-xs mb-3">
                      <Calendar className="w-4 h-4" />
                      {post.date}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                      {post.summary}
                    </p>

                    <div className="flex gap-3">
                      {post.trailerUrl && (
                        <button 
                          onClick={() => setSelectedTrailer(post.trailerUrl!)}
                          aria-label={`צפה בטריילר של ${post.title}`}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          צפה בטריילר
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedPost(post)}
                        aria-label={`פרטים נוספים על ${post.title}`}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/5 flex items-center justify-center active:scale-95"
                        title="לכתבה המלאה"
                      >
                        פרטים נוספים
                      </button>
                      <button 
                        onClick={() => handleShare(post)}
                        aria-label={`שתף את ${post.title}`}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5 flex items-center justify-center active:scale-95"
                        title="שתף כתבה"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl italic">לא נמצאו תוצאות לחיפוש שלך...</p>
          </div>
        )}

        {/* Blog Details Modal */}
        <AnimatePresence>
          {selectedPost && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
                onClick={() => setSelectedPost(null)}
            >
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 rounded-3xl max-w-4xl w-full relative overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              >
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 left-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-all border border-white/10 shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-black shrink-0">
                  {selectedPost.videoSource ? (
                      <video 
                        src={selectedPost.videoSource} 
                        controls 
                        className="w-full h-full object-contain"
                        poster={selectedPost.image}
                      />
                  ) : (
                      <img 
                        src={selectedPost.image} 
                        alt={selectedPost.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                  )}
                  
                  {selectedPost.rating && selectedPost.rating > 0 && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-yellow-500/30">
                      <StarRating rating={selectedPost.rating} className="gap-1" />
                    </div>
                  )}
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto max-h-[80vh] md:max-h-none">
                  <div className="flex items-center gap-3 text-indigo-400 text-sm mb-4 font-medium">
                    <Calendar className="w-4 h-4" />
                    {selectedPost.date}
                    <span className="mx-2 text-white/20">|</span>
                    <span>מקור: {selectedPost.source}</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                    {selectedPost.title}
                  </h2>
                  
                  {selectedPost.subtitle && (
                      <h3 className="text-xl text-indigo-300 mb-6 font-medium">
                          {selectedPost.subtitle}
                      </h3>
                  )}

                  <div className="text-gray-300 text-lg leading-relaxed space-y-4 mb-10 text-right">
                    {detailsLoading ? (
                        <div className="flex justify-center py-10">
                            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <>
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedPost.extraDetails || selectedPost.fullContent || selectedPost.summary) }} />
                        </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    {selectedPost.trailerUrl && (
                      <button 
                        onClick={() => {
                          setSelectedTrailer(selectedPost.trailerUrl!);
                          setSelectedPost(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        צפה בטריילר עכשיו
                      </button>
                    )}
                    <button 
                        onClick={() => handleShare(selectedPost)}
                        className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 flex items-center justify-center font-medium gap-2"
                    >
                        <Share2 className="w-5 h-5" />
                        שתף
                    </button>
                    <a 
                      href={selectedPost.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 flex items-center justify-center font-medium"
                    >
                      לכתבה המקורית
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Trailer Modal */}
        <AnimatePresence>
          {selectedTrailer && (
            <div 
                className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
                onClick={() => setSelectedTrailer(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 rounded-3xl max-w-5xl w-full aspect-video relative overflow-hidden shadow-2xl"
              >
                <button 
                  onClick={() => setSelectedTrailer(null)}
                  className="absolute top-4 left-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-red-500/80 transition-all border border-white/10 shadow-lg"
                >
                  <X className="w-6 h-6" />
                </button>
                <iframe 
                  src={selectedTrailer}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Movie Trailer"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Blog;
