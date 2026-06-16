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

    // 2. Technicien
    await prisma.user.upsert({
        where: { email: 'tech@snaj.tech' },
        update: {},
        create: {
            email: 'tech@snaj.tech',
            password,
            name: 'Marc Technicien',
            role: 'TECHNICIAN',
        },
    });

    // 3. Employé
    await prisma.user.upsert({
        where: { email: 'employe@snaj.tech' },
        update: {},
        create: {
            email: 'employe@snaj.tech',
            password,
            name: 'Jean Employé',
            role: 'EMPLOYEE',
        },
    });

    console.log('✅ Base de données initialisée avec 3 rôles de test.');
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
