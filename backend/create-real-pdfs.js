const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads/library');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ─── Color Palette ───────────────────────────────────────────────────
const RED = '#DF4B37';
const DARK = '#0a0c10';
const GRAY = '#555555';
const LIGHTGRAY = '#f5f5f5';
const BLUE = '#1a3a5c';

// ─── Helper: draw header ─────────────────────────────────────────────
function drawHeader(doc, title, subtitle, machine) {
    doc.rect(0, 0, doc.page.width, 90).fill(DARK);

    doc.fillColor(RED).fontSize(22).font('Helvetica-Bold')
        .text('TECK TRACK', 40, 22);
    doc.fillColor('white').fontSize(11).font('Helvetica')
        .text('Système de Maintenance Industrielle', 160, 26);
    doc.fillColor(RED).fontSize(10)
        .text('S-NAJ TECHNOLOGIE', 40, 46);
    doc.fillColor('white').fontSize(8)
        .text(machine, 40, 62);

    const refDate = new Date().toLocaleDateString('fr-FR');
    doc.fillColor('white').fontSize(8)
        .text(`Réf: TT-2026 | Date: ${refDate}`, 0, 62, { align: 'right', width: doc.page.width - 40 });

    doc.rect(40, 100, doc.page.width - 80, 2).fill(RED);

    doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold')
        .text(title, 40, 115, { width: doc.page.width - 80 });
    doc.fillColor(GRAY).fontSize(10).font('Helvetica')
        .text(subtitle, 40, doc.y, { width: doc.page.width - 80 });
    doc.rect(40, doc.y + 8, doc.page.width - 80, 1).fill('#eeeeee');
    doc.y = doc.y + 20;
}

function drawSectionTitle(doc, text) {
    doc.moveDown(0.5);
    doc.rect(40, doc.y, 4, 16).fill(RED);
    doc.fillColor(DARK).fontSize(13).font('Helvetica-Bold').text('  ' + text, 48, doc.y - 2);
    doc.moveDown(0.3);
}

function drawWarningBox(doc, text) {
    const y = doc.y;
    doc.rect(40, y, doc.page.width - 80, 36).fillAndStroke('#fff3cd', '#e6a817');
    doc.fillColor('#856404').fontSize(9).font('Helvetica-Bold').text('⚠  AVERTISSEMENT  ', 52, y + 6);
    doc.fillColor('#4d3a00').font('Helvetica').fontSize(9).text(text, 52, y + 18, { width: doc.page.width - 112 });
    doc.moveDown(2);
}

function drawInfoBox(doc, text) {
    const y = doc.y;
    doc.rect(40, y, doc.page.width - 80, 36).fillAndStroke('#e8f4fd', '#1a6fa8');
    doc.fillColor('#1a3a5c').fontSize(9).font('Helvetica-Bold').text('ℹ  INFORMATION  ', 52, y + 6);
    doc.fillColor('#1a3a5c').font('Helvetica').fontSize(9).text(text, 52, y + 18, { width: doc.page.width - 112 });
    doc.moveDown(2);
}

function drawTable(doc, headers, rows) {
    const x = 40, colW = (doc.page.width - 80) / headers.length;
    const startY = doc.y;
    const rowH = 22;

    // Header row
    doc.rect(x, startY, doc.page.width - 80, rowH).fill(DARK);
    headers.forEach((h, i) => {
        doc.fillColor('white').fontSize(9).font('Helvetica-Bold').text(h, x + i * colW + 6, startY + 7, { width: colW - 10 });
    });

    // Data rows
    rows.forEach((row, ri) => {
        const rowY = startY + rowH + ri * rowH;
        doc.rect(x, rowY, doc.page.width - 80, rowH).fillAndStroke(ri % 2 === 0 ? '#f9f9f9' : 'white', '#e0e0e0');
        row.forEach((cell, ci) => {
            doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(cell, x + ci * colW + 6, rowY + 7, { width: colW - 10 });
        });
    });
    doc.y = startY + rowH + rows.length * rowH + 10;
    doc.moveDown(1);
}

function drawFooter(doc) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.rect(0, doc.page.height - 35, doc.page.width, 35).fill(DARK);
        doc.fillColor(RED).fontSize(8).font('Helvetica-Bold').text('TECK TRACK', 40, doc.page.height - 22);
        doc.fillColor('white').fontSize(7).font('Helvetica').text('Document confidentiel - Usage interne uniquement', 40, doc.page.height - 13);
        doc.fillColor('white').fontSize(8).text(`Page ${i + 1} / ${pageCount}`, 0, doc.page.height - 22, { align: 'right', width: doc.page.width - 40 });
    }
}

