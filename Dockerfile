# Koristimo Node.js 18 alpine image
FROM node:18-alpine

# Postavljamo radni direktorij
WORKDIR /app

# Kopiramo package.json i package-lock.json
COPY package*.json ./

# Instaliramo dependencies
RUN npm ci --only=production

# Instaliramo curl za healthcheck
RUN apk add --no-cache curl

# Kopiramo ostatak aplikacije
COPY . .

# Kreiramo non-root korisnika
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Dajemo ownership nodejs korisniku
RUN chown -R nodejs:nodejs /app
USER nodejs

# Izlažemo port 3000
EXPOSE 3000

# Dodajemo health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

# Pokretamo aplikaciju
CMD ["node", "server.js"]
