# Sinj x Thompson - Majice Web Shop

Web aplikacija za naručivanje Sinj x Thompson majica.

## 🚀 Deployment sa Coolify na Hetzner

### Preduslovi
- Hetzner VPS server
- Coolify instaliran na serveru
- Git repository (GitHub/GitLab)

### Koraci za deployment:

#### 1. Priprema repository-ja
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

#### 2. Coolify konfiguracija
1. Logujte se u Coolify dashboard
2. Kliknite "New Resource" > "Application"
3. Odaberite vaš Git repository
4. Postavite sledeće:
   - **Build Pack**: Docker
   - **Dockerfile**: `Dockerfile`
   - **Port**: `3000`
   - **Health Check**: `/health`

#### 3. Environment varijable u Coolify
```
NODE_ENV=production
PORT=3000
```

#### 4. Domena i SSL
- Dodajte vašu domenu u Coolify
- Omogućite automatski SSL sertifikat

### 🐳 Lokalno testiranje sa Dockerom

```bash
# Build Docker image
npm run docker:build

# Run sa docker-compose
npm run docker:compose

# Zaustavi
npm run docker:stop
```

### 📋 Funkcionalnosti

- ✅ Responsive dizajn
- ✅ Form validacija
- ✅ Email notifikacije
- ✅ Health check endpoint
- ✅ Docker ready
- ✅ Production optimizovan

### 🔧 Lokalno pokretanje

```bash
# Instaliraj dependencies
npm install

# Pokreni development server
npm run dev

# Pokreni production server
npm start
```

### 🌐 API Endpoints

- `GET /` - Homepage
- `GET /health` - Health check
- `POST /api/naruci` - Naručivanje majice

### 📱 Responsive Design

Aplikacija je optimizovana za:
- Desktop (1200px+)
- Tablet (768px-1199px)
- Mobile (320px-767px)

### 🔒 Security

- Input sanitization
- CORS enabled
- Rate limiting (preporučeno za production)
- Health checks

### 📊 Monitoring

Health check endpoint omogućava:
- Uptime monitoring
- Performance tracking
- Automatic restart na failure

---

**Kontakt**: davidovic.development@gmail.com
