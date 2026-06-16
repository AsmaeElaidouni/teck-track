/**
 * generate-real-pdfs.js
 * Generates proper, readable PDF files for the library.
 * Run: node generate-real-pdfs.js
 */
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'uploads', 'library');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ── Helper ─────────────────────────────────────────────────────────────────────
function makePDF(filename, title, machine, sections) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const out = fs.createWriteStream(path.join(outDir, filename));
    doc.pipe(out);

    // Header bar
    doc.rect(0, 0, doc.page.width, 80).fill('#1a1a2e');
    doc.fillColor('#DF4B37').fontSize(22).font('Helvetica-Bold')
       .text('TECK TRACK', 60, 20);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica')
       .text('Système de Gestion de Maintenance', 60, 46);

    // Title
    doc.moveDown(3);
    doc.fillColor('#1a1a2e').fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#DF4B37').fontSize(12).font('Helvetica').text(`Machine / Système : ${machine}`, { align: 'center' });

    // Divider
    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#DF4B37').lineWidth(2).stroke();
    doc.moveDown(1.5);

    // Sections
    sections.forEach(({ heading, body }) => {
      doc.fillColor('#1a1a2e').fontSize(13).font('Helvetica-Bold').text(heading);
      doc.moveDown(0.4);
      doc.fillColor('#333333').fontSize(10).font('Helvetica').text(body, { lineGap: 4, paragraphGap: 6 });
      doc.moveDown(1.2);
    });

    // Footer
    const bottom = doc.page.height - 50;
    doc.moveTo(60, bottom).lineTo(doc.page.width - 60, bottom).strokeColor('#cccccc').lineWidth(1).stroke();
    doc.fillColor('#888888').fontSize(9).font('Helvetica')
       .text(`Document généré par TECK TRACK — ${new Date().toLocaleDateString('fr-FR')}`, 60, bottom + 8);

    doc.end();
    out.on('finish', () => { console.log(`✅  ${filename}`); resolve(); });
    out.on('error', reject);
  });
}

