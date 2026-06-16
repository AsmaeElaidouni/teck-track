import os

def create_pdf(filepath, title, machine_info):
    # Handcrafted valid PDF structure
    # Object 4 is the page contents stream
    stream_content = f"""BT
/F1 22 Tf
50 750 Td
({title}) Tj
/F1 12 Tf
0 -40 Td
(Systeme: {machine_info}) Tj
0 -20 Td
(Editeur: S-NAJ Technologie - Nador) Tj
0 -30 Td
(1. GENERALITES ET SECURITE :) Tj
0 -20 Td
(  - Toujours consigner la machine avant toute intervention.) Tj
0 -20 Td
(  - Porter les EPI obligatoires (casque, lunettes, gants).) Tj
0 -30 Td
(2. PROCEDURES DE MAINTENANCE PREVENTIVE :) Tj
0 -20 Td
(  - Inspecter les connexions electriques et nettoyer la poussiere.) Tj
0 -20 Td
(  - Verifier le niveau d'huile hydraulique et les filtres.) Tj
0 -20 Td
(  - Controler l'alignement des courroies et la tension.) Tj
0 -20 Td
(  - Effectuer les tests de bon fonctionnement des arrets d'urgence.) Tj
0 -30 Td
(3. FREQUENCE DES INTERVENTIONS :) Tj
0 -20 Td
(  - Hebdomadaire: Nettoyage et inspection visuelle.) Tj
0 -20 Td
(  - Mensuelle: Lubrification et serrage des vis.) Tj
0 -20 Td
(  - Semestrielle: Diagnostic complet et etalonnage des capteurs.) Tj
ET"""

    # We need to compute the exact offsets
    # Header
    header = "%PDF-1.1\n"
    
    # Obj 1: Catalog
    obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    
    # Obj 2: Pages list
    obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    
    # Obj 3: Page properties
    obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n"
    
    # Obj 4: Content stream
    stream_bytes = stream_content.encode('latin1')
    stream_len = len(stream_bytes)
    obj4_header = f"4 0 obj\n<< /Length {stream_len} >>\nstream\n"
    obj4_footer = "\nendstream\nendobj\n"
    
    # Compute byte offsets for xref
    offset1 = len(header)
    offset2 = offset1 + len(obj1)
    offset3 = offset2 + len(obj2)
    offset4 = offset3 + len(obj3)
    
    # Xref table
    xref_offset = offset4 + len(obj4_header) + stream_len + len(obj4_footer)
    
    xref = f"xref\n0 5\n0000000000 65535 f \n{offset1:010d} 00000 n \n{offset2:010d} 00000 n \n{offset3:010d} 00000 n \n{offset4:010d} 00000 n \n"
    
    trailer = f"trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
    
    # Write everything as binary
    with open(filepath, 'wb') as f:
        f.write(header.encode('latin1'))
        f.write(obj1.encode('latin1'))
        f.write(obj2.encode('latin1'))
        f.write(obj3.encode('latin1'))
        f.write(obj4_header.encode('latin1'))
        f.write(stream_bytes)
        f.write(obj4_footer.encode('latin1'))
        f.write(xref.encode('latin1'))
        f.write(trailer.encode('latin1'))

# Generate the two files
dir_path = "c:/Users/asmae/OneDrive/Desktop/FINAL SJ/backend/uploads/library"
create_pdf(os.path.join(dir_path, "sample-guide.pdf"), "GUIDE TECHNIQUE : PRESSE HYDRAULIQUE", "Presse Hydraulique A1")
create_pdf(os.path.join(dir_path, "sample-safety.pdf"), "CONSIGNES DE SECURITE : CONVOYEUR", "Systeme de Convoyage")

print("PDFs generated successfully!")
