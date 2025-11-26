let requires2FA = false;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const twofa_code = document.getElementById('twofa_code').value;
  const errorDiv = document.getElementById('errorMessage');

  errorDiv.style.display = 'none';

  const body = { email, password };
  if (requires2FA && twofa_code) {
    body.twofa_code = twofa_code;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.requires_2fa) {
      requires2FA = true;
      document.getElementById('twofaField').style.display = 'block';
      errorDiv.textContent = 'Введите код из приложения аутентификатора';
      errorDiv.style.display = 'block';
      return;
    }

    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = '/profile.html';
    } else {
      errorDiv.textContent = data.error || 'Ошибка входа';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Ошибка подключения к серверу';
    errorDiv.style.display = 'block';
  }
});