const { Pool } = require('pg');
const { 
    initSQLiteDatabase, 
    saveSQLiteOrder, 
    getSQLiteAllOrders, 
    getSQLiteOrderStats, 
    updateSQLiteOrderStatus, 
    updateSQLiteEmailStatus,
    archiveSQLiteOrder,
    deleteSQLiteOrdersByStatus
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

// Arhiviranje narudžbe (SQLite i Postgres)
const archiveOrder = async (order) => {
    if (!isPostgresAvailable()) {
        return await archiveSQLiteOrder(order);
    }
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS archived_orders AS TABLE narudbe WITH NO DATA;
        `);
        await pool.query(`
            INSERT INTO archived_orders SELECT * FROM narudbe WHERE id = $1
        `, [order.id]);
        return { success: true };
    } catch (error) {
        console.error('❌ Greška pri arhiviranju narudžbe:', error);
        return { success: false, error: error.message };
    }
};

// Brisanje narudžbi po statusu
const deleteOrdersByStatus = async (status) => {
    if (!isPostgresAvailable()) {
        return await deleteSQLiteOrdersByStatus(status);
    }
    try {
        await pool.query(`DELETE FROM narudbe WHERE status = $1`, [status]);
        return { success: true };
    } catch (error) {
        console.error('❌ Greška pri brisanju narudžbi:', error);
        return { success: false, error: error.message };
    }
};

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
                adresa VARCHAR(255) NOT NULL,
                grad VARCHAR(100) NOT NULL,
                postanski_broj VARCHAR(20) NOT NULL,
                velicina VARCHAR(10) NOT NULL,
                kolicina INTEGER NOT NULL,
                napomena TEXT,
                ukupna_cena DECIMAL(10,2) NOT NULL,
                datum TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'nova',
                email_poslat BOOLEAN DEFAULT FALSE,
                admin_email_poslat BOOLEAN DEFAULT FALSE
            )
        `);
        console.log('✅ PostgreSQL tabela kreirana/proverena');
    } catch (error) {
        console.error('❌ Greška pri kreiranju PostgreSQL tabele:', error);
    }
};

// Spremanje narudžbe
const saveOrder = async (narudba) => {
    if (!isPostgresAvailable()) {
        console.log('🔄 Koristim SQLite za lokalno testiranje');
        return await saveSQLiteOrder(narudba);
    }
    
    try {
        const result = await pool.query(`
            INSERT INTO narudbe (
                ime, prezime, email, telefon, adresa, grad, postanski_broj,
                velicina, kolicina, napomena, ukupna_cena, datum, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
            narudba.napomena,
            narudba.ukupnaCena,
            narudba.datum,
            narudba.status
        ]);
        
        console.log('✅ Narudžba uspešno spremljena u PostgreSQL');
        return { success: true, id: result.rows[0].id };
    } catch (error) {
        console.error('❌ Greška pri spremanju u PostgreSQL:', error);
        return { success: false, error: error.message };
    }
};

// Dohvaćanje svih narudžbi
const getAllOrders = async () => {
    if (!isPostgresAvailable()) {
        return await getSQLiteAllOrders();
    }
    
    try {
        const result = await pool.query('SELECT * FROM narudbe ORDER BY datum DESC');
        return { success: true, orders: result.rows };
    } catch (error) {
        console.error('❌ Greška pri dohvaćanju narudžbi:', error);
        return { success: false, error: error.message };
    }
};

const getOrderById = async (id) => {
    if (!isPostgresAvailable()) {
        return { success: false, error: 'SQLite getOrderById not implemented' };
    }
    
    try {
        const result = await pool.query('SELECT * FROM narudbe WHERE id = $1', [id]);
        return { success: true, order: result.rows[0] };
    } catch (error) {
        console.error('❌ Greška pri dohvaćanju narudžbe:', error);
        return { success: false, error: error.message };
    }
};

const updateOrderStatus = async (id, status) => {
    if (!isPostgresAvailable()) {
        return await updateSQLiteOrderStatus(id, status);
    }
    
    try {
        await pool.query('UPDATE narudbe SET status = $1 WHERE id = $2', [status, id]);
        console.log(`✅ Status narudžbe ${id} ažuriran na ${status}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Greška pri ažuriranju statusa:', error);
        return { success: false, error: error.message };
    }
};

const updateEmailStatus = async (id, emailPoslat, adminEmailPoslat) => {
    if (!isPostgresAvailable()) {
        return await updateSQLiteEmailStatus(id, emailPoslat, adminEmailPoslat);
    }
    
    try {
        await pool.query(
            'UPDATE narudbe SET email_poslat = $1, admin_email_poslat = $2 WHERE id = $3',
            [emailPoslat, adminEmailPoslat, id]
        );
        console.log(`✅ Email status ažuriran za narudžbu ${id}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Greška pri ažuriranju email statusa:', error);
        return { success: false, error: error.message };
    }
};

const getOrderStats = async () => {
    if (!isPostgresAvailable()) {
        return await getSQLiteOrderStats();
    }
    
    try {
        const totalResult = await pool.query('SELECT COUNT(*) as total FROM narudbe');
        const statusResult = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM narudbe 
            GROUP BY status
        `);
        
        const stats = {
            total: parseInt(totalResult.rows[0].total),
            byStatus: {}
        };
        
        statusResult.rows.forEach(row => {
            stats.byStatus[row.status] = parseInt(row.count);
        });
        
        return { success: true, stats };
    } catch (error) {
        console.error('❌ Greška pri dohvaćanju statistika:', error);
        return { success: false, error: error.message };
    }
};

const testConnection = async () => {
    if (!isPostgresAvailable()) {
        console.log('🔄 Koristim SQLite za lokalno testiranje');
        return { success: true, message: 'SQLite je spreman' };
    }
    
    try {
        await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL konekcija uspešna');
        return { success: true, message: 'PostgreSQL konekcija uspešna' };
    } catch (error) {
        console.error('❌ Greška PostgreSQL konekcije:', error);
        return { success: false, error: error.message };
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
    archiveOrder,
    deleteOrdersByStatus,
    pool
};
