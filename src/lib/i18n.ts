/**
 * Translate content based on locale
 * RULE: Fallback konsisten - jika EN tidak ada, tampilkan ID
 * Ini mencegah "language leak" (campur bahasa)
 */
export function t(obj: { id: string | null; en: string | null }, locale: string) {
  if (locale === 'en' && obj.en) return obj.en;
  // Fallback ke ID jika EN tidak tersedia (konsisten, tidak campur)
  return obj.id || '';
}

/**
 * Check if all EN translations are available for an article
 * Used to determine if article should display in EN or fallback entirely to ID
 */
export function hasCompleteEnTranslation(article: { 
  title_en?: string | null; 
  excerpt_en?: string | null;
}): boolean {
  return !!(article.title_en && article.excerpt_en);
}

/**
 * Get localized article fields with consistency
 * If EN is incomplete, returns all ID to prevent mixed languages
 */
export function getLocalizedArticle(article: {
  title_id?: string | null;
  title_en?: string | null;
  excerpt_id?: string | null;
  excerpt_en?: string | null;
}, locale: string): { title: string; excerpt: string } {
  // Jika locale EN tapi terjemahan tidak lengkap, fallback ke ID sepenuhnya
  const useEnglish = locale === 'en' && hasCompleteEnTranslation(article);
  
  return {
    title: (useEnglish ? article.title_en : article.title_id) || '',
    excerpt: (useEnglish ? article.excerpt_en : article.excerpt_id) || ''
  };
}

// Static translations for UI elements
export const translations = {
  nav: {
    home: { id: 'Beranda', en: 'Home' },
    blog: { id: 'Blog', en: 'Blog' },
    search: { id: 'Cari', en: 'Search' },
    about: { id: 'Tentang', en: 'About' }
  },
  home: {
    hero_title: { id: 'Blog Digital & Teknologi Terkini', en: 'Latest Digital & Tech Blog' },
    hero_subtitle: { id: 'Baca artikel menarik seputar teknologi, digital lifestyle, tips, dan tutorial', en: 'Read interesting articles about technology, digital lifestyle, tips, and tutorials' },
    shop_now: { id: 'Baca Artikel', en: 'Read Articles' },
    latest_articles: { id: 'Artikel Terbaru', en: 'Latest Articles' },
    articles_subtitle: { id: 'Tips, trik, dan berita digital terkini', en: 'Latest digital tips, tricks, and news' },
    view_all: { id: 'Lihat Semua', en: 'View All' },
    cta_title: { id: 'Jelajahi Lebih Banyak', en: 'Explore More' },
    cta_text: { id: 'Temukan artikel-artikel menarik lainnya tentang teknologi dan digital lifestyle.', en: 'Discover more interesting articles about technology and digital lifestyle.' },
    cta_button: { id: 'Lihat Semua Artikel', en: 'View All Articles' }
  },
  about: {
    title: { id: 'Tentang Kami', en: 'About Us' },
    subtitle: { 
      id: 'Narzo adalah platform blog dan media digital dengan fokus konten teknologi, lifestyle, dan edukasi.', 
      en: 'Narzo is a blog and digital media platform focused on technology, lifestyle, and educational content.' 
    },
    mission_title: { id: 'Misi Kami', en: 'Our Mission' },
    mission_text: { id: 'Menyediakan konten berkualitas seputar teknologi dan digital lifestyle yang bermanfaat bagi pembaca.', en: 'Providing quality content about technology and digital lifestyle that benefits readers.' },
    support_title: { id: 'Support 24/7', en: '24/7 Support' },
    support_text: { id: 'Tim kami siap membantu Anda kapan saja melalui email atau halaman kontak.', en: 'Our team is ready to help you anytime via email or contact page.' },
    stats_title: { id: 'Dipercaya oleh Ribuan Pembaca', en: 'Trusted by Thousands of Readers' },
    customers: { id: 'Pembaca', en: 'Readers' },
    rating: { id: 'Rating', en: 'Rating' }
  },
  blog: {
    title: { id: 'Blog', en: 'Blog' },
    read_more: { id: 'Baca Selengkapnya', en: 'Read More' },
    min_read: { id: 'menit baca', en: 'min read' },
    views: { id: 'dilihat', en: 'views' },
    no_posts: { id: 'Belum ada artikel', en: 'No articles yet' },
    related: { id: 'Artikel Terkait', en: 'Related Articles' },
    share: { id: 'Bagikan artikel ini', en: 'Share this article' }
  },
  notfound: {
    title: { id: 'Tidak Ditemukan', en: 'Not Found' },
    message: { id: 'Halaman tidak ditemukan', en: 'Page not found' },
    back_home: { id: 'Kembali ke Beranda', en: 'Back to Home' }
  },
  search: {
    title: { id: 'Cari', en: 'Search' },
    placeholder: { id: 'Cari artikel...', en: 'Search articles...' },
    results: { id: 'hasil', en: 'results' }
  },
  footer: {
    rights: { id: 'Hak cipta dilindungi', en: 'All rights reserved' },
    privacy: { id: 'Kebijakan Privasi', en: 'Privacy Policy' },
    terms: { id: 'Syarat & Ketentuan', en: 'Terms of Service' },
    contact: { id: 'Kontak', en: 'Contact' }
  }
};
