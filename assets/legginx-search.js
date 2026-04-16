// ════════════════════════════════════════════════════════════
// LegginX Live Search Engine v1
// ════════════════════════════════════════════════════════════

(function() {
  'use strict';

  function injectSearchModal() {
    if (document.getElementById('search-modal')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div id="search-modal" class="fixed inset-0 z-[600] hidden opacity-0 transition-opacity duration-300 font-['Outfit']">
        <div class="absolute inset-0 bg-black/95 backdrop-blur-3xl"></div>
        <div class="relative z-10 w-full h-full flex flex-col p-6 sm:p-20">
          <div class="flex justify-end mb-12">
            <button id="search-close" class="text-white hover:rotate-90 transition-transform duration-300 cursor-pointer bg-transparent border-none">
              <svg class="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="max-w-4xl mx-auto w-full">
            <input type="text" id="search-input" placeholder="SEARCH OUR CATALOG..." class="w-full bg-transparent border-b-2 border-white/20 py-6 text-2xl sm:text-5xl font-bold text-white uppercase tracking-tighter focus:outline-none focus:border-white transition-all placeholder:text-white/10 font-['Outfit']">
            <div id="search-results" class="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6"></div>
          </div>
        </div>
      </div>
    `);
  }

  function initSearch() {
    injectSearchModal();
    const searchTrigger = document.getElementById('search-trigger');
    const searchClose = document.getElementById('search-close');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchModal || !searchInput || !searchResults) return;

    function openSearch() {
      searchModal.classList.remove('hidden');
      setTimeout(() => {
        searchModal.classList.remove('opacity-0');
        searchInput.focus();
      }, 10);
      document.body.style.overflow = 'hidden';
    }

    function closeSearch() {
      searchModal.classList.add('opacity-0');
      setTimeout(() => {
        searchModal.classList.add('hidden');
        document.body.style.overflow = '';
        searchInput.value = '';
        searchResults.innerHTML = '';
      }, 300);
    }

    function performSearch(query) {
      if (!window.LegginXProducts) return;
      
      const term = query.toLowerCase().trim();
      if (term.length < 2) {
        searchResults.innerHTML = '';
        return;
      }

      const matches = window.LegginXProducts.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term) ||
        (p.desc && p.desc.toLowerCase().includes(term))
      ).slice(0, 6);

      renderResults(matches);
    }

    function renderResults(products) {
      if (products.length === 0) {
        searchResults.innerHTML = `
          <div class="col-span-full py-12 text-center">
            <p class="text-zinc-500 text-sm uppercase tracking-widest">No results found for your search.</p>
          </div>
        `;
        return;
      }

      searchResults.innerHTML = products.map((p, i) => `
        <a href="product.html?id=${p.id}" class="group block animate-on-scroll" style="transition-delay: ${i * 50}ms">
          <div class="aspect-[3/4] overflow-hidden bg-zinc-900 mb-4 border border-white/5 group-hover:border-white/20 transition-colors">
            <img src="${p.images[0]}" alt="${p.name}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
          </div>
          <div>
            <h4 class="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">${p.category}</h4>
            <p class="text-xs text-white font-bold uppercase tracking-wider group-hover:text-zinc-300 transition-colors">${p.name}</p>
            <p class="text-[11px] text-zinc-400 mt-1">${p.price}</p>
          </div>
        </a>
      `).join('');

      // Trigger reveal animation
      requestAnimationFrame(() => {
        searchResults.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('in-view'));
      });
    }

    searchTrigger && searchTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });

    searchClose && searchClose.addEventListener('click', closeSearch);

    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !searchModal.classList.contains('hidden')) closeSearch();
    });

    // Close on backdrop click
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal || e.target.classList.contains('bg-black/95')) {
        closeSearch();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
