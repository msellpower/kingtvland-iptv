
import { Plan, DeviceCategory } from './types';

export const PLANS: Plan[] = [
  {
    id: 'king',
    name: 'מנוי KING',
    priceNew: 250,
    priceExisting: 150,
    features: ['אלפי ערוצים מהעולם', 'סרטים וסדרות VOD', 'ספורט ישראלי ועולמי כל ערוצי ישראל', 'תמיכה ב-FHD/4K'],
    enabled: true,
  },
  {
    id: 'vod',
    name: 'מנוי VOD',
    priceNew: 150,
    priceExisting: 150,
    features: ['VOD ישראלי הכולל אלפי סרטים וסדרות', 'מתורגמים באופן מלא באיכות גבוהה', 'מתעדכן על בסיס שבועי'],
    enabled: false,
  },
  {
    id: 'israel',
    name: 'מנוי ישראלי',
    priceNew: 250,
    priceExisting: 180,
    features: ['כל הערוצים הישראלים', 'ספורט ישראלי כל הערוצים', 'ספריית VOD עברית עשירה', 'עד 94% יציבות'],
    enabled: true,
  },
  {
    id: 'premium',
    name: 'מנוי פרימיום',
    priceNew: 350,
    priceExisting: 250,
    isPremium: true,
    features: ['ספורט ישראלי ועולמי כל ערוצי ישראל', 'שרתים פרטיים מהירים', 'תמיכה ב-4K HDR', 'תיעדוף בתמיכה', 'ארכיון 7 ימים לאחור'],
    enabled: true,
  },
  {
    id: 'gold',
    name: 'מנוי GOLD',
    priceNew: 300,
    priceExisting: 200,
    isPremium: true,
    features: ['כל יתרונות הפרימיום', 'שרתים מהירים במיוחד', 'תמיכה מלאה ב-4K HDR', 'תיעדוף עליון בתמיכה', 'ארכיון 14 ימים לאחור'],
    enabled: true,
  },
];

export const SYSTEM_INSTRUCTION = `
אתה מומחה תמיכה טכנית של שירות KINGTVLAND.
המטרה שלך היא לתת שירות טכני, מקצועי ומהיר. אתה פחות איש מכירות ויותר טכנאי.

הנחיות התנהגות:
1. **טון דיבור:** מקצועי, ענייני, טכני, אדיב. דבר בעברית בלבד.
2. **פתרון תקלות:** אם לקוח מתלונן על תקיעות, הנחה אותו לבדוק חיבור אינטרנט, לבצע ריסט לראוטר, או לנסות אפליקציה אחרת.
3. **התקנה:** אם שואלים על התקנה, הסבר בקצרה והפנה אותם למדריכים באתר.
4. **מכירה:** ציין מחירים רק אם נשאלת במפורש. אל תדחוף לרכישה בכל משפט.
5. **גבולות גזרה:** אם אינך יודע את התשובה או שהבעיה מורכבת (כמו בעיית חשבון ספציפית), הסבר ללקוח שהנושא הועבר לבדיקה טכנית והוא יקבל מענה בהקדם.

מידע טכני:
- מנוי קינג: 150 ש"ח ללא שירות / 250 ש"ח כולל שירות
- מנוי ישראלי: 180 ש"ח ללא שירות / 250 ש"ח כולל שירות
- מנוי GOLD: 200 ש"ח ללא שירות / 300 ש"ח כולל שירות
- מנוי פרימיום: 250 ש"ח ללא שירות / 350 ש"ח כולל שירות
- מנוי VOD: 150 ש"ח לשנה
- אפליקציות נתמכות: Smarters Pro, XCIPTV, TiviMate, IBO Player.
`;

// אימייל לתשלום בפייפאל
export const PAYPAL_EMAIL = "h.hamerkazit@gmail.com";

// M3U Playlist Sources - Synced with Backend & Optimized for Web (HLS)
export const M3U_URLS: Record<string, string> = {
    king: "https://drive.google.com/uc?export=download&id=1qCU8iHdmsIOoH0JEb-DyVo0KNWzL5m4o",
    vod: "http://livetvproo.com:80/get.php?username=R7ZCa8yb2c&password=sEKcWMr9TQ&type=m3u_plus&output=hls",
    israel: "https://drive.google.com/uc?export=download&id=1KU_uh26pIRldW0QSlvYkc73SurbyUWFE",
    premium: "http://shown66208.cdn-akm.me/get.php?username=205bc3c33352&password=ff3a096994&type=m3u_plus&output=hls",
};

