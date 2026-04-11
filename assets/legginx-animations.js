// legginx-animations.js
// Standalone vanilla JS intersection observer for the Shopify sections
document.addEventListener('DOMContentLoaded', () => {
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  if (!animateElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
    // Quick Add Mock Logic
    const cartCount = document.getElementById('cart-count');
    const quickAddBtns = document.querySelectorAll('.quick-add-btn');
    let count = 0;

    quickAddBtns.forEach(btn => {
        const originalText = btn.innerHTML;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Increment Cart
            count++;
            if (cartCount) {
                cartCount.innerText = count;
                cartCount.classList.add('scale-150', 'text-red-500');
                setTimeout(() => {
                    cartCount.classList.remove('scale-150', 'text-red-500');
                }, 300);
            }

            // Button Feedback
            btn.innerHTML = 'Added to Cart!';
            btn.classList.add('bg-white', 'text-black');
            btn.classList.remove('bg-white/10', 'text-white');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-white', 'text-black');
                btn.classList.add('bg-white/10', 'text-white');
            }, 1500);
        });
    });
});
