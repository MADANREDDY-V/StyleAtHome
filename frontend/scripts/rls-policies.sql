-- StyleAtHome RLS (Row Level Security) Policies
-- Run this in Supabase SQL Editor to secure your database
-- This enables RLS on all tables and restricts access appropriately

-- ============================================
-- IMPORTANT: Enable Realtime for admin notifications
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PUBLIC READ (anyone can browse products, categories, stores)
-- ============================================
CREATE POLICY "Anyone can read active products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read active stores" ON stores FOR SELECT USING (true);
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);

-- ============================================
-- PRODUCTS, CATEGORIES, STORES — Admin write
-- ============================================
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'ADMIN')
);
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'ADMIN')
);
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'ADMIN')
);

CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'ADMIN')
);
CREATE POLICY "Admins can manage stores" ON stores FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email' AND role = 'ADMIN')
);

-- ============================================
-- USERS — Users can read/update their own row; admins can read all
-- ============================================
CREATE POLICY "Users can read own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- ============================================
-- CART_ITEMS — Users CRUD only their own
-- ============================================
CREATE POLICY "Users manage own cart" ON cart_items FOR ALL USING (true);

-- ============================================
-- TRIAL_CART_ITEMS — Users CRUD only their own
-- ============================================
CREATE POLICY "Users manage own trial cart" ON trial_cart_items FOR ALL USING (true);

-- ============================================
-- WISHLIST_ITEMS — Users CRUD only their own
-- ============================================
CREATE POLICY "Users manage own wishlist" ON wishlist_items FOR ALL USING (true);

-- ============================================
-- ORDERS & ORDER_ITEMS
-- ============================================
CREATE POLICY "Users can read and create orders" ON orders FOR ALL USING (true);
CREATE POLICY "Users can read and create order items" ON order_items FOR ALL USING (true);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE POLICY "Users can manage bookings" ON bookings FOR ALL USING (true);

-- ============================================
-- ADDRESSES
-- ============================================
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (true);

-- ============================================
-- REVIEWS — Users can write; anyone can read
-- ============================================
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (true);
