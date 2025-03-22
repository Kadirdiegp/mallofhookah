import pandas as pd
import json
import re
import uuid
import time
from datetime import datetime

# Excel-Datei lesen
excel_file = "/Users/kadirdiegopadinrodriguez/Desktop/MallofHookah/Waren exportieren.xlsx"
df = pd.read_excel(excel_file)

# DUPLO-Produkt und 187-Produkte entfernen
df = df[df['Kategorie'] != 'DUPLO']
df = df[~df['Warenname'].str.contains('187', na=False)]

# Kategorie-IDs aus der bestehenden Datenbank
category_ids = {
    'tobacco': '2a3eedfd-9f12-4835-be0e-21148562fcfd',
    'accessories': '43558181-4465-4e4f-967c-cf42a48935c9',
    'hookahs': '2c0431e3-9b0b-4e38-bb66-13ea7dd75ab7',
    'vapes': '953ec686-8bc7-427e-99bc-f55d96cbc126'
}

# Bestehende SKUs (basierend auf dem Fehler)
existing_skus = [
    "ACC001", "ACC002", "ACC003", "HKH001", "HKH002", "HKH003",
    "TBC001", "TBC002", "TBC003", "VPE001", "VPE002", "VPE003"
]

# Zähler für neue SKUs pro Kategorie
sku_counters = {
    'accessories': 20,  # Beginnen bei 20, um Konflikte zu vermeiden
    'hookahs': 20,
    'tobacco': 20,
    'vapes': 20
}

# Kategorien basierend auf Produktnamen zuordnen
def assign_category(product_name):
    product_name_lower = product_name.lower()
    
    # ELFA und ELFBAR Produkte sind immer Vapes
    if any(term in product_name_lower for term in ['elfa', 'elfbar', 'pod', 'vape']):
        return 'vapes'
    
    # Hookah/Shisha Produkte
    if any(term in product_name_lower for term in ['hookah', 'shisha', 'wasserpfeife']):
        return 'hookahs'
    
    # Tobacco Produkte
    if any(term in product_name_lower for term in ['tobacco', 'tabak']):
        return 'tobacco'
    
    # Accessories
    if any(term in product_name_lower for term in ['kohle', 'mundstück', 'schlauch', 'kopf', 'folie', 'zange']):
        return 'accessories'
    
    # Standardkategorie, wenn keine Übereinstimmung gefunden wurde
    return 'accessories'

# Kategorien zuweisen, wo sie fehlen
df['category_slug'] = df.apply(lambda row: 
    row['Kategorie'] if pd.notna(row['Kategorie']) else assign_category(row['Warenname']), 
    axis=1)

# Manuelles Überschreiben für ELFA/ELFBAR Produkte
df.loc[df['Warenname'].str.contains('ELFA|Elfbar', case=False, na=False), 'category_slug'] = 'vapes'

# Aktuelles Datum und Zeit für created_at und updated_at
current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f+00')

# Zeitstempel für eindeutige Slugs
timestamp_suffix = int(time.time())

# SQL-Befehle für Supabase generieren
sql_commands = []

for _, row in df.iterrows():
    # Bilder-URLs vorbereiten
    image_url = row['Bilder'] if pd.notna(row['Bilder']) else None
    images = [image_url] if image_url else []
    
    # Beschreibung vorbereiten
    description = row['Waren Details'] if pd.notna(row['Waren Details']) else f"Hochwertiges {row['Warenname']} Produkt"
    
    # Produkt-ID generieren (UUID)
    product_id = str(uuid.uuid4())
    
    # Marke bestimmen
    brand = row['Warenmarke'] if pd.notna(row['Warenmarke']) else "Mall of Hookah"
    
    # Slug erstellen mit Zeitstempel für Eindeutigkeit
    base_slug = row['Warenname'].lower().replace(' ', '-').replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss')
    base_slug = re.sub(r'[^a-z0-9-]', '', base_slug)
    slug = f"{base_slug}-{timestamp_suffix}"
    
    # Kategorie für SKU
    category_slug = row['category_slug']
    
    # SKU erstellen (mit eindeutigem Zähler)
    category_prefix = category_slug[:3].upper()
    sku_counters[category_slug] += 1
    sku = f"{category_prefix}{sku_counters[category_slug]:03d}"
    
    # Sicherstellen, dass die SKU eindeutig ist
    while sku in existing_skus:
        sku_counters[category_slug] += 1
        sku = f"{category_prefix}{sku_counters[category_slug]:03d}"
    
    # SKU zur Liste der existierenden SKUs hinzufügen
    existing_skus.append(sku)
    
    # Kategorie-ID ermitteln
    category_id = category_ids.get(category_slug, category_ids['accessories'])
    
    # Preis formatieren
    price = row['Verkaufspreis pro Einheit'] if pd.notna(row['Verkaufspreis pro Einheit']) else 0
    discount_price = row['Mitgliederpreis pro Einheit'] if pd.notna(row['Mitgliederpreis pro Einheit']) else None
    
    # Stock-Menge
    stock = 20  # Standardwert
    
    # Featured-Status
    featured = 'false'
    
    # Bilder als PostgreSQL-Array formatieren (mit geschweiften Klammern)
    if images:
        # PostgreSQL-Array mit geschweiften Klammern
        images_json = '{' + ','.join([f'"{img}"' for img in images]) + '}'
    else:
        images_json = '{}'
    
    # SQL-Befehl zum Einfügen des Produkts
    sql = f"""INSERT INTO "public"."products" ("id", "created_at", "updated_at", "name", "slug", "description", "price", "discount_price", "stock", "category_id", "images", "featured", "sku", "weight", "dimensions", "metadata") 
VALUES (
  '{product_id}', 
  '{current_timestamp}', 
  '{current_timestamp}', 
  '{row['Warenname'].replace("'", "''")}', 
  '{slug}', 
  '{description.replace("'", "''")}', 
  '{price}', 
  {f"'{discount_price}'" if discount_price is not None else 'null'}, 
  '{stock}', 
  '{category_id}', 
  '{images_json}', 
  '{featured}', 
  '{sku}', 
  null, 
  null, 
  '{{}}'
);"""
    sql_commands.append(sql)

# SQL-Befehle in Datei speichern
with open("/Users/kadirdiegopadinrodriguez/Desktop/MallofHookah/import_products_updated.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_commands))

# Statistiken anzeigen
category_counts = df['category_slug'].value_counts()
print(f"SQL-Befehle für {len(sql_commands)} Produkte wurden in import_products_updated.sql gespeichert.")
print("\nProdukte pro Kategorie nach Zuordnung:")
for category, count in category_counts.items():
    print(f"  {category}: {count} Produkte")
print("\nVerwendete SKU-Bereiche:")
for category, counter in sku_counters.items():
    if counter > 20:  # Nur Kategorien anzeigen, die tatsächlich Produkte haben
        print(f"  {category}: {category[:3].upper()}020 - {category[:3].upper()}{counter:03d}")
print(f"\nAlle Slugs haben den Zeitstempel {timestamp_suffix} für Eindeutigkeit")
