# Email Setup Instrukcije

## 📧 Kako podesiti Gmail za slanje email-ova

### 1. Kreiranje App Password za Gmail:

1. Idite na Google Account: https://myaccount.google.com/
2. Kliknite na "Security" (Bezbednost)
3. Uključite "2-Step Verification" ako nije već uključeno
4. Kliknite na "App passwords" (Lozinke za aplikacije)
5. Izaberite "Mail" i "Other (Custom name)"
6. Unesite "Sinj Thompson Shop"
7. Kopirajte generisanu lozinku

### 2. Ažuriranje .env fajla:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-from-step-1
ADMIN_EMAIL=admin@sinjthompson.com
```

### 3. Alternativno - koristite test email:

Za testiranje možete koristiti Ethereal Email:
- Idite na: https://ethereal.email/create
- Kreirajte test nalog
- Kopirajte SMTP kredencijale u .env

### 4. Production setup:

Za produkciju preporučujem:
- SendGrid: https://sendgrid.com/
- Mailgun: https://www.mailgun.com/
- Amazon SES: https://aws.amazon.com/ses/

### 5. Podešavanje Environment Varijabli u Coolify:

#### 5.1. Pristup Coolify Dashboard-u:
1. Logujte se u Coolify na vašem Hetzner serveru
2. Idite na vašu aplikaciju "Sinj Thompson Majice"
3. Kliknite na tab "Environment"

#### 5.2. Dodavanje Environment Varijabli:
U Coolify dodajte sledeće varijable:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
ADMIN_EMAIL=admin@sinjthompson.com
NODE_ENV=production
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### 5.3. Sigurnost Environment Varijabli:
- **EMAIL_PASS** - označite kao "Secret" (🔒 ikona)
- **EMAIL_USER** - može ostati kao obična varijabla
- **ADMIN_EMAIL** - može ostati kao obična varijabla

#### 5.4. Redeploy aplikacije:
1. Kliknite "Save" za sve varijable
2. Kliknite "Deploy" da restartujete aplikaciju
3. Coolify će automatski učitati nove varijable

#### 5.5. Alternativno - korišćenje SendGrid za produkciju:
```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
```

#### 5.6. Provera Environment Varijabli:
- U Coolify logs možete videti da li su varijable učitane
- Testirajte slanje email-a preko forme na sajtu

### 6. Testiranje:

1. Pokrenite server: `npm start`
2. Popunite formu na stranici
3. Kliknite "Naruči majicu"
4. Proverite email za potvrdu

### 7. Problemi i rešenja:

**Gmail blokira slanje:**
- Proverite da li je uključena 2FA
- Koristite App Password umesto obične lozinke
- Proverite da li je Gmail omogućio "Less secure app access"

**Email ne stiže:**
- Proverite spam folder
- Proverite da li je email adresa validna
- Pogledajte console log za greške

**SMTP greške:**
- Proverite port (587 za TLS, 465 za SSL)
- Proverite host adresu
- Proverite firewall postavke
