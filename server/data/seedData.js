const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const defaultHashedPassword = bcrypt.hashSync('password123', salt);

const seedUsers = [
  {
    id: 'usr_admin_01',
    name: 'Platform Administrator',
    email: 'admin@marketzo.com',
    password: defaultHashedPassword,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 019-2831',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_seller_01',
    name: 'Marcus Vance',
    email: 'techstore@marketzo.com',
    password: defaultHashedPassword,
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 392-1082',
    createdAt: '2026-01-10T08:30:00.000Z'
  },
  {
    id: 'usr_seller_02',
    name: 'Elena Rostova',
    email: 'fashionhub@marketzo.com',
    password: defaultHashedPassword,
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 782-9901',
    createdAt: '2026-01-15T10:15:00.000Z'
  },
  {
    id: 'usr_seller_03',
    name: 'Devon Patel',
    email: 'jewelcraft@marketzo.com',
    password: defaultHashedPassword,
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 441-2299',
    createdAt: '2026-02-01T14:20:00.000Z'
  },
  {
    id: 'usr_cust_01',
    name: 'Alex Mercer',
    email: 'alex@marketzo.com',
    password: defaultHashedPassword,
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 234-5678',
    createdAt: '2026-01-20T12:00:00.000Z'
  }
];

const seedSellers = [
  {
    id: 'sel_01',
    userId: 'usr_seller_01',
    storeName: 'Apex Tech Labs',
    slug: 'apex-tech-labs',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    description: 'Premier authorized distributor of flagship electronics, acoustic audio, and next-gen gaming hardware.',
    phone: '+1 (555) 392-1082',
    rating: 4.9,
    reviewCount: 328,
    status: 'approved',
    commissionRate: 8.5,
    businessAddress: '742 Silicon Parkway, San Jose, CA 95110',
    taxId: 'US-TX-9841203',
    payoutBank: 'Silicon Valley Commercial Bank (Ending in 4092)',
    joinedAt: '2026-01-10T08:30:00.000Z'
  },
  {
    id: 'sel_02',
    userId: 'usr_seller_02',
    storeName: 'Urban Threadz & Co',
    slug: 'urban-threadz',
    logo: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
    description: 'Boutique sustainable street couture, organic knitwear, and modern luxury essentials.',
    phone: '+1 (555) 782-9901',
    rating: 4.8,
    reviewCount: 194,
    status: 'approved',
    commissionRate: 10.0,
    businessAddress: '108 Soho Fashion Walk, New York, NY 10012',
    taxId: 'US-NY-7712904',
    payoutBank: 'Manhattan Trust Bank (Ending in 8819)',
    joinedAt: '2026-01-15T10:15:00.000Z'
  },
  {
    id: 'sel_03',
    userId: 'usr_seller_03',
    storeName: 'Aura Luxe Jewels',
    slug: 'aura-luxe-jewels',
    logo: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&auto=format&fit=crop&q=80',
    description: 'Handcrafted artisan diamond solitaires, ethically sourced gemstones, and 18K solid gold pieces.',
    phone: '+1 (555) 441-2299',
    rating: 4.7,
    reviewCount: 42,
    status: 'pending',
    commissionRate: 12.0,
    businessAddress: '55 Diamond District, Chicago, IL 60602',
    taxId: 'US-IL-5531984',
    payoutBank: 'Midwest Premier Bank (Ending in 1204)',
    joinedAt: '2026-02-01T14:20:00.000Z'
  }
];

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

