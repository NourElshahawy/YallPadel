/* ===================================================================
   Shared interactions: navbar, counters, live-slot signature effect,
   mobile menu, image fallbacks.
=================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- AOS init ---------- */
  if (window.AOS){
    AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });
  }

  /* ---------- Sticky navbar ---------- */
  const navbar = document.querySelector('.navbar-ph');
  const onScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 40) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks){
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      const icon = navToggle.querySelector('.material-symbols-rounded');
      if (icon) icon.textContent = navLinks.classList.contains('is-open') ? 'close' : 'menu';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        const icon = navToggle.querySelector('.material-symbols-rounded');
        if (icon) icon.textContent = 'menu';
      });
    });
  }

  /* ---------- Hero / listing search → courts.html ---------- */
  const searchCard = document.querySelector('.search-card');
  if (searchCard){
    const submitBtn = searchCard.querySelector('.search-submit');
    const areaField = searchCard.querySelector('.search-field:nth-child(1) select');
    const dateField = searchCard.querySelector('.search-field:nth-child(2) input');
    const timeField = searchCard.querySelector('.search-field:nth-child(3) select');

    const goToCourts = () => {
      const params = new URLSearchParams();
      if (areaField && areaField.selectedIndex > 0) params.set('area', areaField.value);
      if (dateField && dateField.value) params.set('date', dateField.value);
      if (timeField && timeField.selectedIndex > 0) params.set('time', timeField.value);
      const qs = params.toString();
      window.location.href = 'courts.html' + (qs ? '?' + qs : '');
    };

    if (submitBtn) submitBtn.addEventListener('click', goToCourts);
  }

  /* ---------- Animated counters (IntersectionObserver) ---------- */
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length){
    const animateCounter = (el) => {
      const target = parseFloat(el.dataset.countTo);
      const decimals = el.dataset.countTo.includes('.') ? 1 : 0;
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = target * eased;
        el.textContent = decimals ? value.toFixed(1) : Math.floor(value).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = decimals ? target.toFixed(1) : target.toLocaleString();
      };
      requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* ---------- Signature element: Live Availability Pulse ----------
     Simulates real-time slot changes on featured court cards to
     dramatize the "Real-Time Availability" value proposition,
     without needing a backend.
  ----------------------------------------------------------------- */
  const liveTimeEls = document.querySelectorAll('[data-live-updated]');
  const refreshLiveTimers = () => {
    liveTimeEls.forEach(el => {
      let seconds = parseInt(el.dataset.seconds || '0', 10) + 4;
      el.dataset.seconds = seconds;
      el.textContent = seconds < 60 ? `Updated ${seconds}s ago` : 'Updated just now';
      if (seconds >= 60) el.dataset.seconds = '0';
    });
  };
  if (liveTimeEls.length) setInterval(refreshLiveTimers, 4000);

  const slotRows = document.querySelectorAll('.slot-row');
  if (slotRows.length){
    setInterval(() => {
      slotRows.forEach(row => {
        const chips = Array.from(row.querySelectorAll('.slot-chip:not(.is-taken)'));
        if (chips.length < 2) return;
        const chip = chips[Math.floor(Math.random() * chips.length)];
        chip.classList.add('is-leaving');
        setTimeout(() => {
          chip.classList.add('is-taken');
          chip.classList.remove('is-leaving');
          chip.innerHTML = chip.dataset.time + ' <span style="text-decoration:line-through;opacity:.7">Booked</span>'.replace('<span','').replace('</span>','');
          chip.textContent = chip.dataset.time;
        }, 350);
      });
    }, 6000);
  }

  /* ---------- Image fallback (graceful degrade for hero/court photos) ---------- */
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('.court-media, .gallery-main, .gallery-thumbs .swiper-slide, .testimonial-user')
        ?.classList.add('img-fallback');
      img.style.opacity = '0';
    }, { once: true });
  });

});

