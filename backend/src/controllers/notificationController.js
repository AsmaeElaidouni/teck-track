const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'Notifications marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

// Fonction utilitaire pour créer une notification
exports.createNotification = async (userId, title, message, type = 'INFO') => {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type }
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
  }
};
