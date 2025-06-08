-- Seed data for the ShopBot e-commerce platform
-- This script populates the database with initial categories and products

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Computers, phones, gaming, and electronic devices'),
('Clothing', 'Fashion, shoes, and accessories'),
('Home & Garden', 'Home appliances, furniture, and garden supplies'),
('Books', 'Physical and digital books across all genres'),
('Sports & Outdoors', 'Fitness equipment, outdoor gear, and sports accessories'),
('Beauty & Personal Care', 'Skincare, makeup, and personal hygiene products'),
('Pet Supplies', 'Food, toys, and accessories for pets'),
('Tools & Hardware', 'Hand tools, power tools, and hardware supplies'),
('Automotive', 'Car accessories, parts, and maintenance supplies'),
('Baby & Kids', 'Toys, clothing, and supplies for children'),
('Office Supplies', 'Stationery, furniture, and office equipment'),
('Musical Instruments', 'Instruments, audio equipment, and music accessories'),
('Health & Wellness', 'Fitness trackers, supplements, and wellness products'),
('Jewelry & Watches', 'Fine jewelry, fashion jewelry, and timepieces'),
('Toys & Games', 'Board games, video games, and educational toys'),
('Garden & Outdoor', 'Outdoor furniture, grills, and garden tools'),
('Craft & Hobby', 'Art supplies, crafting materials, and hobby equipment'),
('Food & Beverages', 'Kitchen appliances and food preparation tools'),
('Travel & Luggage', 'Suitcases, travel accessories, and gear')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products (first 20 products)
INSERT INTO products (name, description, price, brand, category_id, in_stock, stock_quantity, rating) VALUES
('iPhone 15 Pro', 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system', 999.00, 'Apple', 1, true, 50, 4.8),
('Samsung Galaxy S24 Ultra', 'Premium Android phone with S Pen, 200MP camera, and AI features', 1199.00, 'Samsung', 1, true, 30, 4.7),
('MacBook Air M3', '13-inch laptop with M3 chip, 18-hour battery life, and Liquid Retina display', 1299.00, 'Apple', 1, true, 25, 4.9),
('Dell XPS 13', 'Ultra-portable laptop with Intel Core i7, 16GB RAM, and InfinityEdge display', 899.00, 'Dell', 1, true, 40, 4.6),
('iPad Pro 12.9"', 'Professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support', 1099.00, 'Apple', 1, true, 35, 4.8),
('Sony WH-1000XM5', 'Premium noise-canceling headphones with 30-hour battery life', 399.00, 'Sony', 1, true, 60, 4.7),
('AirPods Pro 2nd Gen', 'Wireless earbuds with active noise cancellation and spatial audio', 249.00, 'Apple', 1, true, 80, 4.8),
('Nintendo Switch OLED', 'Gaming console with 7-inch OLED screen and enhanced audio', 349.00, 'Nintendo', 1, true, 45, 4.6),
('PlayStation 5', 'Next-gen gaming console with 4K gaming and ultra-fast SSD', 499.00, 'Sony', 1, false, 0, 4.9),
('Xbox Series X', 'Powerful gaming console with 4K gaming at 120fps', 499.00, 'Microsoft', 1, true, 20, 4.8),
('Levi''s 501 Original Jeans', 'Classic straight-leg jeans in authentic indigo denim', 89.00, 'Levi''s', 2, true, 100, 4.5),
('Nike Air Force 1', 'Iconic basketball sneakers with classic white leather design', 110.00, 'Nike', 2, true, 75, 4.7),
('Adidas Ultraboost 22', 'Premium running shoes with Boost midsole and Primeknit upper', 190.00, 'Adidas', 2, true, 60, 4.6),
('Patagonia Better Sweater', 'Fleece jacket made from recycled polyester with classic styling', 99.00, 'Patagonia', 2, true, 40, 4.8),
('Uniqlo Heattech Crew Neck T-Shirt', 'Thermal base layer with moisture-wicking technology', 14.90, 'Uniqlo', 2, true, 200, 4.4),
('Dyson V15 Detect', 'Cordless vacuum with laser dust detection and powerful suction', 749.00, 'Dyson', 3, true, 15, 4.7),
('Instant Pot Duo 7-in-1', 'Multi-use pressure cooker, slow cooker, rice cooker, and more', 99.00, 'Instant Pot', 3, true, 50, 4.6),
('Philips Hue Smart Bulb Starter Kit', 'Smart LED bulbs with 16 million colors and voice control', 199.00, 'Philips', 3, true, 30, 4.5),
('iRobot Roomba j7+', 'Smart robot vacuum with obstacle avoidance and self-emptying base', 849.00, 'iRobot', 3, true, 20, 4.4),
('Nest Learning Thermostat', 'Smart thermostat that learns your schedule and saves energy', 249.00, 'Google', 3, true, 25, 4.6)
ON CONFLICT DO NOTHING;

-- Create a demo user
INSERT INTO users (name, email, password_hash) VALUES
('Demo User', 'demo@shopbot.com', '$2b$10$demo_hash_for_password_demo123')
ON CONFLICT (email) DO NOTHING;
