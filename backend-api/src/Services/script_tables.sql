/*
powered by  : (c) 2025, Ramadan Ismael - All rights reserved!!
to          : TEKA AWAY
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- auto uuid



-- USERS
CREATE TABLE IF NOT EXISTS tbUsers
(
    id UUID PRIMARY KEY,    
    username VARCHAR(50) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NULL,
    roles VARCHAR(10) NOT NULL DEFAULT 'user',
    password_hash VARCHAR(255) NOT NULL,
    images VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NULL
);
CREATE INDEX idx_tbUsers_roles ON tbUsers(roles);
-- USERS



-- REFRESH TOKEN
CREATE TABLE IF NOT EXISTS tbRefreshToken
(
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES tbUsers(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);
-- REFRESH TOKEN



-- INGREDIENTS
CREATE TABLE IF NOT EXISTS tbIngredients (
    id UUID PRIMARY KEY,    
    item_name VARCHAR(50) NOT NULL,    
    batch_number VARCHAR(50) NULL,
    package_size DECIMAL(5,2) DEFAULT 0.00 CHECK(package_size >= 0.00),    
    unit_of_measure VARCHAR(10),        
    quantity NUMERIC DEFAULT 0 CHECK(quantity >= 0),
    unit_cost_price DECIMAL(10,2) DEFAULT 0.00 CHECK(unit_cost_price >= 0.00),
    total_cost_price DECIMAL(12,2) GENERATED ALWAYS AS 
        (quantity * unit_cost_price) STORED,    
    expiration_at TIMESTAMPTZ NULL,    
    expiration_status VARCHAR(25) NULL,    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,    
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,    
    updated_at TIMESTAMPTZ DEFAULT NULL,

    UNIQUE (item_name, expiration_at),
    UNIQUE (item_name, batch_number)
);
CREATE INDEX idx_ingredients_item_name ON tbIngredients(item_name);
-- INGREDIENTS



-- PRODUCTS
CREATE TABLE IF NOT EXISTS tbProducts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NULL,    
    price DECIMAL(10,2) DEFAULT 0.00 CHECK(price >= 0.00),
    category VARCHAR(50) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_item_name ON tbProducts(item_name);
--PRODUCTS



-- INGREDIENTS PRODUCTS
CREATE TABLE IF NOT EXISTS tbIngredientsProducts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES tbProducts(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES tbIngredients(id) ON DELETE CASCADE,
    quantity NUMERIC DEFAULT 0 CHECK(quantity >= 0),
    updated_at TIMESTAMPTZ DEFAULT NULL,
    
    UNIQUE(product_id, ingredient_id)
);
CREATE INDEX idx_ingredientsproducts_product_id ON tbIngredientsProducts(product_id);
CREATE INDEX idx_ingredientsproducts_ingredient ON tbIngredientsProducts(ingredient_id);
-- INGREDIENTS PRODUCTS



-- CASH REGISTER
CREATE TYPE cash_name_enum AS ENUM ('opened', 'closed', 'cash in', 'cash out');

CREATE TABLE IF NOT EXISTS tbCashRegister (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_opened BOOLEAN NOT NULL DEFAULT TRUE,
    user_id UUID NOT NULL REFERENCES tbUsers(id) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX unique_idx_is_opened_per_user ON tbCashRegister(user_id) WHERE is_opened = TRUE;
CREATE INDEX idx_cash_registr_user_id ON tbCashRegister(user_id);
CREATE INDEX idx_cash_registr_is_opened ON tbCashRegister(is_opened);

/* DETAILS */
CREATE TABLE IF NOT EXISTS tbCashRegisterDetails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_register_id UUID NOT NULL REFERENCES tbCashRegister(id) ON DELETE CASCADE,
    cash_name cash_name_enum NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00 CHECK(amount >= 0.00),
    description TEXT NULL,
    is_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_time TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_crd_cash_register_id ON tbCashRegisterDetails(cash_register_id);
CREATE INDEX idx_crd_cash_name ON tbCashRegisterDetails(cash_name);
CREATE INDEX idx_crd_date_time ON tbCashRegisterDetails (date_time);
-- CASH REGISTER



-- SALES
CREATE TABLE IF NOT EXISTS tbSales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    
    cash_register_id UUID NOT NULL REFERENCES tbCashRegister(id) ON DELETE CASCADE    
);
CREATE INDEX idx_sales_cash_id ON tbSales(cash_register_id);
-- SALES



-- COSTUMERS
CREATE TABLE IF NOT EXISTS tbCustomers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),    
    sales_id UUID UNIQUE NOT NULL REFERENCES tbSales(id) ON DELETE CASCADE,
    fullName VARCHAR(50) NOT NULL DEFAULT 'CLIENTE FINAL',
    phone_number VARCHAR(20)
);

CREATE OR REPLACE FUNCTION set_default_fullName()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fullName IS NULL OR TRIM(NEW.fullName) = '' THEN
        NEW.fullname := 'CLIENTE FINAL';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_default_fullname
BEFORE INSERT OR UPDATE ON tbCustomers
FOR EACH ROW
EXECUTE FUNCTION set_default_fullname();
-- COSTUMERS



-- ORDERS
CREATE TYPE order_status AS ENUM ('canceled', 'pending', 'paid');

CREATE TABLE IF NOT EXISTS tbOrders (
    order_number BIGINT GENERATED ALWAYS AS IDENTITY,
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_id UUID NOT NULL REFERENCES tbSales(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES tbProducts(id) ON DELETE RESTRICT, 
    quantity NUMERIC NOT NULL DEFAULT 1 CHECK(quantity >= 1),
    unit_price DECIMAL(10,2) DEFAULT 0.00 CHECK(unit_price >= 0.00),
    total_to_pay DECIMAL(12,2) GENERATED ALWAYS AS 
        (quantity * unit_price) STORED, 
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    status order_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(sales_id, product_id)
);
CREATE INDEX idx_order_sales_id ON tbOrders(sales_id);
CREATE INDEX idx_order_product_id ON tbOrders(product_id);
CREATE INDEX idx_order_status ON tbOrders(status);
-- ORDERS



-- PAYMENT METHODS
CREATE TYPE pymt_method AS ENUM ('cash', 'eMola', 'mPesa');

CREATE TABLE IF NOT EXISTS tbPaymentSales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sales_id UUID NOT NULL REFERENCES tbSales(id) ON DELETE RESTRICT,
    method pymt_method NOT NULL DEFAULT 'cash',
    total_paid DECIMAL(10,2) DEFAULT 0.00 CHECK(total_paid >= 0.00),
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP    
);
CREATE INDEX idx_pymtMethod_sales_id ON tbPaymentSales(sales_id);
CREATE INDEX idx_pymtMethod_method ON tbPaymentSales(method);
-- PAYMENT METHODS