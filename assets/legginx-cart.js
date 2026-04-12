// ═══════════════════════════════════════════════════════
// LegginX Cart Drawer v2 — Premium Upgrade
// Free-shipping progress bar · Upsell strip ·
// Animated item entry/exit · Total counter animation
// ═══════════════════════════════════════════════════════

(function () {
  'use strict';

  const FREE_SHIPPING_THRESHOLD = 75;

  // ─── State ──────────────────────────────────────────
  let cart = JSON.parse(localStorage.getItem('legginx-cart') || '[]');

  function saveCart() {
    localStorage.setItem('legginx-cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('legginx:cart-updated', { detail: { cart } }));
  }

  function getCartTotal() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }
  function getCartCount() {
    return cart.reduce((s, i) => s + i.qty, 0);
  }

  // ─── Upsell Products ────────────────────────────────
  const UPSELLS = [
    { id: 'rival_black', name: 'Rival Shorts – Obsidian', price: 44, image: 'images/catalog/rival-shorts/rival-shorts-black/front.png' },
    { id: 'aura_obsidian', name: 'Aura Bra – Obsidian', price: 48, image: 'images/aura_obsidian.png' },
    { id: 'glow_black', name: 'Glow Legging – Black', price: 58, image: 'images/catalog/glow-leggings/glow-leggings-black/front.png' },
  ];

  function getUpsells() {
    const cartIds = new Set(cart.map(i => i.id));
    return UPSELLS.filter(u => !cartIds.has(u.id)).slice(0, 3);
  }

  // ─── Drawer HTML ────────────────────────────────────
  function injectDrawer() {
    if (document.getElementById('cart-drawer')) return;

    const html = `
    <!-- Backdrop -->
    <div id="cart-drawer-backdrop"
         class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] hidden opacity-0 transition-opacity duration-300"></div>

    <!-- Drawer Shell -->
    <div id="cart-drawer"
         class="fixed top-0 right-0 h-full w-full sm:w-[440px] z-[310] transform translate-x-full
                transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                flex flex-col font-['Outfit']"
         style="background:linear-gradient(180deg,rgba(13,13,15,.98) 0%,rgba(9,9,11,.99) 100%);
                backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
                border-left:1px solid rgba(255,255,255,0.06);">

      <!-- ── Header ─────────────────────────────────── -->
      <div class="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
        <div class="flex items-center gap-3">
          <svg class="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
          </svg>
          <h2 class="text-xs uppercase tracking-[0.25em] font-semibold text-white">Your Cart</h2>
          <span id="cd-count"
                class="text-[10px] bg-white/8 text-white/50 px-2 py-0.5 rounded-full font-medium border border-white/8">0</span>
        </div>
        <button id="cd-close" class="p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- ── Free-Shipping Progress Bar ─────────────── -->
      <div id="cd-shipping-banner" class="px-6 pb-4 flex-shrink-0">
        <div class="rounded-xl border border-white/6 px-4 py-3"
             style="background:rgba(255,255,255,0.03)">
          <p id="cd-shipping-text" class="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2"></p>
          <div class="relative w-full h-[3px] rounded-full bg-white/8 overflow-hidden">
            <div id="cd-shipping-bar"
                 class="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
                 style="width:0%;background:linear-gradient(90deg,#666 0%,#fff 100%)"></div>
          </div>
        </div>
      </div>

      <!-- ── Items ──────────────────────────────────── -->
      <div id="cd-items"
           class="flex-1 overflow-y-auto px-4 space-y-2 min-h-0"
           style="scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.08) transparent"></div>

      <!-- ── Empty State ────────────────────────────── -->
      <div id="cd-empty" class="flex-1 hidden flex-col items-center justify-center px-6 py-16">
        <div class="w-16 h-16 rounded-full border border-white/6 flex items-center justify-center mb-6">
          <svg class="w-7 h-7 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
          </svg>
        </div>
        <p class="text-xs text-white/25 uppercase tracking-[0.2em]">Your cart is empty</p>
        <a href="all-items.html"
           class="mt-6 text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white
                  border border-white/8 hover:border-white/30 px-6 py-3 rounded-full transition-all duration-300">
          Browse Collection
        </a>
      </div>

      <!-- ── Upsell Strip ───────────────────────────── -->
      <div id="cd-upsell" class="flex-shrink-0 hidden border-t border-white/5 px-4 py-4">
        <p class="text-[9px] uppercase tracking-[0.25em] text-zinc-600 mb-3 px-1">You Might Also Like</p>
        <div id="cd-upsell-items" class="flex gap-3 overflow-x-auto pb-1"
             style="scrollbar-width:none"></div>
      </div>

      <!-- ── Footer ─────────────────────────────────── -->
      <div id="cd-footer" class="flex-shrink-0 border-t border-white/5 px-6 pt-4 pb-6 hidden"
           style="background:rgba(0,0,0,0.35)">
        <!-- Subtotal row -->
        <div class="flex items-baseline justify-between mb-1">
          <span class="text-[10px] uppercase tracking-[0.2em] text-white/35">Subtotal</span>
          <span id="cd-total" class="text-xl font-light text-white tracking-tight">$0.00</span>
        </div>
        <p class="text-[9px] text-white/20 uppercase tracking-wider mb-4">Shipping & taxes at checkout</p>

        <!-- Checkout CTA -->
        <a href="checkout.html"
           class="cd-checkout-btn flex items-center justify-center gap-2 w-full bg-white text-black text-[11px]
                  uppercase tracking-[0.25em] font-bold py-4 rounded-full transition-all duration-300
                  hover:bg-zinc-100 hover:shadow-[0_0_40px_rgba(255,255,255,0.18)] hover:scale-[1.01] active:scale-[0.98]">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
          </svg>
          Secure Checkout
        </a>

        <!-- Continue shopping -->
        <button id="cd-continue"
                class="w-full text-[9px] uppercase tracking-[0.2em] text-white/30 hover:text-white/70
                       py-3 text-center transition-colors mt-2">
          Continue Shopping
        </button>

        <!-- Trust badges -->
        <div class="flex items-center justify-center gap-4 mt-3 opacity-30">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3.5 6.5v5C3.5 16.38 7.14 21.06 12 22c4.86-.94 8.5-5.62 8.5-10.5v-5L12 2z"/></svg>
          <span class="text-[9px] uppercase tracking-widest text-white">SSL Secured</span>
          <span class="text-white/20">·</span>
          <span class="text-[9px] uppercase tracking-widest text-white">Free Returns</span>
        </div>
      </div>

    </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    bindDrawerEvents();
  }

  // ─── Render ─────────────────────────────────────────
  function animateCounter(el, targetVal) {
    const curr = parseFloat(el.dataset.curr || '0');
    const diff = targetVal - curr;
    if (Math.abs(diff) < 0.01) { el.textContent = `$${targetVal.toFixed(2)}`; return; }
    let start = null;
    const dur = 350;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = `$${(curr + diff * ease).toFixed(2)}`;
      if (p < 1) requestAnimationFrame(step);
      else el.dataset.curr = targetVal;
    }
    requestAnimationFrame(step);
  }

  function renderShippingBar() {
    const total = getCartTotal();
    const pct = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const bar = document.getElementById('cd-shipping-bar');
    const txt = document.getElementById('cd-shipping-text');
    if (!bar || !txt) return;
    if (total >= FREE_SHIPPING_THRESHOLD) {
      txt.textContent = '🎉 You unlocked free shipping!';
      txt.classList.add('text-emerald-400/70');
    } else {
      const rem = (FREE_SHIPPING_THRESHOLD - total).toFixed(2);
      txt.textContent = `$${rem} away from free shipping`;
      txt.classList.remove('text-emerald-400/70');
    }
    setTimeout(() => { bar.style.width = pct + '%'; }, 40);
  }

  function renderUpsells() {
    const strip = document.getElementById('cd-upsell');
    const container = document.getElementById('cd-upsell-items');
    if (!strip || !container) return;
    const upsells = getUpsells();
    if (!upsells.length) { strip.classList.add('hidden'); return; }
    strip.classList.remove('hidden');
    container.innerHTML = upsells.map(u => `
      <div class="flex-shrink-0 w-28 rounded-xl overflow-hidden border border-white/6 cursor-pointer
                  hover:border-white/20 transition-all duration-300 group/up"
           style="background:rgba(255,255,255,0.02)">
        <div class="w-full aspect-[4/5] overflow-hidden bg-black">
          <img src="${u.image}" alt="${u.name}"
               class="w-full h-full object-cover object-top opacity-70 group-hover/up:opacity-100 transition-opacity duration-500">
        </div>
        <div class="p-2">
          <p class="text-[9px] text-white/60 leading-tight truncate">${u.name}</p>
          <p class="text-[9px] text-white/40 mt-0.5">$${u.price}</p>
          <button class="upsell-add-btn mt-1.5 w-full text-[8px] uppercase tracking-widest border border-white/10
                         hover:border-white/40 hover:text-white text-white/40 py-1 rounded-md transition-all"
                  data-id="${u.id}" data-name="${u.name}" data-price="${u.price}" data-image="${u.image}">
            Add
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.upsell-add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart({ id: btn.dataset.id, name: btn.dataset.name, price: parseFloat(btn.dataset.price), image: btn.dataset.image });
        btn.textContent = '✓';
        btn.disabled = true;
      });
    });
  }

  function renderCart(animateNewId) {
    const itemsEl = document.getElementById('cd-items');
    const emptyEl = document.getElementById('cd-empty');
    const footerEl = document.getElementById('cd-footer');
    const countEl = document.getElementById('cd-count');
    const totalEl = document.getElementById('cd-total');

    const count = getCartCount();
    const total = getCartTotal();

    document.querySelectorAll('#cart-count').forEach(el => { el.textContent = count; });
    if (countEl) countEl.textContent = count;
    if (totalEl) animateCounter(totalEl, total);

    renderShippingBar();

    if (!cart.length) {
      if (itemsEl) itemsEl.classList.add('hidden');
      if (emptyEl) { emptyEl.classList.remove('hidden'); emptyEl.classList.add('flex'); }
      if (footerEl) footerEl.classList.add('hidden');
      renderUpsells();
      return;
    }

    if (itemsEl) itemsEl.classList.remove('hidden');
    if (emptyEl) { emptyEl.classList.add('hidden'); emptyEl.classList.remove('flex'); }
    if (footerEl) footerEl.classList.remove('hidden');

    if (!itemsEl) return;

    itemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-row flex gap-3 p-3 rounded-2xl group/row transition-all duration-300
                  hover:bg-white/[0.025] border border-transparent hover:border-white/5
                  ${item.id === animateNewId ? 'opacity-0 translate-x-4' : ''}"
           data-index="${i}" style="transition:opacity .4s ease,transform .4s ease">
        <!-- Thumbnail -->
        <a href="product.html?id=${item.id}"
           class="w-18 h-22 rounded-xl overflow-hidden bg-black/60 flex-shrink-0 block" style="width:72px;height:88px">
          <img src="${item.image}" alt="${item.name}"
               class="w-full h-full object-cover object-top opacity-80 group-hover/row:opacity-100 transition-opacity duration-500">
        </a>
        <!-- Info -->
        <div class="flex-1 flex flex-col justify-between min-w-0 py-0.5">
          <div>
            <h3 class="text-[13px] font-medium text-white truncate leading-tight">${item.name}</h3>
            <p class="text-[9px] uppercase tracking-widest text-white/25 mt-0.5">One Size</p>
          </div>
          <div class="flex items-center justify-between mt-2">
            <!-- Qty stepper -->
            <div class="flex items-center border border-white/8 rounded-full overflow-hidden bg-white/[0.03]">
              <button class="cd-qty w-7 h-7 flex items-center justify-center text-white/35 hover:text-white
                             hover:bg-white/5 transition-all text-sm font-light leading-none"
                      data-action="decrease" data-index="${i}">−</button>
              <span class="w-7 h-7 flex items-center justify-center text-[12px] text-white font-medium">${item.qty}</span>
              <button class="cd-qty w-7 h-7 flex items-center justify-center text-white/35 hover:text-white
                             hover:bg-white/5 transition-all text-sm font-light leading-none"
                      data-action="increase" data-index="${i}">+</button>
            </div>
            <span class="text-[13px] font-medium text-white">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        </div>
        <!-- Remove -->
        <button class="cd-remove self-start text-white/10 hover:text-red-400 transition-colors p-1 mt-0.5 rounded"
                data-index="${i}">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');

    // Animate new item in
    if (animateNewId) {
      requestAnimationFrame(() => {
        const newRow = itemsEl.querySelector(`[data-index="${cart.findIndex(i => i.id === animateNewId)}"]`);
        if (newRow) {
          requestAnimationFrame(() => {
            newRow.style.opacity = '1';
            newRow.style.transform = 'translateX(0)';
          });
        }
      });
    }

    // Qty events
    itemsEl.querySelectorAll('.cd-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        if (btn.dataset.action === 'increase') cart[idx].qty++;
        else {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        saveCart();
        renderCart();
      });
    });

    // Remove events
    itemsEl.querySelectorAll('.cd-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const row = btn.closest('.cart-row');
        row.style.opacity = '0';
        row.style.transform = 'translateX(60px)';
        row.style.maxHeight = row.offsetHeight + 'px';
        setTimeout(() => {
          row.style.maxHeight = '0';
          row.style.padding = '0';
          row.style.marginBottom = '0';
          row.style.overflow = 'hidden';
        }, 200);
        setTimeout(() => {
          cart.splice(idx, 1);
          saveCart();
          renderCart();
        }, 440);
      });
    });

    renderUpsells();
  }

  // ─── Open / Close ────────────────────────────────────
  function openCartDrawer(animateId) {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (!drawer || !backdrop) return;
    renderCart(animateId);
    backdrop.classList.remove('hidden');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0');
      drawer.classList.remove('translate-x-full');
    }));
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
    }, 500);
  }

  // ─── Add to Cart ─────────────────────────────────────
  function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) { existing.qty++; }
    else { cart.push({ ...product, qty: 1 }); }
    saveCart();
    openCartDrawer(product.id);
  }

  // ─── Bind events ────────────────────────────────────
  function bindDrawerEvents() {
    document.getElementById('cd-close')?.addEventListener('click', closeCartDrawer);
    document.getElementById('cd-continue')?.addEventListener('click', closeCartDrawer);
    document.getElementById('cart-drawer-backdrop')?.addEventListener('click', closeCartDrawer);
  }

  // ─── Quick Add buttons ───────────────────────────────
  function bindQuickAddButtons() {
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
      if (btn.dataset.cartBound) return;
      btn.dataset.cartBound = 'true';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.legginx-product-card') || btn.closest('[class*="product"]');
        if (!card) return;

        const linkEl = card.querySelector('a[href*="product.html"]');
        const imgEl = card.querySelector('img');
        const nameEl = card.querySelector('h3 a') || card.querySelector('h3');
        const priceEl = card.querySelector('p[class*="text-zinc"]') || card.querySelector('[class*="price"]');

        const id = linkEl ? new URLSearchParams(linkEl.href.split('?')[1]).get('id') : 'item-' + Date.now();
        const name = nameEl ? nameEl.textContent.trim() : 'Product';
        const image = imgEl ? imgEl.src : '';
        const price = parseFloat((priceEl?.textContent || '0').replace('$', '')) || 0;

        // Button feedback
        const orig = btn.innerHTML;
        btn.innerHTML = '<svg class="inline w-3.5 h-3.5 mr-1.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>Added';
        btn.style.background = 'rgba(52,211,153,0.1)';
        btn.style.borderColor = 'rgba(52,211,153,0.3)';
        btn.style.color = 'rgb(110,231,183)';
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 1400);

        addToCart({ id, name, image, price });
      });
    });
  }

  // ─── Bind header cart icon ───────────────────────────
  function bindCartIcon() {
    document.querySelectorAll('a[href="cart.html"]').forEach(link => {
      if (link.closest('#cart-drawer')) return;
      if (link.closest('nav.lg\\:hidden')) return;
      link.addEventListener('click', (e) => { e.preventDefault(); openCartDrawer(); });
    });
  }

  // ─── Init ────────────────────────────────────────────
  function init() {
    injectDrawer();
    renderCart();
    bindQuickAddButtons();
    bindCartIcon();

    const grid = document.getElementById('product-grid');
    if (grid) {
      new MutationObserver(() => bindQuickAddButtons())
        .observe(grid, { childList: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.LegginXCart = { openCartDrawer, closeCartDrawer, addToCart, renderCart };
})();
