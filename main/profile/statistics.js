class GameStatistics {
    constructor() {
        this.statsCache = new Map();
    }

    getPlayerStats(userId) {
        if (this.statsCache.has(userId)) {
            return this.statsCache.get(userId);
        }

        const stats = {
            userId: userId,
            level: 15,
            rating: 1250,
            wins: 47,
            losses: 23,
            totalGames: 70,
            playtime: 18500,
            winRate: 67.14,
            lastMatch: new Date(),
            rank: 'Золото III',
            experience: 15420,
            nextLevelExp: 18000
        };

        this.statsCache.set(userId, stats);
        return stats;
    }

    getAchievements(userId) {
        return [
            {
                id: 1,
                name: 'Первая кровь',
                description: 'Одержите первую победу',
                icon: 'achievement_first_win.png',
                unlockedAt: new Date('2024-10-15'),
                rarity: 'common'
            },
            {
                id: 2,
                name: 'Серия побед',
                description: 'Выиграйте 5 игр подряд',
                icon: 'achievement_win_streak.png',
                unlockedAt: new Date('2024-11-01'),
                rarity: 'rare'
            },
            {
                id: 3,
                name: 'Мастер',
                description: 'Достигните 15 уровня',
                icon: 'achievement_level_15.png',
                unlockedAt: new Date('2024-11-03'),
                rarity: 'epic'
            }
        ];
    }

    formatPlaytime(minutes) {
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days} дн. ${hours % 24} ч.`;
        }
        return `${hours} ч. ${minutes % 60} мин.`;
    }

    getLevelProgress(currentExp, nextLevelExp) {
        return Math.round((currentExp / nextLevelExp) * 100);
    }
}

module.exports = GameStatistics;