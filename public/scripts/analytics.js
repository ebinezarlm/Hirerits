// Analytics initialization
// Replace with your actual analytics implementation

// Google Analytics 4 example
function initGoogleAnalytics() {
  // Get GA ID from data attribute or environment
  const script = document.querySelector('script[data-ga-id]');
  const GA_MEASUREMENT_ID = script ? script.getAttribute('data-ga-id') : null;
  
  if (!GA_MEASUREMENT_ID) {
    return;
  }
  
  // Check for cookie consent
  const consent = localStorage.getItem('cookie-consent');
  if (consent !== 'accepted') {
    return;
  }
  
  // Load GA script
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(gaScript);
  
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });
  
  window.gtag = gtag;
}

// Event tracking
function trackEvent(category, action, label, value) {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
  
  // Track CTA clicks
  if (category === 'CTA') {
    console.log('CTA Click:', { category: category, action: action, label: label });
  }
}

// Track CTA clicks
document.addEventListener('click', function(e) {
  var target = e.target;
  while (target && target !== document.body) {
    if (target.hasAttribute && target.hasAttribute('data-analytics')) {
      var analytics = target.getAttribute('data-analytics');
      trackEvent('CTA', 'click', analytics);
      break;
    }
    target = target.parentElement;
  }
});

// Track form submissions
document.addEventListener('submit', function(e) {
  var form = e.target;
  if (form && form.tagName === 'FORM') {
    var formType = form.getAttribute('data-form-type') || 'contact';
    trackEvent('Form', 'submit', formType);
  }
});

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleAnalytics);
} else {
  initGoogleAnalytics();
}
