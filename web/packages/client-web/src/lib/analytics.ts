declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackWaitlistSignup(type: 'CLIENT' | 'COMPANY') {
  const userType = type.toLowerCase();

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'sign_up', {
      method: 'waitlist',
      user_type: userType,
    });
  }

  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: `waitlist_${userType}`,
    });
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
