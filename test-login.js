require('dotenv').config();
const authController = require('./gestaoPadeiro-fdd83e32d29c2ac32a0f0529bc342c95e0b35aef/controllers/auth.controller');

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
