document.addEventListener('DOMContentLoaded', function() {
    const lengthSlider = document.getElementById('length');
    const lengthValue = document.getElementById('length-value');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const uppercaseCheckbox = document.getElementById('uppercase');

    const generateSingleBtn = document.getElementById('generate-single');
    const generateMultipleBtn = document.getElementById('generate-multiple');
    const checkStrengthBtn = document.getElementById('check-strength');
    const copyBtn = document.getElementById('copy-btn');

    const passwordOutput = document.getElementById('password-output');
    const passwordLength = document.getElementById('password-length');
    const passwordStrength = document.getElementById('password-strength');
    const logsContainer = document.getElementById('logs-container');

    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    generateSingleBtn.addEventListener('click', async function() {
        const data = {
            length: parseInt(lengthSlider.value),
            useNumbers: numbersCheckbox.checked,
            useSymbols: symbolsCheckbox.checked,
            useUppercase: uppercaseCheckbox.checked
        };

        try {
            const response = await fetch('/api/passwords/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                displayPassword(result);
                addLog('POST', '/api/passwords/generate', 'Успешно');
            } else {
                showError(result.error);
                addLog('POST', '/api/passwords/generate', `Ошибка: ${result.error}`);
            }
        } catch (error) {
            showError('Ошибка сети');
            addLog('POST', '/api/passwords/generate', `Ошибка сети: ${error.message}`);
        }
    });

    generateMultipleBtn.addEventListener('click', async function() {
        const data = {
            count: 5,
            length: parseInt(lengthSlider.value),
            useNumbers: numbersCheckbox.checked,
            useSymbols: symbolsCheckbox.checked,
            useUppercase: uppercaseCheckbox.checked
        };

        try {
            const response = await fetch('/api/passwords/generate/multiple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                displayPassword(result.passwords[0]);
                const allPasswords = result.passwords.map(p => p.password).join('\n');
                alert(`Все сгенерированные пароли:\n\n${allPasswords}`);

                addLog('POST', '/api/passwords/generate/multiple', 'Успешно (5 паролей)');
            } else {
                showError(result.error);
                addLog('POST', '/api/passwords/generate/multiple', `Ошибка: ${result.error}`);
            }
        } catch (error) {
            showError('Ошибка сети');
            addLog('POST', '/api/passwords/generate/multiple', `Ошибка сети: ${error.message}`);
        }
    });

    checkStrengthBtn.addEventListener('click', async function() {
        const currentPassword = passwordOutput.value;

        if (!currentPassword || currentPassword === '') {
            const testPassword = prompt('Введите пароль для проверки:');
            if (!testPassword) return;

            passwordOutput.value = testPassword;
            checkPasswordStrength(testPassword);
        } else {
            checkPasswordStrength(currentPassword);
        }
    });

    copyBtn.addEventListener('click', function() {
        if (passwordOutput.value) {
            navigator.clipboard.writeText(passwordOutput.value)
                .then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Ошибка копирования: ', err);
                });
        }
    });

    document.querySelectorAll('.test-api').forEach(button => {
        button.addEventListener('click', async function() {
            const method = this.dataset.method;
            const endpoint = this.dataset.endpoint;

            let requestOptions = {
                method: method,
                headers: {}
            };

            if (method === 'POST') {
                requestOptions.headers['Content-Type'] = 'application/json';
                if (endpoint.includes('/generate')) {
                    requestOptions.body = JSON.stringify({
                        length: 12,
                        useNumbers: true,
                        useSymbols: true
                    });
                } else if (endpoint.includes('/check')) {
                    requestOptions.body = JSON.stringify({
                        password: "TestPass123!"
                    });
                }
            }

            try {
                const response = await fetch(`/api/passwords${endpoint}`, requestOptions);
                const result = await response.json();

                if (response.ok) {
                    if (result.password) {
                        displayPassword(result);
                    } else {
                        alert(JSON.stringify(result, null, 2));
                    }
                    addLog(method, `/api/passwords${endpoint}`, 'Успешно (тест)');
                } else {
                    showError(result.error);
                    addLog(method, `/api/passwords${endpoint}`, `Ошибка: ${result.error}`);
                }
            } catch (error) {
                showError('Ошибка сети');
                addLog(method, `/api/passwords${endpoint}`, `Ошибка сети: ${error.message}`);
            }
        });
    });

    function displayPassword(data) {
        passwordOutput.value = data.password;
        passwordLength.textContent = data.length || data.password.length;

        const strength = data.strength || 'Неизвестно';
        passwordStrength.textContent = strength;

        passwordStrength.className = '';
        if (strength.includes('Очень сильный')) {
            passwordStrength.classList.add('strength-very-strong');
        } else if (strength.includes('Сильный')) {
            passwordStrength.classList.add('strength-strong');
        } else if (strength.includes('Средний')) {
            passwordStrength.classList.add('strength-medium');
        } else {
            passwordStrength.classList.add('strength-weak');
        }
    }

    async function checkPasswordStrength(password) {
        try {
            const response = await fetch('/api/passwords/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const result = await response.json();

            if (response.ok) {
                displayPassword(result);

                if (result.suggestions && result.suggestions.length > 0) {
                    alert(`Рекомендации:\n\n${result.suggestions.join('\n')}`);
                }

                addLog('POST', '/api/passwords/check', 'Успешно');
            } else {
                showError(result.error);
                addLog('POST', '/api/passwords/check', `Ошибка: ${result.error}`);
            }
        } catch (error) {
            showError('Ошибка сети');
            addLog('POST', '/api/passwords/check', `Ошибка сети: ${error.message}`);
        }
    }

    function showError(message) {
        alert(`Ошибка: ${message}`);
    }

    function addLog(method, endpoint, message) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';

        const time = new Date().toLocaleTimeString();
        const methodClass = method.toUpperCase();

        logEntry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-method ${methodClass}">${method}</span>
            <span class="log-endpoint">${endpoint}</span>
            <span class="log-message">${message}</span>
        `;

        logsContainer.prepend(logEntry);

        if (logsContainer.children.length > 10) {
            logsContainer.removeChild(logsContainer.lastChild);
        }
    }

    setTimeout(async () => {
        try {
            const response = await fetch('/api/passwords/generate?length=12');
            const result = await response.json();

            if (response.ok) {
                displayPassword(result);
                addLog('GET', '/api/passwords/generate?length=12', 'Автогенерация при загрузке');
            }
        } catch (error) {
            console.log('Сервер не отвечает, но это нормально для демонстрации');
        }
    }, 1000);
});