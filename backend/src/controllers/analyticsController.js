const prisma = require('../config/prisma');
const { exec } = require('child_process');
const path = require('path');

exports.getStats = async (req, res) => {
    try {
        const totalTickets = await prisma.ticket.count();
        const pendingTickets = await prisma.ticket.count({ where: { status: 'PENDING' } });
        
        // Calcul de la consommation totale
        const consumptionSum = await prisma.consumption.aggregate({
            _sum: { quantity: true }
        });

        // Calcul du temps de résolution moyen (pour les tickets REPAIRED)
        const repairedTickets = await prisma.ticket.findMany({
            where: { status: 'REPAIRED' },
            select: { createdAt: true, updatedAt: true }
        });

        let avgResolutionTime = 0;
        if (repairedTickets.length > 0) {
            const totalMs = repairedTickets.reduce((acc, t) => {
                return acc + (new Date(t.updatedAt) - new Date(t.createdAt));
            }, 0);
            avgResolutionTime = Math.round(totalMs / repairedTickets.length / (1000 * 60 * 60)); // en heures
        }

        res.json({ 
            totalTickets, 
            pendingTickets, 
            totalConsumption: consumptionSum._sum.quantity || 0,
            avgResolutionTime
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAiPrediction = (req, res) => {
    const scriptPath = path.join(__dirname, '../../ai_predict.py');
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur d'exécution: ${error}`);
            return res.status(500).json({ error: "Erreur lors de l'exécution de l'IA", details: stderr });
        }
        try {
            const result = JSON.parse(stdout);
            if (result.success) {
                res.json(result.data);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (parseError) {
            console.error("Erreur de parsing JSON:", parseError);
            res.status(500).json({ error: "Format de réponse invalide depuis Python", rawOutput: stdout });
        }
    });
};