const seedProducts = [
  {
    id: 'prod_01',
    sellerId: 'sel_01',
    categoryId: 'cat_electronics',
    brandId: 'br_sonic',
    name: 'SonicPulse Pro ANC Wireless Studio Headphones',
    slug: 'sonicpulse-pro-anc-wireless-studio-headphones',
    description: 'Immerse yourself in concert-grade sound with the SonicPulse Pro. Featuring hybrid 48dB Active Noise Cancellation, custom 45mm neodymium drivers, 55 hours of battery life with ultra-fast warp charge, and ultra-plush memory foam earcups.',
    price: 249.99,
    originalPrice: 349.99,
    discountPercent: 28,
    stock: 45,
    rating: 4.9,
    reviewCount: 1420,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: false,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_01_blk', name: 'Color', value: 'Midnight Black', priceDiff: 0, stock: 25 },
      { id: 'var_01_slv', name: 'Color', value: 'Titanium Silver', priceDiff: 0, stock: 15 },
      { id: 'var_01_gld', name: 'Color', value: 'Champagne Gold', priceDiff: 15.00, stock: 5 }
    ],
    specs: {
      'Driver Size': '45mm Custom Neodymium',
      'Battery Life': '55 Hours (ANC On)',
      'Connectivity': 'Bluetooth 5.3 / 3.5mm Aux / USB-C Hi-Res',
      'Noise Cancellation': 'Hybrid Adaptive ANC (Up to 48dB)',
      'Weight': '255g',
      'Warranty': '2 Years Marketzo Comprehensive'
    },
    highlights: [
      'Industry-leading 48dB hybrid Active Noise Cancellation',
      'Hi-Res Audio Certified with LDAC support',
      'Multi-point dual device pairing',
      'Quick 10-minute charge gives 6 hours of playback'
    ],
    offers: [
      'Instant 10% discount on credit card checkout',
      'No Cost EMI starting at $21.50/month',
      'Free 3-Month High-Res Music Streaming Subscription'
    ]
  },
  {
    id: 'prod_02',
    sellerId: 'sel_01',
    categoryId: 'cat_mobiles',
    brandId: 'br_aurora',
    name: 'Aurora Ultra 5G Pro Flagship Smartphone (256GB / 12GB RAM)',
    slug: 'aurora-ultra-5g-pro-flagship-smartphone',
    description: 'Experience unmatched speed with the 4nm Octa-Core flagship processor, 6.8-inch 144Hz LTPO AMOLED Dynamic Display with 3000 nits peak brightness, and a groundbreaking 200MP Quad Periscope camera system.',
    price: 899.99,
    originalPrice: 1099.99,
    discountPercent: 18,
    stock: 28,
    rating: 4.8,
    reviewCount: 980,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: true,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_02_256', name: 'Storage', value: '256GB / 12GB RAM', priceDiff: 0, stock: 18 },
      { id: 'var_02_512', name: 'Storage', value: '512GB / 16GB RAM', priceDiff: 120.00, stock: 10 }
    ],
    specs: {
      'Display': '6.8" 144Hz Quad HD+ AMOLED',
      'Processor': 'Snapdragon 8 Gen 3 (4nm)',
      'Primary Camera': '200MP OIS + 50MP Ultra-wide + 50MP Periscope (5x)',
      'Battery': '5,400 mAh with 100W HyperCharge',
      'Protection': 'Gorilla Glass Armor / IP68 Dust & Water Resistant'
    },
    highlights: [
      '200MP Quad Camera with 100x Space Zoom',
      'Ultra-bright 3000 nits LTPO Display',
      'Full day charge in just 22 minutes',
      '5 years of major OS & security updates'
    ],
    offers: [
      'Exchange bonus up to $200 on your old smartphone',
      'Free Wireless Fast Charging Stand included',
      'Zero processing fee on 12-month installments'
    ]
  },
  {
    id: 'prod_03',
    sellerId: 'sel_01',
    categoryId: 'cat_laptops',
    brandId: 'br_zenith',
    name: 'Zenith Blade 16 Studio OLED Laptop (M3 Pro / 32GB / 1TB)',
    slug: 'zenith-blade-16-studio-oled-laptop',
    description: 'Engineered for creators and architects. Featuring an ultra-thin aerospace aluminum chassis, breathtaking 16-inch 3.2K OLED 120Hz Calman-Verified display, 32GB unified memory, and 22-hour battery efficiency.',
    price: 1899.00,
    originalPrice: 2299.00,
    discountPercent: 17,
    stock: 14,
    rating: 4.9,
    reviewCount: 420,
    isFeatured: true,
    isTrending: false,
    isBestSeller: true,
    isNewArrival: false,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_03_1tb', name: 'Storage', value: '1TB SSD / 32GB RAM', priceDiff: 0, stock: 10 },
      { id: 'var_03_2tb', name: 'Storage', value: '2TB SSD / 64GB RAM', priceDiff: 350.00, stock: 4 }
    ],
    specs: {
      'Screen': '16.0" 3.2K (3200 x 2000) 120Hz OLED 100% DCI-P3',
      'CPU / GPU': '12-Core Performance Architecture / 18-Core GPU',
      'Memory': '32GB LPDDR5X 7500MHz',
      'Storage': '1TB NVMe Gen 4 M.2 SSD',
      'Weight': '1.68 kg (3.7 lbs)'
    },
    highlights: [
      '100% DCI-P3 Color Accuracy with Pantone Validation',
      'Vapor Chamber Thermal cooling system',
      'Whisper-quiet mag-lev keys with ambient backlighting',
      'Thunderbolt 4 x 3, SD Card Express reader & HDMI 2.1'
    ],
    offers: [
      'Complimentary 1-year Adobe Creative Cloud Suite subscription',
      'Free premium Italian leather sleeve'
    ]
  },
  {
    id: 'prod_04',
    sellerId: 'sel_02',
    categoryId: 'cat_fashion',
    brandId: 'br_vanguard',
    name: 'Vanguard Minimalist Merino Wool Overcoat',
    slug: 'vanguard-minimalist-merino-wool-overcoat',
    description: 'Tailored from 100% Australian virgin merino wool with double-faced woven construction. Features a modern relaxed silhouette, unstructured shoulders, horn buttons, and deep welt pockets.',
    price: 289.00,
    originalPrice: 395.00,
    discountPercent: 26,
    stock: 35,
    rating: 4.7,
    reviewCount: 310,
    isFeatured: true,
    isTrending: true,
    isBestSeller: false,
    isNewArrival: true,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_04_m_camel', name: 'Size/Color', value: 'Medium / Camel Tan', priceDiff: 0, stock: 12 },
      { id: 'var_04_l_camel', name: 'Size/Color', value: 'Large / Camel Tan', priceDiff: 0, stock: 10 },
      { id: 'var_04_m_charcoal', name: 'Size/Color', value: 'Medium / Charcoal Grey', priceDiff: 0, stock: 8 },
      { id: 'var_04_l_charcoal', name: 'Size/Color', value: 'Large / Charcoal Grey', priceDiff: 0, stock: 5 }
    ],
    specs: {
      'Material': '100% Virgin Australian Merino Wool',
      'Lining': '100% Bemberg Cupro breathable lining',
      'Fit': 'Contemporary Relaxed Fit',
      'Care': 'Specialist dry clean only',
      'Origin': 'Handmade in Portugal'
    },
    highlights: [
      'Thermal insulation down to -5°C (23°F)',
      'Naturally water-repellent and odor-resistant wool',
      'Internal zippered passport & phone security pockets',
      'Includes Marketzo cedar garment bag'
    ],
    offers: [
      'Buy 1 Get 15% off any cashmere scarf bundle',
      'Free 30-day size exchange guarantee'
    ]
  },
  {
    id: 'prod_05',
    sellerId: 'sel_02',
    categoryId: 'cat_jewellery',
    brandId: 'br_lumiere',
    name: 'Lumière Solitaire 2.0ct Lab Diamond Pendant Necklace (18K White Gold)',
    slug: 'lumiere-solitaire-2ct-lab-diamond-pendant-necklace',
    description: 'An iconic emblem of brilliance. Features an IGI-certified 2.00 carat round brilliant lab diamond (E Color, VVS1 Clarity, Ideal Cut) set in a 4-prong basket of 18K recycled solid white gold on an adjustable 16-18 inch cable chain.',
    price: 1250.00,
    originalPrice: 1750.00,
    discountPercent: 28,
    stock: 9,
    rating: 5.0,
    reviewCount: 88,
    isFeatured: true,
    isTrending: false,
    isBestSeller: true,
    isNewArrival: false,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_05_wg', name: 'Metal', value: '18K White Gold', priceDiff: 0, stock: 4 },
      { id: 'var_05_yg', name: 'Metal', value: '18K Yellow Gold', priceDiff: 0, stock: 3 },
      { id: 'var_05_rg', name: 'Metal', value: '18K Rose Gold', priceDiff: 0, stock: 2 }
    ],
    specs: {
      'Center Stone': '2.00 Carat Round Brilliant Lab Diamond',
      'Color / Clarity': 'E Color / VVS1 Flawless Clarity',
      'Certification': 'IGI Certified with Laser Inscription Number',
      'Chain Length': '16-18 inches adjustable',
      'Metal Purity': '750 Hallmarked 18K Solid Gold'
    },
    highlights: [
      '100% Conflict-free ethical lab-grown diamond',
      'IGI Certificate and appraisal card included in luxury velvet box',
      'Complimentary lifetime ultrasonic cleaning & inspection'
    ],
    offers: [
      'Free insured next-day courier delivery',
      'Lifetime trade-up value guarantee'
    ]
  },
  {
    id: 'prod_06',
    sellerId: 'sel_01',
    categoryId: 'cat_home',
    brandId: 'br_nordic',
    name: 'NordicCraft Barista Touch Precision Espresso Machine',
    slug: 'nordiccraft-barista-touch-precision-espresso-machine',
    description: 'Elevate your morning ritual to third-wave specialty cafe standards. Equipped with dual stainless steel thermo-blocks, PID temperature control (±1°C), integrated conical burr grinder with 30 grind levels, and an automatic microfoam steam wand.',
    price: 649.00,
    originalPrice: 849.00,
    discountPercent: 23,
    stock: 22,
    rating: 4.8,
    reviewCount: 560,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: false,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_06_ss', name: 'Finish', value: 'Brushed Stainless Steel', priceDiff: 0, stock: 14 },
      { id: 'var_06_mb', name: 'Finish', value: 'Matte Truffle Black', priceDiff: 25.00, stock: 8 }
    ],
    specs: {
      'Pump Pressure': '15 Bar Italian High-Pressure Pump',
      'Water Tank': '2.5 Liters with integrated water filter',
      'Grinder': 'Hardened Stainless Steel Conical Burrs',
      'Display': '4.3-inch Color Touch Interface',
      'Power': '1650 Watts Fast Warm-up'
    },
    highlights: [
      'Automatic microfoam milk texturing for latte art',
      'Pre-infusion technology for rich crema extraction',
      'Includes 54mm portafilter, tamper, and milk pitcher'
    ],
    offers: [
      'Free 1kg bag of artisanal single-origin roast coffee beans',
      '2 Years extended manufacturer warranty'
    ]
  },
  {
    id: 'prod_07',
    sellerId: 'sel_02',
    categoryId: 'cat_beauty',
    brandId: 'br_botanica',
    name: 'Botanica Lab Radiance Vitamin C + Peptide Repair Elixir (50ml)',
    slug: 'botanica-lab-radiance-vitamin-c-peptide-repair-elixir',
    description: 'A clinical potency anti-aging powerhouse formulated with 15% Ethyl Ascorbic Acid, Multi-Peptide Matrixyl 3000, and botanical Ferulic Acid. Brightens discoloration, firms fine lines, and shields against urban oxidative pollution.',
    price: 68.00,
    originalPrice: 95.00,
    discountPercent: 28,
    stock: 85,
    rating: 4.9,
    reviewCount: 780,
    isFeatured: false,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: true,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597359-00994f3879f9?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_07_50', name: 'Volume', value: '50ml Standard Bottle', priceDiff: 0, stock: 60 },
      { id: 'var_07_100', name: 'Volume', value: '100ml Value Size', priceDiff: 45.00, stock: 25 }
    ],
    specs: {
      'Key Actives': '15% Stabilized Vit C, Matrixyl 3000, Ferulic Acid, Hyaluronic 4D',
      'Skin Type': 'All Skin Types (Sensitive Tested)',
      'Cruelty Free': 'Leaping Bunny Certified Vegan',
      'Texture': 'Silky fast-absorbing weightless essence'
    },
    highlights: [
      'Clinically proven 43% brighter skin tone in 14 days',
      'Stabilized formula does not oxidize or turn yellow',
      '100% fragrance-free and non-comedogenic'
    ],
    offers: [
      'Subscribe & Save 15% on auto-delivery',
      'Free deluxe mini botanical cleanser on orders over $50'
    ]
  },
  {
    id: 'prod_08',
    sellerId: 'sel_01',
    categoryId: 'cat_sports',
    brandId: 'br_apexfit',
    name: 'ApexFit Pro Smart GPS Multisport Titanium Watch',
    slug: 'apexfit-pro-smart-gps-multisport-titanium-watch',
    description: 'Built for extreme adventures and daily peak performance. Features a Grade 5 Titanium bezel, Sapphire crystal touchscreen, multi-band dual-frequency GNSS tracking, ECG heart analytics, and up to 28 days of battery life on solar assist.',
    price: 379.00,
    originalPrice: 499.00,
    discountPercent: 24,
    stock: 30,
    rating: 4.8,
    reviewCount: 640,
    isFeatured: true,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_08_47', name: 'Size', value: '47mm Case (Titanium Slate)', priceDiff: 0, stock: 18 },
      { id: 'var_08_51', name: 'Size', value: '51mm Case (Solar Carbon)', priceDiff: 60.00, stock: 12 }
    ],
    specs: {
      'Water Rating': '10 ATM (100 meters dive safe)',
      'Sensors': 'Optical HR, SpO2, ECG, Barometric Altimeter, Compass, Thermometer',
      'Display': '1.4" Always-on Sunlight-Visible Chroma MIP display',
      'Compatibility': 'iOS & Android via Marketzo Health Sync'
    },
    highlights: [
      'Dual-Band Multi-GNSS for pinpoint trail accuracy',
      'Topographic offline maps preloaded',
      'Training Readiness and Real-Time Stamina metrics'
    ],
    offers: [
      'Free quick-fit nylon sport strap included',
      '0% financing for 6 months'
    ]
  },
  {
    id: 'prod_09',
    sellerId: 'sel_01',
    categoryId: 'cat_accessories',
    brandId: 'br_sonic',
    name: 'SonicPulse 3-in-1 Foldable MagSafe Wireless Charging Hub',
    slug: 'sonicpulse-3in1-foldable-magsafe-charging-hub',
    description: 'An ultra-compact CNC aluminum charging dock designed for bedside tables and international travel. Simultaneously charges your phone (15W MagSafe), Smartwatch (5W Fast), and Wireless Earbuds (5W).',
    price: 79.99,
    originalPrice: 119.99,
    discountPercent: 33,
    stock: 50,
    rating: 4.7,
    reviewCount: 390,
    isFeatured: false,
    isTrending: true,
    isBestSeller: true,
    isNewArrival: false,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_09_sp', name: 'Color', value: 'Space Grey', priceDiff: 0, stock: 30 },
      { id: 'var_09_sl', name: 'Color', value: 'Silver Frost', priceDiff: 0, stock: 20 }
    ],
    specs: {
      'Input': 'USB-C 30W PD (Power adapter included)',
      'Total Output': '25W Fast Wireless',
      'Folded Dimensions': '85mm x 65mm x 20mm',
      'Weight': '160g'
    },
    highlights: [
      'Official Qi2 / MagSafe certified magnetic alignment',
      'Travel pouch and 30W braided USB-C power block included'
    ],
    offers: ['10% extra discount when paired with any smartphone order']
  },
  {
    id: 'prod_10',
    sellerId: 'sel_02',
    categoryId: 'cat_fashion',
    brandId: 'br_vanguard',
    name: 'Vanguard Hand-Burnished Italian Leather Chelsea Boots',
    slug: 'vanguard-hand-burnished-italian-leather-chelsea-boots',
    description: 'Masterfully crafted in Tuscany from full-grain calfskin leather with a Goodyear-welted construction, Vibram rubber commando sole inserts, and elasticated side gussets for effortless slip-on luxury.',
    price: 219.00,
    originalPrice: 289.00,
    discountPercent: 24,
    stock: 25,
    rating: 4.8,
    reviewCount: 215,
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_10_41', name: 'Size', value: 'US 8.5 / EU 41 (Espresso Brown)', priceDiff: 0, stock: 8 },
      { id: 'var_10_42', name: 'Size', value: 'US 9.5 / EU 42 (Espresso Brown)', priceDiff: 0, stock: 10 },
      { id: 'var_10_43', name: 'Size', value: 'US 10.5 / EU 43 (Onyx Black)', priceDiff: 0, stock: 7 }
    ],
    specs: {
      'Upper': '100% Full-grain Tuscan Calf Leather',
      'Construction': 'Goodyear Welted (Resoleable for life)',
      'Sole': 'Leather sole with embedded Vibram rubber grip'
    },
    highlights: [
      'Water-resistant natural wax finish',
      'Breathable cork footbed molds to your foot over time'
    ],
    offers: ['Free natural beeswax conditioning cream and shoe horn']
  },
  {
    id: 'prod_11',
    sellerId: 'sel_01',
    categoryId: 'cat_electronics',
    brandId: 'br_sonic',
    name: 'SonicPulse Beam 360 Spatial Audio Wireless Soundbar',
    slug: 'sonicpulse-beam-360-spatial-soundbar',
    description: 'Transform your living room into an IMAX acoustic experience. Features 9 high-excursion drivers, upward-firing Dolby Atmos height channels, wireless 8-inch subwoofer, and eARC 4K pass-through.',
    price: 399.00,
    originalPrice: 549.00,
    discountPercent: 27,
    stock: 19,
    rating: 4.7,
    reviewCount: 310,
    isFeatured: false,
    isTrending: true,
    isBestSeller: false,
    isNewArrival: false,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { id: 'var_11_sb', name: 'Bundle', value: 'Soundbar + Subwoofer', priceDiff: 0, stock: 12 },
      { id: 'var_11_surr', name: 'Bundle', value: 'Soundbar + Sub + Rear Satellites', priceDiff: 150.00, stock: 7 }
    ],
    specs: {
      'Channels': '5.1.2 Dolby Atmos / DTS:X',
      'Total Output': '420 Watts Peak',
      'Connectivity': 'HDMI eARC, Optical, AirPlay 2, Spotify Connect, Bluetooth 5.2'
    },
    highlights: [
      'Room-calibration AI tunes sound to your room layout',
      'Ultra-crisp dialog enhancement algorithm'
    ],
    offers: ['Free 2-day delivery and professional setup guide']
  },
  {
    id: 'prod_12',
    sellerId: 'sel_01',
    categoryId: 'cat_toys',
    brandId: 'br_aurora',
    name: 'RoboQuest STEM AI Programmable Bionic Robotics Kit',
    slug: 'roboquest-stem-ai-programmable-robotics-kit',
    description: 'An engaging robotic exploration platform for teens and enthusiasts. Includes over 450 precision snap-together anodized components, AI computer vision camera module, ultrasonic obstacle radar, and drag-and-drop Python coding IDE.',
    price: 139.99,
    originalPrice: 189.99,
    discountPercent: 26,
    stock: 40,
    rating: 4.9,
    reviewCount: 165,
    isFeatured: false,
    isTrending: false,
    isBestSeller: false,
    isNewArrival: true,
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [],
    specs: {
      'Age Group': '10+ Years / Teens & Adults',
      'Programming': 'Block-based Scratch & MicroPython supported',
      'Sensors': 'AI Vision Camera, Gyro, Distance Radar, Color Sensor'
    },
    highlights: [
      'Step-by-step interactive 3D video building tutorials',
      'Rechargeable 3000mAh battery included'
    ],
    offers: ['Free lifetime access to RoboQuest cloud course curriculum']
  }
];

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

