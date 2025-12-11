function generateRandomPassword(length, useNumbers, useSymbols, useUppercase) {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{};:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    return password;
}

function calculatePasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score >= 7) return 'Очень сильный';
    if (score >= 5) return 'Сильный';
    if (score >= 3) return 'Средний';
    return 'Слабый';
}

function getPasswordSuggestions(password) {
    const suggestions = [];

    if (password.length < 8) {
        suggestions.push('Используйте не менее 8 символов');
    }
    if (!/\d/.test(password)) {
        suggestions.push('Добавьте цифры');
    }
    if (!/[A-Z]/.test(password)) {
        suggestions.push('Добавьте заглавные буквы');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
        suggestions.push('Добавьте специальные символы');
    }

    return suggestions;
}

function generatePassword(req, res) {
    try {
        const { length = 12, useNumbers = true, useSymbols = true, useUppercase = true } = req.body;

        const len = parseInt(length);
        if (isNaN(len) || len < 4 || len > 64) {
            return res.status(400).json({
                error: 'Длина пароля должна быть от 4 до 64 символов'
            });
        }
        const password = generateRandomPassword(len, useNumbers, useSymbols, useUppercase);
        const strength = calculatePasswordStrength(password);

        res.json({
            password,
            length: len,
            strength,
            timestamp: res.locals.requestTime
        });

    } catch (error) {
        res.status(500).json({ error: 'Ошибка генерации пароля' });
    }
}
function generateMultiplePasswords(req, res) {
    try {
        const { count = 5, length = 12, useNumbers = true, useSymbols = true, useUppercase = true } = req.body;

        const passwords = [];
        for (let i = 0; i < count; i++) {
            const password = generateRandomPassword(length, useNumbers, useSymbols, useUppercase);
            passwords.push({
                password,
                strength: calculatePasswordStrength(password)
            });
        }

        res.json({
            passwords,
            count,
            length,
            timestamp: res.locals.requestTime
        });

    } catch (error) {
        res.status(500).json({ error: 'Ошибка генерации паролей' });
    }
}
function checkPasswordStrength(req, res) {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Пароль не указан' });
        }

        const strength = calculatePasswordStrength(password);
        const suggestions = getPasswordSuggestions(password);

        res.json({
            password,
            strength,
            length: password.length,
            hasNumbers: /\d/.test(password),
            hasSymbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            hasUppercase: /[A-Z]/.test(password),
            hasLowercase: /[a-z]/.test(password),
            suggestions,
            timestamp: res.locals.requestTime
        });

    } catch (error) {
        res.status(500).json({ error: 'Ошибка проверки пароля' });
    }
}

module.exports = {
    generatePassword,
    generateMultiplePasswords,
    checkPasswordStrength,
    generateRandomPassword,
    calculatePasswordStrength
};