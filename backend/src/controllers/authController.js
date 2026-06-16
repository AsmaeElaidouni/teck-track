const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

exports.register = async (req, res) => {
    const { email, password, name, role } = req.body;
    
    // Validation backend
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
    }

    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ message: 'Le nom ne doit contenir que des lettres.' });
    }

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
            data: { email, password: hashedPassword, name, role: role || 'TECHNICIAN' }
        });
        res.status(201).json({ message: 'User created', userId: user.id });
    } catch (err) {
        res.status(400).json({ message: 'Registration failed', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Veuillez remplir tous les champs.' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Login error', error: err.message });
    }
};