const seedAddresses = [
  {
    id: 'addr_01',
    userId: 'usr_cust_01',
    fullName: 'Alex Mercer',
    phone: '+1 (555) 234-5678',
    street: '784 Broadway Blvd, Suite 4B',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94102',
    country: 'United States',
    type: 'Home',
    isDefault: true
  },
  {
    id: 'addr_02',
    userId: 'usr_cust_01',
    fullName: 'Alex Mercer (Office)',
    phone: '+1 (555) 234-5678',
    street: '100 Montgomery St, Floor 12',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94104',
    country: 'United States',
    type: 'Work',
    isDefault: false
  }
];

const seedOrders = [
  {
    id: 'ord_mkz_9921',
    orderNumber: 'MKZ-89104',
    userId: 'usr_cust_01',
    sellerIds: ['sel_01'],
    items: [
      {
        productId: 'prod_01',
        name: 'SonicPulse Pro ANC Wireless Studio Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        price: 249.99,
        quantity: 1,
        variant: 'Midnight Black',
        sellerId: 'sel_01'
      }
    ],
    shippingAddress: {
      fullName: 'Alex Mercer',
      phone: '+1 (555) 234-5678',
      street: '784 Broadway Blvd, Suite 4B',
      city: 'San Francisco',
      state: 'CA',
      pincode: '94102',
      country: 'United States'
    },
    subtotal: 249.99,
    discountAmount: 25.00,
    shippingFee: 0.00,
    taxAmount: 18.00,
    totalAmount: 242.99,
    couponApplied: 'MARKETZO10',
    paymentMethod: 'Credit / Debit Card (Sandbox)',
    paymentStatus: 'paid',
    orderStatus: 'Out for Delivery',
    timeline: [
      { status: 'Pending', time: '2026-08-20T10:00:00.000Z', note: 'Order placed by customer' },
      { status: 'Confirmed', time: '2026-08-20T10:15:00.000Z', note: 'Payment verified and confirmed by Apex Tech Labs' },
      { status: 'Processing', time: '2026-08-20T14:30:00.000Z', note: 'Item picked, packed, and quality checked' },
      { status: 'Shipped', time: '2026-08-21T09:00:00.000Z', note: 'Carrier tracking #MKZ-EXP-889021' },
      { status: 'Out for Delivery', time: '2026-08-22T08:15:00.000Z', note: 'Courier out for delivery. Estimated delivery today by 6 PM' }
    ],
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'ord_mkz_9920',
    orderNumber: 'MKZ-87231',
    userId: 'usr_cust_01',
    sellerIds: ['sel_02'],
    items: [
      {
        productId: 'prod_04',
        name: 'Vanguard Minimalist Merino Wool Overcoat',
        image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?w=800&auto=format&fit=crop&q=80',
        price: 289.00,
        quantity: 1,
        variant: 'Medium / Camel Tan',
        sellerId: 'sel_02'
      }
    ],
    shippingAddress: {
      fullName: 'Alex Mercer',
      phone: '+1 (555) 234-5678',
      street: '784 Broadway Blvd, Suite 4B',
      city: 'San Francisco',
      state: 'CA',
      pincode: '94102',
      country: 'United States'
    },
    subtotal: 289.00,
    discountAmount: 0.00,
    shippingFee: 0.00,
    taxAmount: 23.12,
    totalAmount: 312.12,
    paymentMethod: 'Instant UPI / QR',
    paymentStatus: 'paid',
    orderStatus: 'Delivered',
    timeline: [
      { status: 'Pending', time: '2026-08-14T11:00:00.000Z', note: 'Order placed' },
      { status: 'Confirmed', time: '2026-08-14T11:10:00.000Z', note: 'Confirmed by Urban Threadz & Co' },
      { status: 'Processing', time: '2026-08-14T16:00:00.000Z', note: 'Garment packaged' },
      { status: 'Shipped', time: '2026-08-15T08:30:00.000Z', note: 'Dispatched via Marketzo Prime Logistics' },
      { status: 'Out for Delivery', time: '2026-08-16T09:00:00.000Z', note: 'Driver on route' },
      { status: 'Delivered', time: '2026-08-16T14:45:00.000Z', note: 'Package handed directly to resident' }
    ],
    createdAt: '2026-08-14T11:00:00.000Z'
  }
];

