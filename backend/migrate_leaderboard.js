require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const migrate = async () => {
    console.log('--- Database Migration Service ---');
    const commands = [
        "ALTER TABLE leaderboard ADD COLUMN total_score INTEGER",
        "ALTER TABLE leaderboard ADD COLUMN time_taken INTEGER",
        "ALTER TABLE leaderboard ADD COLUMN percentage REAL",
        "ALTER TABLE leaderboard ADD COLUMN achieved_at DATETIME"
    ];

    for (const cmd of commands) {
        try {
            console.log(`Executing: ${cmd}`);
            await client.execute(cmd);
            console.log('✅ Success');
        } catch (e) {
            if (e.message.includes('duplicate column name')) {
                console.log('ℹ️ Column already exists, skipping.');
            } else {
                console.error(`❌ Failed: ${e.message}`);
            }
        }
    }
    console.log('--- Migration Complete ---');
    process.exit(0);
};

migrate();
