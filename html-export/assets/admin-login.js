(function () {
  const form = document.querySelector('[data-admin-login]');
  if (!form) return;

  const passwordInput = form.querySelector('[name="password"]');
  const warningNode = document.querySelector('[data-admin-warning]');
  const loginBtn = form.querySelector('button[type="submit"]');
  const PASSWORD = 'Ar280602';

  function showWarning(message) {
    warningNode.textContent = message || '';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showWarning('');

    const password = String(passwordInput.value || '').trim();
    if (!password) {
      showWarning('Bitte Passwort eingeben.');
      return;
    }

    if (password !== PASSWORD) {
      showWarning('Falsches Passwort.');
      return;
    }

    // Client-side gate only. Real protection requires server-side auth.
    try {
      sessionStorage.setItem('ae_admin_ok', '1');
      sessionStorage.setItem('ae_admin_ok_at', String(Date.now()));
    } catch (e) {
      // ignore storage errors
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Weiter...';
    window.location.href = 'admin.html';
  });
})();
