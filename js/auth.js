document.addEventListener('DOMContentLoaded', () => {
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