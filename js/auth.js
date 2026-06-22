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
});