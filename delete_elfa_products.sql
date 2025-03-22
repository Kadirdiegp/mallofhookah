-- Löschen der ELFA-Produkte
DELETE FROM "public"."products" 
WHERE "name" LIKE 'ELFA%' OR "name" LIKE '%Elfbar%';