/* ===================================================================
   Courts listing page: reads search params from the URL, drives the
   filter sidebar (price / rating / area), sorting, and the mobile
   filter drawer. Filtering runs client-side over the static result
   cards already in the DOM.
=================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const grid = document.getElementById('resultsGrid');
  const cards = grid ? Array.from(grid.children) : [];
  const emptyState = document.getElementById('emptyState');
  const toolbarCount = document.getElementById('toolbarCount');
  const resultsCount = document.getElementById('resultsCount');
  const listingTitle = document.getElementById('listingTitle');

  const state = {
    area: '',
    date: '',
    time: '',
    maxPrice: 200,
    minRating: 0
  };

  /* ---------- Read query params from the search (?area=&date=&time=) ---------- */
  const params = new URLSearchParams(window.location.search);
  const qpArea = params.get('area') || '';
  const qpDate = params.get('date') || '';
  const qpTime = params.get('time') || '';

  const areaSelect = document.getElementById('areaSelect');
  const dateInput = document.getElementById('dateInput');
  const timeSelect = document.getElementById('timeSelect');

  if (qpArea && areaSelect){ areaSelect.value = qpArea; state.area = qpArea; }
  if (qpDate && dateInput){ dateInput.value = qpDate; state.date = qpDate; }
  if (qpTime && timeSelect){ timeSelect.value = qpTime; state.time = qpTime; }

  if (qpArea && listingTitle){
    listingTitle.textContent = `Padel courts in ${qpArea}, Mansoura`;
  }

  /* ---------- Apply filters to the DOM ---------- */
  const applyFilters = () => {
    let visible = 0;
    cards.forEach(card => {
      const price = parseFloat(card.dataset.price || '0');
      const rating = parseFloat(card.dataset.rating || '0');
      const area = card.dataset.area || '';

      const matchesArea = !state.area || area === state.area;
      const matchesPrice = price <= state.maxPrice;
      const matchesRating = rating >= state.minRating;

      const show = matchesArea && matchesPrice && matchesRating;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (toolbarCount) toolbarCount.textContent = visible;
    if (resultsCount) resultsCount.innerHTML = `<b>${visible}</b> court${visible === 1 ? '' : 's'} available`;
    if (emptyState) emptyState.classList.toggle('d-none', visible !== 0);
  };

  applyFilters();

  /* ---------- Area select drives filtering live ---------- */
  if (areaSelect){
    areaSelect.addEventListener('change', () => {
      state.area = areaSelect.value;
      applyFilters();
    });
  }

  /* ---------- Price range slider ---------- */
  const priceRange = document.getElementById('priceRange');
  const priceMaxLabel = document.getElementById('priceMax');
  if (priceRange){
    priceRange.addEventListener('input', () => {
      state.maxPrice = parseFloat(priceRange.value);
      if (priceMaxLabel) priceMaxLabel.textContent = `${priceRange.value} EGP`;
      applyFilters();
    });
  }

  /* ---------- Rating chips ---------- */
  const ratingChips = document.querySelectorAll('.chip-select [data-rating]');
  ratingChips.forEach(chip => {
    chip.addEventListener('click', () => {
      ratingChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      state.minRating = parseFloat(chip.dataset.rating || '0');
      applyFilters();
    });
  });

  /* ---------- Generic chip groups without filtering logic (court type) ---------- */
  document.querySelectorAll('.chip-select').forEach(group => {
    if (group.querySelector('[data-rating]')) return; // handled above
    const chips = group.querySelectorAll('.chip-option');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
      });
    });
  });

  /* ---------- Clear filters ---------- */
  const clearAll = () => {
    state.area = ''; state.date = ''; state.time = ''; state.maxPrice = 200; state.minRating = 0;
    if (areaSelect) areaSelect.value = '';
    if (dateInput) dateInput.value = '';
    if (timeSelect) timeSelect.value = '';
    if (priceRange){ priceRange.value = 200; if (priceMaxLabel) priceMaxLabel.textContent = '200 EGP'; }
    ratingChips.forEach(c => c.classList.remove('is-active'));
    document.querySelector('.chip-select [data-rating="0"]')?.classList.add('is-active');
    document.querySelectorAll('.check-row input').forEach(cb => cb.checked = false);
    if (listingTitle) listingTitle.textContent = 'Padel courts in Mansoura';
    applyFilters();
  };

  document.getElementById('clearFilters')?.addEventListener('click', clearAll);
  document.getElementById('emptyClearBtn')?.addEventListener('click', clearAll);

  /* ---------- Sort ---------- */
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect){
    sortSelect.addEventListener('change', () => {
      const mode = sortSelect.value;
      const sorted = [...cards].sort((a, b) => {
        const pa = parseFloat(a.dataset.price), pb = parseFloat(b.dataset.price);
        const ra = parseFloat(a.dataset.rating), rb = parseFloat(b.dataset.rating);
        if (mode.includes('low to high')) return pa - pb;
        if (mode.includes('high to low')) return pb - pa;
        if (mode.includes('Highest rated')) return rb - ra;
        return 0;
      });
      sorted.forEach(card => grid.appendChild(card));
    });
  }

  /* ---------- Mobile filter drawer ---------- */
  const filterToggle = document.getElementById('filterToggleMobile');
  const filterSidebar = document.getElementById('filterSidebar');
  if (filterToggle && filterSidebar){
    filterToggle.addEventListener('click', () => {
      filterSidebar.classList.toggle('is-open');
    });
  }

});


/* ---------- Court Owner modal form ---------- */
  const ownerForm = document.getElementById('ownerForm');
  if (ownerForm){
    ownerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: wire this up to your backend / CRM endpoint
      const submitBtn = ownerForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Request sent ✓';
      submitBtn.disabled = true;
      setTimeout(() => {
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('ownerModal'));
        modal.hide();
        ownerForm.reset();
        submitBtn.textContent = 'Request a Callback';
        submitBtn.disabled = false;
      }, 1800);
    });
  }