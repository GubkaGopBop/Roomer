const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  document.getElementById('requestForm').style.display = 'none';
  document.getElementById('resetForm').style.display = 'block';
}

document.getElementById('recoveryRequestForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  try {
    const response = await fetch('/api/auth/recovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.textContent = 'Сообщение было отправлено на вашу почту';
      successDiv.style.display = 'block';
    } else {
      errorDiv.textContent = data.error || 'Ошибка восстановления';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Ошибка подключения к серверу';
    errorDiv.style.display = 'block';
  }
});

document.getElementById('passwordResetForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorDiv = document.getElementById('errorMessage');
  const successDiv = document.getElementById('successMessage');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (newPassword !== confirmPassword) {
    errorDiv.textContent = 'Пароли не совпадают';
    errorDiv.style.display = 'block';
    return;
  }

  if (newPassword.length < 6) {
    errorDiv.textContent = 'Пароль должен содержать минимум 6 символов';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/auth/recovery/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, newPassword })
    });

    const data = await response.json();

    if (response.ok) {
      successDiv.textContent = 'Пароль успешно изменен. Перенаправление на страницу входа...';
      successDiv.style.display = 'block';
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } else {
      errorDiv.textContent = data.error || 'Ошибка смены пароля';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Ошибка подключения к серверу';
    errorDiv.style.display = 'block';
  }
});