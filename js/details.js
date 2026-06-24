document.addEventListener('DOMContentLoaded', () => {

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

  /* ---------- Booking summary refs ---------- */
  const PRICE_PER_HOUR = 150;
  const summaryTime     = document.getElementById('summaryTime');
  const summaryDuration = document.getElementById('summaryDuration');
  const summaryTotal    = document.getElementById('summaryTotal');
  const summaryCourtEl  = document.getElementById('summaryCourt');
  const checkoutBtn     = document.getElementById('checkoutBtn');

  /* ---------- updateSummary (shared between slot & court logic) ---------- */
  const updateSummary = () => {
    const selected = Array.from(
      document.querySelectorAll('.slot-btn.is-active')
    );

    if (!selected.length){
      if (summaryTime)     summaryTime.textContent     = 'Select a time';
      if (summaryDuration) summaryDuration.textContent = '0 hours';
      if (summaryTotal)    summaryTotal.textContent    = '0 EGP';
      if (checkoutBtn)     checkoutBtn.classList.add('disabled');
      return;
    }

    const labels = selected.map(b => b.textContent.trim());
    if (summaryTime)     summaryTime.textContent     = labels.join(', ');
    if (summaryDuration) summaryDuration.textContent = `${selected.length} hour${selected.length > 1 ? 's' : ''}`;
    if (summaryTotal)    summaryTotal.textContent    = `${selected.length * PRICE_PER_HOUR} EGP`;
    if (checkoutBtn)     checkoutBtn.classList.remove('disabled');
  };

  /* ---------- Attach slot click handlers ---------- */
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

  /* ---------- Court selector ---------- */
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
    const grid = document.getElementById('slotGrid');
    if (!grid) return;

    const available = courtSlots[courtId] || [];
    const disabled  = disabledSlots[courtId] || [];

    grid.innerHTML = allHours.map(hour => {
      const isDisabled = !available.includes(hour) || disabled.includes(hour);
      return `<div class="slot-btn${isDisabled ? ' is-disabled' : ''}">${hour}</div>`;
    }).join('');

    attachSlotHandlers();
    updateSummary();
  };

  courtPills.forEach(pill => {
    pill.addEventListener('click', () => {
      courtPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');

      const courtId   = parseInt(pill.dataset.court);
      const courtName = `Court ${courtId} · ${pill.dataset.type === 'panoramic' ? 'Panoramic' : 'Regular'}`;
      if (summaryCourtEl) summaryCourtEl.textContent = courtName;

      rebuildSlots(courtId);
    });
  });

});