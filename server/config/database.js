const fs = require('fs');
const path = require('path');
const { Pool: PgPool } = require('pg');
let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {}

const {
  seedUsers,
  seedSellers,
  seedCategories,
  seedBrands,
  seedProducts,
  seedCoupons,
  seedBanners,
  seedAddresses,
  seedOrders,
  seedReviews,
  seedNotifications,
  seedConversations,
  seedMessages,
  seedDisputes,
  seedWalletTransactions,
  seedPayoutRequests,
  seedVerificationRequests,
  seedFlashSales,
  seedFollows,
  seedWholesaleRfqs
} = require('../data/seedData');

const DB_DIR = path.join(__dirname, '..', 'database');
const DB_FILE = path.join(DB_DIR, 'marketzo-db.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      sellers: [],
      categories: [],
      brands: [],
      products: [],
      cart: [],
      wishlist: [],
      addresses: [],
      orders: [],
      reviews: [],
      coupons: [],
      banners: [],
      notifications: [],
      conversations: [],
      messages: [],
      disputes: [],
      walletTransactions: [],
      payoutRequests: [],
      verificationRequests: [],
      flashSales: [],
      follows: [],
      wholesaleRfqs: []
    };
    this.pgPool = null;
    this.mysqlPool = null;
    this.dbEngine = 'local'; // 'postgres' | 'mysql' | 'local'
    this.isConnected = false;
    this.init();
  }

  async init() {
    // 1. Ensure local database directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    // 2. Load cached local state if available
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          users: parsed.users || [],
          sellers: parsed.sellers || []
        };
      } catch (err) {
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }

    // 3. Auto-detect & Connect to PostgreSQL or MySQL
    await this.connectDatabase();
  }

  seedInitialData() {
    this.data = {
      users: [...seedUsers],
      sellers: [...seedSellers],
      categories: [...seedCategories],
      brands: [...seedBrands],
      products: [...seedProducts],
      cart: [],
      wishlist: [],
      addresses: [...seedAddresses],
      orders: [...seedOrders],
      reviews: [...seedReviews],
      coupons: [...seedCoupons],
      banners: [...seedBanners],
      notifications: [...seedNotifications],
      conversations: [...seedConversations],
      messages: [...seedMessages],
      disputes: [...seedDisputes],
      walletTransactions: [...seedWalletTransactions],
      payoutRequests: [...seedPayoutRequests],
      verificationRequests: [...seedVerificationRequests],
      flashSales: [...seedFlashSales],
      follows: [...seedFollows],
      wholesaleRfqs: [...seedWholesaleRfqs]
    };
    this.saveLocal();
  }

  async connectDatabase() {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.MYSQL_URL;

    // Check if PostgreSQL
    const isPostgres = dbUrl?.startsWith('postgres') || process.env.DB_TYPE === 'postgres' || !!process.env.PGHOST;

    if (isPostgres || (dbUrl && dbUrl.includes('postgres'))) {
      await this.connectPostgres(dbUrl);
    } else if (mysql && (process.env.DB_HOST || dbUrl?.startsWith('mysql'))) {
      await this.connectMySQL(dbUrl);
    } else {
      console.log('📦 [DATABASE] Running with fast local file storage fallback.');
    }
  }

  async connectPostgres(dbUrl) {
    const isRenderInternal = dbUrl && (dbUrl.includes('.internal') || dbUrl.includes('dpg-'));
    const initialSsl = isRenderInternal ? undefined : (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined);

    let config = dbUrl
      ? { connectionString: dbUrl, ssl: initialSsl }
      : {
          host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
          user: process.env.PGUSER || process.env.DB_USER || 'postgres',
          password: process.env.PGPASSWORD || process.env.DB_PASSWORD || '',
          database: process.env.PGDATABASE || process.env.DB_NAME || 'marketzo_db',
          ssl: initialSsl
        };

    try {
      try {
        this.pgPool = new PgPool(config);
        await this.pgPool.query('SELECT NOW() as now');
      } catch (connErr) {
        // If SSL was rejected or required, toggle SSL and retry
        console.warn(`[POSTGRESQL] First connection attempt (${connErr.message}). Retrying with alternate SSL setting...`);
        if (this.pgPool) {
          try { await this.pgPool.end(); } catch (e) {}
        }
        config.ssl = config.ssl ? undefined : { rejectUnauthorized: false };
        this.pgPool = new PgPool(config);
        await this.pgPool.query('SELECT NOW() as now');
      }

      this.dbEngine = 'postgres';
      this.isConnected = true;
      console.log('🐘 [POSTGRESQL] Successfully connected to PostgreSQL Database on Render.');
      
      await this.syncPostgresSchema();
      await this.syncFromPostgres();
    } catch (err) {
      this.isConnected = false;
      console.warn(`⚠️ [POSTGRESQL] Connection notice: ${err.message}.`);
      console.warn(`👉 Marketzo is running safely with active local fallback storage.`);
    }
  }

  async syncPostgresSchema() {
    if (!this.pgPool || !this.isConnected) return;
    try {
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.postgres.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await this.pgPool.query(schemaSql);
        console.log('✅ [POSTGRESQL] PostgreSQL tables and indexes verified.');
      }
    } catch (err) {
      console.warn('[POSTGRESQL] Schema sync notice:', err.message);
    }
  }

  async syncFromPostgres() {
    if (!this.pgPool || !this.isConnected) return;
    try {
      const res = await this.pgPool.query('SELECT collection_name, data_json FROM marketzo_collection_data');
      if (res.rows && res.rows.length > 0) {
        for (const row of res.rows) {
          if (row.data_json) {
            try {
              this.data[row.collection_name] = JSON.parse(row.data_json);
            } catch (e) {}
          }
        }
        console.log('📦 [POSTGRESQL] Synchronized all collections from PostgreSQL database.');
      } else {
        await this.persistAllToPostgres();
      }
    } catch (err) {
      console.warn('[POSTGRESQL] Could not sync from table:', err.message);
    }
  }

  async persistCollectionToPostgres(collection) {
    if (!this.pgPool || !this.isConnected) return;
    try {
      const json = JSON.stringify(this.data[collection] || []);
      await this.pgPool.query(
        `INSERT INTO marketzo_collection_data (collection_name, data_json, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (collection_name)
         DO UPDATE SET data_json = EXCLUDED.data_json, updated_at = NOW()`,
        [collection, json]
      );
    } catch (err) {
      console.warn(`[POSTGRESQL] Failed to persist "${collection}":`, err.message);
    }
  }

  async persistAllToPostgres() {
    if (!this.pgPool || !this.isConnected) return;
    for (const key of Object.keys(this.data)) {
      await this.persistCollectionToPostgres(key);
    }
  }

  async connectMySQL(dbUrl) {
    if (!mysql) return;
    try {
      const host = process.env.DB_HOST || 'localhost';
      const port = parseInt(process.env.DB_PORT || '3306', 10);
      const user = process.env.DB_USER || 'root';
      const password = process.env.DB_PASSWORD || '';
      const database = process.env.DB_NAME || 'marketzo_db';
      const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined;

      this.mysqlPool = mysql.createPool(
        dbUrl
          ? { uri: dbUrl, waitForConnections: true, connectionLimit: 10, ...(ssl && { ssl }) }
          : { host, port, user, password, database, waitForConnections: true, connectionLimit: 10, ...(ssl && { ssl }) }
      );

      const [rows] = await this.mysqlPool.query('SELECT 1 as connected');
      if (rows && rows.length > 0) {
        this.dbEngine = 'mysql';
        this.isConnected = true;
        console.log('🐬 [MYSQL] Connected to MySQL database.');
      }
    } catch (err) {
      console.warn(`⚠️ [MYSQL] MySQL notice: ${err.message}`);
    }
  }

  saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ Failed to persist local state:', err.message);
    }
  }

  save(collection = null) {
    this.saveLocal();
    if (this.dbEngine === 'postgres') {
      if (collection) {
        this.persistCollectionToPostgres(collection);
      } else {
        this.persistAllToPostgres();
      }
    }
  }

  // Direct SQL Query
  async query(sql, params = []) {
    if (this.dbEngine === 'postgres' && this.pgPool) {
      const res = await this.pgPool.query(sql, params);
      return { rows: res.rows, rowCount: res.rowCount };
    }
    if (this.dbEngine === 'mysql' && this.mysqlPool) {
      const [results, fields] = await this.mysqlPool.query(sql, params);
      return { rows: results, fields };
    }
    throw new Error('No active SQL database connected.');
  }

  // Query helpers
  findAll(collection, predicate = null) {
    if (!this.data[collection]) return [];
    if (!predicate) return [...this.data[collection]];
    return this.data[collection].filter(predicate);
  }

  findOne(collection, predicate) {
    if (!this.data[collection]) return null;
    return this.data[collection].find(predicate) || null;
  }

  findById(collection, id) {
    return this.findOne(collection, item => item.id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    this.data[collection].push(item);
    this.save(collection);
    return item;
  }

  update(collection, id, updates) {
    if (!this.data[collection]) return null;
    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) return null;
    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save(collection);
    return this.data[collection][index];
  }

  delete(collection, predicateOrId) {
    if (!this.data[collection]) return false;
    const initialLen = this.data[collection].length;
    if (typeof predicateOrId === 'string') {
      this.data[collection] = this.data[collection].filter(item => item.id !== predicateOrId);
    } else if (typeof predicateOrId === 'function') {
      this.data[collection] = this.data[collection].filter(item => !predicateOrId(item));
    }
    const removed = this.data[collection].length < initialLen;
    if (removed) this.save(collection);
    return removed;
  }
}

const db = new Database();
module.exports = db;
