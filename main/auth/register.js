const bcrypt = require('bcryptjs');

class UserRegistration {
    constructor() {
        this.users = [];
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password && password.length >= 8;
    }

    async registerUser(email, password) {
        try {
            if (!this.validateEmail(email)) {
                return { success: false, error: 'Некорректный email' };
            }

            if (!this.validatePassword(password)) {
                return { success: false, error: 'Пароль должен содержать минимум 8 символов' };
            }

            const existingUser = this.users.find(u => u.email === email);
            if (existingUser) {
                return { success: false, error: 'Пользователь с таким email уже существует' };
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = {
                id: Date.now(),
                email: email,
                password: hashedPassword,
                createdAt: new Date(),
                nickname: `Player${Date.now()}`,
                avatar: null,
                level: 1,
                rating: 0
            };

            this.users.push(newUser);

            return { 
                success: true, 
                message: 'Регистрация успешна',
                userId: newUser.id 
            };

        } catch (error) {
            return { success: false, error: 'Ошибка при регистрации' };
        }
    }
}

module.exports = UserRegistration;