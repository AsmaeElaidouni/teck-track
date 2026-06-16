require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
    console.log("Tentative de connexion à Gmail avec :", process.env.EMAIL_USER);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // On se l'envoie à soi-même
        subject: 'TEST CONNEXION TECK TRACK',
        text: 'Si vous lisez ceci, la connexion est REUSSIE !'
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ SUCCÈS : La connexion Gmail fonctionne !");
    } catch (error) {
        console.log("❌ ÉCHEC : Erreur de connexion !");
        console.log("Message d'erreur complet :", error.message);
    }
}

test();
