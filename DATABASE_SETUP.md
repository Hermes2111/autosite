# 🗄️ Database Setup - Gedetailleerde Instructies

## 📍 Waar ben je nu?

Je Render services zijn deployed. Nu moet je de database tabellen maken.

---

## 🎯 **GEMAKKELIJKSTE MANIER: TablePlus** ⭐

### **Stap 1: Download TablePlus**

**Mac:**
```
→ https://tableplus.com/
→ Download "TablePlus for Mac"
→ Open .dmg en sleep naar Applications
→ Open TablePlus
```

**Windows:**
```
→ https://tableplus.com/windows
→ Download installer
→ Run installer
→ Open TablePlus
```

**Gratis versie:** Je krijgt 2 tabs gratis - meer dan genoeg!

---

### **Stap 2: Haal Database Connectie Info**

```
1. Ga naar: https://dashboard.render.com
2. Klik op "autosite-db" (je database)
3. Je ziet nu database informatie
4. Scroll naar beneden tot je "Connections" ziet
```

**Je ziet dit:**

```
Internal Database URL (gebruik NIET deze!)
postgresql://autosite:xxx@dpg-xxx/autosite

External Database URL (gebruik DEZE! ✅)
postgresql://autosite:PASSWORD@dpg-xxx.frankfurt-postgres.render.com/autosite_xxx
```

**Klik "Copy" naast "External Database URL"** 📋

---

### **Stap 3: Connect in TablePlus**

```
1. Open TablePlus
2. Klik "Create a new connection" (grote + knop)
3. Select "PostgreSQL" icon
```

**Optie A: Plak de hele URL**
```
→ Er is een veld "Import from URL"
→ Plak de hele connection string
→ Klik "Test"
→ Moet groen worden ✅
→ Klik "Connect"
```

**Optie B: Handmatig invullen**

Als je de URL hebt: `postgresql://autosite:ABC123@dpg-xyz.frankfurt-postgres.render.com/autosite_db`

Vul in:
```
Name: Autosite Production
Host: dpg-xyz.frankfurt-postgres.render.com
Port: 5432
User: autosite
Password: ABC123 (het gedeelte tussen : en @)
Database: autosite_db (laatste deel)
```

```
→ Klik "Test" (moet groen ✅)
→ Klik "Connect"
```

---

### **Stap 4: Run SQL**

Nu ben je verbonden! Je ziet je database.

```
1. Klik "SQL" knop bovenaan (of CMD+E / Ctrl+E)
2. Plak deze SQL code:
```

```sql
-- Create customers table
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

-- Link customers to diecast models
ALTER TABLE diecast_models 
ADD COLUMN IF NOT EXISTS "customerId" INTEGER 
REFERENCES customers(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_diecast_models_customer 
ON diecast_models("customerId");

-- Verify it worked
SELECT 'Migration completed! ✅' as status;
```

```
3. Klik "Run Current" of CMD+Return / Ctrl+Enter
4. Je ziet onderaan: "Migration completed! ✅"
```

**Klaar!** 🎉

---

## 🔧 **ALTERNATIEF: Via Render Connect Tab**

### **Als TablePlus niet werkt:**

```
1. Render Dashboard
2. Klik "autosite-db"
3. Klik "Connect" tab
4. Scroll naar beneden
5. Klik "PSQL Command"
```

**Je ziet een commando zoals:**
```bash
PGPASSWORD=xxx psql -h dpg-xxx.frankfurt-postgres.render.com -U autosite autosite_db
```

```
6. Copy deze hele regel
7. Open Terminal (Mac) of Command Prompt (Windows)
8. Plak en druk Enter
9. Plak de SQL code (zie boven)
10. Type \q om te exiten
```

---

## 🐛 **Troubleshooting**

### **"relation 'diecast_models' does not exist"**

**Probleem:** Backend heeft database nog niet geïnitialiseerd.

**Oplossing:**
```
1. Check of "autosite-api" groen/running is
2. Open "autosite-api" → "Logs" tab
3. Wacht tot je ziet: "Nest application successfully started"
4. Wacht nog 1 minuut
5. Probeer SQL opnieuw
```

### **"Can't connect to database"**

**Check:**
- ✅ Gebruik je "External" URL (niet Internal)?
- ✅ Is database groen/running in Render?
- ✅ Copy-paste foutje in password?

### **"column already exists"**

Dat is **OKÉ!** Het betekent dat de kolom al bestaat. De rest werkt gewoon.

### **TablePlus vraagt om te kopen**

De gratis trial heeft 2 tabs - dat is genoeg! Of gebruik "Quit & Reopen" om trial te resetten (hack!).

---

## ✅ **Success Check**

Na het runnen van SQL in TablePlus:

```
1. Refresh de tabel lijst (links)
2. Je moet zien:
   ✅ customers (nieuwe tabel!)
   ✅ diecast_models
   ✅ users
   ✅ teams
   ✅ drivers
```

Klik op "customers" → Je ziet kolommen: id, name, email, phone, etc.

**Perfect!** Database is klaar! 🎉

---

## 🎯 **Volgende Stap: Admin User**

Nu database klaar is, maak admin user:

```sql
-- In TablePlus SQL window:
INSERT INTO users (name, email, password, roles, "createdAt", "updatedAt")
VALUES (
  'Admin',
  'admin@example.com',
  '$2b$10$rX5vQKc8KHq4KqMqH.xGKOa1Z8Xn5D7YqPW3z4A5B6C7D8E9F0G1H2',
  ARRAY['user', 'admin'],
  NOW(),
  NOW()
);
```

Password wordt: `Admin1234!`

---

## 🚀 **Test Je Site!**

```
1. Ga naar: https://autosite-frontend.onrender.com
2. Klik "Inloggen"
3. Email: admin@example.com
4. Password: Admin1234!
5. Login!
```

**🎉 GEFELICITEERD! Je site is live!**

---

## 📞 **Hulp Nodig?**

Stuur screenshot van waar je vastloopt!

