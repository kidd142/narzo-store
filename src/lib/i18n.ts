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
  about: {
    title: { id: 'Tentang Kami', en: 'About Us' },
    subtitle: { id: 'Narzo Store adalah platform top up games dan voucher digital terpercaya di Indonesia.', en: 'Narzo Store is a trusted game top up and digital voucher platform in Indonesia.' },
    mission_title: { id: 'Misi Kami', en: 'Our Mission' },
    mission_text: { id: 'Menyediakan layanan top up game dan voucher digital dengan harga terbaik, proses cepat, dan keamanan terjamin untuk para gamers di Indonesia.', en: 'Providing game top up and digital voucher services with the best prices, fast processing, and guaranteed security for gamers in Indonesia.' },
    instant_title: { id: 'Proses Instan', en: 'Instant Processing' },
    instant_text: { id: 'Dengan sistem otomatis, pesanan Anda akan diproses dalam hitungan detik setelah pembayaran berhasil dikonfirmasi.', en: 'With our automated system, your order will be processed within seconds after payment is confirmed.' },
    secure_title: { id: 'Aman & Terpercaya', en: 'Safe & Trusted' },
    secure_text: { id: 'Semua transaksi dilindungi dengan enkripsi SSL dan kami bekerja sama dengan payment gateway terpercaya di Indonesia.', en: 'All transactions are protected with SSL encryption and we partner with trusted payment gateways in Indonesia.' },
    support_title: { id: 'Support 24/7', en: '24/7 Support' },
    support_text: { id: 'Tim customer service kami siap membantu Anda kapan saja melalui WhatsApp, email, atau live chat.', en: 'Our customer service team is ready to help you anytime via WhatsApp, email, or live chat.' },
    stats_title: { id: 'Dipercaya oleh Ribuan Gamers', en: 'Trusted by Thousands of Gamers' },
    customers: { id: 'Pelanggan', en: 'Customers' },
    transactions: { id: 'Transaksi', en: 'Transactions' },
    products: { id: 'Produk', en: 'Products' },
    rating: { id: 'Rating', en: 'Rating' },
    cta_title: { id: 'Siap untuk Top Up?', en: 'Ready to Top Up?' },
    cta_text: { id: 'Mulai top up game favorit Anda sekarang!', en: 'Start topping up your favorite games now!' },
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
    rights: { id: 'Hak cipta dilindungi', en: 'All rights reserved' }
  }
};