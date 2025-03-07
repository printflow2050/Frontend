// config.ts

// Base URL for API requests
export const BASE_URL = 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  SHOP_DETAILS: `${BASE_URL}/api/shop`, // Base for shop details (append /:shopId)
  PRINT_JOBS: `${BASE_URL}/api/printjobs`, // Base for print jobs (append /prints/:shopId, /:jobId, etc.)
  UPLOAD_FILE: `${BASE_URL}/api/upload`, // Base for file upload (append /:shopId)
  FILE_DOWNLOAD: BASE_URL, // Base for file downloads (append file_path)
  PRINT_JOB_STATUS: `${BASE_URL}/api/printjobs/status`, // For status check (append /:token)
  SHOP_REGISTER: `${BASE_URL}/api/shop/register`, // For shop registration
  SHOP_LOGIN: `${BASE_URL}/api/shop/login`, // For shop login
} as const;

// Static Variables
export const STATIC_VARIABLES = {
  MAX_FILE_SIZE_MB: 10, // Maximum file size in MB for uploads
  DATE_FORMAT: 'MMM d, h:mm a', // Date format for display
  STATUS_TYPES: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    DELETED: 'deleted',
  } as const,
  SOCKET_URL: 'http://localhost:5000', // WebSocket URL
  SOCKET_TRANSPORTS: ['websocket'] as const, // WebSocket transport option
  ACCEPTED_FILE_TYPES: {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  } as const,
  ANIMATION_DELAY_MS: 2000, // Delay for status transition (in milliseconds)
  FADE_ANIMATION_TIMEOUT: 500, // Fade animation duration (in milliseconds)
  MAX_COPIES: 100, // Maximum number of copies allowed
  MIN_COPIES: 1, // Minimum number of copies allowed
  DEFAULT_BW_COST_PER_PAGE: 0.10, // Default black & white cost per page
  DEFAULT_COLOR_COST_PER_PAGE: 0.25, // Default color cost per page
  LOCAL_STORAGE_KEYS: {
    TOKEN: 'token', // Key for storing auth token
    SHOP_ID: 'shopId', // Key for storing shop ID
  } as const,
  LOGIN_REDIRECT_PATH: '/dashboard', // Redirect path after successful login
  // Landing Page-specific variables
  APP_NAME: 'PrintFlow', // Application name for branding
  PATHS: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    ANALYTICS: '/dashboard/analytics',
    DEMO: '/demo',
  } as const,
  LANDING_PAGE: {
    HERO_TITLE: 'File Transfers Made Effortless',
    HERO_SUBTITLE:
      'The digital solution that transforms how Xerox shops receive, manage, and process customer files.',
    CTA_TRIAL_TEXT: 'Start 14-Day Free Trial',
    CTA_DEMO_TEXT: 'Watch Demo',
    CTA_SCHEDULE_TEXT: 'Schedule a Demo',
    TRUST_TEXT: 'Trusted by 100+ shops nationwide',
    RATING_TEXT: '4.9/5 average rating',
    HOW_IT_WORKS_TITLE: 'Simplified File Management',
    HOW_IT_WORKS_SUBTITLE:
      'Our 3-step process eliminates the hassle of traditional file transfers, saving you time and reducing customer wait times.',
    FEATURES: [
      {
        TITLE: 'QR Code Upload',
        DESCRIPTION:
          'Customers scan your shop’s unique QR code to instantly upload files from their phone or tablet.',
      },
      {
        TITLE: 'Print Job Dashboard',
        DESCRIPTION:
          'All incoming files appear in your dashboard, where you can preview, manage, and track print jobs.',
      },
      {
        TITLE: 'Analytics & Insights',
        DESCRIPTION:
          'Track earnings, monitor print job trends, and optimize your business with detailed analytics.',
      },
    ] as const,
    BENEFITS_TITLE: 'Why PrintFlow Makes a Difference',
    BENEFITS_SUBTITLE:
      'Our platform is specifically designed for Xerox shop owners to solve common challenges and improve profitability.',
    BENEFITS: [
      {
        TITLE: '30% Time Savings',
        DESCRIPTION:
          'Automate file transfers and reduce customer wait times, serving more customers daily.',
      },
      {
        TITLE: 'Enhanced Security',
        DESCRIPTION: 'Files are automatically deleted after printing, ensuring customer data privacy.',
      },
      {
        TITLE: 'Better Customer Experience',
        DESCRIPTION:
          'Provide a modern, tech-savvy experience that sets your shop apart from competitors.',
      },
    ] as const,
    STATS: [
      { NUMBER: '30%', LABEL: 'Time Saved' },
      { NUMBER: '100+', LABEL: 'Active Shops' },
      { NUMBER: '15k+', LABEL: 'Files Processed' },
      { NUMBER: '99.9%', LABEL: 'Uptime' },
    ] as const,
    FINAL_CTA_TITLE: 'Ready to Transform Your Xerox Shop?',
    FINAL_CTA_SUBTITLE:
      'Join the growing community of 100+ shop owners who have revolutionized their file handling process.',
    FOOTER_YEAR: '2025',
  } as const,
} as const;