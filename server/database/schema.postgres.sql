-- =========================================================
-- MARKETZO MULTI-VENDOR MARKETPLACE
-- COMPLETE POSTGRESQL DATABASE SCHEMA (RENDER COMPATIBLE)
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  avatar TEXT,
  phone VARCHAR(50),
  "createdAt" VARCHAR(64),
  "updatedAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Sellers Table
CREATE TABLE IF NOT EXISTS sellers (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  "storeName" VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo TEXT,
  banner TEXT,
  description TEXT,
  phone VARCHAR(50),
  rating NUMERIC(3,2) DEFAULT 5.0,
  "reviewCount" INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'approved',
  "commissionRate" NUMERIC(5,2) DEFAULT 10.0,
  "businessAddress" TEXT,
  "taxId" VARCHAR(100),
  "payoutBank" VARCHAR(255),
  "joinedAt" VARCHAR(64),
  "updatedAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_sellers_userId ON sellers("userId");
CREATE INDEX IF NOT EXISTS idx_sellers_slug ON sellers(slug);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(100),
  image TEXT,
  description TEXT,
  featured BOOLEAN DEFAULT TRUE,
  "createdAt" VARCHAR(64),
  "updatedAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- 4. Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo TEXT,
  featured BOOLEAN DEFAULT TRUE,
  "createdAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  "sellerId" VARCHAR(64),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  "categoryId" VARCHAR(64),
  "brandId" VARCHAR(64),
  price NUMERIC(10,2) NOT NULL,
  "originalPrice" NUMERIC(10,2),
  "discountPercent" INT DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  "reviewCount" INT DEFAULT 0,
  stock INT DEFAULT 0,
  images JSONB,
  variants JSONB,
  specs JSONB,
  features JSONB,
  tags JSONB,
  "isFeatured" BOOLEAN DEFAULT FALSE,
  "isTrending" BOOLEAN DEFAULT FALSE,
  "isBestSeller" BOOLEAN DEFAULT FALSE,
  "isNewArrival" BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'approved',
  "createdAt" VARCHAR(64),
  "updatedAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_products_sellerId ON products("sellerId");
CREATE INDEX IF NOT EXISTS idx_products_categoryId ON products("categoryId");
CREATE INDEX IF NOT EXISTS idx_products_brandId ON products("brandId");

-- 6. Cart Table
CREATE TABLE IF NOT EXISTS cart (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  "productId" VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  variant VARCHAR(255),
  "savedForLater" BOOLEAN DEFAULT FALSE,
  "addedAt" VARCHAR(64),
  "updatedAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_cart_userId ON cart("userId");

-- 7. Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  "productId" VARCHAR(64) NOT NULL,
  "addedAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_wishlist_userId ON wishlist("userId");

-- 8. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  street TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(50) NOT NULL,
  country VARCHAR(100) DEFAULT 'United States',
  type VARCHAR(50) DEFAULT 'Home',
  "isDefault" BOOLEAN DEFAULT FALSE,
  "createdAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_addresses_userId ON addresses("userId");

-- 9. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  "orderNumber" VARCHAR(100) NOT NULL UNIQUE,
  "userId" VARCHAR(64) NOT NULL,
  "sellerIds" JSONB,
  items JSONB NOT NULL,
  "shippingAddress" JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  "discountAmount" NUMERIC(10,2) DEFAULT 0.00,
  "shippingFee" NUMERIC(10,2) DEFAULT 0.00,
  "taxAmount" NUMERIC(10,2) DEFAULT 0.00,
  "totalAmount" NUMERIC(10,2) NOT NULL,
  "couponApplied" VARCHAR(100),
  "paymentMethod" VARCHAR(100),
  "paymentStatus" VARCHAR(50) DEFAULT 'pending',
  "orderStatus" VARCHAR(50) DEFAULT 'Pending',
  timeline JSONB,
  "createdAt" VARCHAR(64),
  "updatedAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders("userId");

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  "productId" VARCHAR(64) NOT NULL,
  "userId" VARCHAR(64) NOT NULL,
  "userName" VARCHAR(255),
  "userAvatar" TEXT,
  rating INT NOT NULL,
  title VARCHAR(255),
  comment TEXT,
  "verifiedPurchase" BOOLEAN DEFAULT TRUE,
  "helpfulVotes" INT DEFAULT 0,
  "createdAt" VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_reviews_productId ON reviews("productId");

-- 11. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  "discountType" VARCHAR(50) NOT NULL,
  "discountValue" NUMERIC(10,2) NOT NULL,
  "minOrderValue" NUMERIC(10,2) DEFAULT 0.00,
  "maxDiscount" NUMERIC(10,2),
  "expiresAt" VARCHAR(64),
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  "createdAt" VARCHAR(64)
);

-- 12. Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(255),
  "buttonText" VARCHAR(100),
  link VARCHAR(255),
  "bgGradient" VARCHAR(255),
  badge VARCHAR(100),
  image TEXT,
  active BOOLEAN DEFAULT TRUE,
  "sortOrder" INT DEFAULT 0
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'system',
  "readStatus" BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  "createdAt" VARCHAR(64)
);