const seedReviews = [
  {
    id: 'rev_01',
    productId: 'prod_01',
    userId: 'usr_cust_01',
    userName: 'Alex Mercer',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Astounding sound quality and whisper quiet ANC',
    comment: 'The acoustic tuning on these headphones easily rivals pairs costing twice as much. Battery life is incredible—I only charge it once a week during daily commute and work calls.',
    verifiedPurchase: true,
    helpfulVotes: 48,
    createdAt: '2026-08-18T14:20:00.000Z'
  },
  {
    id: 'rev_02',
    productId: 'prod_01',
    userId: 'usr_rev_02',
    userName: 'David Chen',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Super comfortable for 8+ hour continuous wear',
    comment: 'The plush memory foam padding feels like clouds. The multi-point connection switches seamlessly between my MacBook and phone.',
    verifiedPurchase: true,
    helpfulVotes: 32,
    createdAt: '2026-08-15T09:12:00.000Z'
  },
  {
    id: 'rev_03',
    productId: 'prod_02',
    userId: 'usr_rev_03',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Unbelievable 200MP camera and buttery 144Hz screen',
    comment: 'Low-light photos look like they were shot on a DSLR. The charging speed from 0 to 100 in 20 minutes is a total game changer.',
    verifiedPurchase: true,
    helpfulVotes: 24,
    createdAt: '2026-08-19T18:40:00.000Z'
  }
];

