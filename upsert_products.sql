-- Upsert für ELFA-Produkte mit ON CONFLICT-Behandlung
-- Produkt 1
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "public"."products" WHERE "name" = 'ELFA Strawberry Ice Cream') THEN
    INSERT INTO "public"."products" ("id", "created_at", "updated_at", "name", "slug", "description", "price", "discount_price", "stock", "category_id", "images", "featured", "sku", "weight", "dimensions", "metadata") 
    VALUES (
      'fa17d3dd-69f5-4270-835a-7347b83da49a', 
      '2025-03-22 13:39:31.351613+00', 
      '2025-03-22 13:39:31.351613+00', 
      'ELFA Strawberry Ice Cream', 
      'elfa-strawberry-ice-cream-1742647171', 
      'Hochwertiges ELFA Strawberry Ice Cream Produkt', 
      '10.0', 
      '10.0', 
      '20', 
      '953ec686-8bc7-427e-99bc-f55d96cbc126', 
      '{"uploads/shop_600/20250318/67d99bd0020dd43N1u0k21blbE.png"}', 
      'false', 
      'VAP021', 
      null, 
      null, 
      '{}'
    );
  ELSE
    UPDATE "public"."products" 
    SET 
      "updated_at" = '2025-03-22 13:39:31.351613+00',
      "slug" = 'elfa-strawberry-ice-cream-1742647171',
      "description" = 'Hochwertiges ELFA Strawberry Ice Cream Produkt',
      "price" = '10.0',
      "discount_price" = '10.0',
      "stock" = '20',
      "category_id" = '953ec686-8bc7-427e-99bc-f55d96cbc126',
      "images" = '{"uploads/shop_600/20250318/67d99bd0020dd43N1u0k21blbE.png"}',
      "featured" = 'false'
    WHERE "name" = 'ELFA Strawberry Ice Cream';
  END IF;
END $$;

-- Produkt 2
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "public"."products" WHERE "name" = 'ELFA Elfbar PINEAPPLE LEMON QI') THEN
    INSERT INTO "public"."products" ("id", "created_at", "updated_at", "name", "slug", "description", "price", "discount_price", "stock", "category_id", "images", "featured", "sku", "weight", "dimensions", "metadata") 
    VALUES (
      '4337fa12-0797-45c2-bddf-2ac599888770', 
      '2025-03-22 13:39:31.351613+00', 
      '2025-03-22 13:39:31.351613+00', 
      'ELFA Elfbar PINEAPPLE LEMON QI', 
      'elfa-elfbar-pineapple-lemon-qi-1742647171', 
      'Hochwertiges ELFA Elfbar PINEAPPLE LEMON QI Produkt', 
      '10.0', 
      '10.0', 
      '20', 
      '953ec686-8bc7-427e-99bc-f55d96cbc126', 
      '{"uploads/shop_600/20250204/67a1f97101d4aIDkIxcSScJtio.png"}', 
      'false', 
      'VAP022', 
      null, 
      null, 
      '{}'
    );
  ELSE
    UPDATE "public"."products" 
    SET 
      "updated_at" = '2025-03-22 13:39:31.351613+00',
      "slug" = 'elfa-elfbar-pineapple-lemon-qi-1742647171',
      "description" = 'Hochwertiges ELFA Elfbar PINEAPPLE LEMON QI Produkt',
      "price" = '10.0',
      "discount_price" = '10.0',
      "stock" = '20',
      "category_id" = '953ec686-8bc7-427e-99bc-f55d96cbc126',
      "images" = '{"uploads/shop_600/20250204/67a1f97101d4aIDkIxcSScJtio.png"}',
      "featured" = 'false'
    WHERE "name" = 'ELFA Elfbar PINEAPPLE LEMON QI';
  END IF;
END $$;
