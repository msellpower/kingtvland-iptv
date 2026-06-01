
export interface SystemSettings {
  SHABBAT_START_FRIDAY: string;
  SHABBAT_END_SATURDAY: string;
  SUPPORT_START_DAILY: string;
  SUPPORT_END_DAILY: string;
  SUPPORT_PHONE: string;
  TELEGRAM_USERNAME: string;
  MAINTENANCE_MODE?: boolean;
  SHABBAT_OVERRIDE?: boolean;
  REGISTRATION_OPEN?: boolean;
  PROMO_BANNER_TEXT?: string;
  SUPPORT_MESSAGE?: string;
  RENEWAL_REMINDER_DAYS_AFTER?: number;
  // Component Visibility
  SHOW_HERO?: boolean;
  SHOW_VOD?: boolean;
  SHOW_DEALS?: boolean;
  SHOW_APPS?: boolean;
  SHOW_PRICING?: boolean;
  // Contact Info
  WHATSAPP_NUMBER?: string;
  CONTACT_EMAIL?: string;
  TELEGRAM_LINK?: string;
  // SEO
  SITE_TITLE?: string;
  SITE_DESCRIPTION?: string;
  SITE_URL?: string;
  DB_MODE?: 'firebase' | 'sheets';
  SUPPORT_ACTIVE?: boolean;
  marketingPopups?: import('../types').MarketingPopup[];
  defaultLanguage?: 'he' | 'en';
  serverStatuses?: Record<string, { label: string; status: 'online' | 'maintenance' | 'crashed' }>;
  youtubeVideoUrl?: string;
  appVideoUrls?: Record<string, string>;
}

export const getIsraelTime = () => {
  const now = new Date();
  // Israel is UTC+2 (Standard) or UTC+3 (Daylight Savings)
  // For simplicity and robustness, we use Intl.DateTimeFormat
  const israelTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
  return new Date(israelTimeStr);
};

export const checkSystemStatus = (settings: SystemSettings | null) => {
  if (!settings) {
    // Fallback defaults if settings fail to load
    settings = {
      SHABBAT_START_FRIDAY: '14:00',
      SHABBAT_END_SATURDAY: '20:00',
      SUPPORT_START_DAILY: '11:00',
      SUPPORT_END_DAILY: '22:00',
      SUPPORT_PHONE: '972549946953',
      TELEGRAM_USERNAME: 'kingtvland',
      MAINTENANCE_MODE: false,
      SHABBAT_OVERRIDE: false,
      REGISTRATION_OPEN: true,
      PROMO_BANNER_TEXT: '',
      SUPPORT_MESSAGE: '',
      RENEWAL_REMINDER_DAYS_AFTER: 0,
      SHOW_HERO: true,
      SHOW_VOD: true,
      SHOW_DEALS: true,
      SHOW_APPS: true,
      SHOW_PRICING: true
    };
  }

  // Maintenance Mode Check
  if (settings.MAINTENANCE_MODE) {
      return { isShabbat: false, isSupportActive: false, isServiceActive: false, isMaintenance: true };
  }

  const now = getIsraelTime();
  const day = now.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const shabbatStart = parseTime(settings.SHABBAT_START_FRIDAY);
  // const shabbatEnd = parseTime(settings.SHABBAT_END_SATURDAY); // Not used if we close all Saturday
  const supportStart = parseTime(settings.SUPPORT_START_DAILY);
  const supportEnd = parseTime(settings.SUPPORT_END_DAILY);

  let isShabbat = false;
  // Friday after start time
  if (day === 5 && currentTimeInMinutes >= shabbatStart) isShabbat = true;
  // Saturday (all day)
  if (day === 6) isShabbat = true;

  // Shabbat Override
  if (settings.SHABBAT_OVERRIDE) {
      isShabbat = false;
  }

  let isSupportActive = true;
  if (isShabbat) {
    isSupportActive = false;
  } else {
    // Sun-Thu (0-4)
    if (day >= 0 && day <= 4) {
      if (currentTimeInMinutes < supportStart || currentTimeInMinutes >= supportEnd) {
        isSupportActive = false;
      }
    }
    // Friday (5)
    if (day === 5) {
      if (currentTimeInMinutes < supportStart || currentTimeInMinutes >= parseTime('14:00')) {
        isSupportActive = false;
      }
    }
  }

  // Explicit override
  if (settings.SUPPORT_ACTIVE === false) {
    isSupportActive = false;
  }

  return { isShabbat, isSupportActive, isServiceActive: true, isMaintenance: false };
};
