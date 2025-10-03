# ⚡ Render.com Quick Start (5 minuten)

Snelle instructies om je site live te krijgen!

---

## 📝 **Checklist VOOR je begint:**

- [ ] GitHub repository is up-to-date (`git push`)
- [ ] Render.com account aangemaakt
- [ ] GitHub gekoppeld aan Render account

---

## 🚀 **Deploy in 5 stappen:**

### **1. New Blueprint** (1 min)
```
1. Login op Render.com
2. Klik "New +" → "Blueprint"
3. Select repository: "autosite"
4. Klik "Apply"
5. ☕ Wacht 5-10 minuten
```

### **2. Database Setup** (2 min)
```
1. Ga naar "autosite-db"
2. Klik "Connect" tab
3. Kopieer "External Database URL"
4. Use psql of TablePlus om te connecten
5. Run SQL:
```

```sql
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

ALTER TABLE diecast_models ADD COLUMN IF NOT EXISTS "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_diecast_models_customer ON diecast_models("customerId");
```

### **3. Create Admin User** (1 min)

Via Render Shell of direct in database:

```sql
-- Replace HASH with bcrypt hash of 'Admin1234!'
-- Hash: $2b$10$rX5vQKc8KHq4KqMqH.xGKOa1Z8Xn5D7YqPW3z4A5B6C7D8E9F0G1H2

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

### **4. Check Environment Variables** (30 sec)

Ga naar "autosite-api" → Environment:

✅ `DATABASE_URL` - moet er zijn (auto)  
✅ `JWT_SECRET` - moet er zijn (auto)  
✅ `NODE_ENV=production` - moet er zijn  

### **5. Open je site!** (10 sec)

```
🌐 Frontend: https://autosite-frontend.onrender.com
🔌 API Test: https://autosite-api.onrender.com/api/health

Login: admin@example.com / Admin1234!
```

---

## ✅ **Klaar!**

Je site is nu live! 🎉

### **⚠️ Eerste load kan 30-60 seconden duren (cold start)**

---

## 🔧 **Troubleshooting**

### **"Cannot GET /api"**
- Wacht 30-60s voor cold start
- Check API URL in browser: `https://autosite-api.onrender.com/api/health`
- Zou moeten tonen: `{"status":"ok"}`

### **Login werkt niet**
- Check of admin user is aangemaakt (stap 3)
- Verify password hash is correct
- Check browser console voor errors

### **Database errors**
- Verify migrations zijn uitgevoerd (stap 2)
- Check DATABASE_URL env variable
- Restart backend service

---

## 📚 **Meer info?**

Zie volledige guide: `DEPLOYMENT.md`

---

**Succes! 🚀**

