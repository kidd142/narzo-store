export function t(obj: { id: string | null; en: string | null }, locale: string) {
  if (locale === 'en' && obj.en) return obj.en;
  return obj.id || '';
}

// Static translations for UI elements
export const translations = {
  nav: {
    home: { id: 'Beranda', en: 'Home' },
    blog: { id: 'Blog', en: 'Blog' },
    products: { id: 'Produk', en: 'Products' },
    search: { id: 'Cari', en: 'Search' },
    about: { id: 'Tentang', en: 'About' }
  },
  home: {
    hero_title: { id: 'Platform Top Up Game & Voucher Digital', en: 'Game Top Up & Digital Voucher Platform' },
    hero_subtitle: { id: 'Terpercaya, Cepat, dan Aman', en: 'Trusted, Fast, and Secure' },
    shop_now: { id: 'Belanja Sekarang', en: 'Shop Now' },
    about_us: { id: 'Tentang Kami', en: 'About Us' },
    featured_products: { id: 'Produk Unggulan', en: 'Featured Products' },
    featured_subtitle: { id: 'Pilihan terbaik untuk gamers', en: 'Best picks for gamers' },
    view_all: { id: 'Lihat Semua', en: 'View All' },
    latest_articles: { id: 'Artikel Terbaru', en: 'Latest Articles' },
    articles_subtitle: { id: 'Tips, trik, dan berita gaming terkini', en: 'Latest gaming tips, tricks, and news' },
    cta_title: { id: 'Siap untuk Top Up?', en: 'Ready to Top Up?' },
    cta_text: { id: 'Bergabunglah dengan ribuan gamers lainnya. Dapatkan harga terbaik dan proses instan hanya di Narzo Store.', en: 'Join thousands of other gamers. Get the best prices and instant processing only at Narzo Store.' },
    cta_button: { id: 'Mulai Top Up Sekarang', en: 'Start Top Up Now' }
  },
  blog: {
    title: { id: 'Blog', en: 'Blog' },
    read_more: { id: 'Baca Selengkapnya', en: 'Read More' },
    min_read: { id: 'menit baca', en: 'min read' },
    views: { id: 'dilihat', en: 'views' },
    no_posts: { id: 'Belum ada artikel', en: 'No articles yet' }
  },
  search: {
    title: { id: 'Cari', en: 'Search' },
    placeholder: { id: 'Cari artikel...', en: 'Search articles...' },
    results: { id: 'hasil', en: 'results' }
  },
  footer: {
    rights: { id: 'Hak cipta dilindungi', en: 'All rights reserved' }
  }
};