// Metrics counter animation (already included in Metrics.astro component)
// This is a standalone version if needed elsewhere

export function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const updateCounter = () => {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start).toString();
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toString();
    }
  };
  
  updateCounter();
}

export function initMetricsCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const metricValue = entry.target.querySelector('.metric-number');
          const target = parseInt(entry.target.getAttribute('data-target') || '0', 10);
          
          if (metricValue && !metricValue.classList.contains('animated')) {
            metricValue.classList.add('animated');
            animateCounter(metricValue, target);
          }
        }
      });
    },
    { threshold: 0.5 }
  );
  
  document.querySelectorAll('.metric-card').forEach((card) => {
    observer.observe(card);
  });
}
