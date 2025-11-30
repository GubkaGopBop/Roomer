const rarities = {
  common: { name: 'Обычная', color: '#9CA3AF', chance: 50 },
  uncommon: { name: 'Необычная', color: '#10B981', chance: 30 },
  rare: { name: 'Редкая', color: '#3B82F6', chance: 15 },
  epic: { name: 'Эпическая', color: '#8B5CF6', chance: 4 },
  legendary: { name: 'Легендарная', color: '#F59E0B', chance: 1 }
};

const itemNames = {
  armor: [
    'Ледяной доспех', 'Огненная кираса', 'Теневой нагрудник', 
    'Кристальная броня', 'Драконья чешуя', 'Небесный панцирь',
    'Адамантовый латник', 'Призрачная защита', 'Королевские латы'
  ],
  weapons: [
    'Меч бури', 'Клинок тьмы', 'Посох мудрости', 
    'Лук судьбы', 'Молот титанов', 'Кинжал ночи',
    'Копье света', 'Секира ярости', 'Рапира грации'
  ],
  accessories: [
    'Амулет силы', 'Кольцо защиты', 'Перчатки ловкости',
    'Сапоги скорости', 'Плащ невидимости', 'Шлем мудрости',
    'Пояс выносливости', 'Серьги удачи', 'Браслет магии'
  ],
  consumables: [
    'Зелье здоровья', 'Эликсир маны', 'Свиток телепортации',
    'Камень воскрешения', 'Флакон силы', 'Тотем защиты',
    'Руна опыта', 'Кристалл энергии', 'Порошок удачи'
  ],
  special: [
    'Легендарный ключ', 'Осколок судьбы', 'Печать героя',
    'Знак избранного', 'Реликвия древних', 'Артефакт богов',
    'Талисман победы', 'Эмблема чемпиона', 'Корона властелина'
  ]
};
const achievementTemplates = [
  // Простые достижения (уровень 1-20, высокий процент)
  { name: 'Первая кровь', desc: 'Одержите первую победу', level: 1, wins: 1, rating: 0, percentage: 85.5 },
  { name: 'Начало пути', desc: 'Достигните 5 уровня', level: 5, wins: 0, rating: 0, percentage: 72.3 },
  { name: 'Новичок', desc: 'Достигните 10 уровня', level: 10, wins: 0, rating: 0, percentage: 58.7 },
  { name: 'Упорный', desc: 'Проведите 10 часов в игре', level: 0, wins: 0, rating: 0, playtime: 10, percentage: 54.2 },
  { name: 'Первые шаги', desc: 'Одержите 5 побед', level: 0, wins: 5, rating: 0, percentage: 64.8 },
  
  // Средние достижения (уровень 20-50, средний процент)
  { name: 'Опытный боец', desc: 'Достигните 25 уровня', level: 25, wins: 0, rating: 0, percentage: 38.4 },
  { name: 'Ветеран', desc: 'Проведите 100 часов в игре', level: 0, wins: 0, rating: 0, playtime: 100, percentage: 22.1 },
  { name: 'Победитель', desc: 'Одержите 50 побед', level: 0, wins: 50, rating: 0, percentage: 28.6 },
  { name: 'Коллекционер', desc: 'Соберите 20 предметов', level: 0, wins: 0, rating: 0, percentage: 31.5 },
  { name: 'Исследователь', desc: 'Откройте все локации', level: 20, wins: 0, rating: 0, percentage: 19.7 },
  { name: 'Герой дня', desc: 'Станьте MVP матча', level: 15, wins: 10, rating: 0, percentage: 41.2 },
  { name: 'Быстрый как ветер', desc: 'Победите за 5 минут', level: 10, wins: 5, rating: 0, percentage: 33.9 },
  
  // Сложные достижения (уровень 50+, низкий процент)
  { name: 'Мастер боя', desc: 'Одержите 100 побед', level: 0, wins: 100, rating: 0, percentage: 15.3 },
  { name: 'Элитный воин', desc: 'Достигните 50 уровня', level: 50, wins: 0, rating: 0, percentage: 11.8 },
  { name: 'Непобедимый', desc: 'Выиграйте 10 матчей подряд', level: 30, wins: 50, rating: 0, percentage: 8.4 },
  { name: 'Богач', desc: 'Накопите 10000 монет', level: 40, wins: 0, rating: 0, percentage: 13.7 },
  { name: 'Командный игрок', desc: 'Помогите союзникам 100 раз', level: 35, wins: 40, rating: 0, percentage: 17.2 },
  
  // Очень сложные достижения (высокий уровень/рейтинг, очень низкий процент)
  { name: 'Титан', desc: 'Достигните 75 уровня', level: 75, wins: 0, rating: 0, percentage: 5.6 },
  { name: 'Мастер магии', desc: 'Используйте 1000 заклинаний', level: 60, wins: 0, rating: 0, percentage: 7.2 },
  { name: 'Снайпер', desc: 'Сделайте 500 критических ударов', level: 55, wins: 150, rating: 0, percentage: 6.9 },
  { name: 'Охотник за сокровищами', desc: 'Найдите 50 секретов', level: 45, wins: 0, rating: 0, percentage: 9.1 },
  { name: 'Перфекционист', desc: 'Выполните все задания', level: 70, wins: 200, rating: 0, percentage: 3.8 },
  
  // Легендарные достижения (топ рейтинг, менее 3%)
  { name: 'Легенда арены', desc: 'Достигните рейтинга 3000', level: 60, wins: 150, rating: 3000, percentage: 2.4 },
  { name: 'Покоритель вершин', desc: 'Достигните топ-500 рейтинга', level: 70, wins: 200, rating: 3500, percentage: 1.7 },
  { name: 'Элита', desc: 'Достигните топ-100 рейтинга', level: 80, wins: 300, rating: 4500, percentage: 0.9 },
  { name: 'Чемпион', desc: 'Достигните топ-10 рейтинга', level: 90, wins: 500, rating: 5500, percentage: 0.3 },
  { name: 'Император', desc: 'Займите 1 место в рейтинге', level: 95, wins: 800, rating: 6000, percentage: 0.1 }
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const [key, value] of Object.entries(rarities)) {
    cumulative += value.chance;
    if (roll <= cumulative) {
      return { type: key, ...value };
    }
  }
  
  return { type: 'common', ...rarities.common };
}

