import os
import json
import re

def title_case(s):
    words = re.split(r'[-_]', s)
    clean_words = [w.capitalize() for w in words if w.lower() not in ['copy', 'template']]
    return ' '.join(clean_words)

def build_catalog():
    # Load Comprehensive JSON database
    try:
        with open('legginx_comprehensive_data.json', 'r') as f:
            full_data = json.load(f)
            shop_products = {p['handle']: p for p in full_data.get('products', [])}
            collections_map = {c['handle']: c for c in full_data.get('collections', [])}
            ig_data = full_data.get('instagram', {})
            policies = full_data.get('policies', {})
    except Exception as e:
        print("Could not load legginx_comprehensive_data.json:", str(e))
        return

    catalog = []
    base_dir = "images/catalog"
    categories = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

    # Build Product List
    for cat in categories:
        cat_path = os.path.join(base_dir, cat)
        product_dirs = [d for d in os.listdir(cat_path) if os.path.isdir(os.path.join(cat_path, d))]
        
        for pdir in product_dirs:
            p_path = os.path.join(cat_path, pdir)
            images = [f for f in os.listdir(p_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            if not images: continue
                
            images.sort()
            image_paths = [os.path.join(p_path, img) for img in images]
            
            # Cross-reference with real data
            if pdir in shop_products:
                sp = shop_products[pdir]
                name = sp.get('title', title_case(pdir))
                price_val = sp['variants'][0].get('price', "48.00") if sp.get('variants') else "48.00"
                price = f"${float(price_val):.0f}"
                desc = sp.get('body_html', '')
            else:
                name = title_case(pdir)
                price = "$48"
                desc = ""
            
            catalog.append({
                "id": pdir,
                "category": cat.replace('-', ' ').title(),
                "cat_handle": cat,
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
        f.write(f"window.LegginXIG = {json.dumps(ig_data, indent=2)};\n")

    # Common HTML Header & Footer Components
    header_html = """
<header class="fixed top-0 left-0 right-0 z-[100] w-full transition-all duration-300 bg-transparent flex flex-col font-['Outfit'] antialiased group" id="legginx-header">
  <div class="bg-black text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-center py-2 relative z-20 w-full">
    Free Shipping on All Orders
  </div>
  <div class="w-full px-5 md:px-12 py-4 flex items-center justify-between transition-all duration-500 bg-gradient-to-b from-black/80 to-transparent group-hover:bg-black/90 group-hover:backdrop-blur-md">
    <div class="flex-1 flex items-center">
      <button id="mobile-nav-toggle" class="lg:hidden text-white hover:text-zinc-400 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/></svg>
      </button>
      <nav class="hidden lg:flex items-center gap-8">
        <a href="rival.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400">Rival</a>
        <a href="glow.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400">Glow</a>
        <a href="aura.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400">Aura</a>
        <a href="all-items.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400">All Items</a>
        <a href="essentials.html" class="text-xs font-medium uppercase tracking-[0.2em] text-white hover:text-zinc-400">Essentials</a>
      </nav>
    </div>
    <div class="flex-shrink-0">
      <a href="index.html" class="text-white hover:scale-110 transition-transform duration-500 block filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        <svg viewBox="0 0 100 100" fill="currentColor" class="w-8 h-8 md:w-10 md:h-10">
          <path d="M 50 2 L 34 22 L 44 22 L 44 42 C 44 55, 28 55, 28 35 L 28 28 L 34 32 L 20 6 L 6 32 L 14 28 C 14 55, 34 60, 44 60 C 36 61, 36 66, 44 67 L 44 71 C 36 72, 36 77, 44 78 L 44 98 L 56 98 L 56 78 C 64 77, 64 72, 56 71 L 56 67 C 64 66, 64 61, 56 60 C 66 60, 86 55, 86 28 L 94 32 L 80 6 L 66 32 L 72 28 L 72 35 C 72 55, 56 55, 56 42 L 56 22 L 66 22 Z" />
        </svg>
      </a>
    </div>
    <div class="flex flex-1 items-center justify-end gap-5 text-white">
      <a href="profile.html" class="hover:text-zinc-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg></a>
      <a href="cart.html" class="relative group"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/></svg><span id="cart-count" class="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span></a>
    </div>
  </div>
</header>
"""

    footer_html = f"""
<footer class="bg-black py-20 px-8 border-t border-white/5 font-['Outfit'] mt-auto">
  <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
    <div>
      <h4 class="text-white text-sm uppercase tracking-widest font-bold mb-6">About LegginX</h4>
      <p class="text-zinc-500 text-sm leading-relaxed">Elite performance wear engineered for those who demand the absolute best from their bodies and their gear.</p>
    </div>
    <div>
      <h4 class="text-white text-sm uppercase tracking-widest font-bold mb-6">Shop</h4>
      <ul class="flex flex-col gap-3 text-sm text-zinc-500">
        <li><a href="rival.html" class="hover:text-white transition-colors">Rival Series</a></li>
        <li><a href="glow.html" class="hover:text-white transition-colors">Glow Collection</a></li>
        <li><a href="aura.html" class="hover:text-white transition-colors">Aura Bras</a></li>
        <li><a href="essentials.html" class="hover:text-white transition-colors">Essentials</a></li>
      </ul>
    </div>
    <div>
      <h4 class="text-white text-sm uppercase tracking-widest font-bold mb-6">Support</h4>
      <ul class="flex flex-col gap-3 text-sm text-zinc-500">
        <li><a href="privacy-policy.html" class="hover:text-white transition-colors">Privacy Policy</a></li>
        <li><a href="refund-policy.html" class="hover:text-white transition-colors">Refund Policy</a></li>
        <li><a href="shipping-policy.html" class="hover:text-white transition-colors">Shipping Policy</a></li>
        <li><a href="terms-of-service.html" class="hover:text-white transition-colors">Terms of Service</a></li>
      </ul>
    </div>
    <div>
      <h4 class="text-white text-sm uppercase tracking-widest font-bold mb-6">Connect</h4>
      <p class="text-zinc-500 text-sm mb-4">Email: contact@legginx.com</p>
      <p class="text-zinc-500 text-sm mb-4">Address: PO Box 4154, Riverside CA 92514</p>
      <div class="flex gap-4">
        <a href="{ig_data.get('url', '#')}" class="text-white hover:text-zinc-400">Instagram</a>
      </div>
    </div>
  </div>
  <div class="mt-20 pt-8 border-t border-white/5 text-center text-zinc-600 text-xs tracking-widest uppercase">
    &copy; 2026 LEGGINX.COM — ALL RIGHTS RESERVED.
  </div>
</footer>
"""

    def generate_listing_page(filename, title, filter_cats=None):
        page_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - LegginX Elite</title>
    <link rel="stylesheet" href="assets/rival-shorts-revamp.css?v=9">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="assets/product-data.js"></script>
    <script src="assets/legginx-animations.js?v=5" defer></script>
    <script src="assets/legginx-cart.js?v=1" defer></script>
    <style>
        body {{ font-family: 'Outfit', sans-serif; background-color: #09090b; color: #ededed; display: flex; flex-direction: column; min-h-screen; }}
        .glass-panel {{ background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }}
        .reveal-glow:hover {{ box-shadow: 0 0 40px rgba(150, 150, 150, 0.15); border-color: rgba(255,255,255,0.15); }}
        .hide-scrollbar::-webkit-scrollbar {{ display: none; }}
    </style>
</head>
<body class="antialiased selection:bg-white selection:text-black">
{header_html}
<div class="relative w-full pt-40 pb-24 px-4 sm:px-6 lg:px-12 bg-[#09090b]">
    <div class="max-w-[1400px] mx-auto w-full relative z-20">
        <div class="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
            <h1 class="text-3xl md:text-5xl font-light text-white tracking-widest uppercase">{title}</h1>
            <p class="text-sm text-zinc-500 font-light tracking-wide">{len([p for p in catalog if not filter_cats or p['cat_handle'] in filter_cats])} Items</p>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8" id="product-grid"></div>
    </div>
</div>
{footer_html}
<script>
document.addEventListener('DOMContentLoaded', () => {{
    const grid = document.getElementById('product-grid');
    const filterCats = {json.dumps(filter_cats)};
    const products = window.LegginXProducts.filter(p => !filterCats || filterCats.includes(p.cat_handle));
    
    let htmlStr = '';
    products.forEach(p => {{
        let slidesStr = '';
        p.images.forEach(img => {{
            slidesStr += `<a href="product.html?id=${{p.id}}" class="w-full h-full flex-shrink-0 snap-center cursor-pointer block"><img src="${{img}}" class="w-full h-full object-cover object-top opacity-80 hover:opacity-100 transition-opacity"></a>`;
        }});
        htmlStr += `
        <div class="legginx-product-card group relative flex flex-col rounded-xl glass-panel reveal-glow p-2 transition-transform hover:-translate-y-1">
          <div class="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-black flex-grow">
            <div class="relative w-full h-full flex snap-x snap-mandatory overflow-x-auto hide-scrollbar scroll-smooth" id="slider-${{p.id}}">${{slidesStr}}</div>
            <button class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 z-10" onclick="document.getElementById('slider-${{p.id}}').scrollBy({{left: -300, behavior: 'smooth'}})">&#10094;</button>
            <button class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 z-10" onclick="document.getElementById('slider-${{p.id}}').scrollBy({{left: 300, behavior: 'smooth'}})">&#10095;</button>
            <form class="absolute bottom-4 left-4 right-4 translate-y-8 group-hover:translate-y-0 transition-all opacity-0 group-hover:opacity-100 z-10">
              <button type="button" class="quick-add-btn w-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-4 rounded-lg hover:bg-white hover:text-black uppercase tracking-widest text-xs transition-all">Quick Add / ${{p.price}}</button>
            </form>
          </div>
          <div class="mt-4 px-2">
            <p class="text-[10px] text-zinc-500 uppercase tracking-widest">${{p.category}}</p>
            <h3 class="text-sm font-medium text-white truncate mt-1"><a href="product.html?id=${{p.id}}">${{p.name}}</a></h3>
            <p class="text-sm text-zinc-400 mt-1">${{p.price}}</p>
          </div>
        </div>`;
    }});
    grid.innerHTML = htmlStr;
}});
</script>
</body></html>"""
        with open(filename, 'w') as f: f.write(page_html)

    # Generate Pages
    generate_listing_page('all-items.html', 'The Collection')
    generate_listing_page('rival.html', 'Rival Series', ['competitor-series-leggings', 'competitor-shorts-1'])
    generate_listing_page('glow.html', 'Glow Collection', ['glow-leggings', 'competitor-shorts'])
    generate_listing_page('aura.html', 'Aura Bras', ['aura'])
    generate_listing_page('essentials.html', 'Essentials', ['essential-bras'])

    # Generate Policy Pages
    for p_handle, p_content in policies.items():
        fname = f"{p_handle}.html"
        p_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{p_handle.replace('-', ' ').title()} - LegginX</title>
    <link rel="stylesheet" href="assets/rival-shorts-revamp.css?v=9">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-[#09090b] text-white font['Outfit'] min-h-screen flex flex-col">
{header_html}
<div class="pt-40 pb-24 px-8 max-w-4xl mx-auto leading-relaxed">
    <h1 class="text-4xl font-bold uppercase tracking-widest mb-12">{p_handle.replace('-', ' ').title()}</h1>
    <div class="text-zinc-400 whitespace-pre-wrap">{p_content}</div>
</div>
{footer_html}
</body></html>"""
        with open(fname, 'w') as f: f.write(p_html)

    print("Website retrofitted successfully.")

if __name__ == "__main__":
    build_catalog()
