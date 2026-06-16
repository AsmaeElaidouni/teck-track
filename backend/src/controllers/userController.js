const prisma = require('../config/prisma');

// ADMIN: get all users
exports.getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
};

// ADMIN: get technicians only
exports.getTechnicians = async (req, res) => {
    try {
        const technicians = await prisma.user.findMany({
            where: { role: 'TECHNICIAN' },
            select: { id: true, name: true, email: true }
        });
        res.json(technicians);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching technicians', error: err.message });
    }
};

// ADMIN: create user (employee or technician)
exports.createUser = async (req, res) => {
    const bcrypt = require('bcryptjs');
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
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

    if (password.length < 6) {
        return res.status(400).json({ message: 'Le mot de passe doit faire au moins 6 caractères.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role: role || 'EMPLOYEE' },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: 'User creation failed', error: err.message });
    }
};

// ADMIN: delete user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(400).json({ message: 'Delete failed', error: err.message });
    }
};
// ANY USER: update own password
exports.updatePassword = async (req, res) => {
    const bcrypt = require('bcryptjs');
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });
        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour', error: err.message });
    }
};
