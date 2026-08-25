-- =========================================================
-- MARKETZO MULTI-VENDOR MARKETPLACE
-- COMPLETE MYSQL RELATIONAL DATABASE SCHEMA
-- =========================================================

CREATE DATABASE IF NOT EXISTS `marketzo_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `marketzo_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'seller', 'admin') NOT NULL DEFAULT 'customer',
  `avatar` TEXT,
  `phone` VARCHAR(50),
  `createdAt` VARCHAR(64),
  `updatedAt` VARCHAR(64),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Sellers Table
CREATE TABLE IF NOT EXISTS `sellers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `userId` VARCHAR(64) NOT NULL,
  `storeName` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `logo` TEXT,
  `banner` TEXT,
  `description` TEXT,
  `phone` VARCHAR(50),
  `rating` DECIMAL(3,2) DEFAULT 5.0,
  `reviewCount` INT DEFAULT 0,
  `status` ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'approved',
  `commissionRate` DECIMAL(5,2) DEFAULT 10.0,
  `businessAddress` TEXT,
  `taxId` VARCHAR(100),
  `payoutBank` VARCHAR(255),
  `joinedAt` VARCHAR(64),
  `updatedAt` VARCHAR(64),
  INDEX `idx_sellers_userId` (`userId`),
  INDEX `idx_sellers_slug` (`slug`),
  INDEX `idx_sellers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `icon` VARCHAR(100),
  `image` TEXT,
  `description` TEXT,
  `featured` BOOLEAN DEFAULT TRUE,
  `createdAt` VARCHAR(64),
  `updatedAt` VARCHAR(64),
  INDEX `idx_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Brands Table
CREATE TABLE IF NOT EXISTS `brands` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `logo` TEXT,
  `featured` BOOLEAN DEFAULT TRUE,
  `createdAt` VARCHAR(64),
  INDEX `idx_brands_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(64) PRIMARY KEY,
  `sellerId` VARCHAR(64),
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100),
  `description` LONGTEXT,
  `categoryId` VARCHAR(64),
  `brandId` VARCHAR(64),
  `price` DECIMAL(10,2) NOT NULL,
  `originalPrice` DECIMAL(10,2),
  `discountPercent` INT DEFAULT 0,
  `rating` DECIMAL(3,2) DEFAULT 5.0,
  `reviewCount` INT DEFAULT 0,
  `stock` INT DEFAULT 0,
  `images` JSON,
  `variants` JSON,
  `specs` JSON,
  `features` JSON,
  `tags` JSON,
  `isFeatured` BOOLEAN DEFAULT FALSE,
  `isTrending` BOOLEAN DEFAULT FALSE,
  `isBestSeller` BOOLEAN DEFAULT FALSE,
  `isNewArrival` BOOLEAN DEFAULT FALSE,
  `status` ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'approved',
  `createdAt` VARCHAR(64),
  `updatedAt` VARCHAR(64),
  INDEX `idx_products_sellerId` (`sellerId`),
  INDEX `idx_products_categoryId` (`categoryId`),
  INDEX `idx_products_brandId` (`brandId`),
  INDEX `idx_products_slug` (`slug`),
  INDEX `idx_products_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Cart Table
CREATE TABLE IF NOT EXISTS `cart` (
  `id` VARCHAR(64) PRIMARY KEY,
  `userId` VARCHAR(64) NOT NULL,
  `productId` VARCHAR(64) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `variant` VARCHAR(255),
  `savedForLater` BOOLEAN DEFAULT FALSE,
  `addedAt` VARCHAR(64),
  `updatedAt` VARCHAR(64),
  INDEX `idx_cart_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Wishlist Table
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` VARCHAR(64) PRIMARY KEY,
  `userId` VARCHAR(64) NOT NULL,
  `productId` VARCHAR(64) NOT NULL,
  `addedAt` VARCHAR(64),
  INDEX `idx_wishlist_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Addresses Table
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` VARCHAR(64) PRIMARY KEY,
  `userId` VARCHAR(64) NOT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `street` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(50) NOT NULL,
  `country` VARCHAR(100) DEFAULT 'United States',
  `type` VARCHAR(50) DEFAULT 'Home',
  `isDefault` BOOLEAN DEFAULT FALSE,
  `createdAt` VARCHAR(64),
  INDEX `idx_addresses_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `orderNumber` VARCHAR(100) NOT NULL UNIQUE,
  `userId` VARCHAR(64) NOT NULL,
  `sellerIds` JSON,
  `items` JSON NOT NULL,
  `shippingAddress` JSON NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `discountAmount` DECIMAL(10,2) DEFAULT 0.00,
  `shippingFee` DECIMAL(10,2) DEFAULT 0.00,
  `taxAmount` DECIMAL(10,2) DEFAULT 0.00,
  `totalAmount` DECIMAL(10,2) NOT NULL,
  `couponApplied` VARCHAR(100),
  `paymentMethod` VARCHAR(100),
  `paymentStatus` VARCHAR(50) DEFAULT 'pending',
  `orderStatus` VARCHAR(50) DEFAULT 'Pending',
  `timeline` JSON,
  `createdAt` VARCHAR(64),
  `updatedAt` VARCHAR(64),
  INDEX `idx_orders_userId` (`userId`),
  INDEX `idx_orders_orderNumber` (`orderNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(64) PRIMARY KEY,
  `productId` VARCHAR(64) NOT NULL,
  `userId` VARCHAR(64) NOT NULL,
  `userName` VARCHAR(255),
  `userAvatar` TEXT,
  `rating` INT NOT NULL,
  `title` VARCHAR(255),
  `comment` TEXT,
  `verifiedPurchase` BOOLEAN DEFAULT TRUE,
  `helpfulVotes` INT DEFAULT 0,
  `createdAt` VARCHAR(64),
  INDEX `idx_reviews_productId` (`productId`),
  INDEX `idx_reviews_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Coupons Table
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `discountType` VARCHAR(50) NOT NULL,
  `discountValue` DECIMAL(10,2) NOT NULL,
  `minOrderValue` DECIMAL(10,2) DEFAULT 0.00,
  `maxDiscount` DECIMAL(10,2),
  `expiresAt` VARCHAR(64),
  `description` TEXT,
  `active` BOOLEAN DEFAULT TRUE,
  `createdAt` VARCHAR(64),
  INDEX `idx_coupons_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Banners Table
CREATE TABLE IF NOT EXISTS `banners` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255),
  `subtitle` VARCHAR(255),
  `buttonText` VARCHAR(100),
  `link` VARCHAR(255),
  `bgGradient` VARCHAR(255),
  `badge` VARCHAR(100),
  `image` TEXT,
  `active` BOOLEAN DEFAULT TRUE,
  `sortOrder` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(64) PRIMARY KEY,
  `userId` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'system',
  `readStatus` BOOLEAN DEFAULT FALSE,
  `link` VARCHAR(255),
  `createdAt` VARCHAR(64),
  INDEX `idx_notifications_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Conversations Table
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` VARCHAR(64) PRIMARY KEY,
  `customerId` VARCHAR(64) NOT NULL,
  `customerName` VARCHAR(255),
  `sellerId` VARCHAR(64) NOT NULL,
  `sellerName` VARCHAR(255),
  `productId` VARCHAR(64),
  `productName` VARCHAR(255),
  `productImage` TEXT,
  `productPrice` DECIMAL(10,2),
  `lastMessage` TEXT,
  `lastMessageTime` VARCHAR(64),
  `unreadCountCustomer` INT DEFAULT 0,
  `unreadCountSeller` INT DEFAULT 0,
  `createdAt` VARCHAR(64),
  INDEX `idx_conversations_customer` (`customerId`),
  INDEX `idx_conversations_seller` (`sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Messages Table
CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(64) PRIMARY KEY,
  `conversationId` VARCHAR(64) NOT NULL,
  `senderId` VARCHAR(64) NOT NULL,
  `senderRole` VARCHAR(50) NOT NULL,
  `senderName` VARCHAR(255),
  `text` TEXT,
  `image` TEXT,
  `readStatus` BOOLEAN DEFAULT FALSE,
  `createdAt` VARCHAR(64),
  INDEX `idx_messages_conversationId` (`conversationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Disputes Table
CREATE TABLE IF NOT EXISTS `disputes` (
  `id` VARCHAR(64) PRIMARY KEY,
  `orderId` VARCHAR(64) NOT NULL,
  `orderNumber` VARCHAR(100),
  `customerId` VARCHAR(64) NOT NULL,
  `customerName` VARCHAR(255),
  `sellerId` VARCHAR(64) NOT NULL,
  `sellerName` VARCHAR(255),
  `reason` VARCHAR(100) NOT NULL,
  `reasonLabel` VARCHAR(255),
  `description` TEXT,
  `images` JSON,
  `requestedAmount` DECIMAL(10,2),
  `status` VARCHAR(50) DEFAULT 'under_review',
  `sellerResponse` TEXT,
  `sellerResponseAt` VARCHAR(64),
  `adminResolution` TEXT,
  `createdAt` VARCHAR(64),
  INDEX `idx_disputes_orderId` (`orderId`),
  INDEX `idx_disputes_sellerId` (`sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Wallet Transactions Table
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `sellerId` VARCHAR(64) NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `description` TEXT,
  `status` VARCHAR(50) DEFAULT 'completed',
  `createdAt` VARCHAR(64),
  INDEX `idx_wallet_sellerId` (`sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Payout Requests Table
CREATE TABLE IF NOT EXISTS `payout_requests` (
  `id` VARCHAR(64) PRIMARY KEY,
  `sellerId` VARCHAR(64) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `payoutMethod` VARCHAR(50) DEFAULT 'bank_transfer',
  `accountDetails` TEXT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `requestedAt` VARCHAR(64),
  `processedAt` VARCHAR(64),
  `referenceId` VARCHAR(100),
  INDEX `idx_payout_sellerId` (`sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Verification Requests Table
CREATE TABLE IF NOT EXISTS `verification_requests` (
  `id` VARCHAR(64) PRIMARY KEY,
  `sellerId` VARCHAR(64) NOT NULL,
  `sellerName` VARCHAR(255),
  `businessType` VARCHAR(100),
  `registrationNumber` VARCHAR(100),
  `taxId` VARCHAR(100),
  `identityProofUrl` TEXT,
  `businessProofUrl` TEXT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `assignedBadges` JSON,
  `adminNotes` TEXT,
  `submittedAt` VARCHAR(64),
  `reviewedAt` VARCHAR(64),
  INDEX `idx_verification_sellerId` (`sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Flash Sales Table
CREATE TABLE IF NOT EXISTS `flash_sales` (
  `id` VARCHAR(64) PRIMARY KEY,
  `productId` VARCHAR(64) NOT NULL,
  `productName` VARCHAR(255),
  `sellerId` VARCHAR(64),
  `originalPrice` DECIMAL(10,2),
  `salePrice` DECIMAL(10,2),
  `discountPercent` INT,
  `saleStockTotal` INT,
  `saleStockRemaining` INT,
  `startTime` VARCHAR(64),
  `endTime` VARCHAR(64),
  `status` VARCHAR(50) DEFAULT 'active',
  INDEX `idx_flash_productId` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Follows Table
CREATE TABLE IF NOT EXISTS `follows` (
  `id` VARCHAR(64) PRIMARY KEY,
  `customerId` VARCHAR(64) NOT NULL,
  `sellerId` VARCHAR(64) NOT NULL,
  `createdAt` VARCHAR(64),
  INDEX `idx_follows_customer_seller` (`customerId`, `sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Wholesale RFQs Table
CREATE TABLE IF NOT EXISTS `wholesale_rfqs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `productId` VARCHAR(64) NOT NULL,
  `productName` VARCHAR(255),
  `sellerId` VARCHAR(64),
  `sellerName` VARCHAR(255),
  `customerId` VARCHAR(64) NOT NULL,
  `customerName` VARCHAR(255),
  `customerEmail` VARCHAR(255),
  `targetQuantity` INT NOT NULL,
  `targetPricePerUnit` DECIMAL(10,2),
  `currency` VARCHAR(10) DEFAULT 'USD',
  `shippingDestination` TEXT,
  `buyerMessage` TEXT,
  `status` VARCHAR(50) DEFAULT 'pending',
  `sellerQuote` JSON,
  `createdAt` VARCHAR(64),
  `updatedAt` VARCHAR(64),
  INDEX `idx_rfq_customer` (`customerId`),
  INDEX `idx_rfq_seller` (`sellerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Collection Store State (JSON Sync Table)
CREATE TABLE IF NOT EXISTS `marketzo_collection_data` (
  `collection_name` VARCHAR(64) PRIMARY KEY,
  `data_json` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
