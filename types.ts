
export interface Plan {
  id: string;
  name: string;
  priceNew: number;
  priceExisting: number;
  priceNewHalf?: number;
  priceExistingHalf?: number;
  features: string[];
  isPremium?: boolean;
  period?: string; // e.g. 'שנה', 'חצי שנה'
  isPopular?: boolean;
  enabled?: boolean;
}

export enum CustomerType {
  NEW = 'חדש',
  EXISTING = 'קיים'
}

export enum ServiceLevel {
  VIP = 'VIP',
  BASIC = 'No Service'
}

export interface ChatMessage {
  id?: string;
  sessionId: string; // User email or Random ID
  sender: 'user' | 'admin' | 'system';
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatSession {
    sessionId: string;
    lastMessage: string;
    lastTimestamp: string;
    unreadCount: number;
    userName?: string; // Optional
}

export interface OrderData {
  date?: string;
  name: string;
  phone: string;
  email?: string; // New
  planId: string;
  customerType: string;
  serviceType: string;
  isRenewal?: boolean; // New
  targetUsername?: string; // New
  paymentMethod?: string; // New
  status?: string;
  rowIndex?: number;
}

// Updated AppGuide Structure
export interface GuideStep {
    text: string;
}

export interface GuideApp {
  id: string;
  name: string;
  rating: string;
  description: string;
  steps: string[];
  tip?: string;
  troubleshoot?: string;
  downloadUrl?: string; // URL or Downloader Code
  googlePlayUrl?: string; // New
  appStoreUrl?: string; // New
  officialWebsiteUrl?: string; // New
  platforms?: string[]; // e.g. ['Android', 'iOS', 'TV']
  videoUrl?: string; // New
}

export interface DeviceCategory {
    id: string;
    title: string;
    icon: string;
    apps: GuideApp[];
}

export interface Subscription {
  username: string;
  password?: string; // Optional for security in frontend display if not needed
  email: string;
  createdAt: string;
  expireDate: string;
  daysLeft: number;
  notes: string;
  lastLogin: string;
  type: string;
  serviceLevel?: string;
}

export interface UserSession {
  email: string;
  name?: string;
  phone?: string;
  birthday?: string; // YYYY-MM-DD
  role?: 'admin' | 'user';
  subscriptions: Subscription[];
}

export interface ContentItem {
  type: 'Channel' | 'Movie' | 'Series';
  category: string; // Country for channels, Genre for VOD
  name: string;
  logo?: string;
}

export interface ReportTicket {
  timestamp?: string;
  planId: string;
  type: string;
  category: string;
  name: string;
  season?: string;
  episode?: string;
  description: string;
  status?: string;
  rowIndex?: number; // For admin editing
}

export interface ContentRequest {
    email: string;
    planId: string;
    type: string;
    contentName: string;
    details?: string; // Season/Episode or extra info
}

export interface DashboardStats {
  totalRevenue: number;
  activeSubscribers: number;
  openTickets: number;
  newLeadsToday: number;
  recentOrders: OrderData[];
  chartData: { date: string; count: number }[]; // For graphs
  planDistribution: { name: string; value: number }[];
  expiringThisMonth?: number;
  unreadMessages?: number; // New for chat
}

export interface AdminDataResponse {
  stats: DashboardStats;
  orders: any[];
  customers: any[];
  subscribers: any[];
  reports: any[];
  chatSessions?: ChatSession[];
  blogComments?: BlogComment[];
  requests?: any[];
  settings?: any;
  resellerCrm?: any[];
  resellerRegistrations?: any[];
}

export interface StreamChannel {
    name: string;
    group: string;
    url: string;
    logo?: string;
}

// --- Premium API Types ---

export interface PremiumResellerInfo {
    status: string;
    username: string;
    credits: string;
    enabled: string;
}

export interface PremiumPackage {
    id: string;
    name: string;
}

export interface PremiumDeviceInfo {
    status: string;
    username?: string;
    password?: string;
    expire?: string;
    country?: string;
    user_id?: string;
    note?: string;
    url?: string;
    enabled?: string;
    message?: string;
}

export interface PremiumApiResponse {
    result: 'success' | 'error';
    data?: any;
    error?: string;
}

export interface ReferralData {
    code: string;
    count: number;
    rewardsAvailable: number;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  fullContent?: string;
  image: string;
  date: string;
  source: string;
  category: 'israel' | 'hollywood' | 'netflix' | 'general' | 'now_playing' | 'popular' | 'top_rated' | 'upcoming' | 'news';
  url: string;
  rating?: number;
  trailerUrl?: string;
  subtitle?: string;
  videoSource?: string;
  extraDetails?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  userName: string;
  text: string;
  timestamp: string;
  status: 'Pending' | 'Approved' | 'Deleted';
}

export interface ResellerPackage {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
    isPopular?: boolean;
}

export interface ResellerTransaction {
  Date: string;
  ResellerName: string;
  Type: 'Income' | 'Expense';
  Amount: number;
  Category: string;
  Description: string;
  Status: string;
  rowIndex?: number;
}

export interface ResellerRegistration {
  date?: string;
  name: string;
  email: string;
  isExistingCustomer: boolean;
  packageType: 'King' | 'Israeli' | 'Premium';
  planType: string;
  phone: string;
  status?: string;
  rowIndex?: number;
}

export interface ResellerCrmData {
  transactions: ResellerTransaction[];
  stats: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
}

export interface MarketingPopup {
  id: string;
  title: string;
  content: string;
  ctaText: string;
  ctaLink: string;
  delaySeconds: number;
  order: number;
  isActive: boolean;
}

export interface UserNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  targetType: 'all' | 'plan' | 'users';
  targetPlans?: string[];
  targetUsers?: string[];
}

export interface Config {
  siteName: string;
  welcomeMessage: string;
  maintenanceMode: boolean;
  marketingPopups?: MarketingPopup[];
}
