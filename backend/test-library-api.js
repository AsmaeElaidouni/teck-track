const axios = require('axios');

async function test() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:5010/api/auth/login', {
            email: 'admin@snaj.tech',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Login successful, token retrieved.');

        // 2. Fetch library
        const libRes = await axios.get('http://localhost:5010/api/library', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Library response status:', libRes.status);
        console.log('Library items:', JSON.stringify(libRes.data, null, 2));
    } catch (e) {
        console.error('Test error:', e.message);
        if (e.response) {
            console.error('Response status:', e.response.status);
            console.error('Response data:', e.response.data);
        }
    }
}

test();
