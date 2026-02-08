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
    products: { id: 'Produk', en: 'Products' },
    search: { id: 'Cari', en: 'Search' },
    about: { id: 'Tentang', en: 'About' }
  },
  home: {
    hero_title: { id: 'Artikel Digital & Marketplace Terpercaya', en: 'Trusted Digital Articles & Marketplace' },
    hero_subtitle: { id: 'Baca artikel menarik seputar teknologi, digital lifestyle, dan temukan produk digital terbaik', en: 'Read interesting articles about technology, digital lifestyle, and find the best digital products' },
    shop_now: { id: 'Baca Artikel', en: 'Read Articles' },
    about_us: { id: 'Belanja Produk', en: 'Shop Products' },
    featured_products: { id: 'Produk Pilihan', en: 'Selected Products' },
    featured_subtitle: { id: 'Pilihan terbaik untuk kebutuhan digitalmu', en: 'Best picks for your digital needs' },
    view_all: { id: 'Lihat Semua', en: 'View All' },
    latest_articles: { id: 'Artikel Terbaru', en: 'Latest Articles' },
    articles_subtitle: { id: 'Tips, trik, dan berita digital terkini', en: 'Latest digital tips, tricks, and news' },
    cta_title: { id: 'Siap Berbelanja?', en: 'Ready to Shop?' },
    cta_text: { id: 'Bergabunglah dengan ribuan pelanggan lainnya. Dapatkan harga terbaik dan proses instan hanya di Narzo Store.', en: 'Join thousands of other customers. Get the best prices and instant processing only at Narzo Store.' },
    cta_button: { id: 'Mulai Belanja Sekarang', en: 'Start Shopping Now' }
  },
  about: {
    title: { id: 'Tentang Kami', en: 'About Us' },
    subtitle: { 
      id: 'Narzo Store adalah platform blog dan media digital dengan fokus konten teknologi, lifestyle, dan edukasi. Fitur marketplace menyediakan berbagai produk digital seperti e-book, template, kursus, software, lisensi, dan produk digital partner/affiliate.', 
      en: 'Narzo Store is a blog and digital media platform focused on technology, lifestyle, and educational content. Our marketplace features various digital products including e-books, templates, courses, software, licenses, and partner/affiliate digital products.' 
    },
    mission_title: { id: 'Misi Kami', en: 'Our Mission' },
    mission_text: { id: 'Menyediakan konten berkualitas dan produk digital terbaik dengan harga terjangkau, proses cepat, dan keamanan terjamin.', en: 'Providing quality content and the best digital products at affordable prices, with fast processing and guaranteed security.' },
    instant_title: { id: 'Proses Instan', en: 'Instant Processing' },
    instant_text: { id: 'Dengan sistem otomatis, pesanan Anda akan diproses dalam hitungan detik setelah pembayaran berhasil dikonfirmasi.', en: 'With our automated system, your order will be processed within seconds after payment is confirmed.' },
    secure_title: { id: 'Aman & Terpercaya', en: 'Safe & Trusted' },
    secure_text: { id: 'Semua transaksi dilindungi dengan enkripsi SSL dan kami bekerja sama dengan payment gateway terpercaya di Indonesia.', en: 'All transactions are protected with SSL encryption and we partner with trusted payment gateways in Indonesia.' },
    support_title: { id: 'Support 24/7', en: '24/7 Support' },
    support_text: { id: 'Tim kami siap membantu Anda kapan saja melalui email atau halaman kontak.', en: 'Our team is ready to help you anytime via email or contact page.' },
    stats_title: { id: 'Dipercaya oleh Ribuan Pembaca', en: 'Trusted by Thousands of Readers' },
    customers: { id: 'Pembaca', en: 'Readers' },
    transactions: { id: 'Transaksi', en: 'Transactions' },
    products: { id: 'Produk Digital', en: 'Digital Products' },
    rating: { id: 'Rating', en: 'Rating' },
    cta_title: { id: 'Siap Berbelanja?', en: 'Ready to Shop?' },
    cta_text: { id: 'Jelajahi koleksi produk digital kami sekarang!', en: 'Explore our digital product collection now!' },
    view_products: { id: 'Lihat Produk', en: 'View Products' }
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
  products: {
    title: { id: 'Produk', en: 'Products' },
    no_products: { id: 'Belum ada produk', en: 'No products yet' },
    buy_now: { id: 'Beli Sekarang', en: 'Buy Now' },
    add_to_cart: { id: 'Tambah ke Keranjang', en: 'Add to Cart' }
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