const token = localStorage.getItem('token');
let currentSecret = '';

if (!token) {
  window.location.href = '/login.html';
}

async function loadProfile() {
  try {
    const response = await fetch('/api/profile/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Ошибка загрузки профиля');
    }

    const stats = await response.json();

    document.getElementById('nickname').textContent = stats.nickname;
    document.getElementById('level').textContent = `Уровень ${stats.level}`;
    document.getElementById('playtime').textContent = `${stats.playtime} ч`;
    document.getElementById('rating').textContent = stats.rating;
    document.getElementById('wins').textContent = stats.wins;
    document.getElementById('levelValue').textContent = stats.level;

    document.getElementById('loading').style.display = 'none';
    document.getElementById('profileContent').style.display = 'block';

    loadAchievements();
    loadPurchases();
  } catch (error) {
    console.error('Ошибка:', error);
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }
}

async function loadAchievements() {
  try {
    const response = await fetch('/api/profile/achievements', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const achievements = await response.json();
    console.log('Загружено достижений:', achievements.length, achievements);
    
    const container = document.getElementById('achievementsList');

    if (achievements.length === 0) {
      container.innerHTML = '<div class="achievement-item">Пока нет достижений</div>';
      return;
    }

    const rarityNames = {
      common: 'Обычная',
      uncommon: 'Необычная',
      rare: 'Редкая',
      epic: 'Эпическая',
      legendary: 'Легендарная'
    };

    container.innerHTML = achievements.map(ach => `
      <div class="achievement-item ${ach.rarity || 'common'}">
        <div class="achievement-title">
          ${ach.title}
          <span class="rarity-badge ${ach.rarity || 'common'}">${rarityNames[ach.rarity] || 'Обычная'}</span>
        </div>
        <div>${ach.description || ''}</div>
        <div class="achievement-percentage">У ${ach.percentage || '50.0'}% игроков</div>
        <div class="achievement-date">${new Date(ach.earned_at).toLocaleDateString('ru-RU')}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Ошибка загрузки достижений:', error);
    document.getElementById('achievementsList').innerHTML = 
      '<div class="achievement-item" style="color: red;">Ошибка загрузки достижений</div>';
  }
}

async function loadPurchases() {
  try {
    const response = await fetch('/api/profile/purchases', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const purchases = await response.json();
    console.log('Загружено покупок:', purchases.length, purchases);
    
    const container = document.getElementById('purchasesList');

    if (purchases.length === 0) {
      container.innerHTML = '<div class="purchase-item">Пока нет покупок</div>';
      return;
    }

    const rarityNames = {
      common: 'Обычная',
      uncommon: 'Необычная',
      rare: 'Редкая',
      epic: 'Эпическая',
      legendary: 'Легендарная'
    };

    container.innerHTML = purchases.map((purchase, index) => `
      <div class="purchase-item ${purchase.rarity || 'common'}" style="animation-delay: ${index * 0.05}s">
        <div class="purchase-name">
          ${purchase.item_name}
        </div>
        <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 18px; font-weight: bold; color: #10B981;">${purchase.amount} руб.</span>
          <span class="rarity-badge ${purchase.rarity || 'common'}">${rarityNames[purchase.rarity] || 'Обычная'}</span>
        </div>
        <div class="purchase-date" style="margin-top: 5px;">
          ${new Date(purchase.purchase_date).toLocaleDateString('ru-RU', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Ошибка загрузки покупок:', error);
    document.getElementById('purchasesList').innerHTML = 
      '<div class="purchase-item" style="color: red;">Ошибка загрузки покупок</div>';
  }
}

function showEditProfile() {
  document.getElementById('profileContent').style.display = 'none';
  document.getElementById('editProfileModal').style.display = 'block';
}

function hideEditProfile() {
  document.getElementById('editProfileModal').style.display = 'none';
  document.getElementById('profileContent').style.display = 'block';
}

document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nickname = document.getElementById('newNickname').value;
  const email = document.getElementById('newEmail').value;
  const errorDiv = document.getElementById('editError');

  errorDiv.style.display = 'none';

  const updates = {};
  if (nickname) updates.nickname = nickname;
  if (email) updates.email = email;

  if (Object.keys(updates).length === 0) {
    errorDiv.textContent = 'Заполните хотя бы одно поле';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('/api/profile/update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    const data = await response.json();

    if (response.ok) {
      alert('Профиль обновлен');
      hideEditProfile();
      loadProfile();
    } else {
      errorDiv.textContent = data.error || 'Ошибка обновления';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Ошибка подключения к серверу';
    errorDiv.style.display = 'block';
  }
});

async function show2FASetup() {
  try {
    const response = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    currentSecret = data.secret;

    document.getElementById('qrCodeImage').src = data.qrCode;
    document.getElementById('qrCodeContainer').style.display = 'block';
    
    document.getElementById('profileContent').style.display = 'none';
    document.getElementById('twofaModal').style.display = 'block';
  } catch (error) {
    alert('Ошибка настройки 2FA');
  }
}

function hide2FASetup() {
  document.getElementById('twofaModal').style.display = 'none';
  document.getElementById('profileContent').style.display = 'block';
}

document.getElementById('enable2FAForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const code = document.getElementById('twofa_code_setup').value;
  const errorDiv = document.getElementById('twofaError');

  errorDiv.style.display = 'none';

  try {
    const response = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ secret: currentSecret, code })
    });

    const data = await response.json();

    if (response.ok) {
      alert('2FA успешно включена');
      hide2FASetup();
    } else {
      errorDiv.textContent = data.error || 'Ошибка включения 2FA';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Ошибка подключения к серверу';
    errorDiv.style.display = 'block';
  }
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}

function togglePurchases() {
  console.log('togglePurchases вызвана');
  
  const section = document.getElementById('purchasesSection');
  const button = document.getElementById('purchasesButton');
  
  console.log('section:', section);
  console.log('button:', button);
  console.log('section.classList:', section.classList);
  
  if (section.classList.contains('show')) {
    console.log('Закрываем список');
    section.classList.remove('show');
    button.classList.remove('active');
    button.textContent = 'Список покупок';
  } else {
    console.log('Открываем список');
    section.classList.add('show');
    button.classList.add('active');
    button.textContent = 'Скрыть покупки';
    
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

if (window.location.hash === '#purchases') {
  document.getElementById('purchasesSection').style.display = 'block';
}

loadProfile();