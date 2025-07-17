const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rute
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check ruta za Docker
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime() 
    });
});

// API ruta za naručivanje
app.post('/api/naruci', (req, res) => {
    const { ime, prezime, email, telefon, adresa, grad, postanskiBroj, velicina, kolicina, napomena } = req.body;
    
    // Validacija
    if (!ime || !prezime || !email || !telefon || !adresa || !grad || !postanskiBroj || !velicina || !kolicina) {
        return res.status(400).json({ 
            success: false, 
            message: 'Molimo popunite sva obavezna polja' 
        });
    }
    
    // Simulacija spremanja narudžbe
    const narudba = {
        id: Date.now(),
        ime,
        prezime,
        email,
        telefon,
        adresa,
        grad,
        postanskiBroj,
        velicina,
        kolicina: parseInt(kolicina),
        napomena: napomena || '',
        ukupnaCena: parseInt(kolicina) * 25,
        datum: new Date().toISOString(),
        status: 'nova'
    };
    
    console.log('Nova narudžba:', narudba);
    
    // Ovde biste normalno spremili u bazu podataka
    // i poslali email potvrdu
    
    res.json({ 
        success: true, 
        message: 'Narudžba je uspešno poslata!',
        narudba: narudba
    });
});

// Pokretanje servera
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
    console.log(`Otvorite browser na: http://localhost:${PORT}`);
});