const seedNotifications = [
  {
    id: 'notif_01',
    userId: 'usr_cust_01',
    title: 'Out for Delivery 🚚',
    message: 'Your order #MKZ-89104 for SonicPulse Pro ANC is out for delivery today.',
    type: 'order',
    read: false,
    link: '/account?tab=orders',
    createdAt: '2026-08-22T08:15:00.000Z'
  },
  {
    id: 'notif_02',
    userId: 'usr_cust_01',
    title: 'Exclusive Offer Available 🎉',
    message: 'Use code MARKETZO10 to save 10% on your next electronics purchase!',
    type: 'promo',
    read: true,
    link: '/category/electronics-audio',
    createdAt: '2026-08-21T10:00:00.000Z'
  },
  {
    id: 'notif_03',
    userId: 'usr_seller_01',
    title: 'New Customer Order Received 📦',
    message: 'Order #MKZ-89104 was placed for SonicPulse Pro ANC.',
    type: 'seller',
    read: true,
    link: '/seller?tab=orders',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'notif_04',
    userId: 'usr_admin_01',
    title: 'New Seller Application Pending 🛡️',
    message: 'Aura Luxe Jewels has requested seller authorization.',
    type: 'admin',
    read: false,
    link: '/admin?tab=sellers',
    createdAt: '2026-08-21T12:00:00.000Z'
  }
];

