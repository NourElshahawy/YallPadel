document.addEventListener('DOMContentLoaded', () => {

  /* ---------- AOS ---------- */
  if (window.AOS){
    AOS.init({ duration: 700, once: true, offset: 60, easing: 'ease-out-cubic' });
  }

  /* ---------- Sticky navbar ---------- */
  const navbar = document.querySelector('.navbar-ph');
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
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

  /* ---------- Hero search → courts.html ---------- */
  const searchCard = document.querySelector('.search-card');
  if (searchCard){
    const submitBtn = searchCard.querySelector('.search-submit');
    const areaField = searchCard.querySelector('.search-field:nth-child(1) select');
    const dateField = searchCard.querySelector('.search-field:nth-child(2) input');
    const timeField = searchCard.querySelector('.search-field:nth-child(3) select');
    const goToCourts = () => {
      const params = new URLSearchParams();
      if (areaField && areaField.selectedIndex > 0) params.set('area', areaField.value);
      if (dateField && dateField.value)             params.set('date', dateField.value);
      if (timeField && timeField.selectedIndex > 0) params.set('time', timeField.value);
      const qs = params.toString();
      window.location.href = 'courts.html' + (qs ? '?' + qs : '');
    };
    if (submitBtn) submitBtn.addEventListener('click', goToCourts);
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length){
    const animateCounter = (el) => {
      const target   = parseFloat(el.dataset.countTo);
      const decimals = el.dataset.countTo.includes('.') ? 1 : 0;
      const start    = performance.now();
      const tick = (now) => {
        const p     = Math.min((now - start) / 1600, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = decimals
          ? (target * eased).toFixed(1)
          : Math.floor(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = decimals ? target.toFixed(1) : target.toLocaleString();
      };
      requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){ animateCounter(e.target); counterObserver.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  /* ---------- Live slot pulse (homepage cards) ---------- */
  const liveTimeEls = document.querySelectorAll('[data-live-updated]');
  if (liveTimeEls.length){
    setInterval(() => {
      liveTimeEls.forEach(el => {
        let s = parseInt(el.dataset.seconds || '0', 10) + 4;
        el.dataset.seconds = s >= 60 ? 0 : s;
        el.textContent = s < 60 ? `Updated ${s}s ago` : 'Updated just now';
      });
    }, 4000);
  }
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
          chip.textContent = chip.dataset.time;
        }, 350);
      });
    }, 6000);
  }

  /* ---------- Image fallback ---------- */
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('.court-media,.gallery-main,.testimonial-user,.news-featured,.news-item')
        ?.classList.add('img-fallback');
      img.style.opacity = '0';
    }, { once: true });
  });

  /* ---------- Courts listing filters ---------- */
  const grid = document.getElementById('resultsGrid');
  if (grid){
    const cards        = Array.from(grid.children);
    const emptyState   = document.getElementById('emptyState');
    const toolbarCount = document.getElementById('toolbarCount');
    const resultsCount = document.getElementById('resultsCount');
    const listingTitle = document.getElementById('listingTitle');
    const areaSelect   = document.getElementById('areaSelect');
    const dateInput    = document.getElementById('dateInput');
    const timeSelect   = document.getElementById('timeSelect');
    const priceRange   = document.getElementById('priceRange');
    const priceMaxLbl  = document.getElementById('priceMax');
    const state = { area:'', maxPrice:200, minRating:0 };

    const params = new URLSearchParams(window.location.search);
    if (params.get('area') && areaSelect){ areaSelect.value = params.get('area'); state.area = params.get('area'); }
    if (params.get('date') && dateInput)  dateInput.value = params.get('date');
    if (params.get('time') && timeSelect) timeSelect.value = params.get('time');
    if (state.area && listingTitle) listingTitle.textContent = `Padel courts in ${state.area}, Mansoura`;

    const applyFilters = () => {
      let visible = 0;
      cards.forEach(card => {
        const show = (!state.area || card.dataset.area === state.area)
                  && parseFloat(card.dataset.price  || 0) <= state.maxPrice
                  && parseFloat(card.dataset.rating || 0) >= state.minRating;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (toolbarCount) toolbarCount.textContent = visible;
      if (resultsCount) resultsCount.innerHTML   = `<b>${visible}</b> court${visible === 1 ? '' : 's'} available`;
      if (emptyState)   emptyState.classList.toggle('d-none', visible !== 0);
    };
    applyFilters();

    areaSelect?.addEventListener('change', () => { state.area = areaSelect.value; applyFilters(); });
    priceRange?.addEventListener('input',  () => {
      state.maxPrice = parseFloat(priceRange.value);
      if (priceMaxLbl) priceMaxLbl.textContent = `${priceRange.value} EGP`;
      applyFilters();
    });

    document.querySelectorAll('.chip-select [data-rating]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip-select [data-rating]').forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        state.minRating = parseFloat(chip.dataset.rating || 0);
        applyFilters();
      });
    });
    document.querySelectorAll('.chip-select:not(:has([data-rating]))').forEach(group => {
      group.querySelectorAll('.chip-option').forEach(chip => {
        chip.addEventListener('click', () => {
          group.querySelectorAll('.chip-option').forEach(c => c.classList.remove('is-active'));
          chip.classList.add('is-active');
        });
      });
    });

    const clearAll = () => {
      state.area = ''; state.maxPrice = 200; state.minRating = 0;
      if (areaSelect)  areaSelect.value = '';
      if (dateInput)   dateInput.value  = '';
      if (timeSelect)  timeSelect.value = '';
      if (priceRange){ priceRange.value = 200; if (priceMaxLbl) priceMaxLbl.textContent = '200 EGP'; }
      document.querySelectorAll('.chip-select [data-rating]').forEach(c => c.classList.remove('is-active'));
      document.querySelector('.chip-select [data-rating="0"]')?.classList.add('is-active');
      document.querySelectorAll('.check-row input').forEach(cb => cb.checked = false);
      if (listingTitle) listingTitle.textContent = 'Padel courts in Mansoura';
      applyFilters();
    };
    document.getElementById('clearFilters')?.addEventListener('click', clearAll);
    document.getElementById('emptyClearBtn')?.addEventListener('click', clearAll);

    document.getElementById('sortSelect')?.addEventListener('change', function(){
      const mode   = this.value;
      const sorted = [...cards].sort((a, b) => {
        const pa = parseFloat(a.dataset.price),  pb = parseFloat(b.dataset.price);
        const ra = parseFloat(a.dataset.rating), rb = parseFloat(b.dataset.rating);
        if (mode.includes('low to high'))  return pa - pb;
        if (mode.includes('high to low'))  return pb - pa;
        if (mode.includes('Highest rated'))return rb - ra;
        return 0;
      });
      sorted.forEach(card => grid.appendChild(card));
    });

    document.getElementById('filterToggleMobile')?.addEventListener('click', () => {
      document.getElementById('filterSidebar')?.classList.toggle('is-open');
    });
  }

  /* ---------- Court Owner modal ---------- */
  const ownerForm = document.getElementById('ownerForm');
  if (ownerForm){
    ownerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = ownerForm.querySelector('button[type="submit"]');
      btn.textContent = 'Request sent ✓';
      btn.disabled = true;
      setTimeout(() => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('ownerModal')).hide();
        ownerForm.reset();
        btn.textContent = 'Request a Callback';
        btn.disabled = false;
      }, 1800);
    });
  }


  /* ---------- Court details: booking logic ---------- */
  if (document.getElementById('slotGrid')){

    const PRICE_PER_HOUR  = 150;
    const summaryCourtEl  = document.getElementById('summaryCourt');
    const summaryDate     = document.getElementById('summaryDate');
    const summaryTime     = document.getElementById('summaryTime');
    const summaryDuration = document.getElementById('summaryDuration');
    const summaryTotal    = document.getElementById('summaryTotal');
    const checkoutBtn     = document.getElementById('checkoutBtn');
    const monthLabel      = 'Jun';

    /* Summary updater */
    const updateSummary = () => {
      const selected = Array.from(document.querySelectorAll('.slot-btn.is-active'));
      if (!selected.length){
        if (summaryTime)     summaryTime.textContent     = 'Select a time';
        if (summaryDuration) summaryDuration.textContent = '0 hours';
        if (summaryTotal)    summaryTotal.textContent    = '0 EGP';
        if (checkoutBtn)     checkoutBtn.classList.add('disabled');
        return;
      }
      if (summaryTime)     summaryTime.textContent     = selected.map(b => b.textContent.trim()).join(', ');
      if (summaryDuration) summaryDuration.textContent = `${selected.length} hour${selected.length > 1 ? 's' : ''}`;
      if (summaryTotal)    summaryTotal.textContent    = `${selected.length * PRICE_PER_HOUR} EGP`;
      if (checkoutBtn)     checkoutBtn.classList.remove('disabled');
    };

    /* Slot click handlers */
    const attachSlotHandlers = () => {
      document.querySelectorAll('.slot-btn:not(.is-disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.classList.toggle('is-active');
          updateSummary();
        });
      });
    };
    attachSlotHandlers();
    updateSummary();

    /* Date strip */
    document.querySelectorAll('.date-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.date-pill').forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        if (summaryDate)
          summaryDate.textContent =
            `${pill.querySelector('.dow').textContent}, ${pill.querySelector('.dom').textContent} ${monthLabel}`;
      });
    });

    /* Court selector */
    const courtPills = Array.from(
      document.querySelectorAll('.court-pill:not(:has(.busy))')
    );
    const courtSlots = {
      1: ['8 AM','9 AM','11 AM','12 PM','2 PM','3 PM','4 PM','5 PM','6 PM','8 PM','9 PM','10 PM'],
      2: ['8 AM','9 AM','10 AM','12 PM','1 PM','3 PM','5 PM','7 PM','8 PM','10 PM'],
      4: ['9 AM','11 AM','2 PM','4 PM','5 PM','6 PM','8 PM','9 PM'],
      5: ['8 AM','10 AM','11 AM','1 PM','3 PM','4 PM','6 PM','7 PM','9 PM','10 PM'],
    };
    const disabledSlots = {
      1: ['10 AM','1 PM','7 PM'],
      2: ['11 AM','2 PM','6 PM','9 PM'],
      4: ['10 AM','12 PM','3 PM','7 PM'],
      5: ['9 AM','12 PM','2 PM','5 PM','8 PM'],
    };
    const allHours = [
      '8 AM','9 AM','10 AM','11 AM','12 PM','1 PM',
      '2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM'
    ];

    const rebuildSlots = (courtId) => {
      const grid      = document.getElementById('slotGrid');
      const available = courtSlots[courtId]  || [];
      const disabled  = disabledSlots[courtId] || [];
      grid.innerHTML  = allHours.map(h => {
        const off = !available.includes(h) || disabled.includes(h);
        return `<div class="slot-btn${off ? ' is-disabled' : ''}">${h}</div>`;
      }).join('');
      attachSlotHandlers();
      updateSummary();
    };

    courtPills.forEach(pill => {
      pill.addEventListener('click', () => {
        courtPills.forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        const id   = parseInt(pill.dataset.court);
        const type = pill.dataset.type === 'panoramic' ? 'Panoramic' : 'Regular';
        if (summaryCourtEl) summaryCourtEl.textContent = `Court ${id} · ${type}`;
        rebuildSlots(id);
      });
    });
  }




