export const config = {
  // Site info
  site: {
    name: import.meta.env.SITE_NAME || 'Narzo',
    url: import.meta.env.SITE_URL || 'https://narzo.site',
    locale: 'id',
    locales: ['id', 'en'],
  },
  
  // Feature flags
  features: {
    blog: true,
    search: true,
    ads: import.meta.env.ADSENSE_ENABLED === 'true',
    analytics: false,
    comments: false,
    newsletter: false,
  },
  
  // Admin settings
  admin: {
    email: import.meta.env.ADMIN_EMAIL,
  },
  
  // Ads provider config
  ads: {
    provider: 'adsense',
    adsense: {
      publisherId: import.meta.env.ADSENSE_PUBLISHER_ID,
      slots: {
        header: import.meta.env.ADSENSE_HEADER_SLOT,
        sidebar: import.meta.env.ADSENSE_SIDEBAR_SLOT,
        article: import.meta.env.ADSENSE_ARTICLE_SLOT,
        footer: import.meta.env.ADSENSE_FOOTER_SLOT,
      },
    },
  },
  
  // Storage config (for images only)
  storage: {
    provider: 'r2',
    maxFileSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
  
  // Editor config
  editor: {
    provider: 'quill',
  },
};

export type Config = typeof config;
export type Features = typeof config.features;
