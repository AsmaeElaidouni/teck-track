const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
});

async function main() {
    console.log('--- Direct Admin Creation Start ---');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    try {
        await prisma.user.upsert({
            where: { email: 'admin@snaj.tech' },
            update: {},
            create: {
                email: 'admin@snaj.tech',
                password: hashedPassword,
                name: 'Amin Snaj',
                role: 'ADMIN',
            },
        });
        console.log('✅ Admin user created: admin@snaj.tech / admin123');
    } catch (err) {
        console.error('❌ Error creating admin:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
