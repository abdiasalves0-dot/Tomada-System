require('dotenv').config();
const authController = require('./controllers/auth.controller');

(async () => {
    const req = { body: { email: 'test@test.com', senha: '123' } };
    const res = {
        status: (s) => ({
            json: (data) => console.log('Status:', s, 'Data:', data)
        }),
        json: (data) => console.log('Data:', data)
    };

    try {
        await authController.login(req, res);
    } catch (e) {
        console.error("Error:", e);
    }
})();
