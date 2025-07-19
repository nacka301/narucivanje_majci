// Kreiranje tablice za arhivirane narudžbe
const initSQLiteArchiveTable = async () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS archived_orders (
                id INTEGER PRIMARY KEY,
                ime TEXT,
                prezime TEXT,
                email TEXT,
                telefon TEXT,
                adresa TEXT,
                grad TEXT,
                postanski_broj TEXT,
                velicina TEXT,
                kolicina INTEGER,
                ukupna_cena REAL,
                napomena TEXT,
                datum_narudbe DATETIME,
                status TEXT,
                email_poslat BOOLEAN,
                admin_email_poslat BOOLEAN,
                created_at DATETIME,
                updated_at DATETIME
            )
        `, (err) => {
            if (err) reject(err); else resolve();
        });
    });
};

// Arhiviranje narudžbe u SQLite
const archiveSQLiteOrder = async (order) => {
    await initSQLiteArchiveTable();
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO archived_orders (
                id, ime, prezime, email, telefon, adresa, grad, postanski_broj, velicina, kolicina, ukupna_cena, napomena, datum_narudbe, status, email_poslat, admin_email_poslat, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            order.id,
            order.ime,
            order.prezime,
            order.email,
            order.telefon,
            order.adresa,
            order.grad,
            order.postanski_broj || order.postanskiBroj,
            order.velicina,
            order.kolicina,
            order.ukupna_cena || order.ukupnaCena,
            order.napomena,
            order.datum_narudbe || order.datum,
            order.status,
            order.email_poslat || order.emailPoslat,
            order.admin_email_poslat || order.adminEmailPoslat,
            order.created_at,
            order.updated_at
        ], function(err) {
            if (err) reject({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
};

// Brisanje narudžbi po statusu u SQLite
const deleteSQLiteOrdersByStatus = async (status) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM narudbe WHERE status = ?`, [status], function(err) {
            if (err) reject({ success: false, error: err.message });
            else resolve({ success: true });
        });
    });
};
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Kreiranje SQLite baze za lokalno testiranje
const db = new sqlite3.Database(path.join(__dirname, 'narudbe.db'));

// Inicijalizacija SQLite tabela
const initSQLiteDatabase = async () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS narudbe (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ime TEXT NOT NULL,
                prezime TEXT NOT NULL,
                email TEXT NOT NULL,
                telefon TEXT NOT NULL,
                adresa TEXT NOT NULL,
                grad TEXT NOT NULL,
                postanski_broj TEXT NOT NULL,
                velicina TEXT NOT NULL,
                kolicina INTEGER NOT NULL,
                ukupna_cena REAL NOT NULL,
                napomena TEXT,
                datum_narudbe DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'nova',
                email_poslat BOOLEAN DEFAULT 0,
                admin_email_poslat BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Greška pri kreiranju SQLite tabele:', err);
                reject(err);
            } else {
                console.log('✅ SQLite tabela je kreirana/proverena');
                resolve();
            }
        });
    });
};

// Spremanje narudžbe u SQLite
const saveSQLiteOrder = async (narudba) => {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO narudbe (
                ime, prezime, email, telefon, adresa, grad, postanski_broj,
                velicina, kolicina, ukupna_cena, napomena, status,
                email_poslat, admin_email_poslat
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            narudba.ime,
            narudba.prezime,
            narudba.email,
            narudba.telefon,
            narudba.adresa,
            narudba.grad,
            narudba.postanskiBroj,
            narudba.velicina,
            narudba.kolicina,
            narudba.ukupnaCena,
            narudba.napomena || null,
            narudba.status || 'nova',
            narudba.emailPoslat ? 1 : 0,
            narudba.adminEmailPoslat ? 1 : 0
        ], function(err) {
            if (err) {
                console.error('❌ Greška pri spremanju SQLite narudžbe:', err);
                reject({ success: false, error: err.message });
            } else {
                console.log('✅ SQLite narudžba spremljena, ID:', this.lastID);
                resolve({ success: true, id: this.lastID });
            }
        });
    });
};

// Dohvaćanje svih narudžbi iz SQLite
const getSQLiteAllOrders = async () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT * FROM narudbe 
            ORDER BY datum_narudbe DESC
        `, (err, rows) => {
            if (err) {
                console.error('❌ Greška pri dohvaćanju SQLite narudžbi:', err);
                reject({ success: false, error: err.message });
            } else {
                resolve({ success: true, orders: rows });
            }
        });
    });
};

// Statistike za SQLite
const getSQLiteOrderStats = async () => {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                COUNT(*) as ukupno_narudbi,
                SUM(ukupna_cena) as ukupna_zarada,
                SUM(CASE WHEN status = 'nova' THEN 1 ELSE 0 END) as nove_narudbe,
                SUM(CASE WHEN status = 'u_obradi' THEN 1 ELSE 0 END) as u_obradi,
                SUM(CASE WHEN status = 'poslano' THEN 1 ELSE 0 END) as poslano,
                SUM(CASE WHEN status = 'zavrseno' THEN 1 ELSE 0 END) as zavrseno,
                SUM(CASE WHEN DATE(datum_narudbe) = DATE('now') THEN 1 ELSE 0 END) as danas
            FROM narudbe
        `, (err, row) => {
            if (err) {
                console.error('❌ Greška pri dohvaćanju SQLite statistika:', err);
                reject({ success: false, error: err.message });
            } else {
                resolve({ success: true, stats: row });
            }
        });
    });
};

// Ažuriranje statusa u SQLite
const updateSQLiteOrderStatus = async (id, status) => {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE narudbe 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [status, id], function(err) {
            if (err) {
                console.error('❌ Greška pri ažuriranju SQLite statusa:', err);
                reject({ success: false, error: err.message });
            } else {
                resolve({ success: true });
            }
        });
    });
};

// Ažuriranje email statusa u SQLite
const updateSQLiteEmailStatus = async (id, emailPoslat, adminEmailPoslat) => {
    return new Promise((resolve, reject) => {
        db.run(`
            UPDATE narudbe 
            SET email_poslat = ?, admin_email_poslat = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [emailPoslat ? 1 : 0, adminEmailPoslat ? 1 : 0, id], function(err) {
            if (err) {
                console.error('❌ Greška pri ažuriranju SQLite email statusa:', err);
                reject({ success: false, error: err.message });
            } else {
                resolve({ success: true });
            }
        });
    });
};

module.exports = {
    initSQLiteDatabase,
    saveSQLiteOrder,
    getSQLiteAllOrders,
    getSQLiteOrderStats,
    updateSQLiteOrderStatus,
    updateSQLiteEmailStatus,
    archiveSQLiteOrder,
    deleteSQLiteOrdersByStatus
};