const seedConversations = [
  {
    id: 'conv_01',
    customerId: 'usr_cust_01',
    customerName: 'Alexandre Mercer',
    sellerId: 'sel_01',
    sellerName: 'Apex Tech Labs',
    productId: 'prod_01',
    productName: 'SonicPulse Pro ANC Wireless Studio Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    productPrice: 249.99,
    lastMessage: 'Hi, does this headphone come with a 3.5mm audio cable included in the box?',
    lastMessageTime: '2026-08-22T10:30:00.000Z',
    unreadCountCustomer: 0,
    unreadCountSeller: 1,
    createdAt: '2026-08-22T10:25:00.000Z'
  }
];

const seedMessages = [
  {
    id: 'msg_01',
    conversationId: 'conv_01',
    senderId: 'usr_cust_01',
    senderRole: 'customer',
    senderName: 'Alexandre Mercer',
    text: 'Hello! I am looking to buy the SonicPulse Pro ANC for international studio travel.',
    image: null,
    createdAt: '2026-08-22T10:25:00.000Z',
    read: true
  },
  {
    id: 'msg_02',
    conversationId: 'conv_01',
    senderId: 'usr_cust_01',
    senderRole: 'customer',
    senderName: 'Alexandre Mercer',
    text: 'Hi, does this headphone come with a 3.5mm audio cable included in the box?',
    image: null,
    createdAt: '2026-08-22T10:30:00.000Z',
    read: false
  }
];

