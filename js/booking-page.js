document.addEventListener("DOMContentLoaded", () => {
  /* ===================== STATE ===================== */
  let selectedCourt = null; // { name, index }
  let selectedDate = null;
  let selectedTime = null;
  let selectedPrice = 0;

  /* ===================== REFS ===================== */
  const summaryTime = document.getElementById("summaryTime");
  const summaryDate = document.getElementById("summaryDate");
  const summaryPrice = document.getElementById("summaryPrice");
  const displayPrice = document.getElementById("displayPrice");
  const bookNowBtn = document.getElementById("bookNowBtn");
  const reviewDate = document.getElementById("reviewDate");
  const reviewTime = document.getElementById("reviewTime");
  const reviewTotal = document.getElementById("reviewTotal");
  const sheet = document.getElementById("confirmSheet");
  const cancelBtn = document.getElementById("cancelSheet");
  const confirmBtn = document.getElementById("confirmBtn");
  const toast = document.getElementById("successToast");

  /* ===================== STEPS UI ===================== */
  // Steps: 1=court, 2=day, 3=time
  const lockSection = (selector, locked) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.classList.toggle("section-locked", locked);
  };

  const updateStepsUI = () => {
    // Day section — unlocks after court selected
    lockSection(".booking-days", !selectedCourt);
    // Slots section — unlocks after day selected
    lockSection(".booking-slots", !selectedCourt || !selectedDate);
    // Book Now btn
    const ready = selectedCourt && selectedDate && selectedTime;
    bookNowBtn?.classList.toggle("disabled", !ready);
  };

  // Init — everything locked
  updateStepsUI();
  bookNowBtn?.classList.add("disabled");

  /* ===================== STEP INDICATOR ===================== */
  const renderStepBar = () => {
    let existing = document.getElementById("stepBar");
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "stepBar";
      existing.className = "step-bar";
      existing.innerHTML = `
        <div class="step-item" id="si1">
          <div class="step-circle"><span>1</span></div>
          <span>اختر الملعب</span>
        </div>
        <div class="step-line" id="sl1"></div>
        <div class="step-item" id="si2">
          <div class="step-circle"><span>2</span></div>
          <span>اختر اليوم</span>
        </div>
        <div class="step-line" id="sl2"></div>
        <div class="step-item" id="si3">
          <div class="step-circle"><span>3</span></div>
          <span>اختر الوقت</span>
        </div>
      `;
      // Insert after booking-hero section
      const courtCard = document.querySelector(".booking-hero");
      courtCard?.insertAdjacentElement("afterend", existing);
    }

    const mark = (id, done, active) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle("done", done);
      el.classList.toggle("active", active && !done);
    };

    mark("si1", !!selectedCourt, true);
    mark("si2", !!selectedDate, !!selectedCourt);
    mark("si3", !!selectedTime, !!selectedDate);
    document.getElementById("sl1")?.classList.toggle("done", !!selectedDate);
    document.getElementById("sl2")?.classList.toggle("done", !!selectedTime);
  };

  renderStepBar();

  /* ===================== 1. COURT SELECTION ===================== */
  const courtCards = document.querySelectorAll(".img-details");

  courtCards.forEach((card, i) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      courtCards.forEach((c) => c.classList.remove("court-selected"));
      card.classList.add("court-selected");

      const name = card.querySelector("h2")?.textContent?.trim() || `ملعب ${i + 1}`;
      selectedCourt = { name, index: i + 1 };

      // Reset downstream selections when court changes
      selectedDate = null;
      selectedTime = null;
      document.querySelectorAll(".day-card").forEach((d) => d.classList.remove("active"));
      document.querySelectorAll(".slot-card.selected").forEach((s) => {
        s.classList.remove("selected");
        s.querySelector(".slot-check")?.remove();
      });
      if (summaryDate) summaryDate.textContent = "—";
      if (summaryTime) summaryTime.textContent = "—";

      // Scroll to days section
      setTimeout(() => {
        document.querySelector(".booking-days")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

      updateStepsUI();
      renderStepBar();
    });
  });

  /* ===================== 2. DAY SELECTION ===================== */
  document.querySelectorAll(".day-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (!selectedCourt) return; // locked

      document.querySelectorAll(".day-card").forEach((d) => d.classList.remove("active"));
      card.classList.add("active");
      selectedDate = card.dataset.date;

      // Reset time when day changes
      selectedTime = null;
      document.querySelectorAll(".slot-card.selected").forEach((s) => {
        s.classList.remove("selected");
        s.querySelector(".slot-check")?.remove();
      });

      if (summaryDate) summaryDate.textContent = `${card.querySelector("small").textContent} ${card.querySelector("strong").textContent}`;
      if (summaryTime) summaryTime.textContent = "—";

      // Scroll to slots
      setTimeout(() => {
        document.querySelector(".booking-slots")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);

      updateStepsUI();
      renderStepBar();
    });
  });

  /* ===================== 3. TIME SLOT SELECTION ===================== */
  let selectedSlots = [];

  const allSlotCards = Array.from(document.querySelectorAll(".slot-card"));

  const updateSlotDisplay = () => {
    // حدّد range-start / range-mid / range-end
    allSlotCards.forEach((c) => c.classList.remove("range-start", "range-mid", "range-end"));

    const selected = allSlotCards.filter((c) => c.classList.contains("selected"));
    if (selected.length === 1) {
      selected[0].classList.add("range-start", "range-end");
    } else if (selected.length > 1) {
      selected[0].classList.add("range-start");
      selected[selected.length - 1].classList.add("range-end");
      selected.slice(1, -1).forEach((c) => c.classList.add("range-mid"));
    }

    // بيانات الملخص
    if (!selected.length) {
      selectedTime = null;
      selectedPrice = 0;
      if (summaryTime) summaryTime.textContent = "—";
      if (summaryPrice) summaryPrice.innerHTML = `0 <span>EGP</span>`;
      const dur = document.getElementById("summaryDuration");
      if (dur) dur.textContent = "—";
      updateStepsUI();
      renderStepBar();
      return;
    }

    const firstStart = selected[0].dataset.start;
    const lastEnd = selected[selected.length - 1].dataset.end;
    const total = selected.reduce((s, c) => s + Number(c.dataset.price), 0);
    const hours = selected.length;

    selectedTime = `${firstStart} الي ${lastEnd}`;
    selectedPrice = total;

    if (summaryTime) summaryTime.textContent = selectedTime;
    if (summaryPrice) summaryPrice.innerHTML = `${total} <span>EGP</span>`;
    if (displayPrice) displayPrice.textContent = total;

    const dur = document.getElementById("summaryDuration");
    if (dur) dur.textContent = hours === 1 ? "ساعة واحدة" : `${hours} ساعات`;

    updateStepsUI();
    renderStepBar();
  };

  document.querySelectorAll(".slot-card:not(.booked)").forEach((card) => {
    card.addEventListener("click", () => {
      if (!selectedDate) return;

      card.classList.toggle("selected");

      // checkmark
      if (card.classList.contains("selected")) {
        if (!card.querySelector(".slot-check")) {
          const chk = document.createElement("span");
          chk.className = "slot-check";
          chk.innerHTML = '<i class="fa-solid fa-check"></i>';
          card.appendChild(chk);
        }
      } else {
        card.querySelector(".slot-check")?.remove();
      }

      updateSlotDisplay();
    });
  });

  /* ===================== BOOK NOW ===================== */
  bookNowBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selectedCourt || !selectedDate || !selectedTime) return;

    if (reviewDate) reviewDate.textContent = selectedDate;
    if (reviewTime) reviewTime.textContent = selectedTime;
    if (reviewTotal) reviewTotal.textContent = `${selectedPrice} EGP`;

    // Add court name to review if element exists
    const reviewCourt = document.getElementById("reviewCourt");
    if (reviewCourt) reviewCourt.textContent = selectedCourt.name;

    sheet?.classList.add("active");
  });

  cancelBtn?.addEventListener("click", () => sheet?.classList.remove("active"));
  sheet?.addEventListener("click", (e) => {
    if (e.target === sheet) sheet.classList.remove("active");
  });

  confirmBtn?.addEventListener("click", () => {
    confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التأكيد…';
    confirmBtn.disabled = true;
    setTimeout(() => {
      sheet?.classList.remove("active");
      toast?.classList.add("show");
      setTimeout(() => {
        // window.location.href = "booking-confirmation.html";
      }, 1400);
    }, 1200);
  });

  /* ===================== OWL CAROUSEL ===================== */
  if (typeof $ !== "undefined" && $.fn.owlCarousel) {
    $(".hero-slider").owlCarousel({
      loop: true,
      margin: 20,
      nav: false,
      dots: false,
      autoplay: true,
      smartSpeed: 700,
      mouseDrag: true,
      touchDrag: true,
      responsive: { 0: { items: 1 }, 768: { items: 2 }, 1200: { items: 3 } },
    });
  }
});
