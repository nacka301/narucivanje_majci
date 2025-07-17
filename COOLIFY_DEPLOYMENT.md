# Coolify Deployment Guide

## 🚀 Kompletan vodič za deployment na Coolify

### 1. Priprema za Deployment

#### 1.1. Git Repository Setup:
```bash
git init
git add .
git commit -m "Initial commit - Sinj Thompson Majice"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sinj-thompson-majice.git
git push -u origin main
```

#### 1.2. Potrebni fajlovi za Coolify:
- ✅ `Dockerfile` - za containerizaciju
- ✅ `docker-compose.yml` - za lokalno testiranje
- ✅ `.dockerignore` - za optimizaciju build-a
- ✅ `health-check.js` - za monitoring
- ✅ `.env.example` - template za env varijable
- ✅ `.gitignore` - za sigurnost

### 2. Coolify Konfiguracija

#### 2.1. Kreiranje nove aplikacije:
1. **New Resource** → **Application**
2. **Source Type**: Git Repository
3. **Repository**: `https://github.com/YOUR_USERNAME/sinj-thompson-majice.git`
4. **Branch**: `main`
5. **Build Pack**: `Docker`
6. **Dockerfile Path**: `./Dockerfile`

#### 2.2. Osnovne postavke:
```
Name: sinj-thompson-majice
Port: 3000
Health Check Path: /health
Build Command: (ostavi prazno, Docker će build automatski)
Start Command: (ostavi prazno, Docker CMD će pokrenuti)
```

#### 2.3. Environment Varijable (VAŽNO - dodaj ove u Coolify):
```bash
# Email konfiguracija
EMAIL_USER=vpsolutions.booking@gmail.com
EMAIL_PASS=mydb mmcd blkv yphv                # Označiti kao SECRET ✅
ADMIN_EMAIL=vpsolutions.booking@gmail.com

# Server konfiguracija
NODE_ENV=production
PORT=3000
HTTPS_ONLY=false
SESSION_SECRET=moja_mama_voli_meso            # Označiti kao SECRET ✅

# Database konfiguracija (PostgreSQL za produkciju)
DATABASE_URL=postgres://username:password@host:port/database  # Označiti kao SECRET ✅

# SMTP konfiguracija
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 2.4. PostgreSQL Database Setup:
1. **New Resource** → **Database** → **PostgreSQL**
2. **Database Name**: `sinjthompson_db`
3. **Username**: `sinjthompson_user`
4. **Password**: (generiraj strong password)
5. **Port**: `5432` (default)
6. Kopiraj **Connection String** u `DATABASE_URL` environment varijablu

⚠️ **VAŽNO**: Aplikacija koristi SQLite lokalno, a PostgreSQL u produkciji (automatska detekcija).
```

### 3. Domen i SSL

#### 3.1. Dodavanje domena:
1. Idite na **Domains** tab
2. Dodajte vaš domen: `sinjthompson.com`
3. Omogućite **Auto SSL Certificate**

#### 3.2. DNS postavke:
```
Type: A
Name: @ (ili www)
Value: IP_ADRESA_VAŠEG_HETZNER_SERVERA
```

### 4. Monitoring i Logs

#### 4.1. Health Check:
- Coolify automatski poziva `/health` endpoint
- Ako health check ne prođe, aplikacija se restartuje

#### 4.2. Logs:
- **Application Logs**: `docker logs container_name`
- **Build Logs**: dostupni u Coolify interface
- **Email Logs**: vidljivi u application logs

### 5. Automatic Deployment

#### 5.1. Webhook setup:
1. Coolify generiše webhook URL
2. Dodajte u GitHub repository settings
3. Svaki push na `main` branch = automatic deployment

#### 5.2. Manual deployment:
- Kliknite **Deploy** u Coolify dashboard-u
- Coolify će pull-ovati latest kod i rebuild aplikaciju

### 6. Sigurnost

#### 6.1. Environment varijable:
- **EMAIL_PASS** - uvek označiti kao SECRET
- **API_KEYS** - uvek označiti kao SECRET
- **DATABASE_URL** - uvek označiti kao SECRET

#### 6.2. Firewall:
- Hetzner server: otvorite portove 80, 443, 22
- Coolify: automatski konfiguracija

### 7. Backup i Restore

#### 7.1. Database backup (kada dodate):
```bash
# PostgreSQL backup
docker exec container_name pg_dump -U user db_name > backup.sql

# MongoDB backup
docker exec container_name mongodump --out /backup
```

#### 7.2. Code backup:
- Git repository je već backup
- Coolify čuva prethodne verzije

### 8. Troubleshooting

#### 8.1. Aplikacija ne startuje:
1. Proverite **Build Logs**
2. Proverite **Environment Variables**
3. Proverite **Port konfiguraciju**

#### 8.2. Email ne radi:
1. Proverite Gmail App Password
2. Proverite Environment varijable
3. Pogledajte Application Logs

#### 8.3. SSL problemi:
1. Proverite DNS postavke
2. Sačekajte propagaciju (do 24h)
3. Restartujte SSL sertifikat u Coolify

### 9. Performance Optimization

#### 9.1. Docker optimizacija:
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]
```

#### 9.2. Caching:
- Coolify automatski cache-uje Docker layers
- Git repository cache za brže deployment

### 10. Monitoring i Analytics

#### 10.1. Uptime monitoring:
- Coolify built-in health checks
- Externos servisi: UptimeRobot, Pingdom

#### 10.2. Error tracking:
- Console logs u Coolify
- Sentry.io za advanced error tracking

---

## 📞 Podrška

Za pomoć oko deployment-a:
- Coolify dokumentacija: https://coolify.io/docs
- Hetzner podrška: https://www.hetzner.com/support
- Email: support@yourdomain.com
