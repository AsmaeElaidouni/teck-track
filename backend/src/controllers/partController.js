const prisma = require('../config/prisma');

exports.getParts = async (req, res) => {
    try {
        const parts = await prisma.part.findMany();
        res.json(parts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addPart = async (req, res) => {
    const { name, stock, minThreshold } = req.body;
    try {
        const part = await prisma.part.create({
            data: { name, stock, minThreshold }
        });
        res.status(201).json(part);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updatePart = async (req, res) => {
    const { id } = req.params;
    const { name, stock, minThreshold } = req.body;
    try {
        const part = await prisma.part.update({
            where: { id: parseInt(id) },
            data: { name, stock, minThreshold }
        });
        res.json(part);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getPredictions = async (req, res) => {
    try {
        // 1. Récupérer l'historique des pièces et de leurs consommations
        const parts = await prisma.part.findMany({
            include: {
                consumptions: true
            }
        });

        // 2. Envoyer les données au microservice Python pour prédiction
        const aiResponse = await fetch('http://localhost:8000/api/predict-stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parts })
        });

        if (!aiResponse.ok) {
            throw new Error(`Erreur IA Service: ${aiResponse.statusText}`);
        }

        const predictions = await aiResponse.json();
        res.json(predictions);

    } catch (err) {
        console.error("AI Prediction Error:", err);
        res.status(500).json({ error: "Impossible de contacter l'IA pour la maintenance prédictive.", details: err.message });
    }
};
