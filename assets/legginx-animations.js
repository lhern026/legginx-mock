// ═══════════════════════════════════════════════════════
// LegginX Animations Engine v5
// Scroll-triggered reveals with stagger, parallax hints
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll('.animate-on-scroll');

  if (!animateElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.08
  };

  // Stagger counter per parent group
  const staggerMap = new WeakMap();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;

        // Calculate stagger delay based on sibling index
        const parent = el.parentElement;
        if (!staggerMap.has(parent)) staggerMap.set(parent, 0);
        const idx = staggerMap.get(parent);
        staggerMap.set(parent, idx + 1);

        // Apply stagger delay if not already set via inline style  
        const existingDelay = el.style.transitionDelay;
        if (!existingDelay || existingDelay === '0ms' || existingDelay === '0s') {
          el.style.transitionDelay = `${idx * 120}ms`;
        }

        el.classList.add('in-view');
        observer.unobserve(el);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));

  // ─── Smooth Parallax for Hero Image ────────────────
  const heroImg = document.querySelector('[class*="hero"] img, .hero-bg img');
  if (heroImg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          if (scrolled < window.innerHeight) {
            heroImg.style.transform = `scale(${1 + scrolled * 0.0003}) translateY(${scrolled * 0.15}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ─── Header Shrink on Scroll ────────────────────────
  const header = document.getElementById('legginx-header');
  if (header) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('bg-black/90', 'backdrop-blur-md', 'shadow-2xl');
        header.classList.remove('bg-transparent');
      } else {
        header.classList.remove('bg-black/90', 'backdrop-blur-md', 'shadow-2xl');
        header.classList.add('bg-transparent');
      }
      lastScroll = scrollY;
    });
  }

  // ─── Counter Animation for Trust Stats ──────────────
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = current.toLocaleString() + suffix;
          }, 30);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }
});
