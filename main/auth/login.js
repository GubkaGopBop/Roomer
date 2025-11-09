const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserLogin {
    constructor(userDatabase) {
        this.users = userDatabase;
        this.JWT_SECRET = process.env.JWT_SECRET || 'roomer_secret_key';
    }

    async login(email, password) {
        try {
            const user = this.users.find(u => u.email === email);
            
            if (!user) {
                return { 
                    success: false, 
                    error: 'Неверный email или пароль' 
                };
            }

            if (user.isBlocked) {
                return { 
                    success: false, 
                    error: 'Аккаунт заблокирован. Обратитесь в поддержку.' 
                };
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            
            if (!isPasswordValid) {
                this.notifySuspiciousActivity(user.email);
                return { 
                    success: false, 
                    error: 'Неверный email или пароль' 
                };
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                this.JWT_SECRET,
                { expiresIn: '24h' }
            );

            user.lastLogin = new Date();

            return {
                success: true,
                token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    nickname: user.nickname,
                    avatar: user.avatar
                }
            };

        } catch (error) {
            return { 
                success: false, 
                error: 'Ошибка при авторизации' 
            };
        }
    }

    notifySuspiciousActivity(email) {
        console.log(`[SECURITY] Неудачная попытка входа для ${email}`);
    }

    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET);
            return { valid: true, userId: decoded.userId };
        } catch (error) {
            return { valid: false, error: 'Недействительный токен' };
        }
    }
}

module.exports = UserLogin;