
import { BlogPost } from "../types";


const RSS_FEEDS = {
  news: [
    "https://www.seret.co.il/xml/daily/RSSSeretNews.xml",
    "https://www.seret.co.il/xml/daily/RSSseretCriticReviews.xml",
    "https://www.seret.co.il/xml/daily/RSSseretCriticSeriesReviews.xml"
  ],
  now_playing: [
    "https://www.seret.co.il/xml/weekly/RSSseret5NewMovies.xml"
  ],
  popular: [
    "https://www.seret.co.il/xml/weekly/RSSseret5MostViewed.xml"
  ],
  upcoming: [
    "https://www.seret.co.il/xml/weekly/RSSseret5ComingSoon.xml"
  ]
};

const PROXY_URL = "https://api.rss2json.com/v1/api.json?rss_url=";

export const getArticleDetails = async (url: string): Promise<{ subtitle?: string; videoSource?: string; extraDetails?: string; description?: string; title?: string }> => {
  try {
    // Only fetch details for Seret.co.il links via our backend scraper
    if (!url.includes('seret.co.il')) return {};

    const response = await fetch('/api/sheet/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_article_details', url }),
    });
    const result = await response.json();
    if (result.result === 'success') {
      return {
        subtitle: result.subtitle,
        videoSource: result.videoSource,
        extraDetails: result.description || result.extraDetails, // Backend returns description
        title: result.title
      };
    }
    return {};
  } catch (error) {
    console.error("Error fetching article details:", error);
    return {};
  }
};

const fetchRSSFeed = async (url: string): Promise<any[]> => {
    try {
        const res = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
        const data = await res.json();
        return data.status === 'ok' ? data.items : [];
    } catch (e) {
        console.error(`Error fetching RSS ${url}:`, e);
        return [];
    }
};

export const fetchMoviesByCategory = async (category: 'now_playing' | 'popular' | 'top_rated' | 'upcoming' | 'news'): Promise<BlogPost[]> => {
    try {
        let rssItems: any[] = [];
        const feedUrls = RSS_FEEDS[category as keyof typeof RSS_FEEDS] || [];
        
        // Fetch all RSS feeds for this category in parallel
        const feedsData = await Promise.all(feedUrls.map(fetchRSSFeed));
        rssItems = feedsData.flat();

        // If not enough items or specific category, fetch from TMDB as fallback/supplement
        let tmdbMovies: any[] = [];
        if (category !== 'news') { // News is mostly RSS
             try {
                const tmdbCat = category === 'now_playing' ? 'now_playing' : 
                                category === 'popular' ? 'popular' : 
                                category === 'upcoming' ? 'upcoming' : 'top_rated';
                
                const res = await fetch(`/api/public/tmdb?category=${tmdbCat}`);
                const data = await res.json();
                tmdbMovies = data.results || [];
             } catch (e) {}
        }

        // Combine items: RSS first, then TMDB
        const combinedItems = [
            ...rssItems.map(item => ({ type: 'rss', data: item })),
            ...tmdbMovies.map(movie => ({ type: 'tmdb', data: movie }))
        ];

        // Process items
        const enrichedPosts = await Promise.all(combinedItems.slice(0, 40).map(async (item) => {
             if (item.type === 'rss') {
                 const rss = item.data;
                 let image = "";
                 // Extract image
                 const imgMatch = (rss.description || "").match(/src="([^"]+)"/);
                 if (imgMatch) image = imgMatch[1];
                 else if (rss.enclosure?.link) image = rss.enclosure.link;
                 else image = `https://picsum.photos/seed/${encodeURIComponent(rss.title)}/800/450`;

                 return {
                     id: rss.guid || Math.random().toString(36).substr(2, 9),
                     title: rss.title,
                     summary: (rss.description || "").replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                     fullContent: rss.description || "",
                     image: image,
                     date: rss.pubDate ? new Date(rss.pubDate).toLocaleDateString('he-IL') : '',
                     source: "Seret.co.il",
                     category: category,
                     url: rss.link,
                     rating: 0,
                 } as BlogPost;
             } else {
                 const movie = item.data;
                 return {
                    id: movie.id.toString(),
                    title: movie.title,
                    summary: movie.overview || "אין תקציר זמין.",
                    fullContent: movie.overview || "אין תקציר זמין.",
                    image: movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/800/450`,
                    date: movie.release_date ? new Date(movie.release_date).toLocaleDateString('he-IL') : '',
                    source: "TMDB",
                    category: category,
                    url: `https://www.themoviedb.org/movie/${movie.id}`,
                    rating: movie.vote_average,
                 } as BlogPost;
             }
        }));

        return enrichedPosts;

    } catch (e) {
        console.error(`Error fetching ${category}:`, e);
        return [];
    }
};

export const fetchLatestMovieNews = async (): Promise<BlogPost[]> => {
    return fetchMoviesByCategory('news');
};
