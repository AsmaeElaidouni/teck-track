const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const tech = await prisma.user.upsert({
    where: { email: 'tech@test.com' },
    update: { password: hashedPassword },
    create: {
      email: 'tech@test.com',
      name: 'Technicien Test',
      password: hashedPassword,
      role: 'TECHNICIAN'
    }
  });
  console.log('Technicien créé avec succès :', tech.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
