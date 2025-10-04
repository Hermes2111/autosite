# 🚀 Render.com Deployment Guide

Complete stap-voor-stap instructies om je F1 Collectie site te deployen op Render.com (100% gratis!)

---

## 📋 **Vereisten**

- ✅ GitHub account
- ✅ Render.com account (maak gratis aan op [render.com](https://render.com))
- ✅ Je code gepusht naar GitHub

---

## 🎯 **Deployment Stappen**

### **STAP 1: Maak Render Account**

1. Ga naar [render.com](https://render.com)
2. Klik "Get Started"
3. Sign up met je GitHub account (aanbevolen) of email
4. Verify je email

---

### **STAP 2: Connect GitHub Repository**

1. Klik op **"New +"** (rechtsboven)
2. Selecteer **"Blueprint"**
3. Klik **"Connect GitHub"**
4. Autoriseer Render om je repositories te zien
5. Zoek en selecteer: **`autosite`** repository
6. Klik **"Connect"**

---

### **STAP 3: Deploy met Blueprint**

Render detecteert automatisch `render.yaml` en maakt:

✅ **autosite-api** (Backend server)  
✅ **autosite-frontend** (Frontend site)  
✅ **autosite-db** (PostgreSQL database)

1. Review de services
2. Klik **"Apply"**
3. Wacht 5-10 minuten voor eerste deploy

---

### **STAP 4: Database Migratie Uitvoeren**

Na de eerste deploy, voer database setup uit:

1. Ga naar **Dashboard** → **autosite-db**
2. Klik **"Connect"** → Kopieer "External Database URL"
3. Download een PostgreSQL client (bijv. [TablePlus](https://tableplus.com/) of [pgAdmin](https://www.pgadmin.org/))
4. Connect met de database URL
5. Voer deze SQL uit:

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

-- Add customerId column to diecast_models (if not exists)
ALTER TABLE diecast_models ADD COLUMN IF NOT EXISTS "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_diecast_models_customer ON diecast_models("customerId");
```

**Of via Render Shell:**

1. Ga naar **autosite-api** service
2. Klik **"Shell"** tab
3. Run: `node dist/migration.js` (als je een migration script hebt)

---

### **STAP 5: Environment Variables Instellen**

#### **Backend (autosite-api):**

De meeste zijn al automatisch ingesteld, maar controleer:

1. Ga naar **autosite-api** → **Environment**
2. Verifieer deze variables:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | Auto (van database) |
| `JWT_SECRET` | Auto-generated | Auto-generated |
| `NODE_ENV` | `production` | render.yaml |
| `PORT` | `3000` | render.yaml |

3. **Optioneel: Google OAuth** (als je Google login wilt):
   - Klik **"Add Environment Variable"**
   - `GOOGLE_CLIENT_ID`: jouw Google client ID
   - `GOOGLE_CLIENT_SECRET`: jouw Google client secret
   - `GOOGLE_CALLBACK_URL`: `https://autosite-api.onrender.com/api/auth/google/callback`

4. Klik **"Save Changes"**

---

### **STAP 6: Update Frontend API URL**

De frontend moet weten waar je backend draait.

#### **Optie A: Via Environment Variable (Aanbevolen)**

1. Ga naar **autosite-frontend** service
2. Klik **"Environment"**
3. Add variable:
   - Key: `API_URL`
   - Value: `https://autosite-api.onrender.com`
4. Save

Dan update `web/apiClient.js`:

```javascript
const baseURL = import.meta.env?.API_URL || 
                localStorage.getItem('apiBaseUrl') || 
                'https://autosite-api.onrender.com/api';
```

#### **Optie B: Hardcoded (Simpeler)**

Edit `web/apiClient.js`:

```javascript
// Change this line:
const baseURL = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000/api';

// To:
const baseURL = 'https://autosite-api.onrender.com/api';
```

Commit en push naar GitHub → Auto-redeploy!

---

### **STAP 7: Maak Admin Account**

Via Render Shell:

1. Ga naar **autosite-api** → **Shell**
2. Run:

```bash
# Start Node REPL
node

# Voer uit:
const bcrypt = require('bcrypt');
bcrypt.hash('Admin1234!', 10).then(hash => console.log(hash));
```

3. Kopieer de hash
4. Connect naar database (stap 4)
5. Insert admin user:

```sql
INSERT INTO users (name, email, password, roles, "createdAt", "updatedAt")
VALUES (
  'Admin',
  'admin@example.com',
  'PASTE_HASH_HERE',
  ARRAY['user', 'admin'],
  NOW(),
  NOW()
);
```

---

### **STAP 8: Test Je Site!**

1. Open: `https://autosite-frontend.onrender.com`
2. Login met: `admin@example.com` / `Admin1234!`
3. Test alle functies:
   - ✅ Items bekijken
   - ✅ Admin panel
   - ✅ Klanten toevoegen
   - ✅ Quick sale
   - ✅ Dashboard

---

## 🎉 **Gefeliciteerd!**

Je site is nu live! 🚀

**Jouw URLs:**
- 🌐 Frontend: `https://autosite-frontend.onrender.com`
- 🔌 API: `https://autosite-api.onrender.com/api`
- 🗄️ Database: Render managed PostgreSQL

---

## 🔄 **Auto-Deploy**

Elke keer dat je `git push` doet naar GitHub:
- ✅ Render detecteert changes
- ✅ Rebuild & redeploy automatisch
- ✅ ~2-5 minuten deploy tijd

---

## ⚠️ **Belangrijk: Free Tier Limitaties**

### **Backend Sleep Mode:**
- ⏰ Server slaapt na **15 minuten inactiviteit**
- 🥶 **Cold start: 30-60 seconden** bij eerste request
- 💡 **Oplossing:** Dagelijks gebruik houdt het wakker

### **Database:**
- 💾 **1GB storage** (genoeg voor ~5000 items)
- 🔒 **90 dagen expiry** voor inactieve databases

### **Upgrade Opties:**
Als je cold starts wilt vermijden:
- 💰 **$7/maand** voor altijd-aan backend
- 💳 Upgrade via Dashboard → Billing

---

## 🐛 **Troubleshooting**

### **1. "Cannot GET /api" error**

**Probleem:** Frontend kan backend niet bereiken  
**Oplossing:**
- Check API URL in `apiClient.js`
- Verify backend is running (groen in Render dashboard)
- Check CORS instellingen in `backend/src/main.ts`

### **2. Database connection errors**

**Probleem:** Backend kan niet verbinden met database  
**Oplossing:**
- Verify `DATABASE_URL` env variable is set
- Check database is running (groen in Render dashboard)
- Run migrations (Stap 4)

### **3. Cold start te traag**

**Probleem:** 30-60s wachttijd  
**Oplossing:**
- Upgrade naar paid plan ($7/maand)
- Of: Use "ping service" om server wakker te houden

### **4. Images niet zichtbaar**

**Probleem:** Uploads worden niet opgeslagen  
**Oplossing:**
- Render free tier heeft **geen persistent storage**
- **Oplossing A:** Gebruik Cloudinary voor image hosting
- **Oplossing B:** Upgrade naar paid plan met persistent disk

---

## 📚 **Volgende Stappen**

### **Custom Domain (Optioneel):**
1. Koop domain (bijv. via Namecheap)
2. Render → Settings → Custom Domain
3. Add je domain
4. Update DNS records

### **Monitoring:**
- Render dashboard toont logs en metrics
- Setup email alerts voor downtime

### **Backups:**
- Database backups automatisch in paid plan
- Free tier: Maak handmatige backups via `pg_dump`

---

## 💡 **Tips**

✅ **Push regelmatig naar GitHub** - Auto deploys!  
✅ **Check Render logs** - Zie errors realtime  
✅ **Test lokaal eerst** - Minder deploy cycles  
✅ **Monitor database size** - 1GB limit  
✅ **Use .env.example** - Deel nooit echte secrets

---

## 🆘 **Hulp Nodig?**

- 📖 [Render Docs](https://render.com/docs)
- 💬 [Render Community](https://community.render.com/)
- 📧 Email: support@render.com

---

**Succes met je deployment! 🎉**