// ════════════════════════════════════════════════════════════════════
// PDF 1 — Manuel Maintenance Presse Hydraulique A10
// ════════════════════════════════════════════════════════════════════
function createPDF1() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'manuel_presse_hydraulique_a10.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Manuel de Maintenance', 'Presse Hydraulique A10 — Procédures et Intervalles', 'Presse Hydraulique A10');

    drawSectionTitle(doc, '1. Présentation de la Machine');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(
        'La presse hydraulique A10 est un équipement de production critique utilisé pour le formage et l\'emboutissage de pièces métalliques. Elle opère sous une pression maximale de 250 bars et peut exercer une force de 100 tonnes. Son utilisation quotidienne exige une maintenance préventive rigoureuse.', 40, doc.y, { width: doc.page.width - 80, align: 'justify' }
    );
    doc.moveDown(1);

    drawWarningBox(doc, 'Toute intervention sur cet équipement doit être réalisée par un technicien certifié. Consigner l\'alimentation avant toute opération de maintenance.');

    drawSectionTitle(doc, '2. Tableau des Interventions Préventives');
    drawTable(doc,
        ['Opération', 'Fréquence', 'Durée', 'Niveau Technicien'],
        [
            ['Contrôle niveau huile hydraulique', 'Quotidien', '5 min', 'L1'],
            ['Vérification pression circuit', 'Hebdomadaire', '15 min', 'L1'],
            ['Changement filtre hydraulique', 'Mensuel', '45 min', 'L2'],
            ['Inspection joints et flexibles', 'Trimestriel', '1h 30min', 'L2'],
            ['Vidange complète circuit hydraulique', 'Annuel', '4h', 'L3'],
            ['Étalonnage capteurs de pression', 'Annuel', '2h', 'L3'],
        ]
    );

    drawSectionTitle(doc, '3. Spécifications Techniques');
    drawTable(doc,
        ['Paramètre', 'Valeur', 'Unité'],
        [
            ['Force maximale', '100', 'Tonnes'],
            ['Pression de service', '180 - 250', 'bar'],
            ['Débit pompe hydraulique', '28', 'L/min'],
            ['Viscosité huile recommandée', 'ISO VG 46', '—'],
            ['Température de service', '20 - 60', '°C'],
            ['Niveau sonore', '< 78', 'dB(A)'],
        ]
    );

    drawSectionTitle(doc, '4. Procédure de Démarrage');
    ['Vérifier visuellement l\'absence de fuites hydrauliques.', 'Contrôler le niveau d\'huile dans le réservoir (repère MAXI/MINI).', 'Mettre sous tension le tableau électrique principal.', 'Effectuer un cycle de purge à vide (3 cycles complets sans charge).', 'Vérifier la pression via le manomètre de contrôle (180 bars minimum).', 'L\'équipement est prêt à recevoir la production.'].forEach((step, i) => {
        doc.fillColor(RED).fontSize(10).font('Helvetica-Bold').text(`0${i+1}. `, 40, doc.y, { continued: true });
        doc.fillColor(GRAY).font('Helvetica').text(step);
    });

    doc.addPage();
    drawInfoBox(doc, 'En cas de chute de pression soudaine, arrêter immédiatement la production et contacter le service de maintenance via l\'application TECK TRACK.');

    drawSectionTitle(doc, '5. Codes de Panne et Solutions');
    drawTable(doc,
        ['Code Erreur', 'Description', 'Cause Probable', 'Action'],
        [
            ['E-001', 'Pression insuffisante', 'Pompe défaillante ou fuite', 'Vérifier circuit, remplacer filtre'],
            ['E-002', 'Surchauffe huile', 'Refroidisseur encrassé', 'Nettoyer échangeur thermique'],
            ['E-003', 'Limite de course', 'Capteur fin de course', 'Régler/remplacer capteur'],
            ['E-004', 'Pression excessive', 'Valve limitatrice', 'Étalonner la valve de sécurité'],
            ['E-005', 'Fuite détectée', 'Joint usé ou flexible craquelé', 'Remplacer le joint ou flexible'],
        ]
    );

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 1 créé : manuel_presse_hydraulique_a10.pdf');
}

