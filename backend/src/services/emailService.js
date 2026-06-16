const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log("Service Email initialisé avec l'utilisateur :", process.env.EMAIL_USER);

// Helper function to send email with support for test override
const sendEmail = async (to, originalSubject, htmlContent) => {
    let recipient = to;
    let subject = originalSubject;

    if (process.env.EMAIL_OVERRIDE) {
        recipient = process.env.EMAIL_OVERRIDE;
        subject = `${originalSubject} [Destinataire: ${to}]`;
        console.log(`[EMAIL SERVICE] Redirection de [${to}] vers [${recipient}]`);
    }

    const mailOptions = {
        from: `"TECK TRACK Support" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: subject,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ E-mail "${originalSubject}" envoyé avec succès à ${recipient}! (ID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'e-mail à ${recipient} :`, error.message);
        throw error;
    }
};

// 1. Welcome Email (Accès créé)
exports.sendWelcomeEmail = async (to, name, password) => {
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0a0c10; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-family: 'Orbitron', sans-serif;">TECK <span style="color: #DF4B37;">TRACK</span></h1>
            </div>
            <div style="padding: 40px; color: #333333; line-height: 1.6;">
                <h2 style="color: #0a0c10; margin-top: 0; font-weight: 600;">Félicitations ${name} !</h2>
                <p>Votre demande d'accès à la plateforme <strong>TECK TRACK</strong> a été approuvée par l'administrateur.</p>
                <p>Vous pouvez désormais vous connecter pour gérer vos interventions et consulter les analyses de maintenance.</p>
                
                <div style="background-color: #f8f9fa; border: 1px dashed #cccccc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="margin: 0; font-weight: bold; color: #555555;">Vos identifiants de connexion :</p>
                    <p style="margin: 10px 0 5px 0;"><strong>Email :</strong> ${to}</p>
                    <p style="margin: 0;"><strong>Mot de passe temporaire :</strong> <span style="color: #DF4B37; font-family: monospace; font-size: 1.2em; font-weight: bold;">${password}</span></p>
                </div>

                <p style="font-size: 0.9em; color: #666666; font-style: italic;">* Par mesure de sécurité, nous vous recommandons de changer votre mot de passe dès votre première connexion.</p>
                
                <div style="text-align: center; margin-top: 40px;">
                    <a href="http://localhost:5173/login" style="background-color: #DF4B37; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px rgba(223, 75, 55, 0.2);">Accéder à la plateforme</a>
                </div>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 0.8em; color: #999999;">
                <p>© 2026 TECK TRACK - Système de Maintenance Prédictive.</p>
            </div>
        </div>
    `;
    await sendEmail(to, 'Bienvenue sur TECK TRACK - Vos accès au système', htmlContent);
};

// 2. Ticket Created Email (Nouveau Ticket)
exports.sendTicketCreatedEmail = async (to, ticket, creatorName) => {
    const priorityColor = ticket.priority === 'URGENT' ? '#DF4B37' : (ticket.priority === 'NORMAL' ? '#ff9800' : '#4caf50');
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0a0c10; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px;">TECK <span style="color: #DF4B37;">TRACK</span></h1>
            </div>
            <div style="padding: 40px; color: #333333; line-height: 1.6;">
                <div style="display: inline-block; background-color: #fff3f3; color: #DF4B37; font-weight: bold; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; margin-bottom: 20px; border: 1px solid #ffe3e3;">
                    🚨 Nouveau Ticket Créé
                </div>
                <h2 style="color: #0a0c10; margin-top: 0; font-weight: 600;">Un nouveau incident a été signalé</h2>
                <p>L'employé <strong>${creatorName}</strong> vient de créer un nouveau ticket de maintenance dans le système.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 0.95em;">
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666; width: 120px;">Ticket :</td>
                        <td style="padding: 10px 0; color: #111111;">#${ticket.id} - ${ticket.title}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666;">Priorité :</td>
                        <td style="padding: 10px 0; color: ${priorityColor}; font-weight: bold;">${ticket.priority}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666;">Catégorie :</td>
                        <td style="padding: 10px 0; color: #111111;">${ticket.type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: bold; color: #666666; vertical-align: top;">Description :</td>
                        <td style="padding: 10px 0; color: #555555; white-space: pre-line;">${ticket.description}</td>
                    </tr>
                </table>
                
                <div style="text-align: center; margin-top: 35px;">
                    <a href="http://localhost:5173/admin/tickets" style="background-color: #0a0c10; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Assigner un technicien</a>
                </div>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 0.8em; color: #999999;">
                <p>© 2026 TECK TRACK - Système de Maintenance Prédictive.</p>
            </div>
        </div>
    `;
    await sendEmail(to, `[Nouveau Ticket #${ticket.id}] ${ticket.title}`, htmlContent);
};

