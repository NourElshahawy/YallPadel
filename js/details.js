
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Swiper gallery ---------- */
  if (window.Swiper){
    const thumbs = new Swiper('#galleryThumbs', {
      slidesPerView: 4,
      spaceBetween: 12,
      watchSlidesProgress: true,
      breakpoints: {
        0: { slidesPerView: 3 },
        576: { slidesPerView: 4 }
      }
    });

    new Swiper('#galleryMain', {
      slidesPerView: 1,
      spaceBetween: 0,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      thumbs: { swiper: thumbs }
    });
  }

  /* ---------- Date strip selection ---------- */
  const datePills = document.querySelectorAll('.date-pill');
  const summaryDate = document.getElementById('summaryDate');
  const monthLabel = 'Jun';

  datePills.forEach(pill => {
    pill.addEventListener('click', () => {
      datePills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      const dow = pill.querySelector('.dow').textContent;
      const dom = pill.querySelector('.dom').textContent;
      if (summaryDate) summaryDate.textContent = `${dow}, ${dom} ${monthLabel}`;
    });
  });

  /* ---------- Slot grid selection (multi-select) ---------- */
  const PRICE_PER_HOUR = 150;
  const slotButtons = Array.from(document.querySelectorAll('.slot-btn:not(.is-disabled)'));
  const summaryTime = document.getElementById('summaryTime');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryTotal = document.getElementById('summaryTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const updateSummary = () => {
    const selected = slotButtons.filter(b => b.classList.contains('is-active'));

    if (!selected.length){
      if (summaryTime) summaryTime.textContent = 'Select a time';
      if (summaryDuration) summaryDuration.textContent = '0 hours';
      if (summaryTotal) summaryTotal.textContent = '0 EGP';
      if (checkoutBtn) checkoutBtn.classList.add('disabled');
      return;
    }

    const labels = selected.map(b => b.textContent.trim());
    if (summaryTime) summaryTime.textContent = labels.join(', ');
    if (summaryDuration) summaryDuration.textContent = `${selected.length} hour${selected.length > 1 ? 's' : ''}`;
    if (summaryTotal) summaryTotal.textContent = `${selected.length * PRICE_PER_HOUR} EGP`;
    if (checkoutBtn) checkoutBtn.classList.remove('disabled');
  };

  slotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-active');
      updateSummary();
    });
  });

  updateSummary();

});