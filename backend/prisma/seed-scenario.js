const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // 1. Admin
    await prisma.user.upsert({
        where: { email: 'admin@snaj.tech' },
        update: {},
        create: {
            email: 'admin@snaj.tech',
            password,
            name: 'Admin Snaj',
            role: 'ADMIN',
        },
    });

    // 2. Technicien (Youssef)
    await prisma.user.upsert({
        where: { email: 'youssef@snaj.tech' },
        update: {},
        create: {
            email: 'youssef@snaj.tech',
            password,
            name: 'Youssef (Hardware)',
            role: 'TECHNICIAN',
        },
    });

    // 3. Employé (Ali)
    await prisma.user.upsert({
        where: { email: 'ali@snaj.tech' },
        update: {},
        create: {
            email: 'ali@snaj.tech',
            password,
            name: 'Ali (Employé)',
            role: 'EMPLOYEE',
        },
    });

    // 4. Initial Stock
    await prisma.part.upsert({
        where: { name: 'RAM 8GB' },
        update: { stock: 5 },
        create: { name: 'RAM 8GB', stock: 5, minThreshold: 5 }
    });

    console.log('✅ Base de données initialisée pour le Scénario Réel (Ali / Youssef).');
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
