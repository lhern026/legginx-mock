// ═══════════════════════════════════════════════════════
// LegginX Cart Drawer Engine
// Premium slide-out cart with glassmorphic design
// ═══════════════════════════════════════════════════════

(function() {
  'use strict';

  // ─── State ──────────────────────────────────────────
  let cart = JSON.parse(localStorage.getItem('legginx-cart') || '[]');

  function saveCart() {
    localStorage.setItem('legginx-cart', JSON.stringify(cart));
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  // ─── Drawer HTML Injection ──────────────────────────
  function injectDrawer() {
    if (document.getElementById('cart-drawer')) return;

    const drawerHTML = `
    <!-- Cart Backdrop -->
    <div id="cart-drawer-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] hidden opacity-0 transition-opacity duration-300"></div>

    <!-- Cart Drawer -->
    <div id="cart-drawer" class="fixed top-0 right-0 h-full w-full sm:w-[420px] z-[310] transform translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col font-['Outfit']"
         style="background: linear-gradient(180deg, rgba(15,15,17,0.97) 0%, rgba(9,9,11,0.99) 100%); backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px); border-left: 1px solid rgba(255,255,255,0.06);">

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
          <h2 class="text-sm uppercase tracking-[0.2em] font-semibold text-white">Your Cart</h2>
          <span id="cart-drawer-count" class="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-medium">0</span>
        </div>
        <button id="cart-drawer-close" class="text-white/40 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Cart Items (scrollable) -->
      <div id="cart-drawer-items" class="flex-1 overflow-y-auto px-6 py-4 space-y-4" style="scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;">
        <!-- Items injected here -->
      </div>

      <!-- Empty State -->
      <div id="cart-drawer-empty" class="flex-1 flex flex-col items-center justify-center px-6 py-12 hidden">
        <svg class="w-16 h-16 text-white/10 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="0.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
        <p class="text-sm text-white/30 uppercase tracking-[0.15em] font-light">Your cart is empty</p>
        <a href="all-items.html" class="mt-6 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 rounded-full transition-all duration-300">Continue Shopping</a>
      </div>

      <!-- Footer -->
      <div id="cart-drawer-footer" class="border-t border-white/5 px-6 py-5 space-y-4" style="background: rgba(0,0,0,0.3);">
        <div class="flex items-center justify-between">
          <span class="text-xs uppercase tracking-[0.15em] text-white/40 font-medium">Subtotal</span>
          <span id="cart-drawer-total" class="text-lg font-semibold text-white">$0.00</span>
        </div>
        <p class="text-[10px] text-white/25 uppercase tracking-wider text-center">Shipping & taxes calculated at checkout</p>
        <a href="cart.html" class="block w-full bg-white text-black text-xs uppercase tracking-[0.2em] font-bold py-4 rounded-full text-center transition-all duration-300 hover:bg-zinc-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.01] active:scale-[0.99]">
          Checkout
        </a>
        <button id="cart-continue-shopping" class="block w-full text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white py-2 text-center transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);
    bindDrawerEvents();
  }

  // ─── Render Cart Items ──────────────────────────────
  function renderCart() {
    const itemsEl = document.getElementById('cart-drawer-items');
    const emptyEl = document.getElementById('cart-drawer-empty');
    const footerEl = document.getElementById('cart-drawer-footer');
    const countEl = document.getElementById('cart-drawer-count');
    const totalEl = document.getElementById('cart-drawer-total');

    // Update all cart count badges
    document.querySelectorAll('#cart-count').forEach(el => {
      el.innerText = getCartCount();
    });
    if (countEl) countEl.innerText = getCartCount();
    if (totalEl) totalEl.innerText = `$${getCartTotal().toFixed(2)}`;

    if (cart.length === 0) {
      if (itemsEl) itemsEl.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      if (footerEl) footerEl.classList.add('hidden');
      return;
    }

    if (itemsEl) itemsEl.classList.remove('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (footerEl) footerEl.classList.remove('hidden');

    if (!itemsEl) return;

    itemsEl.innerHTML = cart.map((item, i) => `
      <div class="flex gap-4 p-3 rounded-xl transition-all duration-300 hover:bg-white/[0.02] group/item" data-index="${i}">
        <a href="product.html?id=${item.id}" class="w-20 h-24 rounded-lg overflow-hidden bg-black/50 flex-shrink-0 block">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover object-top opacity-80 group-hover/item:opacity-100 transition-opacity">
        </a>
        <div class="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          <div>
            <h3 class="text-sm font-medium text-white truncate">${item.name}</h3>
            <p class="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">Size: One Size</p>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-0 border border-white/10 rounded-full overflow-hidden">
              <button class="cart-qty-btn w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs" data-action="decrease" data-index="${i}">−</button>
              <span class="w-7 h-7 flex items-center justify-center text-xs text-white font-medium">${item.qty}</span>
              <button class="cart-qty-btn w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs" data-action="increase" data-index="${i}">+</button>
            </div>
            <span class="text-sm font-medium text-white">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        </div>
        <button class="cart-remove-btn self-start text-white/15 hover:text-red-400 transition-colors p-1 mt-0.5" data-index="${i}">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    `).join('');

    // Bind item events
    itemsEl.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index);
        const action = btn.dataset.action;
        if (action === 'increase') {
          cart[idx].qty++;
        } else if (action === 'decrease') {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        saveCart();
        renderCart();
      });
    });

    itemsEl.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const row = btn.closest('[data-index]');
        row.style.transform = 'translateX(100%)';
        row.style.opacity = '0';
        row.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          cart.splice(idx, 1);
          saveCart();
          renderCart();
        }, 300);
      });
    });
  }

  // ─── Open / Close ───────────────────────────────────
  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (!drawer || !backdrop) return;

    renderCart();
    backdrop.classList.remove('hidden');
    setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
    drawer.classList.remove('translate-x-full');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (!drawer || !backdrop) return;

    drawer.classList.add('translate-x-full');
    backdrop.classList.add('opacity-0');
    setTimeout(() => {
      backdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }, 400);
  }

  // ─── Add to Cart ────────────────────────────────────
  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    saveCart();
    openCartDrawer();
  }

  // ─── Bind Drawer Events ─────────────────────────────
  function bindDrawerEvents() {
    const closeBtn = document.getElementById('cart-drawer-close');
    const continueBtn = document.getElementById('cart-continue-shopping');
    const backdrop = document.getElementById('cart-drawer-backdrop');

    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
    if (continueBtn) continueBtn.addEventListener('click', closeCartDrawer);
    if (backdrop) backdrop.addEventListener('click', closeCartDrawer);
  }

  // ─── Bind Quick Add Buttons ─────────────────────────
  function bindQuickAddButtons() {
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
      // Skip if already bound
      if (btn.dataset.cartBound) return;
      btn.dataset.cartBound = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Extract product data from the card
        const card = btn.closest('.legginx-product-card') || btn.closest('[class*="product"]');
        if (!card) return;

        const linkEl = card.querySelector('a[href*="product.html"]');
        const imgEl = card.querySelector('img');
        const nameEl = card.querySelector('h3 a') || card.querySelector('h3');
        const priceEl = card.querySelector('p[class*="text-zinc"]');

        const id = linkEl ? new URLSearchParams(linkEl.href.split('?')[1]).get('id') : 'item-' + Date.now();
        const name = nameEl ? nameEl.textContent.trim() : 'Product';
        const image = imgEl ? imgEl.src : '';
        const priceText = priceEl ? priceEl.textContent.trim() : '$0';
        const price = parseFloat(priceText.replace('$', '')) || 0;

        // Button feedback animation
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Added';
        btn.classList.add('bg-white', 'text-black', 'scale-105');
        btn.classList.remove('bg-white/10', 'text-white');

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('bg-white', 'text-black', 'scale-105');
          btn.classList.add('bg-white/10', 'text-white');
        }, 1200);

        addToCart({ id, name, image, price });
      });
    });
  }

  // ─── Bind Header Cart Icon ──────────────────────────
  function bindCartIcon() {
    // Make header cart icon open drawer instead of navigating
    document.querySelectorAll('a[href="cart.html"]').forEach(link => {
      // Skip the checkout button in the drawer and the mobile dock
      if (link.closest('#cart-drawer') || link.closest('#cart-drawer-footer')) return;
      // Keep the bottom dock link as a page navigation
      if (link.closest('nav.lg\\:hidden')) return;

      link.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    });
  }

  // ─── Initialize ─────────────────────────────────────
  function init() {
    injectDrawer();
    renderCart(); // Set initial count
    bindQuickAddButtons();
    bindCartIcon();

    // Re-bind when new products are dynamically loaded
    const gridObserver = new MutationObserver(() => {
      bindQuickAddButtons();
    });
    const grid = document.getElementById('product-grid');
    if (grid) gridObserver.observe(grid, { childList: true });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.LegginXCart = { openCartDrawer, closeCartDrawer, addToCart, renderCart };
})();
