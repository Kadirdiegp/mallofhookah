-- Löschen der zuvor importierten Produkte
DELETE FROM "public"."products" 
WHERE ("sku" LIKE 'TOB0%' 
   OR "sku" LIKE 'VAP0%' 
   OR "sku" LIKE 'ACC0%' 
   OR "sku" LIKE 'HOO0%')
   AND "sku" NOT IN ('TOB001', 'TOB002', 'TOB003', 'VAP001', 'VAP002', 'VAP003', 'ACC001', 'ACC002', 'ACC003', 'HOO001', 'HOO002', 'HOO003');
