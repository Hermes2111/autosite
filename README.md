# 🏎️ F1 Modelauto Collectie

Een moderne web applicatie voor het beheren en presenteren van een F1 diecast model collectie.

![F1 Collection](faviconauto.png)

## ✨ Features

### 👥 **Voor Bezoekers:**
- 🖼️ Moderne galerij met zoeken en filters
- 🎨 Dark/Light mode
- 🌐 Meertalig (NL, EN, FR)
- 📱 Volledig responsive design
- ⭐ Watchlist functionaliteit
- 🔍 Geavanceerd zoeken op jaar, team, schaal

### 👑 **Voor Admins:**
- 📊 Uitgebreid dashboard met verkoop statistieken
- ⚡ Quick Sale voor snelle verkoop registratie
- 👥 Klanten management met aankoopgeschiedenis
- 📈 Grafieken en analytics (Chart.js)
- 📦 Items beheren (toevoegen, bewerken, verwijderen)
- 💰 Verkoop tracking met winst/verlies analyse
- 🔄 Repeat customer detectie

## 🛠️ Tech Stack

### **Frontend:**
- HTML5, CSS3, JavaScript (ES Modules)
- Vanilla JS (geen frameworks!)
- Chart.js voor data visualisatie
- Font Awesome icons
- Google Fonts (Inter)

### **Backend:**
- Node.js + NestJS framework
- TypeORM voor database management
- PostgreSQL database
- JWT authentication
- Google OAuth (optioneel)
- Passport.js voor auth strategies

### **Deployment:**
- Render.com (gratis tier)
- Auto-deploy vanuit GitHub
- HTTPS/SSL automatisch

## 🚀 Quick Start (Lokaal)

### **1. Clone Repository**
```bash
git clone https://github.com/Hermes2111/autosite.git
cd autosite
```

### **2. Start Database (Docker)**
```bash
docker-compose up -d
```

### **3. Backend Setup**
```bash
cd backend
npm install
npm run start:dev
```

### **4. Frontend Setup**
```bash
# In project root
python3 -m http.server 5500
```

### **5. Open Browser**
```
http://localhost:5500
```

**Login:**
- Email: `admin@example.com`
- Password: `Admin1234!`

## 📦 Deployment naar Render.com

Zie volledige instructies in:
- **Quick Start:** [RENDER_QUICK_START.md](RENDER_QUICK_START.md)
- **Uitgebreide Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)

### **TL;DR:**
1. Push code naar GitHub ✅ (al klaar!)
2. Login op Render.com
3. New Blueprint → Select "autosite" repo
4. Klik "Apply"
5. Wacht 5-10 minuten
6. Live! 🎉

## 📁 Project Structuur

```
autosite/
├── backend/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── customer/    # Customer management
│   │   ├── diecast-model/
│   │   ├── entities/    # TypeORM entities
│   │   └── ...
│   └── package.json
├── web/                  # Frontend modules
│   ├── admin.js         # Admin panel
│   ├── auth.js          # Authentication
│   ├── customers.js     # Customer management
│   ├── dashboard.js     # Sales dashboard
│   ├── gallery.js       # Main gallery
│   └── ...
├── index.html           # Main HTML
├── style.css            # Styling
├── script.js            # Main entry point
├── render.yaml          # Render deployment config
└── docker-compose.yml   # Local development
```

## 🎨 Screenshots

### Galerij View
Modern grid layout met filters en zoekfunctionaliteit

### Admin Dashboard
Uitgebreide verkoop statistieken en grafieken

### Customer Management
Klanten beheer met aankoopgeschiedenis

## 🔐 Environment Variables

Voor lokale development, maak `.env` aan:

```env
DATABASE_URL=postgresql://devusr:devpwd@localhost:5432/autosite
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Voor production (Render.com):
- `DATABASE_URL` - Auto-generated
- `JWT_SECRET` - Auto-generated
- `NODE_ENV=production`

## 📊 Database Schema

### **Main Tables:**
- `users` - User accounts en admin roles
- `diecast_models` - F1 model collectie items
- `customers` - Klanten database
- `teams` - F1 teams
- `drivers` - F1 coureurs
- `watchlist` - User favorites

## 🤝 Contributing

Dit is een persoonlijk project, maar suggesties zijn welkom!

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push naar branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📝 License

Dit project is voor persoonlijk gebruik.

## 👨‍💻 Author

**Hermes van Steenbrugge**
- GitHub: [@Hermes2111](https://github.com/Hermes2111)

## 🙏 Acknowledgments

- Font Awesome voor icons
- Chart.js voor grafieken
- NestJS framework
- Render.com voor gratis hosting

---

**Made with ❤️ for F1 collectie liefhebbers**
