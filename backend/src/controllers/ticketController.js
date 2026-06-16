const prisma = require('../config/prisma');
const { createNotification } = require('./notificationController');
const emailService = require('../services/emailService');

// Any authenticated user creates a ticket (creatorId = me)
exports.createTicket = async (req, res) => {
    const { title, description, priority, type } = req.body;
    
    // 🤖 IA NLP : Détection automatique d'urgence
    const urgenceKeywords = ['urgent', 'grave', 'danger', 'fumé', 'feu', 'bloqué', 'immédiat', 'panne totale', 'alarme', 'explosé', 'fuite'];
    const textToAnalyze = (title + ' ' + description).toLowerCase();
    let finalPriority = priority || 'NORMAL';
    
    if (urgenceKeywords.some(word => textToAnalyze.includes(word))) {
        finalPriority = 'URGENT';
        console.log("🤖 IA : Détection d'une urgence critique ! Priorité forcée à URGENT.");
    }

    try {
        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: finalPriority,
                type: type || 'OTHER',
                creatorId: req.user.id
            }
        });

        // 📧 Envoyer l'email de notification aux Admins
        try {
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
            for (const admin of admins) {
                await emailService.sendTicketCreatedEmail(admin.email, ticket, req.user.name || 'Employé');
            }
        } catch (emailErr) {
            console.error("L'e-mail de création de ticket n'a pas pu être envoyé aux admins :", emailErr.message);
        }

        res.status(201).json(ticket);
    } catch (err) {
        res.status(400).json({ message: 'Ticket creation failed', error: err.message });
    }
};

// Role-scoped ticket list
exports.getTickets = async (req, res) => {
    try {
        let where = {};
        if (req.user.role === 'TECHNICIAN') where = { technicianId: req.user.id };
        if (req.user.role === 'EMPLOYEE') where = { creatorId: req.user.id };

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                technician: { select: { id: true, name: true } },
                creator: { select: { id: true, name: true } },
                consumptions: { include: { part: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tickets', error: err.message });
    }
};

// Get single ticket (scoped)
exports.getTicketById = async (req, res) => {
    const { id } = req.params;
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                technician: { select: { id: true, name: true } },
                creator: { select: { id: true, name: true } },
                consumptions: { include: { part: { select: { id: true, name: true } } } }
            }
        });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Access control
        if (req.user.role === 'TECHNICIAN' && ticket.technicianId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (req.user.role === 'EMPLOYEE' && ticket.creatorId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching ticket', error: err.message });
    }
};

// ADMIN: assign technician to ticket
exports.assignTechnician = async (req, res) => {
    const { id } = req.params;
    const { technicianId } = req.body;
    try {
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: { technicianId: parseInt(technicianId), status: 'IN_PROGRESS' },
            include: { technician: { select: { id: true, name: true, email: true } } }
        });

        // 🔔 Notification pour le Technicien
        await createNotification(
            parseInt(technicianId),
            'Nouvelle mission 🔧',
            `Le ticket #${id} : "${ticket.title}" vous a été assigné.`,
            'INFO'
        );

        // 📧 Envoyer l'email de notification au Technicien
        if (ticket.technician && ticket.technician.email) {
            try {
                await emailService.sendTicketAssignedEmail(ticket.technician.email, ticket, ticket.technician.name);
            } catch (emailErr) {
                console.error("L'e-mail d'assignation n'a pas pu être envoyé au technicien :", emailErr.message);
            }
        }

        res.json(ticket);
    } catch (err) {
        res.status(400).json({ message: 'Assignment failed', error: err.message });
    }
};

// TECHNICIAN: update ticket status
exports.updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        // Verify technician owns this ticket
        const existing = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
        if (req.user.role === 'TECHNICIAN' && existing?.technicianId !== req.user.id) {
            return res.status(403).json({ message: 'Not your ticket' });
        }
        
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: { status },
            include: { 
                technician: { select: { name: true } },
                creator: { select: { id: true, name: true, email: true } }
            }
        });

        // 🔔 Notification pour l'Employé (Créateur)
        if (ticket.creatorId) {
            let title = 'Mise à jour ticket 🛠️';
            let message = `L'état de votre demande #${id} est passé à : ${status}`;
            let type = 'INFO';

            if (status === 'REPAIRED') {
                title = 'Réparation terminée ! ✅';
                message = `Votre machine pour le ticket #${id} a été réparée.`;
                type = 'SUCCESS';
            }

            await createNotification(ticket.creatorId, title, message, type);

            // 📧 Envoyer l'email de notification au Créateur
            if (ticket.creator && ticket.creator.email) {
                try {
                    await emailService.sendTicketResolvedEmail(ticket.creator.email, ticket, ticket.creator.name);
                } catch (emailErr) {
                    console.error("L'e-mail de mise à jour n'a pas pu être envoyé au créateur :", emailErr.message);
                }
            }
        }

        // 🔔 Notification pour les ADMINS quand le technicien termine le travail
        if (status === 'REPAIRED') {
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
            for (const admin of admins) {
                await createNotification(
                    admin.id,
                    'Travail de technicien terminé 🎉',
                    `Le technicien ${ticket.technician?.name || 'N/A'} a terminé le ticket #${id} : "${ticket.title}". Veuillez réviser.`,
                    'SUCCESS'
                );

                // 📧 Envoyer l'email de notification de résolution aux admins
                try {
                    await emailService.sendTicketResolvedEmail(admin.email, ticket, admin.name);
                } catch (emailErr) {
                    console.error("L'e-mail de fin de ticket n'a pas pu être envoyé à l'admin :", emailErr.message);
                }
            }
        }

        res.json(ticket);
    } catch (err) {
        res.status(400).json({ message: 'Status update failed', error: err.message });
    }
};

// TECHNICIAN: add parts consumption
exports.addConsumption = async (req, res) => {
    const { id } = req.params;
    const { partId, quantity } = req.body;
    try {
        const part = await prisma.part.findUnique({ where: { id: parseInt(partId) } });
        if (!part || part.stock < quantity) {
            return res.status(400).json({ message: 'Stock insuffisant ou pièce introuvable' });
        }
        
        const newStock = part.stock - parseInt(quantity);

        const result = await prisma.$transaction([
            prisma.consumption.create({
                data: { ticketId: parseInt(id), partId: parseInt(partId), quantity: parseInt(quantity) }
            }),
            prisma.part.update({
                where: { id: parseInt(partId) },
                data: { stock: newStock }
            })
        ]);

        // 📧 Alerte stock bas si le stock après transaction est inférieur ou égal au seuil minThreshold
        if (newStock <= part.minThreshold) {
            console.log(`⚠️ ALERTE STOCK BAS détectée pour la pièce ${part.name}. Stock actuel: ${newStock}, Seuil: ${part.minThreshold}`);
            try {
                const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
                for (const admin of admins) {
                    await emailService.sendLowStockAlertEmail(admin.email, {
                        name: part.name,
                        stock: newStock,
                        minThreshold: part.minThreshold
                    });
                }
            } catch (emailErr) {
                console.error("L'e-mail d'alerte stock bas n'a pas pu être envoyé :", emailErr.message);
            }
        }

        res.json({ message: 'Consommation enregistrée', result });
    } catch (err) {
        res.status(400).json({ message: 'Error adding consumption', error: err.message });
    }
};

// EMPLOYEE: add comment to own ticket
exports.addComment = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    try {
        const existing = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
        if (!existing || existing.creatorId !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const ticket = await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: { comment }
        });
        res.json(ticket);
    } catch (err) {
        res.status(400).json({ message: 'Comment failed', error: err.message });
    }
};
