/**
 * add-calibrage-pdf.js  — generates the missing calibrage_capteurs_ia.pdf
 * and rebuilds meta.json to match exactly the files on disk.
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads', 'library');

// ── Generate calibrage PDF ─────────────────────────────────────────────────────
function makePDF(filename, title, machine, sections) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const out = fs.createWriteStream(path.join(uploadDir, filename));
    doc.pipe(out);

    doc.rect(0, 0, doc.page.width, 80).fill('#1a1a2e');
    doc.fillColor('#DF4B37').fontSize(22).font('Helvetica-Bold').text('TECK TRACK', 60, 20);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica').text('Système de Gestion de Maintenance', 60, 46);

    doc.moveDown(3);
    doc.fillColor('#1a1a2e').fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#DF4B37').fontSize(12).font('Helvetica').text(`Machine / Système : ${machine}`, { align: 'center' });

    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#DF4B37').lineWidth(2).stroke();
    doc.moveDown(1.5);

    sections.forEach(({ heading, body }) => {
      doc.fillColor('#1a1a2e').fontSize(13).font('Helvetica-Bold').text(heading);
      doc.moveDown(0.4);
      doc.fillColor('#333333').fontSize(10).font('Helvetica').text(body, { lineGap: 4, paragraphGap: 6 });
      doc.moveDown(1.2);
    });

    const bottom = doc.page.height - 50;
    doc.moveTo(60, bottom).lineTo(doc.page.width - 60, bottom).strokeColor('#cccccc').lineWidth(1).stroke();
    doc.fillColor('#888888').fontSize(9).font('Helvetica')
       .text(`Document généré par TECK TRACK — ${new Date().toLocaleDateString('fr-FR')}`, 60, bottom + 8);

    doc.end();
    out.on('finish', () => { console.log(`✅  ${filename}`); resolve(); });
    out.on('error', reject);
  });
}

async function main() {
  // Generate missing PDF
  await makePDF('calibrage_capteurs_ia.pdf',
    'Calibrage des Capteurs — Intelligence Artificielle',
    'Capteurs IA & IIoT',
    [
      { heading: '1. Introduction', body: 'Ce document décrit les procédures de calibrage des capteurs connectés utilisés dans le cadre du système de maintenance prédictive basé sur l\'Intelligence Artificielle (IA). Les capteurs collectent des données en temps réel (vibration, température, pression) qui alimentent les algorithmes de détection d\'anomalies.' },
      { heading: '2. Capteurs concernés', body: 'CS-VIB-001 : Accéléromètre triaxial (vibration) — plage : 0-50 g — fréquence : 10 kHz\nCS-TMP-002 : Sonde PT100 (température) — plage : -20°C à 200°C — précision : ±0,1°C\nCS-PRS-003 : Capteur de pression piezo — plage : 0-500 bar — sortie : 4-20 mA\nCS-AUD-004 : Microphone industriel (émission acoustique) — bande : 20 Hz-100 kHz' },
      { heading: '3. Procédure de calibrage (trimestrielle)', body: 'Étape 1 : Déconnecter le capteur du réseau IIoT (isolation logique).\nÉtape 2 : Connecter l\'étalon de référence certifié COFRAC.\nÉtape 3 : Appliquer les valeurs de référence aux points 0%, 25%, 50%, 75%, 100% de l\'étendue de mesure.\nÉtape 4 : Enregistrer les valeurs lues et calculer l\'erreur relative.\nÉtape 5 : Ajuster le coefficient de correction dans le firmware du capteur si erreur > ±0,5%.\nÉtape 6 : Valider le calibrage en relançant le cycle de test complet.\nÉtape 7 : Reconnecte au réseau et vérifier la réception des données dans le dashboard IA.' },
      { heading: '4. Seuils d\'alerte IA', body: 'Le modèle IA (RandomForest + LSTM) génère des alertes selon les seuils suivants :\n• Vibration > 8 g RMS sur 60 s → Alerte niveau 2 (intervention sous 24h)\n• Température palier > 85°C → Alerte niveau 1 (intervention immédiate)\n• Pression > 420 bar → Alerte niveau 1 (arrêt automatique)\n• Score d\'anomalie IA > 0.85 → Notification maintenance préventive\nTous les seuils sont configurables dans l\'interface d\'administration du module IA.' },
      { heading: '5. Traçabilité', body: 'Chaque calibrage doit être enregistré dans la GMAO avec :\n• Numéro de série du capteur\n• Date et heure du calibrage\n• Résultats avant/après correction\n• Identifiant du technicien\n• Référence du certificat d\'étalonnage COFRAC\nConservez les certificats pendant 5 ans minimum.' },
    ]
  );

  // Rebuild meta.json from the authoritative list
  const metaPath = path.join(uploadDir, 'meta.json');
  const meta = [
    { id: 1717410000001, title: 'Manuel Maintenance — Presse Hydraulique A10', machine: 'Presse Hydraulique A10', type: 'PDF', size: '2.4 MB', filename: 'manuel_presse_hydraulique_a10.pdf', originalName: 'manuel_presse_hydraulique_a10.pdf', uploadedAt: '2026-05-29T15:05:23.589Z' },
    { id: 1717410000002, title: 'Schéma Électrique — Armoire M1', machine: 'Armoire Électrique M1', type: 'Image', size: '3.1 MB', filename: 'schema_electrique_t1.png', originalName: 'schema_electrique_t1.png', uploadedAt: '2026-05-30T15:05:23.589Z' },
    { id: 1717410000003, title: 'Guide de Dépannage — Compresseur Atlas', machine: "Compresseur d'air AC-40", type: 'PDF', size: '1.8 MB', filename: 'guide_panne_compresseur.pdf', originalName: 'guide_panne_compresseur.pdf', uploadedAt: '2026-05-31T15:05:23.589Z' },
    { id: 1717410000004, title: 'Procédure Sécurité — Lockout/Tagout', machine: 'Sécurité Générale', type: 'PDF', size: '950 KB', filename: 'procedure_consignation_securite.pdf', originalName: 'procedure_consignation_securite.pdf', uploadedAt: '2026-06-01T15:05:23.589Z' },
    { id: 1717410000005, title: 'Entretien — Bande Transporteuse C5', machine: 'Convoyeur C5', type: 'PDF', size: '1.2 MB', filename: 'maintenance_bande_transporteuse.pdf', originalName: 'maintenance_bande_transporteuse.pdf', uploadedAt: '2026-06-02T15:05:23.589Z' },
    { id: 1717410000006, title: 'Plan de Câblage — Automate Siemens S7', machine: 'Automate S7-1200', type: 'Image', size: '2.8 MB', filename: 'schema_cablage_automate_siemens.png', originalName: 'schema_cablage_automate_siemens.png', uploadedAt: '2026-06-03T15:05:23.589Z' },
    { id: 1717410000007, title: 'Manuel Lubrification — Moteurs Électriques', machine: 'Moteurs M1-M8', type: 'PDF', size: '780 KB', filename: 'procedures_graissage_moteurs.pdf', originalName: 'procedures_graissage_moteurs.pdf', uploadedAt: '2026-06-03T15:05:23.589Z' },
    { id: 1717410000008, title: 'Guide Maintenance HVAC (Chauffage)', machine: 'Système de Chauffage', type: 'PDF', size: '1.5 MB', filename: 'hvac-maintenance-guide.pdf', originalName: 'hvac-maintenance-guide.pdf', uploadedAt: '2026-06-03T15:05:23.589Z' },
    { id: 1717410000009, title: 'Guide Réseaux — Diagnostic Réseau Industriel', machine: 'Réseau Industriel', type: 'PDF', size: '1.1 MB', filename: 'network-diagnostic-guide.pdf', originalName: 'network-diagnostic-guide.pdf', uploadedAt: '2026-06-03T15:05:23.589Z' },
    { id: 1717410000010, title: 'Manuel Utilisateur — Robot KUKA KR6', machine: 'Robot KUKA KR6', type: 'PDF', size: '2.1 MB', filename: 'guide_utilisateur_robot_kuka.pdf', originalName: 'guide_utilisateur_robot_kuka.pdf', uploadedAt: '2026-06-03T15:05:23.589Z' },
    { id: 1717410000011, title: 'Spécifications — Pompe Centrifuge P3', machine: 'Pompe P3', type: 'PDF', size: '850 KB', filename: 'specifications_pompe_centrifuge.pdf', originalName: 'specifications_pompe_centrifuge.pdf', uploadedAt: '2026-06-03T15:05:23.589Z' },
    { id: 1717410000012, title: 'Calibrage Capteurs — Intelligence Artificielle', machine: 'Capteurs IA & IIoT', type: 'PDF', size: '1.3 MB', filename: 'calibrage_capteurs_ia.pdf', originalName: 'calibrage_capteurs_ia.pdf', uploadedAt: '2026-06-04T15:05:23.589Z' },
  ];

  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log('\n📋 meta.json rebuilt with', meta.length, 'documents.');
  console.log('🎉 Done!');
}

main().catch(console.error);