function generateItemName() {
  const category = getRandomElement(Object.keys(itemNames));
  return getRandomElement(itemNames[category]);
}

function calculatePrice(rarity) {
  const basePrices = {
    common: [10, 50],
    uncommon: [60, 150],
    rare: [160, 400],
    epic: [450, 900],
    legendary: [1000, 5000]
  };
  
  const [min, max] = basePrices[rarity];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDateTime(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  
  return date.toISOString();
}

function generatePurchase(userId) {
  const rarity = getRandomRarity();
  const itemName = generateItemName();
  const price = calculatePrice(rarity.type);
  
  const daysAgo = Math.floor(Math.random() * 90);
  const purchaseDate = generateRandomDateTime(daysAgo);
  
  return {
    user_id: userId,
    item_name: itemName,
    amount: price,
    rarity: rarity.type,
    purchase_date: purchaseDate
  };
}

function generateAchievement(userId, userStats) {
  const availableAchievements = achievementTemplates.filter(template => {
    if (template.level && userStats.level < template.level) return false;
    if (template.wins && userStats.wins < template.wins) return false;
    if (template.rating && userStats.rating < template.rating) return false;
    if (template.playtime && userStats.playtime < template.playtime) return false;
    return true;
  });

  if (availableAchievements.length === 0) {
    const template = achievementTemplates[0];
    return createAchievementFromTemplate(userId, template);
  }

  const template = getRandomElement(availableAchievements);
  return createAchievementFromTemplate(userId, template);
}

function createAchievementFromTemplate(userId, template) {
  const rarity = determineRarityByPercentage(template.percentage);
  
  const daysAgo = Math.floor(Math.random() * 180);
  const earnedDate = generateRandomDateTime(daysAgo);
  
  return {
    user_id: userId,
    title: template.name,
    description: template.desc,
    rarity: rarity,
    percentage: template.percentage.toFixed(1),
    earned_at: earnedDate
  };
}

function determineRarityByPercentage(percentage) {
  if (percentage < 1) return 'legendary';
  if (percentage < 5) return 'epic';
  if (percentage < 15) return 'rare';
  if (percentage < 40) return 'uncommon';
  return 'common';
}

function generateUserStats() {
  const level = Math.floor(Math.random() * 99) + 1;
  
  const baseRating = 1000;
  const ratingVariance = (level - 1) * 50 + Math.floor(Math.random() * 500);
  const rating = baseRating + ratingVariance;
  
  const minPlaytime = level * 2;
  const maxPlaytime = level * 10;
  const playtime = Math.floor(Math.random() * (maxPlaytime - minPlaytime + 1)) + minPlaytime;
  
  const winsPerLevel = Math.floor(Math.random() * 8) + 2;
  const wins = level * winsPerLevel + Math.floor(Math.random() * 20);
  
  return {
    level,
    rating,
    playtime,
    wins
  };
}

function generateMultiplePurchases(userId, count) {
  const purchases = [];
  const usedItems = new Map();
  
  let attempts = 0;
  const maxAttempts = count * 3;
  
  while (purchases.length < count && attempts < maxAttempts) {
    attempts++;
    const purchase = generatePurchase(userId);
    
    const existingRarities = usedItems.get(purchase.item_name) || [];
    
    if (!existingRarities.includes(purchase.rarity)) {
      existingRarities.push(purchase.rarity);
      usedItems.set(purchase.item_name, existingRarities);
      purchases.push(purchase);
    }
  }
  
  purchases.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
  
  return purchases;
}

function generateMultipleAchievements(userId, count, userStats) {
  const achievements = [];
  const usedTemplates = new Set();
  
  let attempts = 0;
  const maxAttempts = count * 3;
  
  while (achievements.length < count && attempts < maxAttempts) {
    attempts++;
    const achievement = generateAchievement(userId, userStats);
    const key = achievement.title;
    
    if (!usedTemplates.has(key)) {
      usedTemplates.add(key);
      achievements.push(achievement);
    }
  }
  
  achievements.sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage));
  
  return achievements;
}

module.exports = {
  generatePurchase,
  generateAchievement,
  generateUserStats,
  generateMultiplePurchases,
  generateMultipleAchievements,
  rarities
};