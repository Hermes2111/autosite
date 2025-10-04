-- 🗄️ Complete Database Setup voor Autosite
-- Run dit script in TablePlus of psql

-- Clean up (optioneel - uncomment als je opnieuw wilt beginnen)
-- DROP TABLE IF EXISTS model_driver CASCADE;
-- DROP TABLE IF EXISTS diecast_models CASCADE;
-- DROP TABLE IF EXISTS customers CASCADE;
-- DROP TABLE IF EXISTS drivers CASCADE;
-- DROP TABLE IF EXISTS teams CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    roles TEXT DEFAULT 'user',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customers Table (for sales tracking)
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    notes TEXT,
    "isRepeatCustomer" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Diecast Models Table (main table with all features)
CREATE TABLE IF NOT EXISTS diecast_models (
    id SERIAL PRIMARY KEY,
    year VARCHAR(255) NOT NULL,
    what VARCHAR(255) NOT NULL,
    scale VARCHAR(255),
    specs VARCHAR(255),
    numbers VARCHAR(255),
    price VARCHAR(255),
    images TEXT[],
    "teamId" INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Sales tracking fields
    "isSold" BOOLEAN DEFAULT FALSE,
    "soldDate" TIMESTAMP,
    "soldPrice" VARCHAR(255),
    "soldTo" VARCHAR(255),
    "soldLocation" VARCHAR(255),
    "shippingCost" VARCHAR(255),
    fees VARCHAR(255),
    "isPaid" BOOLEAN DEFAULT FALSE,
    "saleNotes" TEXT,
    "salesChannel" VARCHAR(255),
    "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Model-Driver Junction Table (many-to-many)
CREATE TABLE IF NOT EXISTS model_driver (
    "diecastModelId" INTEGER NOT NULL REFERENCES diecast_models(id) ON DELETE CASCADE,
    "driverId" INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    PRIMARY KEY ("diecastModelId", "driverId")
);

-- 7. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_diecast_models_team ON diecast_models("teamId");
CREATE INDEX IF NOT EXISTS idx_diecast_models_customer ON diecast_models("customerId");
CREATE INDEX IF NOT EXISTS idx_diecast_models_sold ON diecast_models("isSold");
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 8. Create Default Admin User (password: admin123)
-- Password hash for "admin123" using argon2
INSERT INTO users (email, name, password, roles)
VALUES (
    'admin@autosite.com',
    'Admin',
    '$argon2id$v=19$m=65536,t=3,p=4$8u5QKgVgrPVeq/X+/98bAw$xCMPFRrXC6rPzGJNXhFKBOzQeRhXQvmgYLPD+/b/Kzs',
    'admin,user'
)
ON CONFLICT (email) DO NOTHING;

-- 9. Insert Some Sample Teams (optional)
INSERT INTO teams (name) VALUES 
    ('Ferrari'),
    ('Red Bull Racing'),
    ('Mercedes'),
    ('McLaren'),
    ('Alpine'),
    ('Aston Martin'),
    ('Williams'),
    ('AlphaTauri'),
    ('Alfa Romeo'),
    ('Haas')
ON CONFLICT (name) DO NOTHING;

-- 10. Verify Setup
SELECT 
    'Database setup completed! ✅' as status,
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM teams) as teams_count,
    (SELECT COUNT(*) FROM diecast_models) as models_count,
    (SELECT COUNT(*) FROM customers) as customers_count;

-- 🎉 Done! Your database is ready to use!
-- Login credentials: admin@autosite.com / admin123