// ════════════════════════════════════════════════════════════════════
// PDF 2 — Guide Panne Compresseur Atlas Copco
// ════════════════════════════════════════════════════════════════════
function createPDF2() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'guide_panne_compresseur.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Guide de Résolution de Pannes', 'Compresseur d\'Air Atlas Copco GA-40 — Diagnostic Avancé', 'Compresseur d\'air AC-40');

    drawSectionTitle(doc, '1. Identification Rapide des Pannes');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(
        'Ce guide permet au technicien de maintenance d\'identifier rapidement l\'origine d\'une panne sur le compresseur Atlas Copco GA-40 et d\'appliquer la procédure corrective adaptée. La méthodologie 5 Pourquoi (5 Why) est recommandée pour les pannes répétitives.', 40, doc.y, { width: doc.page.width - 80, align: 'justify' }
    );
    doc.moveDown(1);

    drawSectionTitle(doc, '2. Arbre de Diagnostic — Pression Insuffisante');
    const steps2 = [
        { q: 'Le compresseur démarre-t-il normalement ?', oui: '→ Vérifier la pression de sortie', non: '→ Vérifier alimentation électrique (disjoncteur)' },
        { q: 'La pression atteint-elle 6 bars ?', oui: '→ Vérifier régulateur pression aval', non: '→ Inspecter les clapets d\'aspiration' },
        { q: 'L\'huile est-elle au bon niveau ?', oui: '→ Contrôler filtre à huile (ΔP > 1 bar)', non: '→ Appoint d\'huile TOTAL Compresseur 46' },
    ];
    steps2.forEach((s, i) => {
        doc.rect(40, doc.y, doc.page.width - 80, 40).fillAndStroke('#f0f4f8', '#ccd9e8');
        doc.fillColor(BLUE).fontSize(9).font('Helvetica-Bold').text(`Étape ${i+1}: ${s.q}`, 52, doc.y - 36, { width: doc.page.width - 110 });
        doc.fillColor('#2e7d32').fontSize(8).font('Helvetica').text(`✔ OUI: ${s.oui}`, 52, doc.y - 22, { width: doc.page.width - 110, continued: true });
        doc.fillColor(RED).text(`   ✘ NON: ${s.non}`);
        doc.moveDown(0.8);
    });

    doc.moveDown(0.5);
    drawSectionTitle(doc, '3. Intervalles de Maintenance Préventive');
    drawTable(doc,
        ['Composant', 'Fréquence', 'Pièce de Rechange'],
        [
            ['Filtre à air d\'aspiration', 'Toutes les 2000h', 'Filtre air GA-40 (Réf: 1613950400)'],
            ['Filtre à huile', 'Toutes les 2000h', 'Filtre huile (Réf: 1613243100)'],
            ['Séparateur huile/air', 'Toutes les 4000h', 'Cartouche séparatrice (Réf: 1613730800)'],
            ['Huile compresseur', 'Toutes les 4000h', 'TOTAL Compresseur VDL 46 (12L)'],
            ['Courroie trapézoïdale', 'Toutes les 8000h', 'Courroie standard XPB-2240'],
            ['Clapets aspiration/refoulement', 'Toutes les 8000h', 'Kit clapets complet GA-40'],
        ]
    );

    drawWarningBox(doc, 'Ne jamais intervenir sur le compresseur sous pression. Purger totalement le circuit avant ouverture du capot de maintenance.');

    drawSectionTitle(doc, '4. Paramètres de Fonctionnement Normaux');
    drawTable(doc,
        ['Paramètre', 'Valeur Min', 'Valeur Max'],
        [
            ['Pression de service', '6.5 bars', '7.5 bars'],
            ['Température huile', '50 °C', '90 °C'],
            ['Température air sortie', '35 °C', '50 °C'],
            ['Tension alimentation', '380V ± 10%', '415V ± 10%'],
            ['Intensité moteur (pleine charge)', '62 A', '72 A'],
        ]
    );

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 2 créé : guide_panne_compresseur.pdf');
}

