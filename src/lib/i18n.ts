export function t(obj: { id: string | null; en: string | null }, locale: string) {
  if (locale === 'en' && obj.en) return obj.en;
  return obj.id || '';
}