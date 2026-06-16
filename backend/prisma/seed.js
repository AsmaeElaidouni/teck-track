const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seed starting...');
    try {
        const userCount = await prisma.user.count();
        console.log('Current user count:', userCount);
        console.log('Seed completed successfully (minimal)');
    } catch (err) {
        console.error('MINIMAL_SEED_ERROR:', err);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