// ════════════════════════════════════════════════════════════════════
// PDF 3 — Procédure de Consignation et Sécurité Industrielle
// ════════════════════════════════════════════════════════════════════
function createPDF3() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'procedure_consignation_securite.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Procédure de Consignation LOTO', 'Lockout/Tagout — Sécurité Industrielle Obligatoire', 'Sécurité Générale — Toutes machines');

    drawWarningBox(doc, 'Cette procédure est OBLIGATOIRE avant toute intervention de maintenance. Non-respect = mise en danger immédiate. Directive 2006/42/CE.');

    drawSectionTitle(doc, '1. Définition de la Consignation LOTO');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(
        'La procédure LOTO (Lockout/Tagout) est un ensemble de mesures de sécurité visant à garantir que les machines dangereuses sont correctement éteintes, isolées de toutes leurs sources d\'énergie et cadenassées avant que les employés n\'effectuent des travaux de maintenance ou d\'entretien pouvant causer des blessures en cas de démarrage ou de libération d\'énergie stockée.', 40, doc.y, { width: doc.page.width - 80, align: 'justify' }
    );
    doc.moveDown(1);

    drawSectionTitle(doc, '2. Les 6 Étapes Obligatoires LOTO');
    const lotoSteps = [
        { num: '01', title: 'Notification', desc: 'Informer tous les opérateurs de la zone concernée de la mise en consignation imminente.' },
        { num: '02', title: 'Identification des Sources', desc: 'Identifier toutes les sources d\'énergie : électrique (TGBT), pneumatique, hydraulique, thermique, cinétique.' },
        { num: '03', title: 'Isolement', desc: 'Couper et isoler chaque source d\'énergie à l\'aide des dispositifs d\'isolement prévus (disjoncteur, vanne, etc.).' },
        { num: '04', title: 'Cadenassage', desc: 'Apposer un cadenas personnel ROUGE sur chaque point d\'isolement. Chaque intervenant appose son propre cadenas.' },
        { num: '05', title: 'Étiquetage', desc: 'Fixer une étiquette DANGER sur chaque cadenas : nom, date, nature travaux, numéro de contact.' },
        { num: '06', title: 'Vérification', desc: 'Vérifier l\'absence de tension, de pression, et de mouvement avant de commencer l\'intervention.' },
    ];
    lotoSteps.forEach(step => {
        const y = doc.y;
        doc.rect(40, y, 36, 36).fill(RED);
        doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text(step.num, 40, y + 8, { width: 36, align: 'center' });
        doc.fillColor(DARK).fontSize(11).font('Helvetica-Bold').text(step.title, 84, y + 2);
        doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(step.desc, 84, y + 16, { width: doc.page.width - 130 });
        doc.moveDown(1.5);
    });

    drawSectionTitle(doc, '3. Registre d\'Application');
    drawTable(doc,
        ['Machine', 'Sources Énergie', 'Points Consignation', 'Responsable'],
        [
            ['Presse Hydraulique A10', 'Élec + Hydraulique', 'DJ-P10 + V-Hyd-01', 'Tech. L2 minimum'],
            ['Compresseur AC-40', 'Élec + Pneumatique', 'DJ-AC40 + V-Air-01/02', 'Tech. L2 minimum'],
            ['Robot KUKA KR6', 'Élec + Pneumatique', 'DJ-ROB + V-Pneu-Rob', 'Tech. L3 (robotique)'],
            ['Convoyeur C5', 'Élec', 'DJ-Conv-C5', 'Tech. L1 minimum'],
            ['Pompe Centrifuge P3', 'Élec + Hydraulique', 'DJ-P3 + V-P3-01/02', 'Tech. L2 minimum'],
        ]
    );

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 3 créé : procedure_consignation_securite.pdf');
}

