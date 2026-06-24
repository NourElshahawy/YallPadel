document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Account type selector ---------- */
  const typeCards   = document.querySelectorAll('.type-card');
  const accountType = document.getElementById('accountType');

  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      typeCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
      if (accountType) accountType.value = card.dataset.type;
    });
  });
  document.querySelectorAll('.field-toggle').forEach(btn => {
    const input = btn.closest('.field-input-wrap').querySelector('input');
    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.querySelector('.material-symbols-rounded').textContent = isPassword ? 'visibility_off' : 'visibility';
    });
  });

  document.querySelectorAll('.auth-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: wire this up to your Laravel auth endpoint (login / register)
    });
  });





  let currentStep = 1;
  const totalSteps = 5;
  const courts = []; // { name, type, price }

  const steps       = document.querySelectorAll('.wizard-step');
  const wnavItems   = document.querySelectorAll('.wnav-item');
  const prevBtn     = document.getElementById('prevBtn');
  const nextBtn     = document.getElementById('nextBtn');
  const submitBtn   = document.getElementById('submitBtn');
  const progressFill= document.getElementById('progressFill');
  const mobileStep  = document.getElementById('mobileStepNum');

  /* ---- Show/hide the right step ---- */
  const goToStep = (n) => {
    steps.forEach(s => s.classList.remove('is-active'));
    document.getElementById(`step${n}`)?.classList.add('is-active');

    wnavItems.forEach((item, i) => {
      item.classList.remove('is-active', 'is-done');
      if (i + 1 < n)  item.classList.add('is-done');
      if (i + 1 === n) item.classList.add('is-active');
    });

    if (progressFill) progressFill.style.width = `${(n / totalSteps) * 100}%`;
    if (mobileStep)   mobileStep.textContent = n;

    prevBtn.style.display = n === 1 ? 'none' : '';
    nextBtn.classList.toggle('d-none', n === totalSteps);
    submitBtn.classList.toggle('d-none', n !== totalSteps);

    if (n === 3) buildPhotoSections();
    if (n === 5) buildReview();

    currentStep = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---- Step 2: Add / remove court rows ---- */
  const buildCourtRow = (index) => {
    const div = document.createElement('div');
    div.className = 'court-row';
    div.dataset.index = index;
    div.innerHTML = `
      <div class="court-row-header">
        <h4>Court ${index + 1}</h4>
        ${index > 0 ? `<button type="button" class="btn-remove-court">
          <span class="material-symbols-rounded" style="font-size:16px">delete</span> Remove
        </button>` : ''}
      </div>
      <div class="row g-3">
        <div class="col-12">
          <div class="field-group mb-0">
            <label>Court Name</label>
            <div class="field-input-wrap">
              <span class="material-symbols-rounded field-icon">sports_tennis</span>
              <input class="field-input court-name-input" type="text"
                placeholder="e.g. Court ${index + 1}" value="Court ${index + 1}">
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="field-group mb-0">
            <label>Court Type</label>
            <div class="field-input-wrap">
              <span class="material-symbols-rounded field-icon">category</span>
              <select class="field-input court-type-input">
                <option value="regular">Regular</option>
                <option value="panoramic">Panoramic</option>
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="field-group mb-0">
            <label>Price / Hour (EGP)</label>
            <div class="field-input-wrap">
              <span class="material-symbols-rounded field-icon">payments</span>
              <input class="field-input court-price-input" type="number"
                placeholder="e.g. 150" min="50" max="1000">
            </div>
          </div>
        </div>
      </div>
    `;
    div.querySelector('.btn-remove-court')?.addEventListener('click', () => {
      div.remove();
      reindexCourts();
    });
    return div;
  };

  const reindexCourts = () => {
    document.querySelectorAll('.court-row').forEach((row, i) => {
      row.dataset.index = i;
      row.querySelector('h4').textContent = `Court ${i + 1}`;
      const nameInput = row.querySelector('.court-name-input');
      if (nameInput.value === `Court ${parseInt(row.dataset.index)}`) {
        nameInput.placeholder = `e.g. Court ${i + 1}`;
      }
    });
  };

  const courtsContainer = document.getElementById('courtsContainer');
  // Start with 1 court
  courtsContainer?.appendChild(buildCourtRow(0));

  document.getElementById('addCourtBtn')?.addEventListener('click', () => {
    const count = document.querySelectorAll('.court-row').length;
    if (count >= 20) return;
    courtsContainer?.appendChild(buildCourtRow(count));
  });

  /* ---- Step 3: Photo upload zones ---- */
  const buildPhotoSections = () => {
    const container = document.getElementById('photoSections');
    if (!container) return;
    const rows = document.querySelectorAll('.court-row');
    if (!rows.length) return;

    // Keep existing sections for courts already rendered
    const existing = Array.from(container.querySelectorAll('.photo-section'))
      .map(s => s.dataset.court);

    rows.forEach((row, i) => {
      const cIndex = row.dataset.index;
      if (existing.includes(cIndex)) return;

      const name = row.querySelector('.court-name-input')?.value || `Court ${i + 1}`;
      const section = document.createElement('div');
      section.className = 'photo-section';
      section.dataset.court = cIndex;
      section.innerHTML = `
        <h4>${name}</h4>
        <div class="photo-drop-zone" id="dropZone${cIndex}">
          <input type="file" accept="image/*" multiple id="photoInput${cIndex}">
          <span class="material-symbols-rounded">add_photo_alternate</span>
          <p>Drag & drop photos or <b style="color:var(--accent)">browse</b></p>
          <span>JPG, PNG, WEBP — max 10MB each</span>
        </div>
        <div class="photo-previews" id="previews${cIndex}"></div>
      `;
      container.appendChild(section);

      document.getElementById(`photoInput${cIndex}`)
        ?.addEventListener('change', (e) => handlePhotos(e.target.files, cIndex));
    });
  };

  const handlePhotos = (files, cIndex) => {
    const previewsEl = document.getElementById(`previews${cIndex}`);
    if (!previewsEl) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const item = document.createElement('div');
        item.className = 'photo-preview-item';
        item.innerHTML = `
          <img src="${e.target.result}" alt="">
          <button class="remove-photo" type="button">✕</button>
        `;
        item.querySelector('.remove-photo').addEventListener('click', () => item.remove());
        previewsEl.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
  };

  /* ---- Step 5: Review ---- */
  const buildReview = () => {
    const el = document.getElementById('reviewContent');
    if (!el) return;

    const venueName  = document.getElementById('venueName')?.value  || '—';
    const venueArea  = document.getElementById('venueArea')?.value  || '—';
    const venuePhone = document.getElementById('venuePhone')?.value || '—';
    const venueEmail = document.getElementById('venueEmail')?.value || '—';

    const courtRows = document.querySelectorAll('.court-row');
    const courtsSummary = Array.from(courtRows).map((row, i) => {
      const name  = row.querySelector('.court-name-input')?.value  || `Court ${i+1}`;
      const type  = row.querySelector('.court-type-input')?.value  || 'Regular';
      const price = row.querySelector('.court-price-input')?.value || '—';
      return `<div class="review-row">
        <span>${name} (${type})</span>
        <span>${price} EGP/hr</span>
      </div>`;
    }).join('');

    const checkedAmenities = Array.from(
      document.querySelectorAll('input[name="amenities"]:checked')
    ).map(cb => cb.value).join(', ') || 'None selected';

    const cancelPolicy = document.getElementById('cancellationPolicy')?.value || '—';

    el.innerHTML = `
      <div class="review-section">
        <h4>Venue</h4>
        <div class="review-row"><span>Name</span><span>${venueName}</span></div>
        <div class="review-row"><span>Area</span><span>${venueArea}</span></div>
        <div class="review-row"><span>Phone</span><span>${venuePhone}</span></div>
        <div class="review-row"><span>Email</span><span>${venueEmail}</span></div>
      </div>
      <div class="review-section">
        <h4>Courts (${courtRows.length})</h4>
        ${courtsSummary}
      </div>
      <div class="review-section">
        <h4>Amenities</h4>
        <div class="review-row"><span>Available</span><span>${checkedAmenities}</span></div>
      </div>
      <div class="review-section">
        <h4>Policy</h4>
        <div class="review-row"><span>Cancellation</span><span>${cancelPolicy}</span></div>
      </div>
    `;
  };

  /* ---- Navigation ---- */
  nextBtn?.addEventListener('click', () => {
    if (currentStep < totalSteps) goToStep(currentStep + 1);
  });

  prevBtn?.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  submitBtn?.addEventListener('click', () => {
    const agreed = document.getElementById('agreeTerms')?.checked;
    if (!agreed){
      document.getElementById('agreeTerms').focus();
      return;
    }
    submitBtn.textContent = 'Submitting…';
    submitBtn.disabled = true;
    // TODO: POST to /api/owner/venues
    setTimeout(() => {
      submitBtn.innerHTML = '✓ Submitted — we\'ll review within 24h';
    }, 1600);
  });

  /* ---- Init ---- */
  goToStep(1);
});