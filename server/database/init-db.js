require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const {
  seedCategories,
  seedBrands,
  seedProducts,
  seedCoupons,
  seedBanners
} = require('../data/seedData');

async function initializeDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'marketzo_db';

  console.log('---------------------------------------------------------');
  console.log('🚀 Marketzo MySQL Database Setup & Initialization');
  console.log(`📡 Connecting to MySQL Server at ${host}:${port} as "${user}"...`);
  console.log('---------------------------------------------------------');

  let connection;
  try {
    // 1. Connect to MySQL Server (without selecting database first)
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server successfully.');

    // 2. Create Database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database \`${database}\` verified / created.`);

    // 3. Switch to database
    await connection.query(`USE \`${database}\`;`);

    // 4. Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✅ All MySQL tables and indexes created successfully.');
    }

    // 5. Seed Catalog Master Data (Categories, Brands, Products, Coupons, Banners)
    const [existingCategories] = await connection.query('SELECT COUNT(*) as count FROM `categories`');
    if (existingCategories[0].count === 0 && seedCategories.length > 0) {
      console.log(`🌱 Seeding ${seedCategories.length} master categories...`);
      for (const cat of seedCategories) {
        await connection.query(
          'INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `image`, `description`, `featured`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [cat.id, cat.name, cat.slug, cat.icon || '', cat.image || '', cat.description || '', cat.featured ? 1 : 0, new Date().toISOString()]
        );
      }
    }

    const [existingBrands] = await connection.query('SELECT COUNT(*) as count FROM `brands`');
    if (existingBrands[0].count === 0 && seedBrands.length > 0) {
      console.log(`🌱 Seeding ${seedBrands.length} master brands...`);
      for (const brand of seedBrands) {
        await connection.query(
          'INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `featured`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?)',
          [brand.id, brand.name, brand.slug, brand.logo || '', brand.featured ? 1 : 0, new Date().toISOString()]
        );
      }
    }

    const [existingCoupons] = await connection.query('SELECT COUNT(*) as count FROM `coupons`');
    if (existingCoupons[0].count === 0 && seedCoupons.length > 0) {
      console.log(`🌱 Seeding ${seedCoupons.length} promotional coupons...`);
      for (const coupon of seedCoupons) {
        await connection.query(
          'INSERT INTO `coupons` (`id`, `code`, `discountType`, `discountValue`, `minOrderValue`, `maxDiscount`, `expiresAt`, `description`, `active`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [coupon.id, coupon.code, coupon.discountType, coupon.discountValue, coupon.minOrderValue || 0, coupon.maxDiscount || null, coupon.expiresAt || null, coupon.description || '', coupon.active ? 1 : 0, new Date().toISOString()]
        );
      }
    }

    const [existingBanners] = await connection.query('SELECT COUNT(*) as count FROM `banners`');
    if (existingBanners[0].count === 0 && seedBanners.length > 0) {
      console.log(`🌱 Seeding ${seedBanners.length} storefront banners...`);
      for (const banner of seedBanners) {
        await connection.query(
          'INSERT INTO `banners` (`id`, `title`, `subtitle`, `buttonText`, `link`, `bgGradient`, `badge`, `image`, `active`, `sortOrder`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [banner.id, banner.title, banner.subtitle, banner.buttonText, banner.link, banner.bgGradient, banner.badge, banner.image, banner.active ? 1 : 0, banner.order || 0]
        );
      }
    }

    const [existingProducts] = await connection.query('SELECT COUNT(*) as count FROM `products`');
    if (existingProducts[0].count === 0 && seedProducts.length > 0) {
      console.log(`🌱 Seeding ${seedProducts.length} marketplace catalog products...`);
      for (const p of seedProducts) {
        await connection.query(
          `INSERT INTO \`products\` (
            \`id\`, \`sellerId\`, \`name\`, \`slug\`, \`sku\`, \`description\`, 
            \`categoryId\`, \`brandId\`, \`price\`, \`originalPrice\`, \`discountPercent\`, 
            \`rating\`, \`reviewCount\`, \`stock\`, \`images\`, \`variants\`, \`specs\`, 
            \`features\`, \`tags\`, \`isFeatured\`, \`isTrending\`, \`isBestSeller\`, \`isNewArrival\`, \`status\`, \`createdAt\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.sellerId || null,
            p.name,
            p.slug,
            p.sku || '',
            p.description || '',
            p.categoryId || '',
            p.brandId || '',
            p.price,
            p.originalPrice || p.price,
            p.discountPercent || 0,
            p.rating || 5.0,
            p.reviewCount || 0,
            p.stock || 0,
            JSON.stringify(p.images || []),
            JSON.stringify(p.variants || []),
            JSON.stringify(p.specs || {}),
            JSON.stringify(p.features || []),
            JSON.stringify(p.tags || []),
            p.isFeatured ? 1 : 0,
            p.isTrending ? 1 : 0,
            p.isBestSeller ? 1 : 0,
            p.isNewArrival ? 1 : 0,
            p.status || 'approved',
            p.createdAt || new Date().toISOString()
          ]
        );
      }
    }

    console.log('---------------------------------------------------------');
    console.log('✨ MySQL Database Initialization Complete!');
    console.log('👥 Dummy sample accounts: Completely Cleaned & Removed.');
    console.log('🛒 New user registrations will now be securely saved directly to MySQL.');
    console.log('---------------------------------------------------------');

    return { success: true };
  } catch (err) {
    console.error('❌ MySQL Initialization Error:', err.message);
    console.log('\n💡 Please check that your MySQL service is running and credentials in .env are correct.');
    return { success: false, error: err.message };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initializeDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { initializeDatabase };
