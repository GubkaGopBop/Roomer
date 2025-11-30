function validatePassword(password) {
  if (password.length < 8) {
    return 'Пароль должен содержать минимум 8 символов';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Пароль должен содержать заглавные буквы (A-Z)';
  }
  if (!/[a-z]/.test(password)) {
    return 'Пароль должен содержать строчные буквы (a-z)';
  }
  if (!/[0-9]/.test(password)) {
    return 'Пароль должен содержать цифры (0-9)';
  }
  return null;
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('errorMessage');

  errorDiv.style.display = 'none';

  const passwordError = validatePassword(password);
  if (passwordError) {
    errorDiv.textContent = passwordError;
    errorDiv.style.display = 'block';
    return;
  }

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Пароли не совпадают';
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