-- 14. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(64) PRIMARY KEY,
  "customerId" VARCHAR(64) NOT NULL,
  "customerName" VARCHAR(255),
  "sellerId" VARCHAR(64) NOT NULL,
  "sellerName" VARCHAR(255),
  "productId" VARCHAR(64),
  "productName" VARCHAR(255),
  "productImage" TEXT,
  "productPrice" NUMERIC(10,2),
  "lastMessage" TEXT,
  "lastMessageTime" VARCHAR(64),
  "unreadCountCustomer" INT DEFAULT 0,
  "unreadCountSeller" INT DEFAULT 0,
  "createdAt" VARCHAR(64)
);

-- 15. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  "conversationId" VARCHAR(64) NOT NULL,
  "senderId" VARCHAR(64) NOT NULL,
  "senderRole" VARCHAR(50) NOT NULL,
  "senderName" VARCHAR(255),
  text TEXT,
  image TEXT,
  "readStatus" BOOLEAN DEFAULT FALSE,
  "createdAt" VARCHAR(64)
);

-- 16. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
  id VARCHAR(64) PRIMARY KEY,
  "orderId" VARCHAR(64) NOT NULL,
  "orderNumber" VARCHAR(100),
  "customerId" VARCHAR(64) NOT NULL,
  "customerName" VARCHAR(255),
  "sellerId" VARCHAR(64) NOT NULL,
  "sellerName" VARCHAR(255),
  reason VARCHAR(100) NOT NULL,
  "reasonLabel" VARCHAR(255),
  description TEXT,
  images JSONB,
  "requestedAmount" NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'under_review',
  "sellerResponse" TEXT,
  "sellerResponseAt" VARCHAR(64),
  "adminResolution" TEXT,
  "createdAt" VARCHAR(64)
);

-- 17. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id VARCHAR(64) PRIMARY KEY,
  "sellerId" VARCHAR(64) NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  "createdAt" VARCHAR(64)
);

-- 18. Payout Requests Table
CREATE TABLE IF NOT EXISTS payout_requests (
  id VARCHAR(64) PRIMARY KEY,
  "sellerId" VARCHAR(64) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  "payoutMethod" VARCHAR(50) DEFAULT 'bank_transfer',
  "accountDetails" TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  "requestedAt" VARCHAR(64),
  "processedAt" VARCHAR(64),
  "referenceId" VARCHAR(100)
);

-- 19. Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
  id VARCHAR(64) PRIMARY KEY,
  "sellerId" VARCHAR(64) NOT NULL,
  "sellerName" VARCHAR(255),
  "businessType" VARCHAR(100),
  "registrationNumber" VARCHAR(100),
  "taxId" VARCHAR(100),
  "identityProofUrl" TEXT,
  "businessProofUrl" TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  "assignedBadges" JSONB,
  "adminNotes" TEXT,
  "submittedAt" VARCHAR(64),
  "reviewedAt" VARCHAR(64)
);

-- 20. Flash Sales Table
CREATE TABLE IF NOT EXISTS flash_sales (
  id VARCHAR(64) PRIMARY KEY,
  "productId" VARCHAR(64) NOT NULL,
  "productName" VARCHAR(255),
  "sellerId" VARCHAR(64),
  "originalPrice" NUMERIC(10,2),
  "salePrice" NUMERIC(10,2),
  "discountPercent" INT,
  "saleStockTotal" INT,
  "saleStockRemaining" INT,
  "startTime" VARCHAR(64),
  "endTime" VARCHAR(64),
  status VARCHAR(50) DEFAULT 'active'
);

-- 21. Follows Table
CREATE TABLE IF NOT EXISTS follows (
  id VARCHAR(64) PRIMARY KEY,
  "customerId" VARCHAR(64) NOT NULL,
  "sellerId" VARCHAR(64) NOT NULL,
  "createdAt" VARCHAR(64)
);

-- 22. Wholesale RFQs Table
CREATE TABLE IF NOT EXISTS wholesale_rfqs (
  id VARCHAR(64) PRIMARY KEY,
  "productId" VARCHAR(64) NOT NULL,
  "productName" VARCHAR(255),
  "sellerId" VARCHAR(64),
  "sellerName" VARCHAR(255),
  "customerId" VARCHAR(64) NOT NULL,
  "customerName" VARCHAR(255),
  "customerEmail" VARCHAR(255),
  "targetQuantity" INT NOT NULL,
  "targetPricePerUnit" NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  "shippingDestination" TEXT,
  "buyerMessage" TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  "sellerQuote" JSONB,
  "createdAt" VARCHAR(64),
  "updatedAt" VARCHAR(64)
);

-- 23. Marketzo Collection Sync State Table
CREATE TABLE IF NOT EXISTS marketzo_collection_data (
  collection_name VARCHAR(64) PRIMARY KEY,
  data_json TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
