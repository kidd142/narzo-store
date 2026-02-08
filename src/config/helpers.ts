import { config } from './index';

export function isEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature] === true;
}

export function getAdsConfig() {
  if (!isEnabled('ads')) return null;
  return config.ads.adsense;
}