// ── PDF definitions ────────────────────────────────────────────────────────────
const pdfs = [
  {
    filename: 'manuel_presse_hydraulique_a10.pdf',
    title: 'Manuel de Maintenance — Presse Hydraulique A10',
    machine: 'Presse Hydraulique A10',
    sections: [
      { heading: '1. Description de la machine', body: 'La Presse Hydraulique A10 est un équipement industriel de 250 tonnes utilisé pour le découpage et l\'emboutissage de tôles métalliques. Elle fonctionne avec un circuit hydraulique à haute pression (250 bar) et est équipée de capteurs de sécurité tricanaux.' },
      { heading: '2. Consignes de sécurité', body: '— Toujours porter les EPI réglementaires (gants, lunettes, chaussures de sécurité).\n— Vérifier que la pression hydraulique est à zéro avant toute intervention.\n— Condamner l\'armoire électrique (procédure Lockout/Tagout) avant de travailler sur les circuits hydrauliques.\n— Ne jamais travailler seul sur cette machine.' },
      { heading: '3. Entretien préventif (mensuel)', body: '• Vérifier le niveau d\'huile hydraulique (réservoir de 200 L — huile HLP 46).\n• Inspecter les joints des vérins pour toute fuite.\n• Contrôler la pression de précharge des accumulateurs (80 bar).\n• Lubrifier les colonnes de guidage avec de la graisse EP2.\n• Tester les vannes de sécurité et les limiteurs de pression.\n• Nettoyer les filtres hydrauliques (remplacement tous les 6 mois).' },
      { heading: '4. Pannes courantes et solutions', body: 'Panne : La presse ne monte pas en pression.\nCause probable : Pompe hydraulique défectueuse ou vanne de décharge ouverte.\nSolution : Vérifier la pompe (contrôle débit à 60 L/min), régler la vanne de décharge.\n\nPanne : Descente lente du piston.\nCause probable : Filtre hydraulique colmaté ou fuite interne dans le vérin.\nSolution : Remplacer le filtre, inspecter les joints du vérin.' },
      { heading: '5. Pièces de rechange recommandées', body: 'Référence HPA10-001 : Joint torique vérin principal (x4)\nRéférence HPA10-002 : Filtre hydraulique haute pression (remplacement 6 mois)\nRéférence HPA10-003 : Huile hydraulique HLP 46 (bidon 20 L)\nRéférence HPA10-004 : Accumulateur à membrane 10 L' },
    ]
  },
  {
    filename: 'guide_panne_compresseur.pdf',
    title: 'Guide de Dépannage — Compresseur Atlas Copco AC-40',
    machine: "Compresseur d'air AC-40",
    sections: [
      { heading: '1. Présentation du compresseur', body: "Le compresseur à vis AC-40 fournit l'air comprimé à l'ensemble de l'atelier (réseau 8 bar). Débit nominal : 4,0 m³/min. Puissance moteur : 22 kW. Capacité du réservoir : 500 L. Pression de service : 7,5 à 8,5 bar." },
      { heading: '2. Tableau de diagnostic', body: 'Symptôme : Le compresseur ne démarre pas.\nVérifier : Alimentation 400V, disjoncteur principal, contacteur moteur.\n\nSymptôme : Arrêt sur alarme haute température.\nVérifier : Niveau huile, refroidisseur encrassé, sonde température, ventilateur.\n\nSymptôme : Pression insuffisante.\nVérifier : Fuites réseau (test savon), filtre d\'aspiration colmaté, vanne de régulation.\n\nSymptôme : Consommation d\'huile excessive.\nVérifier : Séparateur d\'huile saturé (remplacement), joint arbre moteur.' },
      { heading: '3. Entretien 500 heures', body: '• Vidange huile compresseur (huile spéciale synthétique 46)\n• Remplacement filtre à huile\n• Remplacement filtre d\'aspiration\n• Vérification courroies (tension et usure)\n• Nettoyage refroidisseur air/air' },
      { heading: '4. Entretien 2000 heures', body: '• Remplacement séparateur huile/air\n• Révision du kit d\'étanchéité\n• Contrôle roulements moteur (remplacement si nécessaire)\n• Étalonnage capteurs pression et température' },
    ]
  },
  {
    filename: 'procedure_consignation_securite.pdf',
    title: 'Procédure de Consignation Sécurité (Lockout/Tagout)',
    machine: 'Sécurité Générale — Tous équipements',
    sections: [
      { heading: '1. Objectif', body: 'Cette procédure garantit que les machines dangereuses sont correctement arrêtées et qu\'elles ne puissent pas être remises en marche avant la fin des travaux de maintenance. Elle est obligatoire pour toute intervention impliquant l\'ouverture de capots, le contact avec des pièces en mouvement ou des circuits sous tension.' },
      { heading: '2. Matériel nécessaire', body: '• Cadenas de consignation personnel (1 par intervenant)\n• Étiquettes "Ne pas manœuvrer — Travaux en cours"\n• Disjoncteur de consignation (coffret rouge)\n• Détecteur de tension sans contact\n• Registre de consignation (formulaire C-001)' },
      { heading: '3. Étapes de consignation', body: 'Étape 1 : Informer le chef d\'atelier et les opérateurs concernés.\nÉtape 2 : Identifier toutes les sources d\'énergie (électrique, hydraulique, pneumatique).\nÉtape 3 : Éteindre la machine via son interrupteur principal.\nÉtape 4 : Isoler chaque source d\'énergie (disjoncteur, vanne, etc.).\nÉtape 5 : Poser un cadenas personnel sur chaque point d\'isolement.\nÉtape 6 : Apposer une étiquette d\'avertissement.\nÉtape 7 : Vérifier l\'absence d\'énergie résiduelle (testeur tension, purge pneumatique).\nÉtape 8 : Signer le registre de consignation.' },
      { heading: '4. Déconsignation', body: 'Avant de retirer les cadenas :\n1. S\'assurer que tous les travaux sont terminés.\n2. Retirer tous les outils et équipements de la zone de travail.\n3. Informer les personnes environnantes.\n4. Chaque intervenant retire son propre cadenas.\n5. Remettre l\'énergie progressivement.\n6. Tester le bon fonctionnement en mode manuel.' },
    ]
  },
  {
    filename: 'maintenance_bande_transporteuse.pdf',
    title: 'Entretien — Bande Transporteuse C5',
    machine: 'Convoyeur C5',
    sections: [
      { heading: '1. Description', body: 'Le convoyeur C5 assure le transport de pièces usinées entre le poste de tournage et la zone d\'emballage. Longueur : 12 m. Vitesse de bande : 0,3 m/s. Capacité : 200 kg/m. Motoréducteur 4 kW.' },
      { heading: '2. Inspection quotidienne (5 min)', body: '• Vérifier le bon alignement de la bande (absence de dérive latérale)\n• Écouter les bruits anormaux (roulements, racleurs)\n• Contrôler visuellement l\'état de la surface de la bande\n• S\'assurer que les dispositifs d\'arrêt d\'urgence (câbles latéraux) sont en place' },
      { heading: '3. Entretien hebdomadaire', body: '• Graisser les roulements de l\'arbre d\'entraînement et de renvoi\n• Vérifier et régler la tension de la bande (flèche max 10 mm sous charge)\n• Nettoyer les racleurs de bande et vérifier leur appui\n• Inspecter les rouleaux porteurs (remplacement si voilés ou grippés)' },
      { heading: '4. Remplacement de bande', body: 'Critères de remplacement : coupures traversantes, délamination des bords > 5 cm, allongement permanent > 2%.\nProcédure : Déconnecter l\'alimentation (LOTO), détendre la bande via le tendeur vissé, découper la jonction à la meuleuse, poser la nouvelle bande en veillant au sens de marche, réaliser une jonction mécanique à agrafes inox.' },
    ]
  },
  {
    filename: 'procedures_graissage_moteurs.pdf',
    title: 'Manuel de Lubrification — Moteurs Électriques M1 à M8',
    machine: 'Moteurs M1-M8',
    sections: [
      { heading: '1. Importance de la lubrification', body: 'Une lubrification correcte des roulements de moteurs est essentielle pour éviter 40% des pannes prématurées. Un excès de graisse est aussi néfaste qu\'un manque : il provoque une surchauffe par effet de fouettage. Respectez scrupuleusement les quantités prescrites.' },
      { heading: '2. Tableau de lubrification', body: 'Moteur M1 (Convoyeur) : Graisse SKF LGHP2, 5g, tous les 6 mois.\nMoteur M2 (Ventilateur) : Graisse SKF LGHP2, 8g, tous les 4 mois.\nMoteur M3 (Pompe eau) : Graisse FAG Arcanol MULTI3, 10g, tous les 6 mois.\nMoteurs M4-M8 (Servo) : Graisse spéciale servo FAG Arcanol TEMP90, 3g, annuel.\nNote : Ne jamais mélanger différentes marques de graisse.' },
      { heading: '3. Procédure de graissage', body: '1. Arrêter le moteur et appliquer la procédure LOTO.\n2. Nettoyer la tête du graisseur et la cartouche.\n3. Injecter la quantité prescrite à la presse à graisse manuelle.\n4. Faire tourner le moteur à vide 5 min pour répartir la graisse.\n5. Contrôler la température du palier (max 70°C) après 30 min de fonctionnement.\n6. Inscrire l\'opération dans le registre de maintenance préventive.' },
      { heading: '4. Signes d\'alarme', body: '• Température roulement > 80°C : arrêt immédiat\n• Bruit de cliquetis : roulement défaillant, planifier remplacement\n• Graisse noire en sortie du graisseur : contamination métallique, inspection urgente\n• Vibrations anormales (> 4,5 mm/s RMS) : déséquilibre ou roulement usé' },
    ]
  },
  {
    filename: 'hvac-maintenance-guide.pdf',
    title: 'Guide de Maintenance HVAC (Chauffage & Ventilation)',
    machine: 'Système de Chauffage/Climatisation',
    sections: [
      { heading: '1. Description du système', body: 'Le système CVC assure le maintien de la température de l\'atelier entre 18°C et 22°C et garantit un renouvellement d\'air de 6 volumes/heure. Il comprend : 2 centrales de traitement d\'air (CTA1 et CTA2), 1 groupe froid de 80 kW, 1 chaudière gaz de 120 kW, 32 bouches de soufflage.' },
      { heading: '2. Maintenance mensuelle', body: '• Contrôle visuel des filtres G4 et F7 (remplacement si ΔP > 150 Pa)\n• Vérification des débits d\'air (anémomètre)\n• Contrôle des températures de soufflage et de reprise\n• Inspection des courroies des caissons de ventilation\n• Vérification du bon fonctionnement des registres motorisés' },
      { heading: '3. Maintenance trimestrielle', body: '• Entretien du groupe froid (pression frigorifique, état des compresseurs)\n• Contrôle brûleur chaudière (combustion, allumage)\n• Nettoyage des échangeurs de chaleur\n• Vérification GTB (Gestion Technique du Bâtiment) — paramétrage des consignes' },
      { heading: '4. Consommation énergétique cible', body: 'CTA1 + CTA2 : < 45 kWh/jour\nGroupe froid (été) : < 120 kWh/jour\nChaudière (hiver) : < 80 m³ gaz/semaine\nAlarmes à déclencher si dépassement de 20% des valeurs nominales.' },
    ]
  },
  {
    filename: 'network-diagnostic-guide.pdf',
    title: 'Guide de Diagnostic Réseau Industriel',
    machine: 'Réseau Industriel (OT Network)',
    sections: [
      { heading: '1. Architecture réseau', body: 'Le réseau industriel est segmenté en 3 zones :\n• Zone IT (bureaux) : VLAN 10 — 192.168.10.0/24\n• Zone OT (automates, SCADA) : VLAN 20 — 192.168.20.0/24\n• Zone DMZ (serveurs de données) : VLAN 30 — 192.168.30.0/24\nLe pare-feu Fortinet 60F assure l\'isolation entre les zones.' },
      { heading: '2. Diagnostic de connectivité', body: 'Étape 1 : Ping de l\'automate S7 (192.168.20.10)\n  > ping 192.168.20.10 -n 100\n  Résultat attendu : 0% perte, latence < 1ms.\n\nÉtape 2 : Test de la liaison SCADA\n  Ouvrir WinCC → Connexion → Vérifier OPC-UA Endpoint.\n\nÉtape 3 : Vérification switch réseau\n  Console Cisco : show interfaces status — vérifier ports en erreur-disable.' },
      { heading: '3. Pannes fréquentes', body: 'Panne : Perte de communication automate-SCADA.\nDiagnostic : Vérifier câble Ethernet, port switch, adresse IP automate (écran HMI), firmware automate.\n\nPanne : Alarmes "Timeout" sur SCADA.\nDiagnostic : Charge réseau excessive (>60%) — analyser trafic avec Wireshark, identifier storm de broadcast.\n\nPanne : Accès VPN impossible depuis bureau.\nDiagnostic : Vérifier certificat VPN (expiration), profil utilisateur Active Directory, règle pare-feu.' },
      { heading: '4. Contacts support', body: 'Responsable réseau IT : poste interne 3201\nSupport automates Siemens : hotline +33 1 70 70 70 00\nSupport SCADA Wonderware : ticket portal.wonderware.com\nAstreinte réseau (H24) : poste 3999' },
    ]
  },
  {
    filename: 'guide_utilisateur_robot_kuka.pdf',
    title: 'Manuel Utilisateur — Robot KUKA KR6 R900',
    machine: 'Robot KUKA KR6',
    sections: [
      { heading: '1. Caractéristiques techniques', body: 'Modèle : KUKA KR6 R900 sixx\nPortée maximale : 901 mm\nCharge utile maximale : 6 kg\nNombre d\'axes : 6\nRépétabilité : ±0,03 mm\nContrôleur : KRC4 compact\nInterface : KUKA smartPAD (écran tactile)' },
      { heading: '2. Démarrage et arrêt', body: 'Démarrage :\n1. S\'assurer que la cellule est libre (signal lumineux vert).\n2. Tourner la clé du contrôleur KRC4 sur "ON".\n3. Attendre l\'initialisation du système (environ 60 secondes).\n4. Sur le smartPAD : vérifier état "Drives ON" et sélectionner le programme.\n5. Mode Automatique Externe : activer depuis le PC supervision.\n\nArrêt d\'urgence :\n• Appuyer sur tout bouton d\'arrêt d\'urgence (rouge/jaune).\n• Le robot s\'arrête en moins de 0,3 s.\n• Pour réarmer : retirer l\'obstacle, tourner le bouton, acquitter sur smartPAD.' },
      { heading: '3. Maintenance préventive trimestrielle', body: '• Vérifier le jeu dans tous les axes (test d\'oscillation manuelle)\n• Lubrifier les réducteurs harmoniques selon la table KUKA (graisse spéciale)\n• Contrôler les câbles de liaison (pas de pliage ni d\'usure)\n• Mettre à jour le firmware KRC4 si version < 8.7\n• Sauvegarder les programmes sur clé USB (archive complète)' },
      { heading: '4. Codes d\'erreur courants', body: 'KSS01305 : Limite axe dépassée → Déplacer manuellement l\'axe en zone valide.\nKSS00322 : Erreur communication réseau → Vérifier câble PROFINET, redémarrer le contrôleur.\nKSS14001 : Température contrôleur élevée → Nettoyer les filtres du KRC4, vérifier climatisation armoire.\nKSS15220 : Défaut alimentation → Vérifier tensions 24V et 48V sur le panneau KPS.' },
    ]
  },
  {
    filename: 'specifications_pompe_centrifuge.pdf',
    title: 'Spécifications Techniques — Pompe Centrifuge P3',
    machine: 'Pompe Centrifuge P3',
    sections: [
      { heading: '1. Fiche technique', body: 'Fabricant : Grundfos\nModèle : NB 65-200/219\nDébit nominal : 48 m³/h\nHauteur manométrique totale (HMT) : 32 m\nPuissance absorbée : 8,5 kW\nVitesse de rotation : 1450 tr/min\nFluide pompé : Eau industrielle (max 60°C)\nMatière corps de pompe : Fonte GG-25\nMatière roue : Inox 316L' },
      { heading: '2. Courbe de performance', body: 'La pompe P3 opère de manière optimale entre 40 et 55 m³/h. En dehors de cette plage, le rendement chute significativement :\n• Q < 20 m³/h : risque de cavitation (bruit de crépitement, vibrations)\n• Q > 60 m³/h : surchauffe du moteur, alarme courant\n\nPoint de fonctionnement actuel (réseau) : Q = 46 m³/h, HMT = 30 m — rendement 78%.' },
      { heading: '3. Entretien annuel', body: '1. Démonter la pompe (côté aspiration fermé, procédure LOTO).\n2. Inspecter la roue (érosion, cavitation) — remplacement si perte > 15% de diamètre.\n3. Remplacer la garniture mécanique (ref. GF-P3-GM01).\n4. Contrôler les roulements à billes (bruit, jeu) — remplacer si nécessaire.\n5. Remonter avec joints neufs, alignement accouplement laser (tolérance 0,05 mm).\n6. Test de performance (mesure débit et pression) et enregistrement dans la GMAO.' },
      { heading: '4. Cavitation — Prévention et remèdes', body: 'Signes : Bruit de cliquetis ou de graviers, vibrations, érosion de la roue.\nCauses : NPSH disponible insuffisant, vanne aspiration partiellement fermée, liquide trop chaud.\nRemèdes : Abaisser la pompe par rapport au niveau d\'aspiration, ouvrir complètement les vannes aspiration, réduire la température du fluide (max 55°C pour cette pompe).' },
    ]
  },
];

// ── Run all ────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n📄 Génération de ${pdfs.length} PDFs dans ${outDir}\n`);
  for (const p of pdfs) {
    await makePDF(p.filename, p.title, p.machine, p.sections);
  }
  console.log('\n🎉 Tous les PDFs ont été générés avec succès !');
})();
