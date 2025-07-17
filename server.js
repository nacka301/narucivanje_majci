require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { sendOrderConfirmation, sendAdminNotification } = require('./emailService');
const { 
    initDatabase, 
    saveOrder, 
    getAllOrders, 
    getOrderById, 
    updateOrderStatus, 
    getOrderStats,
    updateEmailStatus,
    testConnection 
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicijalizacija baze podataka
initDatabase();
testConnection();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/admin', express.static('admin'));

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

// Admin rute
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// API ruta za dohvaćanje svih narudžbi
app.get('/api/admin/orders', async (req, res) => {
    try {
        const result = await getAllOrders();
        if (result.success) {
            res.json(result.orders);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API ruta za dohvaćanje statistika
app.get('/api/admin/stats', async (req, res) => {
    try {
        const result = await getOrderStats();
        if (result.success) {
            res.json(result.stats);
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API ruta za ažuriranje statusa narudžbe
app.put('/api/admin/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const result = await updateOrderStatus(id, status);
        if (result.success) {
            res.json({ success: true, message: 'Status ažuriran' });
        } else {
            res.status(500).json({ error: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API ruta za naručivanje
app.post('/api/naruci', async (req, res) => {
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
    
    // Spremanje u bazu podataka
    const dbResult = await saveOrder(narudba);
    
    if (!dbResult.success) {
        console.error('Greška pri spremanju u bazu:', dbResult.error);
        return res.status(500).json({ 
            success: false, 
            message: 'Greška pri spremanju narudžbe' 
        });
    }
    
    // Ažuriranje narudžbe sa ID-om iz baze
    narudba.id = dbResult.id;
    
    // Slanje email-a korisniku i adminu
    try {
        // Slanje potvrde korisniku
        const userEmailResult = await sendOrderConfirmation(narudba);
        
        // Slanje notifikacije adminu
        const adminEmailResult = await sendAdminNotification(narudba);
        
        // Ažuriranje email statusa u bazi
        await updateEmailStatus(narudba.id, userEmailResult.success, adminEmailResult.success);
        
        console.log('Email rezultati:', {
            userEmail: userEmailResult.success ? 'Poslat' : 'Greška',
            adminEmail: adminEmailResult.success ? 'Poslat' : 'Greška'
        });
        
        res.json({ 
            success: true, 
            message: 'Narudžba je uspešno poslata! Proverite email za potvrdu.',
            narudba: narudba,
            emailStatus: {
                userEmail: userEmailResult.success,
                adminEmail: adminEmailResult.success
            }
        });
    } catch (error) {
        console.error('Greška pri slanju email-ova:', error);
        
        // Ažuriranje email statusa u bazi
        await updateEmailStatus(narudba.id, false, false);
        
        // Čak i ako email ne prođe, narudžba je uspešna
        res.json({ 
            success: true, 
            message: 'Narudžba je uspešno poslata! Kontaktiraćemo vas uskoro.',
            narudba: narudba,
            emailStatus: {
                userEmail: false,
                adminEmail: false,
                error: error.message
            }
        });
    }
});

// Pokretanje servera
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
    console.log(`Otvorite browser na: http://localhost:${PORT}`);
});
