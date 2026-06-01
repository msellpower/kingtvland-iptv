import 'dotenv/config';
const test = async () => {
    try {
        const res = await fetch('http://127.0.0.1:3000/api/public/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text);
    } catch(e) {
        console.error('Fetch error:', e);
    }
};
test();
