document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('errorMessage');

  errorDiv.style.display = 'none';

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Пароли не совпадают';
    errorDiv.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'Пароль должен содержать минимум 6 символов';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = '/profile.html';
    } else {
      errorDiv.textContent = data.error || 'Ошибка регистрации';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Ошибка подключения к серверу';
    errorDiv.style.display = 'block';
  }
});