const seedDisputes = [
  {
    id: 'dsp_01',
    orderId: 'ord_01',
    orderNumber: 'MKZ-89104',
    customerId: 'usr_cust_01',
    customerName: 'Alexandre Mercer',
    sellerId: 'sel_01',
    sellerName: 'Apex Tech Labs',
    reason: 'damaged_product',
    reasonLabel: 'Damaged during transit / broken seal',
    description: 'The exterior package seal was torn and audio crackles slightly in right ear cup.',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80'],
    requestedAmount: 249.99,
    status: 'under_review',
    sellerResponse: 'We sincerely apologize. We are willing to issue an immediate replacement or full refund.',
    sellerResponseAt: '2026-08-22T11:00:00.000Z',
    adminResolution: null,
    createdAt: '2026-08-22T09:30:00.000Z'
  }
];

const seedWalletTransactions = [
  {
    id: 'txn_wal_01',
    sellerId: 'sel_01',
    type: 'credit',
    amount: 1420.50,
    description: 'Settlement for delivered orders #MKZ-89104 & #MKZ-782555',
    status: 'completed',
    createdAt: '2026-08-22T08:00:00.000Z'
  },
  {
    id: 'txn_wal_02',
    sellerId: 'sel_01',
    type: 'debit',
    amount: 120.74,
    description: 'Marketzo platform commission deduction (8.5%)',
    status: 'completed',
    createdAt: '2026-08-22T08:00:00.000Z'
  }
];

