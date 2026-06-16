const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Remplissage des données de démonstration ---');

    const password = await bcrypt.hash('admin123', 10);

    // 1. Assurer que les utilisateurs existent
    const admin = await prisma.user.upsert({
        where: { email: 'admin@snaj.tech' },
        update: {},
        create: { email: 'admin@snaj.tech', password, name: 'Amin Snaj', role: 'ADMIN' }
    });

    const tech1 = await prisma.user.upsert({
        where: { email: 'youssef@snaj.tech' },
        update: {},
        create: { email: 'youssef@snaj.tech', password, name: 'Youssef Tech', role: 'TECHNICIAN' }
    });

    const user1 = await prisma.user.upsert({
        where: { email: 'ali@snaj.tech' },
        update: {},
        create: { email: 'ali@snaj.tech', password, name: 'Ali Employé', role: 'EMPLOYEE' }
    });

    // 2. Créer des pièces avec différents niveaux de stock
    const partsData = [
        { name: 'Écran LED 15.6"', stock: 12, minThreshold: 3 },
        { name: 'Clavier AZERTY USB', stock: 2, minThreshold: 5 }, // Alert!
        { name: 'SSD 500GB', stock: 15, minThreshold: 4 },
        { name: 'RAM 8GB DDR4', stock: 1, minThreshold: 3 }, // Alert!
        { name: 'Batterie Laptop HP', stock: 8, minThreshold: 2 }
    ];

    const createdParts = [];
    for (const p of partsData) {
        const part = await prisma.part.upsert({
            where: { name: p.name },
            update: { stock: p.stock, minThreshold: p.minThreshold },
            create: p
        });
        createdParts.push(part);
    }

    // 3. Créer des tickets
    const ticketsData = [
        { title: 'Écran cassé', description: 'Le laptop ne s\'allume plus après une chute.', status: 'PENDING', priority: 'URGENT', type: 'HARDWARE', creatorId: user1.id },
        { title: 'Problème Windows', description: 'Mise à jour bloquée à 50%.', status: 'IN_PROGRESS', priority: 'NORMAL', type: 'SOFTWARE', creatorId: user1.id, technicianId: tech1.id },
        { title: 'Clavier HS', description: 'Plusieurs touches ne fonctionnent plus.', status: 'REPAIRED', priority: 'LOW', type: 'HARDWARE', creatorId: user1.id, technicianId: tech1.id },
        { title: 'Lenteur PC', description: 'Le PC est très lent au démarrage.', status: 'REPAIRED', priority: 'NORMAL', type: 'HARDWARE', creatorId: user1.id, technicianId: tech1.id },
        { title: 'Imprimante réseau', description: 'Impossible d\'imprimer sur la Konica.', status: 'PENDING', priority: 'URGENT', type: 'NETWORK', creatorId: user1.id }
    ];

    for (const t of ticketsData) {
        await prisma.ticket.create({ data: t });
    }

    // 4. Créer des consommations fictives sur les 30 derniers jours (pour l'IA)
    console.log('--- Génération des consommations pour l\'IA ---');
    const now = new Date();
    const ram = createdParts.find(p => p.name === 'RAM 8GB DDR4');
    const ssd = createdParts.find(p => p.name === 'SSD 500GB');

    // On simule une consommation régulière de RAM (1 tous les 3 jours)
    for (let i = 1; i <= 10; i++) {
        const date = new Date();
        date.setDate(now.getDate() - (i * 3));
        
        await prisma.consumption.create({
            data: {
                ticketId: 3, // On lie à un ticket existant
                partId: ram.id,
                quantity: 1,
                createdAt: date
            }
        });
    }

    console.log('✅ Base de données peuplée avec succès !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