// 3. Ticket Assigned Email (Ticket Assigné)
exports.sendTicketAssignedEmail = async (to, ticket, technicianName) => {
    const priorityColor = ticket.priority === 'URGENT' ? '#DF4B37' : (ticket.priority === 'NORMAL' ? '#ff9800' : '#4caf50');
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0a0c10; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px;">TECK <span style="color: #DF4B37;">TRACK</span></h1>
            </div>
            <div style="padding: 40px; color: #333333; line-height: 1.6;">
                <div style="display: inline-block; background-color: #eaf6ff; color: #1e88e5; font-weight: bold; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; margin-bottom: 20px; border: 1px solid #d4ebfc;">
                    🔧 Nouvelle Mission Assignée
                </div>
                <h2 style="color: #0a0c10; margin-top: 0; font-weight: 600;">Bonjour ${technicianName},</h2>
                <p>Un ticket de maintenance vous a été attribué. Veuillez prendre connaissance des détails ci-dessous :</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 0.95em;">
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666; width: 120px;">Ticket :</td>
                        <td style="padding: 10px 0; color: #111111; font-weight: 600;">#${ticket.id} - ${ticket.title}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666;">Priorité :</td>
                        <td style="padding: 10px 0; color: ${priorityColor}; font-weight: bold;">${ticket.priority}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666;">Catégorie :</td>
                        <td style="padding: 10px 0; color: #111111;">${ticket.type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; font-weight: bold; color: #666666; vertical-align: top;">Description :</td>
                        <td style="padding: 10px 0; color: #555555; white-space: pre-line;">${ticket.description}</td>
                    </tr>
                </table>
                
                <div style="text-align: center; margin-top: 35px;">
                    <a href="http://localhost:5173/technician/tickets" style="background-color: #DF4B37; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Consulter mes interventions</a>
                </div>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 0.8em; color: #999999;">
                <p>© 2026 TECK TRACK - Système de Maintenance Prédictive.</p>
            </div>
        </div>
    `;
    await sendEmail(to, `[Mission Assignée #${ticket.id}] ${ticket.title}`, htmlContent);
};

// 4. Ticket Resolved Email (Ticket Résolu)
exports.sendTicketResolvedEmail = async (to, ticket, creatorName) => {
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0a0c10; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px;">TECK <span style="color: #DF4B37;">TRACK</span></h1>
            </div>
            <div style="padding: 40px; color: #333333; line-height: 1.6;">
                <div style="display: inline-block; background-color: #e8f5e9; color: #2e7d32; font-weight: bold; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; margin-bottom: 20px; border: 1px solid #c8e6c9;">
                    ✅ Résolution Réussie
                </div>
                <h2 style="color: #0a0c10; margin-top: 0; font-weight: 600;">Bonjour ${creatorName},</h2>
                <p>Bonne nouvelle ! Votre demande d'assistance concernant le ticket <strong>#${ticket.id}</strong> a été résolue par le service technique.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #2e7d32; padding: 15px; margin: 25px 0;">
                    <p style="margin: 0 0 5px 0; font-weight: bold; color: #333333;">Détails de l'intervention :</p>
                    <p style="margin: 0; font-size: 0.95em;"><strong>Titre :</strong> ${ticket.title}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.95em;"><strong>Commentaire technique :</strong> ${ticket.comment || 'Aucun commentaire fourni.'}</p>
                </div>
                
                <p>Si vous rencontrez de nouveaux problèmes, n'hésitez pas à ouvrir un nouveau ticket dans l'application.</p>
                
                <div style="text-align: center; margin-top: 35px;">
                    <a href="http://localhost:5173/login" style="background-color: #0a0c10; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Se connecter à TECK TRACK</a>
                </div>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 0.8em; color: #999999;">
                <p>© 2026 TECK TRACK - Système de Maintenance Prédictive.</p>
            </div>
        </div>
    `;
    await sendEmail(to, `[Ticket Résolu #${ticket.id}] ${ticket.title}`, htmlContent);
};

// 5. Low Stock Alert Email (Stock Bas)
exports.sendLowStockAlertEmail = async (to, part) => {
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #0a0c10; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px;">TECK <span style="color: #DF4B37;">TRACK</span></h1>
            </div>
            <div style="padding: 40px; color: #333333; line-height: 1.6;">
                <div style="display: inline-block; background-color: #fff3cd; color: #856404; font-weight: bold; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; margin-bottom: 20px; border: 1px solid #ffeeba;">
                    ⚠️ Alerte Stock Bas
                </div>
                <h2 style="color: #0a0c10; margin-top: 0; font-weight: 600;">Seuil critique atteint pour une pièce</h2>
                <p>Le stock de la pièce suivante est descendu en dessous du seuil de sécurité défini :</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 0.95em;">
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666; width: 150px;">Désignation pièce :</td>
                        <td style="padding: 10px 0; color: #111111; font-weight: 600;">${part.name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666;">Stock actuel :</td>
                        <td style="padding: 10px 0; color: #DF4B37; font-weight: bold; font-size: 1.1em;">${part.stock}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 10px 0; font-weight: bold; color: #666666;">Seuil minimal :</td>
                        <td style="padding: 10px 0; color: #555555;">${part.minThreshold}</td>
                    </tr>
                </table>
                
                <p style="color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 12px; border-radius: 6px; font-size: 0.9em;">
                    <strong>Action requise :</strong> Veuillez commander des unités supplémentaires pour éviter une rupture de stock lors des prochaines interventions techniques.
                </p>
                
                <div style="text-align: center; margin-top: 35px;">
                    <a href="http://localhost:5173/admin/stock" style="background-color: #0a0c10; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Gérer l'inventaire</a>
                </div>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 0.8em; color: #999999;">
                <p>© 2026 TECK TRACK - Système de Maintenance Prédictive.</p>
            </div>
        </div>
    `;
    await sendEmail(to, `[Alerte Stock Bas] ${part.name} (Stock: ${part.stock})`, htmlContent);
};
