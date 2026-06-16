const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const emailService = require('../services/emailService');

// Public: Create a new access request
exports.createRequest = async (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
    }

    // Validation du nom (pas de chiffres)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ message: 'Le nom ne doit contenir que des lettres.' });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Veuillez entrer une adresse email valide.' });
    }

    try {
        const existing = await prisma.accessRequest.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Une demande existe déjà pour cet email.' });

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'Un utilisateur possède déjà cet email.' });

        const request = await prisma.accessRequest.create({
            data: { name, email, role: role || 'EMPLOYEE' }
        });
        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la demande.' });
    }
};

// Admin: Get all pending requests
exports.getRequests = async (req, res) => {
    try {
        const requests = await prisma.accessRequest.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération.' });
    }
};

// Admin: Approve a request
exports.approveRequest = async (req, res) => {
    const { id } = req.params;
    console.log(">>> [BACKEND] Requête d'approbation reçue pour l'ID :", id);
    try {
        const request = await prisma.accessRequest.findUnique({ where: { id: parseInt(id) } });
        if (!request) return res.status(404).json({ message: 'Demande non trouvée.' });

        // Create user with default password
        const defaultPassword = 'password123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await prisma.user.create({
            data: {
                email: request.email,
                name: request.name,
                role: request.role,
                password: hashedPassword
            }
        });

        // Envoyer l'email de bienvenue automatique
        try {
            await emailService.sendWelcomeEmail(request.email, request.name, defaultPassword);
        } catch (emailErr) {
            console.error("L'email n'a pas pu être envoyé, mais l'utilisateur a été créé.");
        }

        // Mark as approved or delete
        await prisma.accessRequest.delete({ where: { id: parseInt(id) } });

        res.json({ message: 'Demande approuvée. Utilisateur créé et email envoyé.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de l\'approbation.' });
    }
};

// Admin: Reject a request
exports.rejectRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.accessRequest.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Demande rejetée.' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors du rejet.' });
    }
};