/* ---- Dismiss email notice ---- */
  document.getElementById('emailDismiss')?.addEventListener('click', () => {
    const notice = document.getElementById('emailNotice');
    notice.style.opacity = '0';
    notice.style.transform = 'translateY(-8px)';
    notice.style.transition = 'all .35s ease';
    setTimeout(() => notice.remove(), 350);
  });

  /* ---- Copy InstaPay number ---- */
  const copyBtn = document.getElementById('copyBtn');
  const numEl   = document.getElementById('instapayNum');
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(numEl.textContent.trim()).then(() => {
      const icon = copyBtn.querySelector('.material-symbols-rounded');
      icon.textContent = 'check';
      copyBtn.style.background = 'var(--accent)';
      copyBtn.style.color = '#04140E';
      setTimeout(() => {
        icon.textContent = 'content_copy';
        copyBtn.style.background = '';
        copyBtn.style.color = '';
      }, 2000);
    });
  });

  /* ---- Hold timer (15 min countdown) ---- */
  const timerEl = document.getElementById('holdTimer');
  if (timerEl){
    let seconds = 15 * 60;
    const tick = () => {
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
      if (seconds > 0){ seconds--; setTimeout(tick, 1000); }
      else { timerEl.textContent = 'Expired'; timerEl.style.color = '#ff6b6b'; }
    };
    tick();
  }

  /* ---- "I've sent the payment" ---- */
  document.getElementById('markPaidBtn')?.addEventListener('click', () => {
    // Update tracker step 3
    const ts3 = document.getElementById('ts3');
    ts3.classList.remove('is-pending');
    ts3.classList.add('is-done');
    ts3.querySelector('.ts-icon .material-symbols-rounded').textContent = 'check_circle';

    document.getElementById('paymentStatusText').textContent = 'Payment submitted — under review';
    document.getElementById('paymentTime').textContent = 'Today, just now';

    // Hide instapay block, show paid badge
    document.getElementById('instapayBlock').classList.add('d-none');
    document.getElementById('paidBadge').classList.remove('d-none');

    // Update summary badge
    const badge = document.getElementById('summaryPaymentBadge');
    badge.classList.add('is-paid');
    badge.innerHTML = `<span class="material-symbols-rounded">verified</span><span>Payment submitted</span>`;

    // Update top status pill
    const pill = document.querySelector('.status-pill');
    pill.classList.remove('confirmed');
    pill.classList.add('paid');
    pill.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px;">verified</span> Payment Submitted`;

    // Unlock step 4
    document.getElementById('ts4').classList.remove('is-upcoming');
    document.getElementById('ts4').classList.add('is-done');
  });








});