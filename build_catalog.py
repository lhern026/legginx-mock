import os
import glob
import json
import re

def title_case(s):
    words = re.split(r'[-_]', s)
    clean_words = [w.capitalize() for w in words if w.lower() not in ['copy', 'template']]
    return ' '.join(clean_words)

def build_catalog():
    # Load JSON source database
    try:
        with open('legginx_data.json', 'r') as f:
            db_data = json.load(f)
            shop_products = {p['handle']: p for p in db_data.get('products', [])}
    except Exception as e:
        print("Could not load legginx_data.json:", str(e))
        shop_products = {}

    catalog = []
    base_dir = "images/catalog"
    categories = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

    for cat in categories:
        cat_path = os.path.join(base_dir, cat)
        product_dirs = [d for d in os.listdir(cat_path) if os.path.isdir(os.path.join(cat_path, d))]
        
        for pdir in product_dirs:
            p_path = os.path.join(cat_path, pdir)
            images = [f for f in os.listdir(p_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            if not images:
                continue
                
            images.sort()
            image_paths = [os.path.join(p_path, img) for img in images]
            
            # Cross-reference with legginx_data.json
            if pdir in shop_products:
                sp = shop_products[pdir]
                name = sp.get('title', title_case(pdir))
                
                # Fetch price from the first variant if available
                price_val = "48.00"
                if sp.get('variants') and len(sp['variants']) > 0:
                    price_val = sp['variants'][0].get('price', price_val)
                price = f"${price_val}"
                
                desc = sp.get('body_html', '')
            else:
                # Fallback to heuristics if not found in db
                name = title_case(pdir)
                price = "$48.00" if "legging" in pdir.lower() or "leggings" in cat.lower() else "$32.00"
                desc = ""
            
            catalog.append({
                "id": pdir,
                "category": cat.replace('-', ' ').title(),
                "name": name,
                "price": price,
                "desc": desc,
                "images": image_paths
            })

    # Output product-data.js
    with open('assets/product-data.js', 'w') as f:
        f.write("window.LegginXProducts = ")
        f.write(json.dumps(catalog, indent=2))
        f.write(";\n")
        
    # Generate all-items.html (Preserving original exact layout)
    html_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Items - LegginX Elite</title>
    <link rel="stylesheet" href="assets/rival-shorts-revamp.css?v=8">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="assets/product-data.js"></script>
    <script src="assets/legginx-animations.js?v=5" defer></script>
    <style>
        body { font-family: 'Outfit', sans-serif; background-color: #09090b; color: #ededed; }
        .glass-panel {
            background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.05);
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .reveal-glow:hover {
            box-shadow: 0 0 40px rgba(150, 150, 150, 0.15);
            border-color: rgba(255,255,255,0.15);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased selection:bg-white selection:text-black">

<!-- HEADER SECTION -->
<header class="fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 bg-transparent flex flex-col font-['Outfit'] antialiased group bg-black/90 backdrop-blur-md border-b border-white/5" id="legginx-header">
  <div class="bg-black text-white text-xs font-semibold tracking-widest uppercase text-center py-2 relative z-20 w-full border-b border-white/10">
    Free Shipping All Orders
  </div>
  <div class="w-full px-6 md:px-12 py-4 flex items-center justify-between">
    <div class="flex-1 flex items-center lg:hidden">
      <button id="mobile-nav-toggle" class="text-white hover:text-zinc-400 transition-colors" aria-label="Open navigation">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/></svg>
      </button>
    </div>
    <nav class="hidden lg:flex items-center gap-8 flex-1">
      <a href="rival.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400 transition-colors">Rival</a>
      <a href="glow.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400 transition-colors">Glow</a>
      <a href="aura.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400 transition-colors">Aura</a>
      <a href="all-items.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400 transition-colors" style="color: #cbd5e1;">All Items</a>
    </nav>
    <div class="flex-1 flex justify-center items-center">
      <a href="index.html" class="text-white hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        <svg viewBox="0 0 100 100" fill="currentColor" class="w-8 h-8 md:w-10 md:h-10">
          <path d="M 50 2 L 34 22 L 44 22 L 44 42 C 44 55, 28 55, 28 35 L 28 28 L 34 32 L 20 6 L 6 32 L 14 28 C 14 55, 34 60, 44 60 C 36 61, 36 66, 44 67 L 44 71 C 36 72, 36 77, 44 78 L 44 98 L 56 98 L 56 78 C 64 77, 64 72, 56 71 L 56 67 C 64 66, 64 61, 56 60 C 66 60, 86 55, 86 28 L 94 32 L 80 6 L 66 32 L 72 28 L 72 35 C 72 55, 56 55, 56 42 L 56 22 L 66 22 Z" />
        </svg>
      </a>
    </div>
    <div class="flex flex-1 items-center justify-end gap-6 text-white">
      <a href="profile.html" class="hover:text-zinc-400 transition-colors hidden sm:block">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
      </a>
      <a href="cart.html" class="hover:text-zinc-400 transition-colors flex items-center relative">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
        <span id="cart-count" class="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300">0</span>
      </a>
    </div>
  </div>
</header>

<div class="relative w-full min-h-screen pt-40 pb-24 px-4 sm:px-6 lg:px-12 bg-[#09090b] font-['Outfit'] antialiased">
    <div class="max-w-[1400px] mx-auto w-full relative z-20">
        <div class="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
            <h1 class="text-3xl md:text-5xl font-light text-white tracking-widest uppercase">The Collection</h1>
            <p class="text-sm text-zinc-500 font-light tracking-wide">All Items</p>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 pb-32 lg:pb-12" id="product-grid">
            <!-- Rendered via JS -->
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('product-grid');
    if (!window.LegginXProducts) return;
    
    let htmlStr = '';
    window.LegginXProducts.forEach(p => {
        let slidesStr = '';
        p.images.forEach(img => {
            slidesStr += `<a href="product.html?id=${p.id}" class="w-full h-full flex-shrink-0 snap-center cursor-pointer block relative">
                <img src="${img}" class="w-full h-full object-cover object-top opacity-80 hover:opacity-100 transition-opacity duration-300">
            </a>`;
        });
        
        htmlStr += `
        <div class="legginx-product-card group relative flex flex-col rounded-xl glass-panel reveal-glow p-2 transition-transform duration-300 hover:-translate-y-1">
          <div class="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-black flex-grow">
            
            <div class="relative w-full h-full flex snap-x snap-mandatory overflow-x-auto hide-scrollbar scroll-smooth" id="slider-${p.id}">
                ${slidesStr}
            </div>

            <!-- Arrow Overlays -->
            <button class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10" onclick="document.getElementById('slider-${p.id}').scrollBy({left: -300, behavior: 'smooth'})">&#10094;</button>
            <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10" onclick="document.getElementById('slider-${p.id}').scrollBy({left: 300, behavior: 'smooth'})">&#10095;</button>

            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <form class="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 z-10 opacity-0 group-hover:opacity-100">
              <button type="button" class="quick-add-btn w-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3.5 px-4 rounded-lg shadow-xl hover:bg-white hover:text-black hover:border-white uppercase tracking-widest text-xs transition-all duration-300 cursor-pointer pointer-events-auto">Quick Add / ${p.price}</button>
            </form>
          </div>
          <div class="mt-4 mb-2 flex flex-col gap-1 px-2">
            <p class="text-[10px] text-zinc-500 uppercase tracking-widest">${p.category}</p>
            <div class="flex flex-row items-baseline justify-between mb-1">
                <h3 class="text-sm font-medium text-white tracking-wide truncate w-3/4"><a href="product.html?id=${p.id}" class="hover:text-zinc-300 transition-colors">${p.name}</a></h3>
            </div>
            <div class="flex items-center justify-between">
                <p class="text-sm text-zinc-400 font-light">${p.price}</p>
                <p class="text-[10px] text-zinc-600 bg-white/5 px-2 py-1 rounded-sm">${p.images.length} Shots</p>
            </div>
          </div>
        </div>`;
    });
    
    grid.innerHTML = htmlStr;
    
    // Bind quick add after render
    setTimeout(() => {
        const cartCount = document.getElementById('cart-count');
        document.querySelectorAll('.quick-add-btn').forEach(btn => {
            const originalText = btn.innerHTML;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                let count = parseInt(cartCount.innerText) || 0;
                cartCount.innerText = count + 1;
                cartCount.classList.add('scale-150', 'text-red-500');
                setTimeout(() => cartCount.classList.remove('scale-150', 'text-red-500'), 300);
                
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
    }, 100);
});

// Mobile Nav Drawer Toggle
const toggleBtn = document.getElementById('mobile-nav-toggle');
const closeBtn = document.getElementById('mobile-nav-close');
const drawer = document.getElementById('mobile-nav-drawer');
const backdrop = document.getElementById('mobile-nav-backdrop');

function openDrawer() {
  drawer.classList.remove('-translate-x-full');
  backdrop.classList.remove('hidden');
  setTimeout(() => backdrop.classList.remove('opacity-0'), 10);
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawer.classList.add('-translate-x-full');
  backdrop.classList.add('opacity-0');
  setTimeout(() => {
    backdrop.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

toggleBtn && toggleBtn.addEventListener('click', openDrawer);
closeBtn && closeBtn.addEventListener('click', closeDrawer);
backdrop && backdrop.addEventListener('click', closeDrawer);
</script>

<!-- MOBILE NAV DRAWER -->
<div id="mobile-nav-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] hidden opacity-0 transition-opacity duration-300"></div>
<div id="mobile-nav-drawer" class="fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-[#09090b] z-[210] transform -translate-x-full transition-transform duration-300 ease-in-out border-r border-white/5 flex flex-col p-8 lg:hidden font-['Outfit']">
  <div class="flex justify-between items-center mb-12">
    <svg viewBox="0 0 100 100" fill="currentColor" class="w-8 h-8 text-white">
      <path d="M 50 2 L 34 22 L 44 22 L 44 42 C 44 55, 28 55, 28 35 L 28 28 L 34 32 L 20 6 L 6 32 L 14 28 C 14 55, 34 60, 44 60 C 36 61, 36 66, 44 67 L 44 71 C 36 72, 36 77, 44 78 L 44 98 L 56 98 L 56 78 C 64 77, 64 72, 56 71 L 56 67 C 64 66, 64 61, 56 60 C 66 60, 86 55, 86 28 L 94 32 L 80 6 L 66 32 L 72 28 L 72 35 C 72 55, 56 55, 56 42 L 56 22 L 66 22 Z" />
    </svg>
    <button id="mobile-nav-close" class="text-white hover:text-zinc-400 transition-colors">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </div>
  <nav class="flex flex-col gap-6">
    <a href="rival.html" class="text-2xl font-light tracking-widest text-white hover:text-zinc-400 transition-colors uppercase">Rival</a>
    <a href="glow.html" class="text-2xl font-light tracking-widest text-white hover:text-zinc-400 transition-colors uppercase">Glow</a>
    <a href="aura.html" class="text-2xl font-light tracking-widest text-white hover:text-zinc-400 transition-colors uppercase">Aura</a>
    <a href="all-items.html" class="text-2xl font-light tracking-widest text-white hover:text-zinc-400 transition-colors uppercase">All Items</a>
    <a href="essentials.html" class="text-2xl font-light tracking-widest text-white hover:text-zinc-400 transition-colors uppercase">Essentials</a>
  </nav>
  <div class="mt-auto border-t border-white/5 pt-8 flex flex-col gap-4 text-xs tracking-widest uppercase text-zinc-500">
    <a href="profile.html" class="hover:text-white transition-colors">My Profile</a>
    <a href="cart.html" class="hover:text-white transition-colors">Shopping Cart</a>
  </div>
</div>

<!-- MOBILE BOTTOM NAV -->
<nav class="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] bg-black/80 backdrop-blur-2xl rounded-full z-[100] border border-white/10 flex items-center justify-between px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
  <a href="index.html" class="text-white transition-colors">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>
  </a>
  <a href="all-items.html" class="text-zinc-400 hover:text-white transition-colors">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/></svg>
  </a>
  <a href="cart.html" class="text-zinc-400 hover:text-white transition-colors relative">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg>
  </a>
  <a href="profile.html" class="text-zinc-400 hover:text-white transition-colors">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
  </a>
</nav>
</body>
</html>"""

    with open('all-items.html', 'w') as f:
        f.write(html_template)
        
    print(f"Catalog and all-items.html successfully built with {len(catalog)} products.")

if __name__ == "__main__":
    build_catalog()
