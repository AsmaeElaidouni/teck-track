const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function main() {
    console.log('--- Direct MySQL Admin Creation ---');

    // Parse DATABASE_URL: mysql://root:@localhost:3306/maintenance_db
    const url = process.env.DATABASE_URL;
    const match = url.match(/mysql:\/\/([^:]+):?([^@]*)@([^:]+):(\d+)\/(.+)/);

    if (!match) {
        console.error('Invalid DATABASE_URL format');
        return;
    }

    const [, user, password, host, port, database] = match;

    const connection = await mysql.createConnection({
        host,
        user,
        password,
        database,
        port: parseInt(port)
    });

    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const [rows] = await connection.execute(
            'SELECT id FROM User WHERE email = ?',
            ['admin@snaj.tech']
        );

        if (rows.length === 0) {
            await connection.execute(
                'INSERT INTO User (email, password, name, role, updatedAt) VALUES (?, ?, ?, ?, NOW())',
                ['admin@snaj.tech', hashedPassword, 'Amin Snaj', 'ADMIN']
            );
            console.log('✅ Admin user created directly via MySQL');
        } else {
            console.log('ℹ️ Admin user already exists');
        }
    } catch (err) {
        console.error('❌ SQL Error:', err);
    } finally {
        await connection.end();
    }
}

main();