const seedPayoutRequests = [
  {
    id: 'payout_01',
    sellerId: 'sel_01',
    amount: 1200.00,
    currency: 'USD',
    payoutMethod: 'bank_transfer',
    accountDetails: 'JPMorgan Chase •••• 4492 (Apex Tech Labs LLC)',
    status: 'completed',
    requestedAt: '2026-08-20T10:00:00.000Z',
    processedAt: '2026-08-21T14:30:00.000Z',
    referenceId: 'ACH_MKZ_99482103'
  }
];

const seedVerificationRequests = [
  {
    id: 'verif_01',
    sellerId: 'sel_01',
    sellerName: 'Apex Tech Labs',
    businessType: 'Private Limited Enterprise',
    registrationNumber: 'GSTIN-06AAACT2214M1Z8',
    taxId: 'US-EIN-94-2819402',
    identityProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    businessProofUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    assignedBadges: ['verified_seller', 'top_seller', 'fast_shipping'],
    adminNotes: 'All business entity records and tax compliance verified.',
    submittedAt: '2026-08-18T09:00:00.000Z',
    reviewedAt: '2026-08-19T10:00:00.000Z'
  },
  {
    id: 'verif_02',
    sellerId: 'sel_02',
    sellerName: 'Urban Threadz Boutique',
    businessType: 'Sole Proprietorship',
    registrationNumber: 'GSTIN-27AABCU9918K1ZX',
    taxId: 'US-EIN-88-1902844',
    identityProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    businessProofUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    assignedBadges: ['verified_seller', 'best_seller'],
    adminNotes: 'Verified artisanal boutique manufacturer.',
    submittedAt: '2026-08-19T11:00:00.000Z',
    reviewedAt: '2026-08-20T12:00:00.000Z'
  }
];

const seedFlashSales = [
  {
    id: 'flash_01',
    productId: 'prod_01',
    productName: 'SonicPulse Pro ANC Wireless Studio Headphones',
    sellerId: 'sel_01',
    originalPrice: 249.99,
    salePrice: 179.99,
    discountPercent: 28,
    saleStockTotal: 25,
    saleStockRemaining: 7,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    status: 'active'
  },
  {
    id: 'flash_02',
    productId: 'prod_02',
    productName: 'Aurora Ultra 5G Pro Flagship Smartphone (256GB / 12GB RAM)',
    sellerId: 'sel_01',
    originalPrice: 899.00,
    salePrice: 699.00,
    discountPercent: 22,
    saleStockTotal: 15,
    saleStockRemaining: 3,
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() + 43200000).toISOString(),
    status: 'active'
  }
];

const seedFollows = [
  {
    id: 'fol_01',
    customerId: 'usr_cust_01',
    sellerId: 'sel_01',
    createdAt: '2026-08-21T08:00:00.000Z'
  },
  {
    id: 'fol_02',
    customerId: 'usr_cust_01',
    sellerId: 'sel_02',
    createdAt: '2026-08-21T09:00:00.000Z'
  }
];

const seedWholesaleRfqs = [
  {
    id: 'rfq_01',
    productId: 'prod_01',
    productName: 'SonicPulse Pro ANC Wireless Studio Headphones',
    sellerId: 'sel_01',
    sellerName: 'Apex Tech Labs',
    customerId: 'usr_cust_01',
    customerName: 'Alexandre Mercer',
    customerEmail: 'alex.mercer@marketzo.com',
    targetQuantity: 50,
    targetPricePerUnit: 165.00,
    currency: 'USD',
    shippingDestination: 'San Francisco, CA, USA',
    buyerMessage: 'Looking for a bulk trial batch of 50 units for corporate gifting.',
    status: 'quoted',
    sellerQuote: {
      offeredPricePerUnit: 170.00,
      minQuantity: 50,
      estimatedProductionDays: 3,
      shippingCost: 85.00,
      quoteValidUntil: '2026-09-15T23:59:59.000Z',
      notes: 'Includes customized gift box sleeve and express air courier.'
    },
    createdAt: '2026-08-21T15:00:00.000Z',
    updatedAt: '2026-08-22T08:30:00.000Z'
  }
];

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