// ════════════════════════════════════════════════════════════════════
// PDF 4 — Manuel Calibrage Capteurs de Vibration IA
// ════════════════════════════════════════════════════════════════════
function createPDF4() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'calibrage_capteurs_ia.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Calibrage des Capteurs de Vibration', 'Système de Maintenance Prédictive TECK TRACK — Module IA', 'Système Prédictif TECK TRACK');

    drawInfoBox(doc, 'Ce document est utilisé par le système d\'IA TECK TRACK pour analyser les signatures vibratoires et prédire les pannes avant qu\'elles surviennent.');

    drawSectionTitle(doc, '1. Principe de la Maintenance Prédictive par Vibrations');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(
        'L\'analyse vibratoire permet de détecter les défauts mécaniques émergents (déséquilibre, désalignement, défaut roulement, usure engrenages) à un stade précoce. Le système d\'IA TECK TRACK collecte en continu les données des accéléromètres et applique des algorithmes de machine learning (RandomForest, Régression Linéaire) pour prédire la durée de vie résiduelle des composants.', 40, doc.y, { width: doc.page.width - 80, align: 'justify' }
    );
    doc.moveDown(1);

    drawSectionTitle(doc, '2. Seuils d\'Alerte par Machine');
    drawTable(doc,
        ['Machine', 'Seuil NORMAL (mm/s RMS)', 'Seuil ALERTE', 'Seuil CRITIQUE'],
        [
            ['Presse Hydraulique A10', '< 2.8', '2.8 — 7.1', '> 7.1'],
            ['Compresseur AC-40', '< 4.5', '4.5 — 11.2', '> 11.2'],
            ['Robot KUKA KR6', '< 1.8', '1.8 — 4.5', '> 4.5'],
            ['Convoyeur C5', '< 3.5', '3.5 — 9.0', '> 9.0'],
            ['Pompe Centrifuge P3', '< 2.3', '2.3 — 6.5', '> 6.5'],
            ['Moteurs M1 à M8', '< 2.0', '2.0 — 5.0', '> 5.0'],
        ]
    );

    drawSectionTitle(doc, '3. Procédure de Calibrage Périodique (Annuel)');
    ['Arrêter la production sur la machine à calibrer (voir procédure LOTO).', 'Monter l\'accéléromètre de référence (B&K 4507-B) sur la même surface que le capteur en service.', 'Lancer le logiciel de calibrage TECK TRACK Sensor Calibrator v2.1.', 'Effectuer un test de référence à 79.6 Hz (fréquence de calibrage ISO 8041).', 'Ajuster le facteur de sensibilité du capteur jusqu\'à obtenir ±5% de la valeur référence.', 'Enregistrer le nouveau certificat de calibrage dans le système TECK TRACK.', 'Redémarrer la machine et vérifier la collecte de données en temps réel pendant 10 minutes.'].forEach((step, i) => {
        doc.fillColor(RED).fontSize(10).font('Helvetica-Bold').text(`${i + 1}. `, 40, doc.y, { continued: true });
        doc.fillColor(GRAY).font('Helvetica').text(step);
    });

    drawSectionTitle(doc, '4. Modèle de Prédiction IA — Précision');
    drawTable(doc,
        ['Algorithme', 'Type de Défaut', 'Précision', 'Horizon Prédiction'],
        [
            ['Régression Linéaire', 'Rupture stock pièces', '91%', '7 à 30 jours'],
            ['Random Forest', 'Défaut roulement', '94%', '5 à 21 jours'],
            ['Isolation Forest', 'Anomalie vibratoire', '88%', 'Temps réel'],
            ['LSTM (Deep Learning)', 'Usure progressive', '96%', '30 à 90 jours'],
        ]
    );

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 4 créé : calibrage_capteurs_ia.pdf');
}

