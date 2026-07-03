/**
 * Campaign Tracking Utility
 * Captures UTM parameters, click IDs, referrer, device info on first visit.
 * Stores in sessionStorage so it persists across page navigations.
 */

const STORAGE_KEY = 'dne_tracking';

function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    gclid: params.get('gclid') || '',
    fbclid: params.get('fbclid') || '',
    msclkid: params.get('msclkid') || '',
  };
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

/**
 * Initialize tracking on page load.
 * Only captures initial data on first visit within the session.
 * Updates last_visit on every call.
 */
export function initTracking() {
  const now = new Date().toISOString();
  const existing = getTrackingData();

  if (!existing.first_visit_at) {
    // First visit in this session — capture all data
    const params = getUrlParams();
    const data = {
      landing_url: window.location.href.split('?')[0],
      referrer: document.referrer || '',
      ...params,
      browser: getBrowser(),
      device: getDeviceType(),
      first_visit_at: now,
      last_visit_at: now,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } else {
    // Update last visit timestamp
    existing.last_visit_at = now;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
}

/**
 * Retrieve stored tracking data.
 */
export function getTrackingData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
  initTracking();
}
