const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const defaultHashedPassword = bcrypt.hashSync('password123', salt);

const seedUsers = [];

const seedSellers = [];

const seedCategories = [
  {
    id: 'cat_electronics',
    name: 'Electronics & Audio',
    slug: 'electronics-audio',
    icon: 'Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
    description: 'Studio headphones, high-fidelity wireless sound, soundbars & smart home tech.',
    featured: true
  },
  {
    id: 'cat_mobiles',
    name: 'Mobiles & Tablets',
    slug: 'mobiles-tablets',
    icon: 'Smartphone',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80',
    description: 'Flagship smartphones, pro tablets, foldable tech and premium cases.',
    featured: true
  },
  {
    id: 'cat_laptops',
    name: 'Laptops & Computers',
    slug: 'laptops-computers',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
    description: 'High-performance workstation ultrabooks, OLED monitors, and gaming rigs.',
    featured: true
  },
  {
    id: 'cat_fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    icon: 'Shirt',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&auto=format&fit=crop&q=80',
    description: 'Designer streetwear, tailored outerwear, luxury linen, and footwear.',
    featured: true
  },
  {
    id: 'cat_jewellery',
    name: 'Jewellery & Watches',
    slug: 'jewellery-watches',
    icon: 'Gem',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80',
    description: 'Automatic chronographs, solitaire diamonds, and handcrafted gold ornaments.',
    featured: true
  },
  {
    id: 'cat_home',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: 'Home',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
    description: 'Artisan espresso makers, Nordic cookware, air purifiers, and smart decor.',
    featured: true
  },
  {
    id: 'cat_beauty',
    name: 'Beauty & Skincare',
    slug: 'beauty-skincare',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80',
    description: 'Dermatologist-grade serums, organic botanical oils, and luxury fragrances.',
    featured: true
  },
  {
    id: 'cat_sports',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
    description: 'Smart fitness wearables, adjustable dumbbells, and endurance apparel.',
    featured: false
  },
  {
    id: 'cat_grocery',
    name: 'Gourmet & Organic',
    slug: 'gourmet-organic',
    icon: 'ShoppingBag',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
    description: 'Single-origin coffee beans, cold-pressed olive oils, and artisan snacks.',
    featured: false
  },
  {
    id: 'cat_accessories',
    name: 'Smart Accessories',
    slug: 'smart-accessories',
    icon: 'Watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
    description: 'MagSafe charging stations, leather tech folios, and mechanical keyboards.',
    featured: false
  },
  {
    id: 'cat_books',
    name: 'Books & Literature',
    slug: 'books-literature',
    icon: 'BookOpen',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    description: 'Bestselling business strategy, design principles, science, and fiction.',
    featured: false
  },
  {
    id: 'cat_toys',
    name: 'Toys & Gaming',
    slug: 'toys-gaming',
    icon: 'Gamepad2',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&auto=format&fit=crop&q=80',
    description: 'STEM robotics sets, collectible figures, and ergonomic game controllers.',
    featured: false
  }
];

const seedBrands = [
  { id: 'br_sonic', name: 'SonicPulse', categoryId: 'cat_electronics' },
  { id: 'br_aurora', name: 'AuroraTech', categoryId: 'cat_mobiles' },
  { id: 'br_zenith', name: 'Zenith Pro', categoryId: 'cat_laptops' },
  { id: 'br_vanguard', name: 'Vanguard Studios', categoryId: 'cat_fashion' },
  { id: 'br_lumiere', name: 'Lumière Joaillerie', categoryId: 'cat_jewellery' },
  { id: 'br_nordic', name: 'NordicCraft', categoryId: 'cat_home' },
  { id: 'br_botanica', name: 'Botanica Lab', categoryId: 'cat_beauty' },
  { id: 'br_apexfit', name: 'ApexFit', categoryId: 'cat_sports' }
];
const seedProducts = [];


const seedCoupons = [
  {
    id: 'cpn_01',
    code: 'MARKETZO10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 50,
    maxDiscountAmount: 50,
    description: 'Get 10% instant discount on orders above $50',
    expiryDate: '2027-12-31T23:59:59.000Z',
    isActive: true,
    usageLimit: 10000,
    usedCount: 384
  },
  {
    id: 'cpn_02',
    code: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    minOrderValue: 150,
    maxDiscountAmount: 100,
    description: 'Enjoy 25% off storewide on orders over $150',
    expiryDate: '2027-09-30T23:59:59.000Z',
    isActive: true,
    usageLimit: 5000,
    usedCount: 912
  },
  {
    id: 'cpn_03',
    code: 'FREESHIP',
    discountType: 'shipping',
    discountValue: 15,
    minOrderValue: 30,
    maxDiscountAmount: 15,
    description: 'Free express shipping on your entire cart',
    expiryDate: '2027-12-31T23:59:59.000Z',
    isActive: true,
    usageLimit: 20000,
    usedCount: 1420
  },
  {
    id: 'cpn_04',
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderValue: 250,
    maxDiscountAmount: 50,
    description: 'Flat $50 off on high-value orders above $250',
    expiryDate: '2027-12-31T23:59:59.000Z',
    isActive: true,
    usageLimit: 1000,
    usedCount: 204
  }
];

const seedBanners = [
  {
    id: 'ban_01',
    title: 'Flagship Acoustic Symphony',
    subtitle: 'SonicPulse Pro Studio ANC Series with 55hr battery life',
    tag: 'LIMITED SPECIAL RELEASE',
    buttonText: 'Shop Electronics',
    link: '/category/electronics-audio',
    bgGradient: 'from-indigo-900 via-slate-900 to-indigo-950',
    badge: 'SAVE UP TO 30%',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=80',
    active: true,
    order: 1
  },
  {
    id: 'ban_02',
    title: 'The Autumn Wool Collection',
    subtitle: '100% Virgin Merino Wool Tailored Overcoats and Knitwear',
    tag: 'URBAN THREADZ EXCLUSIVE',
    buttonText: 'Explore Collection',
    link: '/category/fashion-apparel',
    bgGradient: 'from-amber-950 via-stone-900 to-stone-950',
    badge: 'NEW ARRIVALS 2026',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=700&auto=format&fit=crop&q=80',
    active: true,
    order: 2
  },
  {
    id: 'ban_03',
    title: 'Next-Gen Computing Power',
    subtitle: 'OLED Studio Workstations & Flagship 5G Flagship Devices',
    tag: 'TECH FESTIVAL SALE',
    buttonText: 'View Tech Deals',
    link: '/category/laptops-computers',
    bgGradient: 'from-cyan-950 via-slate-900 to-blue-950',
    badge: 'FREE EXPRESS SHIPPING',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&auto=format&fit=crop&q=80',
    active: true,
    order: 3
  }
];

const seedAddresses = [];
const seedOrders = [];
const seedReviews = [];
const seedNotifications = [];
const seedConversations = [];
const seedMessages = [];
const seedDisputes = [];
const seedWalletTransactions = [];
const seedPayoutRequests = [];
const seedVerificationRequests = [];
const seedFlashSales = [];
const seedFollows = [];
const seedWholesaleRfqs = [];

module.exports = {
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
};