// ════════════════════════════════════════════════════════════════════
// PDF 5 — Plan de Graissage Moteurs M1-M8
// ════════════════════════════════════════════════════════════════════
function createPDF5() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'procedures_graissage_moteurs.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Plan de Graissage Périodique', 'Moteurs Électriques M1 à M8 — Lubrification Préventive', 'Moteurs Électriques M1 à M8');

    drawSectionTitle(doc, '1. Importance du Graissage Préventif');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(
        'Le graissage inadéquat est responsable de 40% des défaillances prématurées de roulements dans les moteurs électriques industriels. Un plan de lubrification rigoureux réduit la consommation énergétique de 2 à 5% et multiplie par 3 la durée de vie des roulements.', 40, doc.y, { width: doc.page.width - 80, align: 'justify' }
    );
    doc.moveDown(1);

    drawSectionTitle(doc, '2. Tableau de Graissage — Moteurs M1 à M8');
    drawTable(doc,
        ['Moteur', 'Localisation', 'Puissance', 'Lubrifiant', 'Quantité', 'Intervalle'],
        [
            ['M1', 'Zone Production A', '15 kW', 'Mobilgrease XHP 222', '12 g', '3 mois'],
            ['M2', 'Zone Production A', '22 kW', 'Mobilgrease XHP 222', '18 g', '3 mois'],
            ['M3', 'Zone Production B', '11 kW', 'Mobilgrease XHP 222', '10 g', '6 mois'],
            ['M4', 'Zone Production B', '30 kW', 'Mobilgrease XHP 462', '25 g', '3 mois'],
            ['M5', 'Zone Stockage', '7.5 kW', 'Mobilgrease XHP 222', '8 g', '6 mois'],
            ['M6', 'Zone Stockage', '15 kW', 'Mobilgrease XHP 222', '12 g', '3 mois'],
            ['M7', 'Zone Expédition', '5.5 kW', 'Mobilgrease XHP 222', '6 g', '6 mois'],
            ['M8', 'Zone Expédition', '11 kW', 'Mobilgrease XHP 222', '10 g', '6 mois'],
        ]
    );

    drawWarningBox(doc, 'Un sur-graissage est aussi néfaste qu\'un sous-graissage. Respecter scrupuleusement les quantités indiquées. Utiliser exclusivement une pompe à graisse calibrée.');

    drawSectionTitle(doc, '3. Procédure d\'Application du Graisse');
    ['Nettoyer le graisseur (nipple de graissage) avec un chiffon propre avant injection.', 'Connecter la pompe à graisse sur le nipple. Ne jamais injecter sous pression excessive.', 'Injecter lentement la quantité prescrite (écouter le feulement du roulement qui change).', 'S\'assurer que le vieux graisse est bien évacué par le bouchon de purge si présent.', 'Essuyer tout excédent et reboucher le nipple avec le cache-poussière.', 'Noter l\'opération dans le registre de graissage et dans l\'application TECK TRACK.'].forEach((step, i) => {
        doc.fillColor(RED).fontSize(10).font('Helvetica-Bold').text(`${i + 1}. `, 40, doc.y, { continued: true });
        doc.fillColor(GRAY).font('Helvetica').text(step);
    });

    drawSectionTitle(doc, '4. Signaux d\'Alarme — Roulement en Défaut');
    drawTable(doc,
        ['Symptôme Constaté', 'Cause Probable', 'Action Requise'],
        [
            ['Bruit de craquement', 'Roulement sec ou endommagé', 'Graissage immédiat ou remplacement'],
            ['Vibrations excessives', 'Roulement usé', 'Ouvrir ticket TECK TRACK — URGENT'],
            ['Température élevée (> 80°C)', 'Sur-graissage ou charge excessive', 'Réduire la quantité de graisse'],
            ['Fuite de graisse', 'Joint d\'étanchéité défaillant', 'Remplacer joint côté DE/NDE'],
        ]
    );

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 5 créé : procedures_graissage_moteurs.pdf');
}

// ════════════════════════════════════════════════════════════════════
// PDF 6 — Manuel Robot KUKA KR6
// ════════════════════════════════════════════════════════════════════
function createPDF6() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'guide_utilisateur_robot_kuka.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Manuel Utilisateur — Robot KUKA KR6', 'Maintenance et Exploitation Sécurisée — Édition 2026', 'Robot Industriel KUKA KR6');

    drawWarningBox(doc, 'DANGER : Zone de travail du robot délimitée par une barrière de sécurité. Accès interdit pendant le fonctionnement. Respecter impérativement la procédure LOTO (voir document TT-SEC-001).');

    drawSectionTitle(doc, '1. Caractéristiques du Robot KUKA KR6');
    drawTable(doc,
        ['Caractéristique', 'Valeur'],
        [
            ['Modèle', 'KUKA KR 6 R900-2 (agilus)'],
            ['Nombre d\'axes', '6 axes'],
            ['Charge maximale', '6 kg'],
            ['Portée maximale', '900 mm'],
            ['Répétabilité de position', '± 0.03 mm'],
            ['Vitesse maximale TCP', '2 m/s'],
            ['Contrôleur', 'KUKA KRC4 Compact'],
            ['Poids du robot', '51 kg'],
        ]
    );

    drawSectionTitle(doc, '2. Maintenance Préventive Planifiée');
    drawTable(doc,
        ['Tâche', 'Fréquence', 'Durée estimée', 'Outillage requis'],
        [
            ['Contrôle visuel général', 'Quotidien', '10 min', 'Aucun'],
            ['Vérification câbles et connecteurs', 'Mensuel', '30 min', 'Multimètre'],
            ['Graissage axes 1 à 6', 'Tous les 6 mois', '2 heures', 'Pompe graisse KUKA'],
            ['Remplacement graisse réducteurs', 'Tous les 3 ans', '8 heures', 'Kit huile KUKA'],
            ['Calibrage position zéro (mastering)', 'Après remplacement pièce', '1 heure', 'EMD KUKA'],
            ['Mise à jour logiciel KRC4', 'Selon release KUKA', '30 min', 'Clé USB certifiée'],
        ]
    );

    drawSectionTitle(doc, '3. Codes d\'Erreur Fréquents KRC4');
    drawTable(doc,
        ['Code', 'Libellé', 'Solution'],
        [
            ['6266', 'Température moteur élevée', 'Vérifier ventilation armoire, purger le refroidissement'],
            ['6027', 'Défaut de bus Profinet', 'Vérifier câble réseau et paramètres IP'],
            ['16020', 'Zone de sécurité violée', 'Vérifier barrières immatérielles, acquitter l\'arrêt'],
            ['9002', 'Pile contrôleur faible', 'Remplacer pile CR2032 dans le KRC4'],
            ['60000', 'Arrêt d\'urgence activé', 'Libérer le bouton arrêt d\'urgence et acquitter'],
        ]
    );

    drawInfoBox(doc, 'Pour toute intervention sur le robot nécessitant un déplacement manuel des axes, utiliser exclusivement le mode T1 (vitesse < 250mm/s) via la boîte à boutons KUKA SMARTPAD.');

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 6 créé : guide_utilisateur_robot_kuka.pdf');
}