// --- Full Guides Data ---
export const FULL_GUIDES_DATA: DeviceCategory[] = [
    {
        id: 'streamer',
        title: 'סטרימר (Firestick / Android TV)',
        icon: 'fire-tv',
        apps: [
            {
                id: 'tivimate',
                name: 'TiviMate',
                description: 'אפליקציה פרימיום לתמיכה בפלייליסטים מותאמים, עם EPG מתקדם.',
                rating: '4.8/5',
                steps: [
                    'הפעילו "אפליקציות ממקורות לא ידועים": עבורו להגדרות > My Fire TV > Developer Options > Apps from Unknown Sources > הפעילו.',
                    'התקינו את אפליקציית Downloader מחנות Amazon Appstore.',
                    'פתחו את Downloader, הזינו את הכתובת tivimate.com/apk או קוד 929878, ולחצו על Go.',
                    'הורידו והתקינו את קובץ ה-APK.',
                    'פתחו את האפליקציה והוסיפו פלייליסט IPTV.'
                ],
                tip: 'לפרימיום, השתמשו ב-Companion App.',
                troubleshoot: 'אם לא נטען, בדקו חיבור אינטרנט.',
                downloadUrl: '929878',
                googlePlayUrl: 'https://play.google.com/store/apps/details?id=ar.tvplayer.tv',
                platforms: ['Android TV', 'Firestick']
            },
            {
                id: 'smarters',
                name: 'IPTV Smarters Pro',
                description: 'אפליקציה רב-תכליתית עם תמיכה ב-Xtream Codes.',
                rating: '4.5/5',
                steps: [
                    'הפעילו "אפליקציות ממקורות לא ידועים" כפי שתואר לעיל.',
                    'התקינו Downloader.',
                    'הזינו את הכתובת iptvsmarters.com או קוד 250931 ב-Downloader.',
                    'הורידו והתקינו את ה-APK.',
                    'פתחו והזינו פרטי כניסה ל-IPTV (Xtream Codes).'
                ],
                tip: 'גרסה חינמית מכילה פרסומות; שדרגו ל-Pro להסרתן.',
                troubleshoot: 'פרסומות מפריעות? שדרגו לגרסת Pro.',
                downloadUrl: '250931',
                googlePlayUrl: 'https://www.iptvsmarters.com/iptv-smarters-5.0.apk',
                appStoreUrl: 'https://apps.apple.com/us/app/smarters-player-lite/id1616402812',
                officialWebsiteUrl: 'https://www.iptvsmarters.com/#downloads',
                platforms: ['Android', 'TV', 'iOS']
            },
            {
                id: 'xciptv',
                name: 'XCIPTV Player',
                description: 'נגן מותאם אישית עם תמיכה ב-4K ועיצוב נקי.',
                rating: '4.6/5',
                steps: [
                    'הפעילו מקורות לא ידועים.',
                    'התקינו Downloader.',
                    'הזינו xciptv.com/apk או קוד 250931.',
                    'הורידו והתקינו.',
                    'הוסיפו פלייליסט.'
                ],
                tip: 'תומך ב-4K בצורה מעולה.',
                troubleshoot: 'אם האפליקציה קורסת, נסו לעדכן גרסה.',
                downloadUrl: 'https://xciptv.com/apk',
                googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.nathnetwork.xciptv',
                platforms: ['Android TV']
            },
            {
                id: 'perfectplayer',
                name: 'Perfect Player',
                description: 'נגן חינמי עם פענוח חומרה ותמיכה ב-PiP.',
                rating: '4.3/5',
                steps: [
                    'הפעילו מקורות לא ידועים.',
                    'התקינו Downloader.',
                    'הזינו קוד 929878.',
                    'הורידו והתקינו APK.',
                    'הגדירו פלייליסט ו-EPG.'
                ],
                tip: 'ממשק פשוט מאוד וקל משקל.',
                troubleshoot: 'הממשק נראה מיושן? ניתן להתאים בהגדרות.',
                downloadUrl: '929878',
                platforms: ['Android']
            },
            {
                id: 'ottnav',
                name: 'OTT Navigator',
                description: 'נגן חזק עם תמיכה ב-Time-shift אוטומטי.',
                rating: '4.4/5',
                steps: [
                    'הפעילו מקורות לא ידועים.',
                    'התקינו Downloader.',
                    'הזינו קוד או כתובת ottnavigator.tv/apk.',
                    'הורידו והתקינו.',
                    'הוסיפו ספק IPTV.'
                ],
                tip: 'מצוין לצפייה בספורט.',
                troubleshoot: 'הגדרות מורכבות? השתמשו במדריך יוטיוב.',
                downloadUrl: 'https://ottnavigator.tv/apk',
                platforms: ['Android TV']
            }
        ]
    },
    {
        id: 'smarttv',
        title: 'טלוויזיה חכמה (Samsung / LG)',
        icon: 'tv',
        apps: [
            {
                id: 'ssiptv',
                name: 'SSIPTV',
                description: 'אפליקציה חינמית עם העלאת M3U דרך אתר אינטרנט.',
                rating: '4.0/5',
                steps: [
                    'חפשו "SS IPTV" בחנות האפליקציות של הטלוויזיה (Samsung Apps או LG Content Store).',
                    'התקינו את האפליקציה.',
                    'פתחו אותה ורשמו את קוד ההתקן (Get Code).',
                    'עבורו לאתר ss-iptv.com במחשב/טלפון, הזינו את הקוד והעלו פלייליסט M3U.',
                    'רעננו את האפליקציה בטלוויזיה.'
                ],
                tip: 'עובד מעולה על טלוויזיות LG.',
                troubleshoot: 'חסר EPG? ודאו שהוספתם את מקור ה-EPG בהגדרות.',
                downloadUrl: 'https://ss-iptv.com',
                googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.ssiptv.app',
                platforms: ['Samsung', 'LG']
            },
            {
                id: 'smartone',
                name: 'SmartOne IPTV',
                description: 'נגן מתקדם עם תמיכה ברדיו ותוצאות ספורט.',
                rating: '4.6/5',
                steps: [
                    'חפשו "SmartOne IPTV" בחנות האפליקציות.',
                    'התקינו ופתחו את האפליקציה.',
                    'רשמו את כתובת ה-MAC המופיעה על המסך.',
                    'עבורו לאתר smartone-iptv.com, הזינו MAC והעלו פלייליסט.',
                    'הפעילו את האפליקציה מחדש.'
                ],
                tip: 'תומך ב-4K.',
                troubleshoot: 'דורש תשלום לאחר תקופת ניסיון.',
                downloadUrl: 'https://smartone-iptv.com',
                googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.smartoneiptv.player',
                platforms: ['Samsung', 'LG', 'Android TV']
            },
            {
                id: 'iboplayer',
                name: 'IBO Player',
                description: 'אפליקציה פשוטה, מהירה ויציבה.',
                rating: '4.1/5',
                steps: [
                    'חפשו "IBO Player" בחנות.',
                    'התקינו ופתחו.',
                    'רשמו את ה-Device ID וה-Key.',
                    'עבורו לאתר iboplayer.com, הזינו את הפרטים והוסיפו M3U.',
                    'שדרגו לפרימיום אם נדרש.'
                ],
                tip: 'ממשק פשוט ונוח.',
                troubleshoot: 'מוגבל בגרסה החינמית.',
                downloadUrl: 'https://iboplayer.com',
                googlePlayUrl: 'https://play.google.com/store/apps/details?id=com.iboplayer.iptv',
                platforms: ['Samsung', 'LG', 'Android']
            },
            {
                id: 'smartiptv',
                name: 'Smart IPTV (SIPTV)',
                description: 'הנגן הקלאסי, קל משקל ומהיר.',
                rating: '4.2/5',
                steps: [
                    'חפשו "Smart IPTV" בחנות.',
                    'התקינו ורשמו את ה-MAC address.',
                    'עבורו ל-siptv.app, הזינו MAC והעלו פלייליסט (URL או קובץ).',
                    'לחצו על "Reload" באתר ואתחלו את האפליקציה בטלוויזיה.'
                ],
                tip: 'טעינת ערוצים מהירה מאוד.',
                troubleshoot: 'ללא VOD מובנה בצורה נוחה.',
                downloadUrl: 'https://siptv.app',
                platforms: ['Samsung', 'LG', 'Android']
            },
            {
                id: 'netiptv',
                name: 'Net IPTV',
                description: 'תמיכה טובה ב-4K ו-VOD.',
                rating: '4.3/5',
                steps: [
                    'חפשו "Net IPTV" בחנות והתקינו.',
                    'רשמו את ה-MAC שמופיע.',
                    'עבורו ל-netiptv.eu/upload, הזינו MAC והעלו M3U URL.',
                    'הפעילו מחדש את האפליקציה.'
                ],
                tip: 'איכות תמונה מצוינת.',
                troubleshoot: 'דורש תשלום להפעלה מלאה.',
                downloadUrl: 'https://netiptv.eu',
                platforms: ['Samsung', 'LG']
            }
        ]
    },
    {
        id: 'pc',
        title: 'מחשב (Windows / Mac)',
        icon: 'desktop',
        apps: [
            {
                id: 'vlc',
                name: 'VLC Media Player',
                description: 'נגן חינמי רב-תכליתי, קוד פתוח.',
                rating: '4.7/5',
                steps: [
                    'עבורו לאתר videolan.org.',
                    'לחצו על Download VLC ובחרו בגרסה ל-Windows או Mac.',
                    'הריצו את קובץ ההתקנה ועקבו אחר ההנחיות.',
                    'פתחו את התוכנה > Media > Open Network Stream.',
                    'הדביקו את לינק ה-M3U ולחצו Play.'
                ],
                tip: 'הכי פשוט לשימוש מהיר.',
                troubleshoot: 'EPG בסיסי מאוד.',
                downloadUrl: 'https://www.videolan.org/vlc/',
                platforms: ['Windows', 'Mac', 'Linux']
            },
            {
                id: 'kodi',
                name: 'Kodi',
                description: 'מרכז מדיה שלם עם תמיכה בתוספים.',
                rating: '4.2/5',
                steps: [
                    'עבורו ל-kodi.tv/download.',
                    'בחרו Windows או Mac והורידו.',
                    'התקינו והפעילו.',
                    'היכנסו ל-Add-ons > התקינו PVR Simple Client.',
                    'בהגדרות התוסף, הזינו את כתובת ה-M3U שלכם.'
                ],
                tip: 'אינסוף אפשרויות עם תוספים.',
                troubleshoot: 'עקומת למידה, דורש הבנה טכנית.',
                downloadUrl: 'https://kodi.tv/download',
                platforms: ['Windows', 'Mac']
            },
            {
                id: 'smarterspc',
                name: 'IPTV Smarters Pro (PC)',
                description: 'ממשק מודרני, זהה לאפליקציית הטלוויזיה.',
                rating: '4.5/5',
                steps: [
                    'עבורו ל-iptvsmarters.com.',
                    'הורידו את גרסת Windows או Mac.',
                    'הריצו את קובץ ההתקנה.',
                    'פתחו, בחרו Login with Xtream Codes והזינו את הפרטים.',
                    'שדרגו ל-Pro אם נדרש.'
                ],
                tip: 'סנכרון מלא עם המנוי.',
                troubleshoot: 'משתמשי Mac - בדקו תאימות גרסת OS.',
                downloadUrl: 'https://www.iptvsmarters.com/#downloads',
                platforms: ['Windows', 'Mac']
            },
            {
                id: 'myiptv',
                name: 'MyIPTV Player',
                description: 'נגן קליל ל-Windows עם תמיכה ב-EPG.',
                rating: '4.2/5',
                steps: [
                    'פתחו את Microsoft Store במחשב.',
                    'חפשו "MyIPTV Player".',
                    'לחצו על Get והתקינו.',
                    'בהגדרות > Add new playlist > הדביקו את ה-M3U.',
                    'הגדירו מקור EPG אם יש.'
                ],
                tip: 'בלעדי ל-Windows.',
                troubleshoot: 'לא קיים למק.',
                downloadUrl: 'https://apps.microsoft.com/store/detail/myiptv-player/9NBLGGH42SLV',
                platforms: ['Windows']
            },
            {
                id: 'perfectpc',
                name: 'Perfect Player (PC)',
                description: 'ביצועים גבוהים וניהול ערוצים נוח.',
                rating: '4.3/5',
                steps: [
                    'עבורו לאתר niklabs.com.',
                    'הורידו גרסת Windows.',
                    'הריצו את המתקין.',
                    'פתחו > הגדרות > Playlist > הזינו את הלינק.',
                    'ניתן לשנות את עיצוב הממשק בהגדרות.'
                ],
                tip: 'תומך ב-PiP (תמונה בתוך תמונה).',
                troubleshoot: 'למשתמשי Mac יש צורך באמולטור אנדרואיד.',
                downloadUrl: 'https://niklabs.com',
                platforms: ['Windows']
            }
        ]
    },
    {
        id: 'mobile',
        title: 'סלולרי (Android / iOS)',
        icon: 'mobile',
        apps: [
            {
                id: 'gse',
                name: 'GSE Smart IPTV',
                description: 'אפליקציה חינמית פופולרית עם תמיכה ב-Chromecast.',
                rating: '4.4/5',
                steps: [
                    'חפשו "GSE Smart IPTV" ב-Google Play או App Store.',
                    'התקינו ופתחו.',
                    'בתפריט > Remote Playlists > לחצו על +.',
                    'בחרו Add M3U URL והדביקו את הלינק.',
                    'הוסיפו EPG אם יש לכם לינק נפרד.'
                ],
                tip: 'עובד מעולה גם על אנדרואיד וגם iOS.',
                troubleshoot: 'אם קורס, נסו לנקות מטמון או לעדכן.',
                downloadUrl: 'https://apps.apple.com/us/app/gse-smart-iptv-pro/id1028734023',
                platforms: ['iOS', 'Android']
            },
            {
                id: 'smartersmob',
                name: 'IPTV Smarters Pro',
                description: 'האפליקציה המוכרת והטובה, בגרסת מובייל.',
                rating: '4.5/5',
                steps: [
                    'חפשו "IPTV Smarters Pro" ב-Play Store או "Smarters Player Lite" ב-App Store.',
                    'התקינו ופתחו.',
                    'בחרו Login with Xtream Codes.',
                    'הזינו שם משתמש, סיסמה וכתובת שרת.',
                    'אשרו כניסה.'
                ],
                tip: 'גרסת iOS מוגבלת יותר ("Lite").',
                troubleshoot: 'פרסומות? שדרגו לגרסת Pro.',
                downloadUrl: 'https://www.iptvsmarters.com/#downloads',
                googlePlayUrl: 'https://www.iptvsmarters.com/iptv-smarters-5.0.apk',
                appStoreUrl: 'https://apps.apple.com/us/app/smarters-player-lite/id1616402812',
                officialWebsiteUrl: 'https://www.iptvsmarters.com/#downloads',
                platforms: ['iOS', 'Android']
            },
            {
                id: 'vuiptv',
                name: 'VU IPTV Player',
                description: 'נגן מעולה ומינימליסטי למשתמשי אייפון.',
                rating: '4.3/5',
                steps: [
                    'חפשו "VU IPTV Player" ב-App Store.',
                    'התקינו ופתחו.',
                    'לחצו על Add Playlist > בחרו Xtream Codes.',
                    'הזינו את פרטי הספק.',
                    'התחילו בסטרימינג.'
                ],
                tip: 'ממשק VOD נוח מאוד.',
                troubleshoot: 'לא זמין לאנדרואיד.',
                downloadUrl: 'https://apps.apple.com/us/app/vu-iptv-player/id1552553956',
                platforms: ['iOS']
            },
            {
                id: 'iptvx',
                name: 'IPTVX',
                description: 'חוויית משתמש בסגנון נטפליקס (iOS).',
                rating: '4.6/5',
                steps: [
                    'חפשו "IPTVX" ב-App Store.',
                    'התקינו ופתחו.',
                    'הוסיפו פלייליסט M3U או Xtream.',
                    'האפליקציה תסרוק ותסדר את התוכן כפוסטרים.',
                    'צפו בתוכן.'
                ],
                tip: 'אפליקציית פרימיום עם עיצוב מדהים.',
                troubleshoot: 'חלק מהפיצ׳רים בתשלום בלבד.',
                downloadUrl: 'https://apps.apple.com/us/app/iptvx-one-player/id1451470024',
                platforms: ['iOS']
            },
            {
                id: 'iplaytv',
                name: 'iPlayTV',
                description: 'נגן ותיק ויציב למכשירי Apple.',
                rating: '4.1/5',
                steps: [
                    'חפשו "iPlayTV" ב-App Store.',
                    'רכשו והתקינו (בתשלום סמלי).',
                    'פתחו והוסיפו פלייליסט Xtream או M3U.',
                    'הזינו פרטים.',
                    'תומך בסנכרון iCloud.'
                ],
                tip: 'מעולה לאייפד.',
                troubleshoot: 'לא זמין לאנדרואיד.',
                downloadUrl: 'https://apps.apple.com/us/app/iplaytv-iptv-m3u-player/id1072226801',
                platforms: ['iOS']
            }
        ]
    }
];
