-- Supabase Schema Migration for Gastronomic SaaS Application (ACFC Kitchen)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: ingredients
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    nutritional_category VARCHAR(100),
    unit VARCHAR(50) NOT NULL DEFAULT 'gr', -- 'gr', 'ml', 'ud', etc.
    current_stock NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    min_stock NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    id_mercadona VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: supplier_prices
CREATE TABLE IF NOT EXISTS supplier_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    price_per_unit NUMERIC(12, 6) NOT NULL, -- price per base unit (e.g. per gram/ml/unit)
    presentation VARCHAR(100), -- "1 KG", "500 ML", etc.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(supplier_id, ingredient_id)
);

-- 4. Table: recipes
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100), -- 'PASTA', 'RICE', 'GUISOS', 'MEAT_FISH', 'VEGETARIANO', 'General'
    portions INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: recipe_ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL, -- quantity per portion (or per recipe portions count)
    unit VARCHAR(50) NOT NULL,
    UNIQUE(recipe_id, ingredient_id)
);

-- 6. Table: menu_planning
CREATE TABLE IF NOT EXISTS menu_planning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planning_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL, -- 'lunch', 'dinner', 'side', 'breakfast'
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
    servings INTEGER NOT NULL DEFAULT 10, -- number of planned players/diners (pax)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(planning_date, meal_type, recipe_id)
);

-- 7. Table: purchase_budgets
CREATE TABLE IF NOT EXISTS purchase_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget_amount NUMERIC(12, 2) NOT NULL,
    spent_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'closed', 'draft'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- 8. Table: purchase_orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    budget_id UUID REFERENCES purchase_budgets(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'received', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Table: purchase_order_items (Helper junction table for orders detail)
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    price_per_unit NUMERIC(12, 6) NOT NULL,
    total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
    UNIQUE(purchase_order_id, ingredient_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_supplier_prices_ingredient ON supplier_prices(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_menu_planning_date ON menu_planning(planning_date);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order ON purchase_order_items(purchase_order_id);

-- Enable Row Level Security (RLS)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Enable public read/write policies for rapid development (bypass in production)
CREATE POLICY "Allow public read on suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public write on suppliers" ON suppliers FOR ALL USING (true);

CREATE POLICY "Allow public read on ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public write on ingredients" ON ingredients FOR ALL USING (true);

CREATE POLICY "Allow public read on supplier_prices" ON supplier_prices FOR SELECT USING (true);
CREATE POLICY "Allow public write on supplier_prices" ON supplier_prices FOR ALL USING (true);

CREATE POLICY "Allow public read on recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Allow public write on recipes" ON recipes FOR ALL USING (true);

CREATE POLICY "Allow public read on recipe_ingredients" ON recipe_ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public write on recipe_ingredients" ON recipe_ingredients FOR ALL USING (true);

CREATE POLICY "Allow public read on menu_planning" ON menu_planning FOR SELECT USING (true);
CREATE POLICY "Allow public write on menu_planning" ON menu_planning FOR ALL USING (true);

CREATE POLICY "Allow public read on purchase_budgets" ON purchase_budgets FOR SELECT USING (true);
CREATE POLICY "Allow public write on purchase_budgets" ON purchase_budgets FOR ALL USING (true);

CREATE POLICY "Allow public read on purchase_orders" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public write on purchase_orders" ON purchase_orders FOR ALL USING (true);

CREATE POLICY "Allow public read on purchase_order_items" ON purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Allow public write on purchase_order_items" ON purchase_order_items FOR ALL USING (true);