// ════════════════════════════════════════════════════════════════════
// PDF 7 — Fiche Maintenance Bande Transporteuse C5
// ════════════════════════════════════════════════════════════════════
function createPDF7() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'maintenance_bande_transporteuse.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Fiche de Maintenance Convoyeur C5', 'Remplacement et Réglage Bande Transporteuse', 'Convoyeur à bande C5');

    drawSectionTitle(doc, '1. Description de l\'Équipement');
    doc.fillColor(GRAY).fontSize(10).font('Helvetica').text(
        'Le convoyeur à bande C5 est un équipement de manutention assurant le transfert de pièces entre la zone de production B et la zone de stockage. La bande transporteuse supporte une charge maximale de 500 kg/m linéaire et fonctionne à une vitesse de 0.8 m/s.', 40, doc.y, { width: doc.page.width - 80, align: 'justify' }
    );
    doc.moveDown(1);

    drawSectionTitle(doc, '2. Signes d\'Usure de la Bande');
    drawTable(doc,
        ['Défaut observé', 'Gravité', 'Action recommandée'],
        [
            ['Craquements ou fissures superficielles', 'Faible', 'Surveiller, planifier remplacement'],
            ['Déchirure longitudinale < 30mm', 'Modérée', 'Réparation vulcanisation à chaud'],
            ['Déchirure > 30mm ou traversante', 'Élevée', 'Remplacement immédiat'],
            ['Dévoiement de la bande', 'Modérée', 'Régler tambours de renvoi'],
            ['Glissement sur tambour moteur', 'Élevée', 'Vérifier tension et état tambour'],
            ['Usure tapis (épaisseur < 8mm)', 'Élevée', 'Remplacement immédiat préventif'],
        ]
    );

    drawSectionTitle(doc, '3. Procédure de Remplacement de la Bande');
    const replSteps = [
        'Consigner le convoyeur (LOTO) et dégager la zone.',
        'Démonter les protections et les guides latéraux.',
        'Desserrer les vis de tension des tambours de renvoi.',
        'Couper la vieille bande et la retirer par glissement.',
        'Nettoyer les tambours et vérifier l\'état des garnitures.',
        'Positionner la nouvelle bande et effectuer la jonction à froid ou à chaud.',
        'Tensionner la bande (flèche centrale = 1% de la distance entre tambours).',
        'Remonter les protections et effectuer un essai à vide sur 10 cycles.',
        'Valider le bon centrage et noter l\'opération dans TECK TRACK.',
    ];
    replSteps.forEach((step, i) => {
        doc.fillColor(RED).fontSize(10).font('Helvetica-Bold').text(`${i + 1}. `, 40, doc.y, { continued: true });
        doc.fillColor(GRAY).font('Helvetica').text(step);
    });

    drawSectionTitle(doc, '4. Spécifications de la Bande de Remplacement');
    drawTable(doc,
        ['Paramètre', 'Valeur'],
        [
            ['Largeur', '600 mm'],
            ['Épaisseur totale', '14 mm (cover sup. 8mm + armature + cover inf. 4mm)'],
            ['Armature', '2 plis EP 200/2'],
            ['Résistance à la déchirure', '> 280 N/mm'],
            ['Classe de résistance thermique', 'T (jusqu\'à 60°C)'],
            ['Référence fournisseur', 'Semperit 600-EP200-2-TT-2026'],
        ]
    );

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 7 créé : maintenance_bande_transporteuse.pdf');
}

