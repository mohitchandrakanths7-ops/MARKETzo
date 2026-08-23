const fs = require('fs');
const path = require('path');
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
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.data,
          ...parsed,
          conversations: parsed.conversations || [...seedConversations],
          messages: parsed.messages || [...seedMessages],
          disputes: parsed.disputes || [...seedDisputes],
          walletTransactions: parsed.walletTransactions || [...seedWalletTransactions],
          payoutRequests: parsed.payoutRequests || [...seedPayoutRequests],
          verificationRequests: parsed.verificationRequests || [...seedVerificationRequests],
          flashSales: parsed.flashSales || [...seedFlashSales],
          follows: parsed.follows || [...seedFollows],
          wholesaleRfqs: parsed.wholesaleRfqs || [...seedWholesaleRfqs]
        };
        console.log('📦 Loaded existing Marketzo database state with upgraded marketplace collections.');
      } catch (err) {
        console.error('⚠️ Could not parse database file, re-initializing with seed data:', err.message);
        this.seed();
      }
    } else {
      console.log('🌱 Initializing brand new Marketzo database with complete seed data...');
      this.seed();
    }
  }

  seed() {
    this.data = {
      users: [...seedUsers],
      sellers: [...seedSellers],
      categories: [...seedCategories],
      brands: [...seedBrands],
      products: [...seedProducts],
      cart: [
        {
          id: 'crt_01',
          userId: 'usr_cust_01',
          productId: 'prod_01',
          quantity: 1,
          variant: 'Midnight Black',
          savedForLater: false,
          addedAt: '2026-08-21T14:00:00.000Z'
        },
        {
          id: 'crt_02',
          userId: 'usr_cust_01',
          productId: 'prod_09',
          quantity: 1,
          variant: 'Space Grey',
          savedForLater: false,
          addedAt: '2026-08-21T14:05:00.000Z'
        }
      ],
      wishlist: [
        {
          id: 'wsh_01',
          userId: 'usr_cust_01',
          productId: 'prod_03',
          addedAt: '2026-08-20T11:00:00.000Z'
        },
        {
          id: 'wsh_02',
          userId: 'usr_cust_01',
          productId: 'prod_05',
          addedAt: '2026-08-20T11:05:00.000Z'
        }
      ],
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
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('❌ Failed to persist database state:', err.message);
    }
  }

  // Generic query helpers
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
    this.save();
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
    this.save();
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
    if (removed) this.save();
    return removed;
  }
}

const db = new Database();
module.exports = db;
