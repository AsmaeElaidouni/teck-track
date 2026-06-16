const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('--- RÉINITIALISATION ET REMPLISSAGE DES DONNÉES ---');

    // 1. Nettoyage des anciennes données
    console.log('Nettoyage des tables...');
    await prisma.notification.deleteMany();
    await prisma.consumption.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.part.deleteMany();
    await prisma.accessRequest.deleteMany();
    await prisma.user.deleteMany();

    const password = await bcrypt.hash('admin123', 10);

    // 2. Création des utilisateurs avec des noms diversifiés
    console.log('Création des utilisateurs...');
    
    // Admin
    const admin = await prisma.user.create({
        data: { email: 'admin@snaj.tech', password, name: 'Amin Snaj', role: 'ADMIN' }
    });

    // Techniciens
    const techYoussef = await prisma.user.create({
        data: { email: 'youssef@snaj.tech', password, name: 'Youssef Amrani', role: 'TECHNICIAN' }
    });
    const techFatima = await prisma.user.create({
        data: { email: 'fatima@snaj.tech', password, name: 'Fatima-Zahra El Kadiri', role: 'TECHNICIAN' }
    });

    // Employés
    const empAli = await prisma.user.create({
        data: { email: 'ali@snaj.tech', password, name: 'Ali El Omari', role: 'EMPLOYEE' }
    });
    const empRachid = await prisma.user.create({
        data: { email: 'rachid@snaj.tech', password, name: 'Rachid Alami', role: 'EMPLOYEE' }
    });
    const empSofia = await prisma.user.create({
        data: { email: 'sofia@snaj.tech', password, name: 'Sofia Bennani', role: 'EMPLOYEE' }
    });
    const empKarim = await prisma.user.create({
        data: { email: 'karim@snaj.tech', password, name: 'Karim Mansouri', role: 'EMPLOYEE' }
    });

    // 3. Création des pièces de rechange
    console.log('Création des pièces de rechange...');
    const partsData = [
        { name: 'Écran LED 15.6"', stock: 12, minThreshold: 3 },
        { name: 'Clavier AZERTY USB', stock: 2, minThreshold: 5 }, // Alerte stock bas !
        { name: 'SSD 500GB', stock: 15, minThreshold: 4 },
        { name: 'RAM 8GB DDR4', stock: 1, minThreshold: 3 }, // Alerte stock bas !
        { name: 'Batterie Laptop HP', stock: 8, minThreshold: 2 }
    ];

    const parts = {};
    for (const p of partsData) {
        const createdPart = await prisma.part.create({ data: p });
        parts[p.name] = createdPart;
    }

    // 4. Création des tickets avec des créateurs et techniciens logiques
    console.log('Création des tickets de maintenance...');
    const now = new Date();

    const ticketsData = [
        {
            title: 'Écran cassé',
            description: 'Le laptop de la réception ne s\'allume plus suite à un choc physique sur la dalle.',
            status: 'PENDING',
            priority: 'URGENT',
            type: 'HARDWARE',
            creatorId: empAli.id,
            createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12h ago
        },
        {
            title: 'Problème de connexion Wi-Fi Atelier',
            description: 'Les terminaux mobiles de l\'atelier B n\'arrivent plus à obtenir d\'adresse IP.',
            status: 'PENDING',
            priority: 'NORMAL',
            type: 'NETWORK',
            creatorId: empRachid.id,
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
            title: 'Mise à jour firmware automate',
            description: 'Appliquer le correctif de sécurité sur l\'automate central Siemens S7-1200.',
            status: 'IN_PROGRESS',
            priority: 'LOW',
            type: 'SOFTWARE',
            creatorId: empSofia.id,
            technicianId: techYoussef.id,
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
            title: 'Panne tapis de transport ligne 3',
            description: 'Le moteur du tapis surchauffe et s\'arrête de manière aléatoire en pleine production.',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            type: 'HARDWARE',
            creatorId: empKarim.id,
            technicianId: techFatima.id,
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
            title: 'Changement Clavier HS',
            description: 'Plusieurs touches ne répondent plus sur le poste d\'emballage.',
            status: 'REPAIRED',
            priority: 'LOW',
            type: 'HARDWARE',
            creatorId: empRachid.id,
            technicianId: techYoussef.id,
            comment: 'Clavier remplacé par un modèle AZERTY USB neuf. Test ok.',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
            title: 'Migration SSD et lenteur PC',
            description: 'Le poste CAO est extrêmement lent au démarrage et lors du chargement des plans.',
            status: 'REPAIRED',
            priority: 'NORMAL',
            type: 'HARDWARE',
            creatorId: empSofia.id,
            technicianId: techYoussef.id,
            comment: 'Disque dur mécanique remplacé par un SSD 500GB. Clonage réussi.',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
            title: 'Panne ventilateur serveur',
            description: 'Le ventilateur d\'extraction du rack réseau fait un bruit strident.',
            status: 'REPAIRED',
            priority: 'NORMAL',
            type: 'HARDWARE',
            creatorId: empKarim.id,
            technicianId: techFatima.id,
            comment: 'Ventilateur d\'extraction défectueux remplacé par un neuf. Température stable.',
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        }
    ];

    const createdTickets = [];
    for (const t of ticketsData) {
        const ticket = await prisma.ticket.create({ data: t });
        createdTickets.push(ticket);
    }

    // 5. Consommation de pièces pour l'historique et l'IA
    console.log('Génération de l\'historique des consommations...');
    
    // RAM 8GB DDR4 consommée régulièrement pour l'IA
    for (let i = 1; i <= 8; i++) {
        const date = new Date();
        date.setDate(now.getDate() - (i * 4));
        await prisma.consumption.create({
            data: {
                ticketId: createdTickets[4].id, // associé à un ticket résolu
                partId: parts['RAM 8GB DDR4'].id,
                quantity: 1,
                createdAt: date
            }
        });
    }

    // SSD 500GB consommé
    await prisma.consumption.create({
        data: {
            ticketId: createdTickets[5].id,
            partId: parts['SSD 500GB'].id,
            quantity: 1,
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
    });

    // Clavier USB consommé
    await prisma.consumption.create({
        data: {
            ticketId: createdTickets[4].id,
            partId: parts['Clavier AZERTY USB'].id,
            quantity: 1,
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
        }
    });

    // 6. Demandes d'accès
    console.log('Création des demandes d\'accès...');
    await prisma.accessRequest.create({
        data: { name: 'Mourad Filali', email: 'mourad@snaj.tech', role: 'TECHNICIAN', status: 'PENDING' }
    });
    await prisma.accessRequest.create({
        data: { name: 'Layla Touimi', email: 'layla@snaj.tech', role: 'EMPLOYEE', status: 'PENDING' }
    });

    // 7. Notifications
    console.log('Création des notifications...');
    const notifications = [
        {
            userId: admin.id,
            title: 'Nouveau ticket créé',
            message: 'Un ticket Urgent "Écran cassé" a été soumis par Ali El Omari.',
            type: 'URGENT',
            isRead: false
        },
        {
            userId: admin.id,
            title: 'Alerte stock critique',
            message: 'Le stock de "RAM 8GB DDR4" est critique (1 restant).',
            type: 'WARNING',
            isRead: false
        },
        {
            userId: techYoussef.id,
            title: 'Nouveau ticket assigné',
            message: 'Le ticket "Mise à jour firmware automate" vous a été assigné.',
            type: 'INFO',
            isRead: false
        },
        {
            userId: techFatima.id,
            title: 'Ticket assigné d\'urgence',
            message: 'Le ticket urgent "Panne tapis de transport ligne 3" vous a été assigné.',
            type: 'URGENT',
            isRead: false
        }
    ];

    for (const n of notifications) {
        await prisma.notification.create({ data: n });
    }

    console.log('✅ Base de données réinitialisée et repeuplée de façon logique !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
