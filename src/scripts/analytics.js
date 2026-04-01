// Analytics initialization
// Replace with your actual analytics implementation

// Google Analytics 4 example
function initGoogleAnalytics() {
  const GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID;
  
  if (!GA_MEASUREMENT_ID) {
    return;
  }
  
  // Check for cookie consent
  const consent = localStorage.getItem('cookie-consent');
  if (consent !== 'accepted') {
    return;
  }
  
  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });
  
  window.gtag = gtag;
}

// Event tracking
export function trackEvent(category, action, label, value) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
  
  // Track CTA clicks
  if (category === 'CTA') {
    console.log('CTA Click:', { category, action, label });
  }
}

// Track CTA clicks
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-analytics]');
  if (target) {
    const analytics = target.getAttribute('data-analytics');
    trackEvent('CTA', 'click', analytics);
  }
});

// Track form submissions
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.tagName === 'FORM') {
    const formType = form.getAttribute('data-form-type') || 'contact';
    trackEvent('Form', 'submit', formType);
  }
});

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
} else {
  initGoogleAnalytics();
}
