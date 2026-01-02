const fs = require('fs');
const path = require('path');

// Try to load .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            let val = value.trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            process.env[key.trim()] = val;
        }
    });
} catch (e) {
    console.log('No .env file found or could not read it.');
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('Error: TELEGRAM_BOT_TOKEN is not defined in .env');
    process.exit(1);
}

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBHOOK_URL = 'http://localhost:3000/api/telegram/webhook';

let offset = 0;

async function getUpdates() {
    try {
        const res = await fetch(`${API_URL}/getUpdates?offset=${offset}&timeout=30`);
        const data = await res.json();

        if (data.ok) {
            for (const update of data.result) {
                await forwardUpdate(update);
                offset = update.update_id + 1;
            }
        } else {
            console.error('Telegram Error:', data);
        }
    } catch (e) {
        console.error('Polling Error:', e.message);
        // Wait a bit before retrying
        await new Promise(r => setTimeout(r, 5000));
    }

    // Continue polling
    getUpdates();
}

async function forwardUpdate(update) {
    try {
        const res = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
        });

        const text = await res.text();
        console.log(`Update ${update.update_id} forwarded: ${res.status} ${text}`);
    } catch (e) {
        console.error(`Forward Error for ${update.update_id}:`, e.message);
    }
}

console.log('Starting local polling...');
console.log(`Bot Token: ...${BOT_TOKEN.slice(-5)}`);
console.log(`Target: ${WEBHOOK_URL}`);

// Clear webhook first to enable polling
fetch(`${API_URL}/deleteWebhook`)
    .then(() => getUpdates())
    .catch(e => console.error('Failed to delete webhook:', e));
