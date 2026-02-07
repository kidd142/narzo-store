// src/lib/content-ads.ts
// Utility to inject ad placeholders into article content

/**
 * Inject ad placeholder after every N-th H2 heading
 * @param html - Original HTML content
 * @param afterEveryNthH2 - Insert ad after every N-th H2 (default: 2)
 * @returns HTML with ad placeholders inserted
 */
export function injectMidArticleAds(html: string, afterEveryNthH2: number = 2): string {
  if (!html) return html;
  
  // Ad placeholder that will be replaced client-side or via component
  const adPlaceholder = '<!-- AD_SLOT_MID -->';
  
  let h2Count = 0;
  
  // Replace closing </h2> tags and inject ad after every N-th one
  const result = html.replace(/<\/h2>/gi, (match) => {
    h2Count++;
    if (h2Count % afterEveryNthH2 === 0) {
      // Find the next paragraph/content after H2 and inject ad after it
      return match + adPlaceholder;
    }
    return match;
  });
  
  return result;
}

/**
 * Split content into segments around ad placeholders
 * @param html - HTML with ad placeholders
 * @returns Array of content segments
 */
export function splitContentForAds(html: string): string[] {
  if (!html) return [html];
  
  const placeholder = '<!-- AD_SLOT_MID -->';
  return html.split(placeholder);
}

/**
 * Inject ad after specific H2 indices
 * @param html - Original HTML content  
 * @param afterH2Indices - Array of H2 indices to inject after (0-based)
 * @returns HTML with ad placeholders
 */
export function injectAdsAfterH2(html: string, afterH2Indices: number[] = [1]): string {
  if (!html) return html;
  
  const adPlaceholder = '<!-- AD_SLOT_MID -->';
  let h2Count = 0;
  
  return html.replace(/<\/h2>/gi, (match) => {
    const currentIndex = h2Count;
    h2Count++;
    if (afterH2Indices.includes(currentIndex)) {
      return match + adPlaceholder;
    }
    return match;
  });
}
