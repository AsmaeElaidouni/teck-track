const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Ajout de données additionnelles pour les captures ---');

    // 1. Get users
    const admin = await prisma.user.findUnique({ where: { email: 'admin@snaj.tech' } });
    const tech = await prisma.user.findUnique({ where: { email: 'youssef@snaj.tech' } });
    const employee = await prisma.user.findUnique({ where: { email: 'ali@snaj.tech' } });

    if (!admin || !tech || !employee) {
        console.error('Erreur: Veuillez exécuter npm run dev ou node prisma/fill-demo-data.js d\'abord.');
        process.exit(1);
    }

    // 2. Créer des demandes d'accès en attente (AccessRequest)
    await prisma.accessRequest.upsert({
        where: { email: 'fatima@snaj.tech' },
        update: {},
        create: {
            name: 'Fatima Zahra',
            email: 'fatima@snaj.tech',
            role: 'TECHNICIAN',
            status: 'PENDING'
        }
    });

    await prisma.accessRequest.upsert({
        where: { email: 'omar@snaj.tech' },
        update: {},
        create: {
            name: 'Omar Mansouri',
            email: 'omar@snaj.tech',
            role: 'EMPLOYEE',
            status: 'PENDING'
        }
    });

    await prisma.accessRequest.upsert({
        where: { email: 'karim@snaj.tech' },
        update: {},
        create: {
            name: 'Karim Bennani',
            email: 'karim@snaj.tech',
            role: 'EMPLOYEE',
            status: 'APPROVED'
        }
    });

    // 3. Créer des notifications pour les utilisateurs
    const notifications = [
        {
            userId: admin.id,
            title: 'Nouveau ticket créé',
            message: 'Un nouveau ticket urgent "Écran cassé" a été créé par Ali Employé.',
            type: 'URGENT',
            isRead: false
        },
        {
            userId: admin.id,
            title: 'Seuil critique atteint',
            message: 'Le stock de "Clavier AZERTY USB" est bas (2 restants).',
            type: 'WARNING',
            isRead: false
        },
        {
            userId: admin.id,
            title: 'Demande d\'accès',
            message: 'Fatima Zahra a demandé un accès en tant que Technicien.',
            type: 'INFO',
            isRead: false
        },
        {
            userId: tech.id,
            title: 'Nouveau ticket assigné',
            message: 'Le ticket "Problème Windows" vous a été assigné par l\'administrateur.',
            type: 'INFO',
            isRead: false
        },
        {
            userId: tech.id,
            title: 'Alerte maintenance',
            message: 'La presse hydraulique nécessite une révision annuelle.',
            type: 'WARNING',
            isRead: false
        },
        {
            userId: employee.id,
            title: 'Ticket résolu',
            message: 'Votre ticket "Clavier HS" a été marqué comme réparé.',
            type: 'SUCCESS',
            isRead: false
        }
    ];

    for (const n of notifications) {
        await prisma.notification.create({ data: n });
    }

    // 4. Ajouter d'autres tickets historiques pour rendre les graphiques riches
    const now = new Date();
    const extraTickets = [
        {
            title: 'Panne tapis de transport',
            description: 'Le tapis de transport de la ligne B s\'est arrêté subitement sans code d\'erreur.',
            status: 'IN_PROGRESS',
            priority: 'URGENT',
            type: 'HARDWARE',
            creatorId: employee.id,
            technicianId: tech.id,
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // Il y a 2 jours
        },
        {
            title: 'Panne ventilateur serveur',
            description: 'Bruit anormal provenant du rack principal du serveur.',
            status: 'REPAIRED',
            priority: 'NORMAL',
            type: 'HARDWARE',
            creatorId: employee.id,
            technicianId: tech.id,
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
            comment: 'Remplacement du ventilateur de refroidissement effectué avec succès.'
        },
        {
            title: 'Perte connexion Wi-Fi Atelier',
            description: 'Aucun appareil ne parvient à se connecter au point d\'accès de l\'atelier.',
            status: 'PENDING',
            priority: 'NORMAL',
            type: 'NETWORK',
            creatorId: employee.id,
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // Il y a 1 jour
        },
        {
            title: 'Mise à jour firmware automate',
            description: 'Appliquer la version 4.2.1 du firmware sur l\'automate Siemens S7-1200.',
            status: 'REPAIRED',
            priority: 'LOW',
            type: 'SOFTWARE',
            creatorId: employee.id,
            technicianId: tech.id,
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000), // Il y a 8 jours
            comment: 'Mise à jour effectuée pendant l\'arrêt programmé.'
        },
        {
            title: 'Problème de mot de passe',
            description: 'Impossible d\'accéder à l\'extranet SNAJ.',
            status: 'REPAIRED',
            priority: 'LOW',
            type: 'SOFTWARE',
            creatorId: employee.id,
            technicianId: tech.id,
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            comment: 'Réinitialisation de mot de passe effectuée.'
        }
    ];

    for (const t of extraTickets) {
        await prisma.ticket.create({ data: t });
    }

    console.log('✅ Données additionnelles insérées avec succès !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
