const { Pool } = require('pg');
const { 
    initSQLiteDatabase, 
    saveSQLiteOrder, 
    getSQLiteAllOrders, 
    getSQLiteOrderStats, 
    updateSQLiteOrderStatus, 
    updateSQLiteEmailStatus 
} = require('./sqlite-database');

// Provera da li je PostgreSQL dostupan
const isPostgresAvailable = () => {
    return process.env.DATABASE_URL && 
           process.env.DATABASE_URL.includes('postgres') && 
           process.env.NODE_ENV === 'production';
};

// Kreiranje PostgreSQL pool konekcije
const pool = isPostgresAvailable() ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

// Kreiranje tabela ako ne postoje
const initDatabase = async () => {
    if (!isPostgresAvailable()) {
        console.log('🔄 Koristim SQLite za lokalno testiranje');
        return await initSQLiteDatabase();
    }
    
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS narudbe (
                id SERIAL PRIMARY KEY,
                ime VARCHAR(100) NOT NULL,
                prezime VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                telefon VARCHAR(50) NOT NULL,
                adresa TEXT NOT NULL,
                grad VARCHAR(100) NOT NULL,
                postanski_broj VARCHAR(20) NOT NULL,
                velicina VARCHAR(10) NOT NULL,
                kolicina INTEGER NOT NULL,
                ukupna_cena DECIMAL(10,2) NOT NULL,
                napomena TEXT,
                datum_narudbe TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'nova',
                email_poslat BOOLEAN DEFAULT false,
                admin_email_poslat BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ PostgreSQL tabele su kreirane/proverene');
    } catch (error) {
        console.error('❌ Greška pri kreiranju PostgreSQL tabela:', error);
    }
};

// Spremanje narudžbe u bazu
const saveOrder = async (narudba) => {
    if (!isPostgresAvailable()) {
        return await saveSQLiteOrder(narudba);
    }
    
    try {
        const result = await pool.query(`
            INSERT INTO narudbe (
                ime, prezime, email, telefon, adresa, grad, postanski_broj,
                velicina, kolicina, ukupna_cena, napomena, status,
                email_poslat, admin_email_poslat
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING id
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
            narudba.emailPoslat || false,
            narudba.adminEmailPoslat || false
        ]);
        
        return { success: true, id: result.rows[0].id };
    } catch (error) {
        console.error('❌ Greška pri spremanju PostgreSQL narudžbe:', error);
        return { success: false, error: error.message };
    }
};

// Dohvaćanje svih narudžbi
const getAllOrders = async () => {
    if (!isPostgresAvailable()) {
        return await getSQLiteAllOrders();
    }
    
    try {
        const result = await pool.query(`
            SELECT * FROM narudbe 
            ORDER BY datum_narudbe DESC
        `);
        return { success: true, orders: result.rows };
    } catch (error) {
        console.error('❌ Greška pri dohvaćanju PostgreSQL narudžbi:', error);
        return { success: false, error: error.message };
    }
};

// Dohvaćanje narudžbe po ID-u
const getOrderById = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM narudbe WHERE id = $1', [id]);
        return { success: true, order: result.rows[0] };
    } catch (error) {
        console.error('❌ Greška pri dohvaćanju narudžbe:', error);
        return { success: false, error: error.message };
    }
};

// Ažuriranje statusa narudžbe
const updateOrderStatus = async (id, status) => {
    if (!isPostgresAvailable()) {
        return await updateSQLiteOrderStatus(id, status);
    }
    
    try {
        await pool.query(`
            UPDATE narudbe 
            SET status = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
        `, [status, id]);
        return { success: true };
    } catch (error) {
        console.error('❌ Greška pri ažuriranju PostgreSQL statusa:', error);
        return { success: false, error: error.message };
    }
};

// Ažuriranje email statusa
const updateEmailStatus = async (id, emailPoslat, adminEmailPoslat) => {
    if (!isPostgresAvailable()) {
        return await updateSQLiteEmailStatus(id, emailPoslat, adminEmailPoslat);
    }
    
    try {
        await pool.query(`
            UPDATE narudbe 
            SET email_poslat = $1, admin_email_poslat = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $3
        `, [emailPoslat, adminEmailPoslat, id]);
        return { success: true };
    } catch (error) {
        console.error('❌ Greška pri ažuriranju PostgreSQL email statusa:', error);
        return { success: false, error: error.message };
    }
};

// Statistike narudžbi
const getOrderStats = async () => {
    if (!isPostgresAvailable()) {
        return await getSQLiteOrderStats();
    }
    
    try {
        const result = await pool.query(`
            SELECT 
                COUNT(*) as ukupno_narudbi,
                SUM(ukupna_cena) as ukupna_zarada,
                COUNT(CASE WHEN status = 'nova' THEN 1 END) as nove_narudbe,
                COUNT(CASE WHEN status = 'obrađuje_se' THEN 1 END) as u_obradi,
                COUNT(CASE WHEN status = 'poslano' THEN 1 END) as poslano,
                COUNT(CASE WHEN status = 'završeno' THEN 1 END) as zavrseno,
                COUNT(CASE WHEN DATE(datum_narudbe) = CURRENT_DATE THEN 1 END) as danas
            FROM narudbe
        `);
        return { success: true, stats: result.rows[0] };
    } catch (error) {
        console.error('❌ Greška pri dohvaćanju PostgreSQL statistika:', error);
        return { success: false, error: error.message };
    }
};

// Test konekcije
const testConnection = async () => {
    if (!isPostgresAvailable()) {
        console.log('🔄 Koristim SQLite za lokalno testiranje');
        return true;
    }
    
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL konekcija uspešna:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL konekcija neuspešna:', error);
        return false;
    }
};

module.exports = {
    initDatabase,
    saveOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    updateEmailStatus,
    getOrderStats,
    testConnection,
    pool
};
