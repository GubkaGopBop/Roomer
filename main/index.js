const UserRegistration = require('./auth/register');
const UserLogin = require('./auth/login');
const GameStatistics = require('./profile/statistics');

class RoomerApp {
    constructor() {
        this.registration = new UserRegistration();
        this.login = new UserLogin(this.registration.users);
        this.statistics = new GameStatistics();
        
        console.log('Roomer Application запущен');
    }

    async demo() {
        console.log('\n--- Демонстрация системы Roomer ---\n');

        console.log('1. Регистрация нового пользователя:');
        const regResult = await this.registration.registerUser(
            'player@example.com', 
            'SecurePass123'
        );
        console.log(regResult);

        console.log('\n2. Вход в систему:');
        const loginResult = await this.login.login(
            'player@example.com', 
            'SecurePass123'
        );
        console.log(loginResult);

        if (loginResult.success) {
            console.log('\n3. Игровая статистика:');
            const stats = this.statistics.getPlayerStats(loginResult.user.id);
            console.log(stats);

            console.log('\n4. Достижения игрока:');
            const achievements = this.statistics.getAchievements(loginResult.user.id);
            console.log(achievements);
        }
    }
}

const app = new RoomerApp();
app.demo();

module.exports = RoomerApp;