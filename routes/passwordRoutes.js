const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

router.get('/generate', (req, res) => {
    const { length = 12, numbers = 'true', symbols = 'true', uppercase = 'true' } = req.query;
    const password = passwordController.generateRandomPassword(
        parseInt(length),
        numbers === 'true',
        symbols === 'true',
        uppercase === 'true'
    );
    res.json({
        password,
        length: parseInt(length),
        strength: passwordController.calculatePasswordStrength(password),
        generatedVia: 'GET with query params'
    });
});
router.post('/generate', passwordController.generatePassword);
router.post('/generate/multiple', passwordController.generateMultiplePasswords);
router.post('/check', passwordController.checkPasswordStrength)
router.get('/check/:password', (req, res) => {
    const { password } = req.params;
    res.json({
        password,
        length: password.length,
        strength: passwordController.calculatePasswordStrength(password),
        generatedVia: 'GET with route param'
    });
});
router.delete('/history/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        message: `Запись с ID ${id} удалена`,
        timestamp: new Date().toISOString()
    });
});
router.put('/settings', (req, res) => {
    const {defaultLength, useSymbols} = req.body;
    res.json({
        message: 'Настройки обновлены',
        settings: {
            defaultLength: defaultLength || 12,
            useSymbols: useSymbols !== undefined ? useSymbols : true
        }
    });
});
module.exports = router;