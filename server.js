// ...existing code...
// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...

// ...existing code...
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
    testConnection,
    archiveOrder,
    deleteOrdersByStatus
} = require('./database');

const app = express();
// API ruta za arhiviranje i brisanje završenih narudžbi
app.post('/api/admin/orders/delete-finished', async (req, res) => {
    try {
        // Dohvati sve narudžbe sa statusom 'zavrseno'
        const allOrders = await getAllOrders();
        if (!allOrders.success) return res.status(500).json({ error: allOrders.error });
        const finishedOrders = allOrders.orders.filter(o => o.status === 'zavrseno');
        if (finishedOrders.length === 0) return res.json({ success: true, message: 'Nema završenih narudžbi za arhiviranje.' });

        // Spremi ih u arhivu
        for (const order of finishedOrders) {
            await archiveOrder(order); // nova funkcija u database.js
        }
        // Obriši iz glavne tablice
        await deleteOrdersByStatus('zavrseno'); // nova funkcija u database.js

        res.json({ success: true, message: `Arhivirano i obrisano ${finishedOrders.length} narudžbi.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 3000;

// Inicijalizacija baze podataka
initDatabase();
testConnection();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
const session = require('express-session');
require('dotenv').config();
app.use(session({
    secret: process.env.SESSION_SECRET || 'moja_mama_voli_meso',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, sameSite: 'strict' }
}));

function requireAdminLogin(req, res, next) {
    if (req.session && req.session.adminLoggedIn) {
        return next();
    }
    return res.redirect('/admin/login');
}

// Admin login/logout rute dostupne bez autentifikacije


// Štiti samo GET /admin (panel), ne sve /admin rute


// Admin login/logout rute moraju biti dostupne bez requireAdminLogin


// Rute
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Legalne stranice
app.get('/uvjeti-koristenja', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'uvjeti-koristenja.html'));
});

app.get('/politika-privatnosti', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'politika-privatnosti.html'));
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

// Admin login (javno)
app.get('/admin/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="hr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login</title>
        <style>
            body {
                font-family: Segoe UI, Verdana, sans-serif;
                background: linear-gradient(135deg, #232526 0%, #414345 100%);
                min-height: 100vh;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                max-width: 370px;
                width: 100%;
                margin: 0 auto;
                background: rgba(30, 32, 34, 0.98);
                border-radius: 16px;
                box-shadow: 0 8px 32px #0005, 0 1.5px 0 #6c63ff;
                padding: 40px 32px 32px 32px;
                color: #fff;
                position: relative;
            }
            .login-container::before {
                content: '';
                position: absolute;
                top: -2px; left: -2px; right: -2px; bottom: -2px;
                border-radius: 18px;
                background: linear-gradient(90deg, #6c63ff 0%, #e74c3c 100%);
                opacity: 0.12;
                z-index: 0;
            }
            h2 {
                text-align: center;
                margin-bottom: 28px;
                font-size: 2rem;
                letter-spacing: 1px;
                font-weight: 600;
            }
            form {
                position: relative;
                z-index: 1;
            }
            input[type=text], input[type=password] {
                width: 100%;
                padding: 12px;
                margin-bottom: 18px;
                border-radius: 6px;
                border: none;
                background: #232526;
                color: #fff;
                font-size: 1rem;
                box-shadow: 0 1px 4px #0002;
                outline: none;
                transition: box-shadow 0.2s;
            }
            input[type=text]:focus, input[type=password]:focus {
                box-shadow: 0 0 0 2px #6c63ff;
            }
            button {
                width: 100%;
                padding: 12px;
                background: linear-gradient(90deg, #6c63ff 0%, #e74c3c 100%);
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 1.1rem;
                font-weight: 500;
                cursor: pointer;
                box-shadow: 0 2px 8px #0002;
                transition: background 0.2s;
            }
            button:hover {
                background: linear-gradient(90deg, #e74c3c 0%, #6c63ff 100%);
            }
            .error {
                color: #ff6b6b;
                text-align: center;
                margin-bottom: 12px;
                font-weight: 500;
                letter-spacing: 0.5px;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h2>Admin Login</h2>
            <form method="POST" action="/admin/login">
                <input type="text" name="username" placeholder="Korisničko ime" required />
                <input type="password" name="password" placeholder="Lozinka" required />
                <button type="submit">Prijavi se</button>
            </form>
            ${req.query.error ? `<div class="error">Pogrešno korisničko ime ili lozinka!</div>` : ''}
        </div>
    </body>
    </html>
    `);
});


// Admin login provjera (javno)
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD;
    if (username === adminUser && password === adminPass) {
        req.session.adminLoggedIn = true;
        return res.redirect('/admin');
    }
    return res.redirect('/admin/login?error=1');
});

// Admin logout (javno)
app.post('/admin/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Admin panel (zaštićen)
app.get('/admin', requireAdminLogin, (req, res) => {
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
