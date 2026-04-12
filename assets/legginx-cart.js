// ─────────────────────────────────────────────────────────────
// LegginX Cart — Elite Minimal v4
// ─────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const FREE_SHIPPING_THRESHOLD = 75;

  // ── State ──────────────────────────────────────────────────
  let cart = JSON.parse(localStorage.getItem('legginx-cart') || '[]');

  function saveCart() {
    localStorage.setItem('legginx-cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('legginx:cart-updated', { detail: { cart } }));
  }
  function getCartTotal()  { return cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0); }
  function getCartCount()  { return cart.reduce((s, i) => s + (i.qty || 1), 0); }
  function parsePrice(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    return 0;
  }

  // ── Upsells ────────────────────────────────────────────────
  const UPSELLS = [
    { id: 'rival_black',   name: 'Rival Shorts',    sub: 'Black',    price: 44, image: 'images/catalog/competitor-shorts-1/competitor-shorts/DSC06313.jpg' },
    { id: 'aura_obsidian', name: 'Aura Bra',        sub: 'Obsidian', price: 48, image: 'images/aura_obsidian.png' },
    { id: 'glow_black',    name: 'Glow Legging',    sub: 'Black',    price: 58, image: 'images/catalog/glow-leggings/glow-leggings/DSC06652.jpg' },
  ];
  function getUpsells() {
    const ids = new Set(cart.map(i => i.id));
    return UPSELLS.filter(u => !ids.has(u.id)).slice(0, 3);
  }

  // ── Inject global styles once ──────────────────────────────
  function injectStyles() {
    if (document.getElementById('lgx-cart-styles')) return;
    const s = document.createElement('style');
    s.id = 'lgx-cart-styles';
    s.textContent = `
      /* Cart icon click animation */
      @keyframes lgx-cart-pop {
        0%   { transform: scale(1); }
        30%  { transform: scale(0.78); }
        60%  { transform: scale(1.18); }
        80%  { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      @keyframes lgx-badge-pop {
        0%   { transform: scale(1); }
        40%  { transform: scale(1.6); }
        70%  { transform: scale(0.85); }
        100% { transform: scale(1); }
      }
      .lgx-cart-icon-pop { animation: lgx-cart-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .lgx-badge-pop     { animation: lgx-badge-pop 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards; }

      /* Drawer slide */
      #lgx-drawer {
        transform: translateX(100%);
        transition: transform 0.44s cubic-bezier(0.76,0,0.24,1);
      }
      #lgx-drawer.open { transform: translateX(0); }

      #lgx-backdrop {
        opacity: 0;
        transition: opacity 0.38s ease;
        pointer-events: none;
      }
      #lgx-backdrop.open {
        opacity: 1;
        pointer-events: all;
      }

      /* Item row entry */
      @keyframes lgx-row-in {
        from { opacity:0; transform:translateY(14px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .lgx-row-new { animation: lgx-row-in 0.38s cubic-bezier(0.22,1,0.36,1) forwards; }

      /* Item row exit */
      .lgx-row-exit {
        overflow: hidden;
        transition: opacity 0.22s ease, transform 0.22s ease, max-height 0.3s ease, padding 0.3s ease;
        opacity: 0 !important;
        transform: translateX(32px) !important;
        max-height: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }

      /* Scrollbar */
      #lgx-items::-webkit-scrollbar { width: 3px; }
      #lgx-items::-webkit-scrollbar-track { background: transparent; }
      #lgx-items::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius:2px; }

      /* Upsell scrollbar hide */
      #lgx-upsell-items::-webkit-scrollbar { display:none; }

      /* Qty button hover */
      .lgx-qty-btn:hover { color: #fff !important; }

      /* Checkout button shimmer */
      @keyframes lgx-shimmer {
        0%   { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      #lgx-checkout-btn:hover {
        background-size: 200% auto;
        animation: lgx-shimmer 1.2s linear infinite;
        background-image: linear-gradient(90deg, #fff 0%, #d4d4d4 40%, #fff 60%, #d4d4d4 100%);
      }
    `;
    document.head.appendChild(s);
  }

  // ── Drawer HTML ────────────────────────────────────────────
  function injectDrawer() {
    if (document.getElementById('lgx-drawer')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div id="lgx-backdrop"
           style="position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:400;
                  backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)"></div>

      <aside id="lgx-drawer"
             role="dialog" aria-modal="true" aria-label="Cart"
             style="position:fixed;top:0;right:0;height:100%;z-index:401;
                    width:100%;max-width:420px;
                    background:#0d0d0d;
                    border-left:1px solid rgba(255,255,255,0.07);
                    display:flex;flex-direction:column;
                    font-family:'Outfit',sans-serif;
                    box-shadow:-24px 0 64px rgba(0,0,0,0.6)">

        <!-- HEADER -->
        <div id="lgx-header"
             style="display:flex;align-items:center;justify-content:space-between;
                    padding:22px 24px 20px;
                    border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0">
          <div style="display:flex;align-items:baseline;gap:10px">
            <span style="font-size:13px;font-weight:600;letter-spacing:0.06em;
                         text-transform:uppercase;color:#fff">Cart</span>
            <span id="lgx-header-count"
                  style="font-size:11px;color:rgba(255,255,255,0.28);font-weight:400;
                         letter-spacing:0.02em">0 items</span>
          </div>
          <button id="lgx-close"
                  style="width:30px;height:30px;display:flex;align-items:center;
                         justify-content:center;background:none;border:none;
                         cursor:pointer;color:rgba(255,255,255,0.35);
                         transition:color .18s;padding:0"
                  onmouseover="this.style.color='#fff'"
                  onmouseout="this.style.color='rgba(255,255,255,0.35)'">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- SHIPPING BAR -->
        <div id="lgx-ship-wrap"
             style="padding:14px 24px 12px;border-bottom:1px solid rgba(255,255,255,0.05);
                    flex-shrink:0">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
            <p id="lgx-ship-text"
               style="font-size:11px;color:rgba(255,255,255,0.38);
                      font-weight:400;letter-spacing:0.01em;line-height:1.4"></p>
          </div>
          <div style="height:1.5px;background:rgba(255,255,255,0.07);position:relative;overflow:hidden">
            <div id="lgx-ship-bar"
                 style="position:absolute;left:0;top:0;height:100%;width:0%;background:#fff;
                        transition:width 0.7s cubic-bezier(0.34,1.2,0.64,1)"></div>
          </div>
        </div>

        <!-- ITEMS -->
        <div id="lgx-items"
             style="flex:1;overflow-y:auto;padding:0 24px;min-height:0"></div>

        <!-- EMPTY STATE -->
        <div id="lgx-empty"
             style="display:none;flex-direction:column;align-items:center;justify-content:center;
                    flex:1;padding:48px 32px;text-align:center">
          <div style="width:1px;height:48px;background:rgba(255,255,255,0.1);margin:0 auto 28px"></div>
          <p style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);
                    letter-spacing:0.04em;text-transform:uppercase;margin-bottom:8px">Nothing here</p>
          <p style="font-size:11px;color:rgba(255,255,255,0.22);margin-bottom:32px;line-height:1.6">
            Add items to begin your order
          </p>
          <a href="all-items.html"
             style="font-size:10px;text-transform:uppercase;letter-spacing:0.2em;font-weight:600;
                    color:rgba(255,255,255,0.5);text-decoration:none;
                    border-bottom:1px solid rgba(255,255,255,0.18);padding-bottom:2px;
                    transition:color .2s,border-color .2s"
             onmouseover="this.style.color='#fff';this.style.borderColor='rgba(255,255,255,0.6)'"
             onmouseout="this.style.color='rgba(255,255,255,0.5)';this.style.borderColor='rgba(255,255,255,0.18)'">
            Shop Collection
          </a>
        </div>

        <!-- UPSELL -->
        <div id="lgx-upsell" style="display:none;flex-shrink:0;padding:16px 24px 14px;
                                     border-top:1px solid rgba(255,255,255,0.06)">
          <p style="font-size:9px;text-transform:uppercase;letter-spacing:0.22em;
                    color:rgba(255,255,255,0.22);font-weight:600;margin-bottom:13px">Complete the Look</p>
          <div id="lgx-upsell-items"
               style="display:flex;gap:10px;overflow-x:auto;padding-bottom:2px;
                      scrollbar-width:none;-ms-overflow-style:none"></div>
        </div>

        <!-- FOOTER -->
        <div id="lgx-footer"
             style="display:none;flex-shrink:0;padding:18px 24px 28px;
                    border-top:1px solid rgba(255,255,255,0.07)">

          <!-- Totals -->
          <div style="display:flex;align-items:baseline;justify-content:space-between;
                      margin-bottom:3px">
            <span style="font-size:10px;text-transform:uppercase;letter-spacing:0.18em;
                         color:rgba(255,255,255,0.3);font-weight:500">Total</span>
            <span id="lgx-total"
                  style="font-size:20px;font-weight:300;color:#fff;
                         letter-spacing:-0.02em;font-variant-numeric:tabular-nums">$0.00</span>
          </div>
          <p style="font-size:9.5px;color:rgba(255,255,255,0.18);letter-spacing:0.03em;
                    margin-bottom:18px">Shipping &amp; taxes at checkout</p>

          <!-- Checkout -->
          <a href="checkout.html" id="lgx-checkout-btn"
             style="display:flex;align-items:center;justify-content:center;gap:8px;
                    width:100%;height:50px;background:#fff;color:#0d0d0d;
                    font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;
                    text-decoration:none;border:none;cursor:pointer;
                    transition:opacity .2s;font-family:'Outfit',sans-serif"
             onmouseover="this.style.opacity='0.88'"
             onmouseout="this.style.opacity='1'">
            Checkout
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M9 1l4 4-4 4M1 5h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>

          <!-- Continue -->
          <button id="lgx-continue"
                  style="width:100%;background:none;border:none;cursor:pointer;
                         font-size:9.5px;text-transform:uppercase;letter-spacing:0.18em;
                         color:rgba(255,255,255,0.2);padding:14px 0 0;
                         font-family:'Outfit',sans-serif;transition:color .18s"
                  onmouseover="this.style.color='rgba(255,255,255,0.55)'"
                  onmouseout="this.style.color='rgba(255,255,255,0.2)'">
            Continue Shopping
          </button>

          <!-- Trust line -->
          <div style="display:flex;align-items:center;justify-content:center;gap:14px;
                      margin-top:16px;padding-top:14px;
                      border-top:1px solid rgba(255,255,255,0.05)">
            <span style="font-size:8.5px;text-transform:uppercase;letter-spacing:0.15em;
                         color:rgba(255,255,255,0.16)">Secure Checkout</span>
            <span style="width:2px;height:2px;border-radius:50%;background:rgba(255,255,255,0.12)"></span>
            <span style="font-size:8.5px;text-transform:uppercase;letter-spacing:0.15em;
                         color:rgba(255,255,255,0.16)">Free Returns</span>
            <span style="width:2px;height:2px;border-radius:50%;background:rgba(255,255,255,0.12)"></span>
            <span style="font-size:8.5px;text-transform:uppercase;letter-spacing:0.15em;
                         color:rgba(255,255,255,0.16)">Fast Shipping</span>
          </div>
        </div>

      </aside>
    `);

    bindDrawerEvents();
  }

  // ── Animated total counter ─────────────────────────────────
  function animateTotal(el, target) {
    const curr = parseFloat(el.dataset.curr || '0');
    if (Math.abs(target - curr) < 0.005) { el.textContent = `$${target.toFixed(2)}`; el.dataset.curr = target; return; }
    const dur = 380; let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = `$${(curr + (target - curr) * e).toFixed(2)}`;
      if (p < 1) requestAnimationFrame(step);
      else el.dataset.curr = target;
    }
    requestAnimationFrame(step);
  }

  // ── Shipping bar ───────────────────────────────────────────
  function renderShipping() {
    const total = getCartTotal();
    const pct   = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const bar   = document.getElementById('lgx-ship-bar');
    const txt   = document.getElementById('lgx-ship-text');
    if (!bar || !txt) return;

    if (total >= FREE_SHIPPING_THRESHOLD) {
      txt.innerHTML = `<span style="color:rgba(255,255,255,0.7)">Free shipping unlocked</span>`;
      bar.style.background = '#fff';
    } else {
      const rem = (FREE_SHIPPING_THRESHOLD - total).toFixed(2);
      txt.innerHTML = `Spend <span style="color:rgba(255,255,255,0.72);font-weight:500">$${rem} more</span> to unlock free shipping`;
      bar.style.background = 'rgba(255,255,255,0.55)';
    }
    setTimeout(() => { bar.style.width = pct + '%'; }, 40);
  }

  // ── Upsell render ──────────────────────────────────────────
  function renderUpsells() {
    const wrap = document.getElementById('lgx-upsell');
    const list = document.getElementById('lgx-upsell-items');
    if (!wrap || !list) return;
    const ups = getUpsells();
    if (!ups.length) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'block';

    list.innerHTML = ups.map(u => `
      <div style="flex-shrink:0;width:120px;cursor:pointer;
                  border:1px solid rgba(255,255,255,0.06);
                  transition:border-color .2s"
           onmouseover="this.style.borderColor='rgba(255,255,255,0.2)'"
           onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
        <div style="width:120px;height:100px;overflow:hidden;background:#111">
          <img src="${u.image}" alt="${u.name}"
               style="width:100%;height:100%;object-fit:cover;object-position:top;
                      opacity:0.75;transition:opacity .3s,transform .4s"
               onmouseover="this.style.opacity='1';this.style.transform='scale(1.05)'"
               onmouseout="this.style.opacity='0.75';this.style.transform='scale(1)'"
               onerror="this.parentElement.style.background='#1a1a1a'">
        </div>
        <div style="padding:9px 10px 10px">
          <p style="font-size:10px;font-weight:500;color:rgba(255,255,255,0.7);
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                    margin-bottom:1px">${u.name}</p>
          <p style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:8px">${u.sub} · $${u.price}</p>
          <button class="lgx-upsell-add"
                  data-id="${u.id}" data-name="${u.name}" data-price="${u.price}" data-image="${u.image}"
                  style="width:100%;height:26px;background:none;
                         border:1px solid rgba(255,255,255,0.15);
                         color:rgba(255,255,255,0.55);font-size:9px;
                         text-transform:uppercase;letter-spacing:0.16em;font-weight:600;
                         cursor:pointer;transition:background .18s,border-color .18s,color .18s;
                         font-family:'Outfit',sans-serif"
                  onmouseover="if(!this.disabled){this.style.background='rgba(255,255,255,0.07)';this.style.borderColor='rgba(255,255,255,0.35)';this.style.color='#fff'}"
                  onmouseout="if(!this.disabled){this.style.background='none';this.style.borderColor='rgba(255,255,255,0.15)';this.style.color='rgba(255,255,255,0.55)'}">
            Add
          </button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.lgx-upsell-add').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart({ id: btn.dataset.id, name: btn.dataset.name, price: parsePrice(btn.dataset.price), image: btn.dataset.image });
        btn.textContent = '✓';
        btn.style.color = 'rgba(255,255,255,0.7)';
        btn.style.borderColor = 'rgba(255,255,255,0.3)';
        btn.disabled = true;
      });
    });
  }

  // ── Main render ────────────────────────────────────────────
  function renderCart(animNewId) {
    const itemsEl  = document.getElementById('lgx-items');
    const emptyEl  = document.getElementById('lgx-empty');
    const footerEl = document.getElementById('lgx-footer');
    const totalEl  = document.getElementById('lgx-total');
    const countLbl = document.getElementById('lgx-header-count');

    const count = getCartCount();
    const total = getCartTotal();

    document.querySelectorAll('#cart-count').forEach(el => { el.textContent = count; });
    if (countLbl) countLbl.textContent = count === 1 ? '1 item' : `${count} items`;
    if (totalEl)  animateTotal(totalEl, total);

    renderShipping();

    if (!cart.length) {
      if (itemsEl)  { itemsEl.style.display = 'none'; itemsEl.innerHTML = ''; }
      if (emptyEl)  emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      renderUpsells();
      return;
    }

    if (itemsEl)  itemsEl.style.display = 'block';
    if (emptyEl)  emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    itemsEl.innerHTML = cart.map((item, i) => {
      const linePrice = (item.price || 0) * (item.qty || 1);
      const isNew     = item.id === animNewId;
      return `
        <div class="lgx-row${isNew ? ' lgx-row-new' : ''}"
             data-index="${i}"
             style="display:flex;gap:16px;padding:20px 0;
                    border-bottom:1px solid rgba(255,255,255,0.06);
                    max-height:200px;
                    transition:opacity .22s ease,transform .22s ease,max-height .3s ease,padding .3s ease">

          <a href="product.html?id=${item.id}"
             style="flex-shrink:0;display:block;width:80px;height:100px;
                    background:#111;overflow:hidden;text-decoration:none;
                    border:1px solid rgba(255,255,255,0.06)">
            <img src="${item.image}" alt="${item.name}"
                 style="width:100%;height:100%;object-fit:cover;object-position:top;
                        opacity:0.8;transition:opacity .25s"
                 onmouseover="this.style.opacity='1'"
                 onmouseout="this.style.opacity='0.8'"
                 onerror="this.style.display='none'">
          </a>

          <div style="flex:1;display:flex;flex-direction:column;min-width:0;padding:2px 0">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;
                        margin-bottom:4px">
              <div style="min-width:0">
                <p style="font-size:12px;font-weight:500;color:rgba(255,255,255,0.85);
                           white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                           letter-spacing:0.01em;line-height:1.3">${item.name}</p>
                <p style="font-size:10px;color:rgba(255,255,255,0.25);
                           letter-spacing:0.05em;text-transform:uppercase;margin-top:3px">One Size</p>
              </div>
              <button class="lgx-remove"
                      data-index="${i}"
                      style="flex-shrink:0;background:none;border:none;cursor:pointer;
                             color:rgba(255,255,255,0.18);padding:2px;
                             transition:color .18s;line-height:1;font-size:14px;
                             font-family:'Outfit',sans-serif;margin-top:1px"
                      onmouseover="this.style.color='rgba(255,255,255,0.6)'"
                      onmouseout="this.style.color='rgba(255,255,255,0.18)'">×</button>
            </div>

            <div style="margin-top:auto;display:flex;align-items:center;
                        justify-content:space-between">
              <div style="display:flex;align-items:center;gap:0">
                <button class="lgx-qty-btn lgx-qty"
                        data-action="decrease" data-index="${i}"
                        style="width:28px;height:28px;background:none;
                               border:1px solid rgba(255,255,255,0.1);
                               color:rgba(255,255,255,0.3);font-size:15px;line-height:1;
                               cursor:pointer;transition:color .15s,border-color .15s;
                               font-family:'Outfit',sans-serif;
                               display:flex;align-items:center;justify-content:center"
                        onmouseover="this.style.borderColor='rgba(255,255,255,0.3)';this.style.color='#fff'"
                        onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.color='rgba(255,255,255,0.3)'">−</button>
                <span style="width:34px;text-align:center;font-size:12px;font-weight:500;
                              color:rgba(255,255,255,0.8);font-variant-numeric:tabular-nums;
                              border-top:1px solid rgba(255,255,255,0.1);
                              border-bottom:1px solid rgba(255,255,255,0.1);
                              height:28px;display:flex;align-items:center;justify-content:center">${item.qty}</span>
                <button class="lgx-qty-btn lgx-qty"
                        data-action="increase" data-index="${i}"
                        style="width:28px;height:28px;background:none;
                               border:1px solid rgba(255,255,255,0.1);
                               color:rgba(255,255,255,0.3);font-size:15px;line-height:1;
                               cursor:pointer;transition:color .15s,border-color .15s;
                               font-family:'Outfit',sans-serif;
                               display:flex;align-items:center;justify-content:center"
                        onmouseover="this.style.borderColor='rgba(255,255,255,0.3)';this.style.color='#fff'"
                        onmouseout="this.style.borderColor='rgba(255,255,255,0.1)';this.style.color='rgba(255,255,255,0.3)'">+</button>
              </div>
              <span style="font-size:14px;font-weight:500;color:rgba(255,255,255,0.85);
                           font-variant-numeric:tabular-nums;letter-spacing:-0.01em">
                $${linePrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>`;
    }).join('');

    // Bind qty
    itemsEl.querySelectorAll('.lgx-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        if (btn.dataset.action === 'increase') {
          cart[idx].qty++;
        } else {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        saveCart(); renderCart();
      });
    });

    // Bind remove
    itemsEl.querySelectorAll('.lgx-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const row = btn.closest('.lgx-row');
        row.classList.add('lgx-row-exit');
        setTimeout(() => { cart.splice(idx, 1); saveCart(); renderCart(); }, 320);
      });
    });

    renderUpsells();
  }

  // ── Open / Close ───────────────────────────────────────────
  function openCartDrawer(animId) {
    const drawer   = document.getElementById('lgx-drawer');
    const backdrop = document.getElementById('lgx-backdrop');
    if (!drawer) return;
    renderCart(animId);
    requestAnimationFrame(() => {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    const drawer   = document.getElementById('lgx-drawer');
    const backdrop = document.getElementById('lgx-backdrop');
    if (drawer)   drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    setTimeout(() => { document.body.style.overflow = ''; }, 460);
  }

  // ── Add to cart ────────────────────────────────────────────
  function addToCart(product) {
    const price    = parsePrice(product.price);
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
      if (!existing.price && price) existing.price = price;
    } else {
      cart.push({ id: product.id, name: product.name, image: product.image || '', price, qty: 1 });
    }
    saveCart();
    openCartDrawer(product.id);
  }

  // ── Drawer event bindings ──────────────────────────────────
  function bindDrawerEvents() {
    document.getElementById('lgx-close')    ?.addEventListener('click', closeCartDrawer);
    document.getElementById('lgx-continue') ?.addEventListener('click', closeCartDrawer);
    document.getElementById('lgx-backdrop') ?.addEventListener('click', closeCartDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCartDrawer(); });
  }

  // ── Cart icon animation ────────────────────────────────────
  function animateCartIcon() {
    // Animate the SVG bag icon
    const icons = document.querySelectorAll('a[href="cart.html"] svg, button[data-cart-trigger] svg');
    icons.forEach(icon => {
      icon.classList.remove('lgx-cart-icon-pop');
      void icon.offsetWidth; // reflow to restart
      icon.classList.add('lgx-cart-icon-pop');
    });
    // Animate the count badge
    document.querySelectorAll('#cart-count').forEach(badge => {
      badge.classList.remove('lgx-badge-pop');
      void badge.offsetWidth;
      badge.classList.add('lgx-badge-pop');
    });
  }

  // ── Quick-add button bindings ──────────────────────────────
  function bindQuickAddButtons() {
    document.querySelectorAll('.quick-add-btn').forEach(btn => {
      if (btn.dataset.cartBound) return;
      btn.dataset.cartBound = 'true';
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        if (btn.dataset.id && btn.dataset.name && btn.dataset.price) {
          addToCart({ id: btn.dataset.id, name: btn.dataset.name, price: parsePrice(btn.dataset.price), image: btn.dataset.image || '' });
          animateCartIcon();
          showBtnFeedback(btn);
          return;
        }
        const card    = btn.closest('.legginx-product-card') || btn.closest('[class*="product"]');
        if (!card) return;
        const linkEl  = card.querySelector('a[href*="product.html"]');
        const imgEl   = card.querySelector('img');
        const nameEl  = card.querySelector('h3 a') || card.querySelector('h3');
        const priceEl = card.querySelector('p[class*="text-zinc"]') || card.querySelector('[class*="price"]');
        const id      = linkEl ? new URLSearchParams(linkEl.href.split('?')[1]).get('id') : 'item-' + Date.now();
        addToCart({ id, name: nameEl?.textContent.trim() || 'Product', image: imgEl?.src || '', price: parsePrice(priceEl?.textContent) });
        animateCartIcon();
        showBtnFeedback(btn);
      });
    });
  }

  function showBtnFeedback(btn) {
    const orig  = btn.innerHTML;
    const origS = { bg: btn.style.background, border: btn.style.borderColor, color: btn.style.color };
    btn.innerHTML = '✓';
    btn.style.background   = 'rgba(255,255,255,0.06)';
    btn.style.borderColor  = 'rgba(255,255,255,0.25)';
    btn.style.color        = 'rgba(255,255,255,0.8)';
    setTimeout(() => {
      btn.innerHTML         = orig;
      btn.style.background  = origS.bg;
      btn.style.borderColor = origS.border;
      btn.style.color       = origS.color;
    }, 1200);
  }

  // ── Hijack cart icon links ─────────────────────────────────
  function bindCartIcon() {
    document.querySelectorAll('a[href="cart.html"]').forEach(link => {
      if (link.closest('#lgx-drawer')) return;
      if (link.closest('nav.lg\\:hidden')) return;
      link.addEventListener('click', e => {
        e.preventDefault();
        animateCartIcon();
        openCartDrawer();
      });
    });
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    injectStyles();
    injectDrawer();
    renderCart();
    bindQuickAddButtons();
    bindCartIcon();
    new MutationObserver(() => bindQuickAddButtons()).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API ─────────────────────────────────────────────
  window.LegginXCart = { openCartDrawer, closeCartDrawer, addToCart, renderCart };

})();
