const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads/library');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 10 realistic document metadata entries
const documents = [
  {
    id: 1717410000001,
    title: "Manuel de Maintenance - Presse Hydraulique A10",
    machine: "Presse Hydraulique A10",
    type: "PDF",
    size: "2.4 MB",
    filename: "manuel_presse_hydraulique_a10.pdf",
    originalName: "manuel_presse_hydraulique_a10.pdf",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
  },
  {
    id: 1717410000002,
    title: "Schéma Électrique - Armoire Principale T1",
    machine: "Armoire Électrique T1",
    type: "Image",
    size: "4.8 MB",
    filename: "schema_electrique_t1.png",
    originalName: "schema_electrique_t1.png",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString() // 4 days ago
  },
  {
    id: 1717410000003,
    title: "Guide de Résolution de Pannes - Compresseur Atlas Copco",
    machine: "Compresseur d'air AC-40",
    type: "PDF",
    size: "1.7 MB",
    filename: "guide_panne_compresseur.pdf",
    originalName: "guide_panne_compresseur.pdf",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // 3 days ago
  },
  {
    id: 1717410000004,
    title: "Procédure de Consignation et Sécurité Industrielle",
    machine: "Sécurité Générale",
    type: "PDF",
    size: "850 KB",
    filename: "procedure_consignation_securite.pdf",
    originalName: "procedure_consignation_securite.pdf",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() // 2 days ago
  },
  {
    id: 1717410000005,
    title: "Fiche technique - Remplacement Bande Transporteuse C5",
    machine: "Convoyeur à bande C5",
    type: "PDF",
    size: "1.2 MB",
    filename: "maintenance_bande_transporteuse.pdf",
    originalName: "maintenance_bande_transporteuse.pdf",
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() // 1 day ago
  },
  {
    id: 1717410000006,
    title: "Manuel de Calibrage des Capteurs de Vibration IA",
    machine: "Système Prédictif TECK TRACK",
    type: "PDF",
    size: "3.1 MB",
    filename: "calibrage_capteurs_ia.pdf",
    originalName: "calibrage_capteurs_ia.pdf",
    uploadedAt: new Date().toISOString()
  },
  {
    id: 1717410000007,
    title: "Plan de Câblage Automate Siemens S7-1200",
    machine: "Automate Siemens S7",
    type: "Image",
    size: "3.6 MB",
    filename: "schema_cablage_automate_siemens.png",
    originalName: "schema_cablage_automate_siemens.png",
    uploadedAt: new Date().toISOString()
  },
  {
    id: 1717410000008,
    title: "Plan de Graissage Périodique - Moteurs Électriques M1-M8",
    machine: "Moteurs Électriques M1-M8",
    type: "PDF",
    size: "950 KB",
    filename: "procedures_graissage_moteurs.pdf",
    originalName: "procedures_graissage_moteurs.pdf",
    uploadedAt: new Date().toISOString()
  },
  {
    id: 1717410000009,
    title: "Manuel Utilisateur - Robot Industriel KUKA KR6",
    machine: "Robot KUKA KR6",
    type: "PDF",
    size: "5.4 MB",
    filename: "guide_utilisateur_robot_kuka.pdf",
    originalName: "guide_utilisateur_robot_kuka.pdf",
    uploadedAt: new Date().toISOString()
  },
  {
    id: 1717410000010,
    title: "Spécifications de Maintenance - Pompe Centrifuge P3",
    machine: "Pompe Centrifuge P3",
    type: "PDF",
    size: "720 KB",
    filename: "specifications_pompe_centrifuge.pdf",
    originalName: "specifications_pompe_centrifuge.pdf",
    uploadedAt: new Date().toISOString()
  }
];

// Write meta.json
fs.writeFileSync(
  path.join(uploadDir, 'meta.json'),
  JSON.stringify(documents, null, 2),
  'utf8'
);
console.log("✅ Fichier meta.json créé avec succès.");

// Write 10 mock files to disk with some dummy data to prevent 404 errors on download
documents.forEach(doc => {
  const filePath = path.join(uploadDir, doc.filename);
  fs.writeFileSync(filePath, `Ceci est le fichier mock de test pour: ${doc.title}. Format reel: ${doc.type}`);
  console.log(`- Fichier créé: ${doc.filename}`);
});

console.log("\n=== 10 DOCUMENTS TECHNIQUES AJOUTÉS AVEC SUCCÈS À LA BIBLIOTHÈQUE ===");
