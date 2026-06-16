require('dotenv').config();
const emailService = require('./src/services/emailService');

async function testAll() {
    console.log("=== DÉBUT DU TEST DES TEMPLATES D'EMAIL TECK TRACK ===");
    console.log("Compte expéditeur SMTP (EMAIL_USER) :", process.env.EMAIL_USER);
    console.log("Redirection test (EMAIL_OVERRIDE) :", process.env.EMAIL_OVERRIDE);
    console.log("--------------------------------------------------");

    const mockEmailTarget = "destinataire-original@test.com";

    // 1. Test Welcome Email
    console.log("\n[1/5] Envoi de l'e-mail d'inscription (Welcome)...");
    try {
        await emailService.sendWelcomeEmail(
            mockEmailTarget,
            "Asmae Elaidouni",
            "TmpPass_9876"
        );
        console.log("-> [OK] E-mail d'inscription initié.");
    } catch (err) {
        console.error("-> [ERREUR] Échec de l'e-mail d'inscription :", err.message);
    }

    // 2. Test Ticket Created Email
    console.log("\n[2/5] Envoi de l'e-mail de création de ticket...");
    try {
        const mockTicket = {
            id: 104,
            title: "Panne moteur sur la machine d'emballage #3",
            priority: "URGENT",
            type: "HARDWARE",
            description: "Le moteur principal surchauffe après 10 minutes d'activité et s'arrête automatiquement. Présence d'un bruit anormal d'engrenage."
        };
        await emailService.sendTicketCreatedEmail(
            mockEmailTarget,
            mockTicket,
            "Ali El Omari (Opérateur)"
        );
        console.log("-> [OK] E-mail de création de ticket initié.");
    } catch (err) {
        console.error("-> [ERREUR] Échec de l'e-mail de création :", err.message);
    }

    // 3. Test Ticket Assigned Email
    console.log("\n[3/5] Envoi de l'e-mail d'assignation de ticket...");
    try {
        const mockTicket = {
            id: 104,
            title: "Panne moteur sur la machine d'emballage #3",
            priority: "URGENT",
            type: "HARDWARE",
            description: "Le moteur principal surchauffe après 10 minutes d'activité et s'arrête automatiquement. Présence d'un bruit anormal d'engrenage."
        };
        await emailService.sendTicketAssignedEmail(
            mockEmailTarget,
            mockTicket,
            "Youssef Amrani (Expert Maintenance)"
        );
        console.log("-> [OK] E-mail d'assignation initié.");
    } catch (err) {
        console.error("-> [ERREUR] Échec de l'e-mail d'assignation :", err.message);
    }

    // 4. Test Ticket Resolved Email
    console.log("\n[4/5] Envoi de l'e-mail de résolution de ticket...");
    try {
        const mockTicket = {
            id: 104,
            title: "Panne moteur sur la machine d'emballage #3",
            comment: "Remplacement du roulement à billes usé et appoint de lubrifiant haute température effectué. Le moteur tourne maintenant normalement sans surchauffe."
        };
        await emailService.sendTicketResolvedEmail(
            mockEmailTarget,
            mockTicket,
            "Ali El Omari"
        );
        console.log("-> [OK] E-mail de résolution initié.");
    } catch (err) {
        console.error("-> [ERREUR] Échec de l'e-mail de résolution :", err.message);
    }

    // 5. Test Low Stock Alert Email
    console.log("\n[5/5] Envoi de l'e-mail d'alerte stock bas...");
    try {
        const mockPart = {
            name: "Roulement à billes SKF 6204",
            stock: 2,
            minThreshold: 5
        };
        await emailService.sendLowStockAlertEmail(
            mockEmailTarget,
            mockPart
        );
        console.log("-> [OK] E-mail d'alerte stock bas initié.");
    } catch (err) {
        console.error("-> [ERREUR] Échec de l'e-mail d'alerte stock bas :", err.message);
    }

    console.log("\n=== PROCESSUS DE TEST DES NOTIFICATIONS TERMINÉ ===");
    console.log("Veuillez consulter votre boîte mail 'asmaeelaidouni1@gmail.com' pour vérifier la réception.");
}

testAll();
