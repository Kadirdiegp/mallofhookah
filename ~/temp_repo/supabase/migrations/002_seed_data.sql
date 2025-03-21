-- Insert Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Hookahs', 'hookahs', 'Premium hookahs for the ultimate smoking experience', '/images/category-hookah.jpg'),
('Tobacco', 'tobacco', 'Flavor-rich tobacco blends for your hookah', '/images/category-tobacco.jpg'),
('Accessories', 'accessories', 'Essential accessories for hookah and vape maintenance', '/images/category-accessories.jpg'),
('Vapes', 'vapes', 'High-quality vaping devices and supplies', '/images/category-vape.jpg')
ON CONFLICT (slug) DO NOTHING;

-- Get Category IDs
DO $$
DECLARE
    hookah_id UUID;
    tobacco_id UUID;
    accessories_id UUID;
    vapes_id UUID;
BEGIN
    SELECT id INTO hookah_id FROM categories WHERE slug = 'hookahs';
    SELECT id INTO tobacco_id FROM categories WHERE slug = 'tobacco';
    SELECT id INTO accessories_id FROM categories WHERE slug = 'accessories';
    SELECT id INTO vapes_id FROM categories WHERE slug = 'vapes';

    -- Insert Products
    INSERT INTO products (name, slug, description, price, stock, category_id, images, featured, sku) VALUES
    -- Hookahs
    ('Premium Hookah Set', 'premium-hookah-set', 'Complete hookah set with premium accessories.', 129.99, 15, hookah_id, ARRAY['/images/products/hookah1.jpg'], true, 'HKH001'),
    ('Traditional Hookah', 'traditional-hookah', 'Classic design with modern materials for enhanced durability.', 89.99, 20, hookah_id, ARRAY['/images/products/hookah2.jpg'], false, 'HKH002'),
    ('Portable Mini Hookah', 'portable-mini-hookah', 'Compact and travel-friendly hookah for on-the-go enjoyment.', 49.99, 30, hookah_id, ARRAY['/images/products/hookah3.jpg'], false, 'HKH003'),
    
    -- Tobacco
    ('Fruit Mix Tobacco', 'fruit-mix-tobacco', 'Premium fruit-flavored tobacco for hookah.', 24.99, 50, tobacco_id, ARRAY['/images/products/tobacco1.jpg'], true, 'TBC001'),
    ('Mint Blast Tobacco', 'mint-blast-tobacco', 'Refreshing mint tobacco blend for a cool smoking experience.', 22.99, 45, tobacco_id, ARRAY['/images/products/tobacco2.jpg'], false, 'TBC002'),
    ('Berry Paradise Tobacco', 'berry-paradise-tobacco', 'Rich berry-flavored tobacco blend.', 26.99, 40, tobacco_id, ARRAY['/images/products/tobacco3.jpg'], false, 'TBC003'),
    
    -- Accessories
    ('Hookah Cleaning Kit', 'hookah-cleaning-kit', 'Complete kit for cleaning and maintaining your hookah.', 19.99, 30, accessories_id, ARRAY['/images/products/accessory1.jpg'], true, 'ACC001'),
    ('Premium Hookah Hose', 'premium-hookah-hose', 'High-quality replacement hose for enhanced flavor.', 14.99, 50, accessories_id, ARRAY['/images/products/accessory2.jpg'], false, 'ACC002'),
    ('Charcoal Burner', 'charcoal-burner', 'Efficient burner for quick and even charcoal lighting.', 29.99, 25, accessories_id, ARRAY['/images/products/accessory3.jpg'], false, 'ACC003'),
    
    -- Vapes
    ('Vape Starter Kit', 'vape-starter-kit', 'Everything you need to start vaping.', 49.99, 25, vapes_id, ARRAY['/images/products/vape1.jpg'], true, 'VPE001'),
    ('Premium Vape Mod', 'premium-vape-mod', 'Advanced vaping device with customizable settings.', 79.99, 15, vapes_id, ARRAY['/images/products/vape2.jpg'], false, 'VPE002'),
    ('E-Liquid Collection', 'e-liquid-collection', 'Set of premium e-liquids in various flavors.', 34.99, 40, vapes_id, ARRAY['/images/products/vape3.jpg'], false, 'VPE003')
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Insert Product Tags
INSERT INTO product_tags (name, slug) VALUES
('New Arrival', 'new-arrival'),
('Best Seller', 'best-seller'),
('Sale', 'sale'),
('Premium', 'premium'),
('Handmade', 'handmade')
ON CONFLICT (slug) DO NOTHING;

-- Connect Products to Tags
DO $$
DECLARE
    product_id UUID;
    tag_id UUID;
BEGIN
    -- Best Seller Tag for Premium Hookah Set
    SELECT id INTO product_id FROM products WHERE slug = 'premium-hookah-set';
    SELECT id INTO tag_id FROM product_tags WHERE slug = 'best-seller';
    
    IF product_id IS NOT NULL AND tag_id IS NOT NULL THEN
        INSERT INTO product_to_tags (product_id, tag_id) 
        VALUES (product_id, tag_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Premium Tag for Premium Hookah Set
    SELECT id INTO tag_id FROM product_tags WHERE slug = 'premium';
    
    IF product_id IS NOT NULL AND tag_id IS NOT NULL THEN
        INSERT INTO product_to_tags (product_id, tag_id) 
        VALUES (product_id, tag_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- New Arrival Tag for Portable Mini Hookah
    SELECT id INTO product_id FROM products WHERE slug = 'portable-mini-hookah';
    SELECT id INTO tag_id FROM product_tags WHERE slug = 'new-arrival';
    
    IF product_id IS NOT NULL AND tag_id IS NOT NULL THEN
        INSERT INTO product_to_tags (product_id, tag_id) 
        VALUES (product_id, tag_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Sale Tag for Traditional Hookah
    SELECT id INTO product_id FROM products WHERE slug = 'traditional-hookah';
    SELECT id INTO tag_id FROM product_tags WHERE slug = 'sale';
    
    IF product_id IS NOT NULL AND tag_id IS NOT NULL THEN
        INSERT INTO product_to_tags (product_id, tag_id) 
        VALUES (product_id, tag_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Handmade Tag for Traditional Hookah
    SELECT id INTO tag_id FROM product_tags WHERE slug = 'handmade';
    
    IF product_id IS NOT NULL AND tag_id IS NOT NULL THEN
        INSERT INTO product_to_tags (product_id, tag_id) 
        VALUES (product_id, tag_id)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
