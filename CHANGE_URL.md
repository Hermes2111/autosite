# 🌐 Web Adres Wijzigen

## 📋 **2 Opties:**

---

## ✅ **OPTIE 1: Render Subdomain (Gratis!)**

Wijzig van `autosite-frontend.onrender.com` naar `jouw-naam.onrender.com`

### **Stap 1: Wijzig Service Namen in Render**

#### **Frontend:**
```
1. Render Dashboard → "autosite-frontend"
2. Klik "Settings" tab
3. Bij "Name" veld, verander naar bijv: "f1-collection"
4. Klik "Save Changes"
```

**Nieuwe URL:** `https://f1-collection.onrender.com` 🎉

#### **Backend:**
```
1. Render Dashboard → "autosite-api"
2. Settings tab
3. Verander naam naar: "f1-collection-api"
4. Save Changes
```

**Nieuwe API URL:** `https://f1-collection-api.onrender.com`

---

### **Stap 2: Update Code**

Je moet de API URL aanpassen in je code:

#### **Bestand: `web/apiClient.js`**

Vind regel ~12:
```javascript
// VOOR:
return 'https://autosite-api.onrender.com/api';

// NA (vervang met jouw naam):
return 'https://f1-collection-api.onrender.com/api';
```

#### **Commit & Push:**
```bash
git add web/apiClient.js
git commit -m "Update API URL to new service name"
git push origin main
```

Render detecteert dit en redeploys automatisch! (~2-5 min)

---

## 🎨 **OPTIE 2: Custom Domain** (Eigen domein)

Zoals: `f1collection.com` of `jouwwebsite.nl`

### **Stap 1: Koop een Domein**

Populaire providers:
- **Namecheap** (goedkoop, ~€10/jaar)
- **Google Domains** (makkelijk)
- **Cloudflare** (goedkoop + CDN)

### **Stap 2: Add Custom Domain in Render**

#### **Frontend:**
```
1. Render Dashboard → "f1-collection" (jouw frontend)
2. Settings tab
3. Scroll naar "Custom Domain"
4. Klik "Add Custom Domain"
5. Vul in: "f1collection.com" (of jouw domein)
6. Klik "Save"
```

Render geeft je DNS records:
```
Type: CNAME
Name: www
Value: f1-collection.onrender.com
```

#### **Backend API (optioneel):**
```
Als je wilt: api.f1collection.com

1. Render Dashboard → "f1-collection-api"
2. Settings → Custom Domain
3. Add: "api.f1collection.com"
```

---

### **Stap 3: Update DNS bij je Domain Provider**

Voorbeeld voor Namecheap:
```
1. Login op Namecheap
2. Ga naar "Domain List"
3. Klik "Manage" bij jouw domein
4. Klik "Advanced DNS" tab
5. Klik "Add New Record"
```

**Add deze records:**

**Voor root domain (f1collection.com):**
```
Type: A Record
Host: @
Value: 216.24.57.1 (Render's IP - check Render docs)
TTL: Automatic
```

**Voor www (www.f1collection.com):**
```
Type: CNAME
Host: www
Value: f1-collection.onrender.com
TTL: Automatic
```

**Voor API (api.f1collection.com):**
```
Type: CNAME
Host: api
Value: f1-collection-api.onrender.com
TTL: Automatic
```

---

### **Stap 4: Wait for DNS (30 min - 48 uur)**

DNS propagation kan tijd kosten. Check via:
```
https://dnschecker.org
```

### **Stap 5: Update Code**

Als je custom domain hebt:

#### **`web/apiClient.js`:**
```javascript
const detectApiBase = () => {
  const saved = localStorage.getItem('autosite.apiBase');
  if (saved) return saved;

  // Local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }

  // Production with custom domain
  if (window.location.hostname === 'f1collection.com' || window.location.hostname === 'www.f1collection.com') {
    return 'https://api.f1collection.com/api';
  }

  // Render default
  if (window.location.hostname.includes('onrender.com')) {
    return 'https://f1-collection-api.onrender.com/api';
  }

  // Fallback
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000/api`;
};
```

---

## 🎯 **Welke Optie Kies Je?**

### **Optie 1: Render Subdomain**
- ✅ Gratis
- ✅ Direct werkend (na redeploy)
- ✅ HTTPS automatisch
- ⚠️ URL: `jouw-naam.onrender.com`

### **Optie 2: Custom Domain**
- ✅ Professioneel (`jouwwebsite.com`)
- ✅ Eigen branding
- ⚠️ Kost €10-15/jaar
- ⚠️ DNS setup nodig
- ⚠️ 30min - 48 uur wachttijd

---

## 💡 **Aanbeveling:**

**Start met Optie 1** (Render subdomain - gratis!):
- Kies een goede naam: `f1-collection`, `hermesf1`, `senna-models`, etc.
- Later kan je altijd nog een custom domain toevoegen

**Later upgrade naar Optie 2** als je site groeit en je professioneler wilt overkomen.

---

## 🚀 **Quick Start: Verander nu!**

Welke naam wil je?

Voorbeelden:
- `f1-collection.onrender.com`
- `senna-models.onrender.com`
- `hermes-f1.onrender.com`
- `diecast-legends.onrender.com`

Vertel me je gewenste naam en ik help je met de exacte stappen! 🎯

