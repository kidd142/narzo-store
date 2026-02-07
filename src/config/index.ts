export const config = {
  // Site info
  site: {
    name: import.meta.env.SITE_NAME || 'Narzo Store',
    url: import.meta.env.SITE_URL || 'https://narzo.store',
    locale: 'id',
    locales: ['id', 'en'],
  },
  
  // Feature flags
  features: {
    blog: true,
    products: true,
    search: true,
    payment: !!import.meta.env.TRIPAY_API_KEY,
    ads: import.meta.env.ADSENSE_ENABLED === 'true',
    analytics: false,
    comments: false,
    newsletter: false,
  },
  
  // Admin settings
  admin: {
    email: import.meta.env.ADMIN_EMAIL,
  },
  
  // Payment provider config
  payment: {
    provider: 'tripay',
    tripay: {
      apiKey: import.meta.env.TRIPAY_API_KEY,
      privateKey: import.meta.env.TRIPAY_PRIVATE_KEY,
      merchantCode: import.meta.env.TRIPAY_MERCHANT_CODE,
      sandbox: import.meta.env.TRIPAY_SANDBOX !== 'false',
      baseUrl: import.meta.env.TRIPAY_SANDBOX !== 'false'
        ? 'https://tripay.co.id/api-sandbox'
        : 'https://tripay.co.id/api',
    },
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
  
  // Storage config
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