// ════════════════════════════════════════════════════════════════════
// PDF 8 — Spécifications Pompe Centrifuge P3
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
function createPDF8() {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 100, bottom: 50, left: 40, right: 40 }, bufferPages: true });
    const out = fs.createWriteStream(path.join(uploadDir, 'specifications_pompe_centrifuge.pdf'));
    doc.pipe(out);

    drawHeader(doc, 'Spécifications Techniques & Maintenance', 'Pompe Centrifuge P3 — Circuit de Refroidissement', 'Pompe Centrifuge P3');

    drawSectionTitle(doc, '1. Données Techniques Constructeur');
    drawTable(doc,
        ['Paramètre', 'Valeur'],
        [
            ['Modèle', 'GRUNDFOS CM3-4 A-R-G-E-AQQE'],
            ['Débit nominal', '3.5 m³/h'],
            ['Hauteur manométrique totale', '44 m'],
            ['Vitesse de rotation', '2850 tr/min'],
            ['Puissance absorbée (nominal)', '0.75 kW'],
            ['Tension d\'alimentation', '1 × 230V / 50Hz'],
            ['Intensité nominale', '3.7 A'],
            ['Classe de protection', 'IP55 / Classe F'],
            ['Fluide pompé', 'Eau industrielle filtrée (max 60°C)'],
        ]
    );

    drawSectionTitle(doc, '2. Programme de Maintenance Préventive');
    drawTable(doc,
        ['Tâche', 'Fréquence', 'Temps', 'Pièces'],
        [
            ['Contrôle visuel fuites et vibrations', 'Hebdomadaire', '10 min', 'Aucune'],
            ['Vérification presse-étoupe / joint mécanique', 'Mensuel', '15 min', 'Aucune (ou joint)'],
            ['Nettoyage filtre aspiration', 'Trimestriel', '20 min', 'Toile filtrante 100 µm'],
            ['Lubrification roulements (si bague)', 'Semestriel', '10 min', '5g Mobilgrease XHP222'],
            ['Remplacement joint mécanique', 'Tous les 2 ans', '2 heures', 'Kit joint GRUNDFOS CM3'],
            ['Révision complète (impulseur, volute)', 'Tous les 5 ans', '8 heures', 'Kit révision complet'],
        ]
    );

    drawWarningBox(doc, 'Ne jamais faire fonctionner la pompe à sec. Un fonctionnement à sec même bref (< 30 secondes) détruit le joint mécanique et endommage l\'impulseur.');

    drawSectionTitle(doc, '3. Diagnostic des Pannes Fréquentes');
    drawTable(doc,
        ['Symptôme', 'Cause', 'Remède'],
        [
            ['Débit insuffisant', 'Filtre bouché ou impulseur usé', 'Nettoyer filtre, vérifier impulseur'],
            ['Cavitation (bruit d\'eau bouillante)', 'Pression aspiration trop faible', 'Vérifier vannes amont, purger le circuit'],
            ['Fuites au presse-étoupe', 'Joint mécanique usé', 'Remplacer kit joint mécanique'],
            ['Vibrations excessives', 'Impulseur encrassé ou déséquilibré', 'Nettoyage ou remplacement impulseur'],
            ['Disjonction moteur', 'Surcharge ou court-circuit', 'Contrôle isolation moteur, régler protection'],
        ]
    );

    drawInfoBox(doc, 'Lors d\'une intervention TECK TRACK sur un ticket lié à la pompe P3, toujours joindre les mesures de pression d\'aspiration et de refoulement dans le commentaire de clôture du ticket.');

    drawFooter(doc);
    doc.end();
    console.log('✅ PDF 8 créé : specifications_pompe_centrifuge.pdf');
}

// ════════════════════════════════════════════════════════════════════
// Lancer toutes les créations
// ════════════════════════════════════════════════════════════════════
async function main() {
    console.log("=== GÉNÉRATION DES DOCUMENTS TECHNIQUES TECK TRACK ===\n");
    createPDF1();
    createPDF2();
    createPDF3();
    createPDF4();
    createPDF5();
    createPDF6();
    createPDF7();
    createPDF8();
    console.log("\n=== TOUS LES DOCUMENTS GÉNÉRÉS AVEC SUCCÈS ===");
}

main();
