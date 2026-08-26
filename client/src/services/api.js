const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
let API_BASE = '/api';
if (RAW_BASE) {
  const cleanBase = RAW_BASE.replace(/\/+$/, '');
  API_BASE = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;
}

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('marketzo_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  becomeSeller: (data) => request('/auth/become-seller', { method: 'POST', body: data }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data }),
  getProfile: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getProduct: (idOrSlug) => request(`/products/${idOrSlug}`),
  getSuggestions: (q) => request(`/products/suggestions?q=${encodeURIComponent(q)}`),
  submitReview: (productId, reviewData) => request(`/products/${productId}/reviews`, { method: 'POST', body: reviewData }),
  upvoteReview: (reviewId) => request(`/products/reviews/${reviewId}/helpful`, { method: 'POST' }),

  // Categories & Banners
  getCategories: () => request('/categories'),
  getBrands: () => request('/categories/brands/all'),
  getBanners: () => request('/categories/banners/active'),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (productId, quantity = 1, variant = null) => request('/cart/add', { method: 'POST', body: { productId, quantity, variant } }),
  updateCartQty: (cartItemId, quantity) => request('/cart/update-quantity', { method: 'PUT', body: { cartItemId, quantity } }),
  removeFromCart: (cartItemId) => request(`/cart/remove/${cartItemId}`, { method: 'DELETE' }),
  saveForLater: (cartItemId) => request(`/cart/save-for-later/${cartItemId}`, { method: 'PUT' }),
  clearCart: () => request('/cart/clear', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  toggleWishlist: (productId) => request('/wishlist/toggle', { method: 'POST', body: { productId } }),

  // Coupons & Pincode
  getCoupons: () => request('/coupons'),
  validateCoupon: (code, cartSubtotal) => request('/coupons/validate', { method: 'POST', body: { code, cartSubtotal } }),
  checkPincode: (pincode) => request(`/pincode/check/${pincode}`),

  // Orders & Payments
  createOrder: (orderData) => request('/orders/create', { method: 'POST', body: orderData }),
  getMyOrders: () => request('/orders/my-orders'),
  getOrder: (orderId) => request(`/orders/${orderId}`),
  cancelOrder: (orderId, reason) => request(`/orders/${orderId}/cancel`, { method: 'POST', body: { reason } }),
  processPayment: (paymentData) => request('/payments/process', { method: 'POST', body: paymentData }),

  // Addresses
  getAddresses: () => request('/addresses'),
  addAddress: (data) => request('/addresses', { method: 'POST', body: data }),
  updateAddress: (id, data) => request(`/addresses/${id}`, { method: 'PUT', body: data }),
  deleteAddress: (id) => request(`/addresses/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/mark-all-read', { method: 'PUT' }),

  // Seller Portal
  getSellerMetrics: () => request('/seller/metrics'),
  getSellerProducts: () => request('/seller/products'),
  addSellerProduct: (data) => request('/seller/products', { method: 'POST', body: data }),
  updateSellerProduct: (id, data) => request(`/seller/products/${id}`, { method: 'PUT', body: data }),
  deleteSellerProduct: (id) => request(`/seller/products/${id}`, { method: 'DELETE' }),
  getSellerOrders: () => request('/seller/orders'),
  updateOrderStatus: (orderId, status, note) => request(`/orders/${orderId}/status`, { method: 'PUT', body: { status, note } }),
  updateSellerProfile: (data) => request('/seller/profile', { method: 'PUT', body: data }),
  getSellerCoupons: () => request('/coupons/seller/my-coupons'),
  createSellerCoupon: (data) => request('/coupons/seller/create', { method: 'POST', body: data }),
  deleteSellerCoupon: (id) => request(`/coupons/seller/${id}`, { method: 'DELETE' }),
  requestFeatureProduct: (data) => request('/seller/feature-requests', { method: 'POST', body: data }),
  getSellerFeatureRequests: () => request('/seller/feature-requests'),

  // Chat
  getConversations: () => request('/chat/conversations'),
  startChat: (data) => request('/chat/start', { method: 'POST', body: data }),
  getMessages: (convId) => request(`/chat/conversations/${convId}/messages`),
  sendMessage: (convId, data) => request(`/chat/conversations/${convId}/messages`, { method: 'POST', body: data }),

  // Reviews
  submitReview: (productId, data) => request(`/products/${productId}/reviews`, { method: 'POST', body: data }),
  replyToReview: (reviewId, reply) => request(`/products/reviews/${reviewId}/reply`, { method: 'POST', body: { reply } }),

  // Buyer Protection & Disputes
  createDispute: (data) => request('/disputes/create', { method: 'POST', body: data }),
  getMyDisputes: () => request('/disputes/my-disputes'),
  getSellerDisputes: () => request('/disputes/seller'),
  sellerRespondDispute: (id, data) => request(`/disputes/${id}/seller-response`, { method: 'PUT', body: data }),
  getAdminDisputes: () => request('/disputes/admin'),
  adminResolveDispute: (id, data) => request(`/disputes/${id}/admin-resolve`, { method: 'PUT', body: data }),

  // Seller Wallet & Payouts
  getWalletSummary: () => request('/wallet/summary'),
  requestWithdrawal: (data) => request('/wallet/withdraw', { method: 'POST', body: data }),
  getAdminPayouts: () => request('/wallet/admin/payouts'),
  updatePayoutStatus: (id, data) => request(`/wallet/admin/payouts/${id}/status`, { method: 'PUT', body: data }),

  // Seller Verification & Badges
  getVerificationStatus: () => request('/verification/status'),
  submitVerification: (data) => request('/verification/submit', { method: 'POST', body: data }),
  getAdminVerifications: () => request('/verification/admin/list'),
  reviewVerification: (id, data) => request(`/verification/admin/${id}/review`, { method: 'PUT', body: data }),

  // Flash Sales
  getActiveFlashSales: () => request('/flashsales/active'),
  getAllFlashSales: () => request('/flashsales/all'),
  createFlashSale: (data) => request('/flashsales/create', { method: 'POST', body: data }),

  // AI Shopping Assistant & Visual Search
  askAiAssistant: (data) => request('/ai/recommend', { method: 'POST', body: data }),
  getAiSellerHelp: (data) => request('/ai/seller-help', { method: 'POST', body: data }),
  searchVisualProduct: (data) => request('/visualsearch/analyze', { method: 'POST', body: data }),

  // Follow Seller
  toggleFollowSeller: (sellerId) => request('/follows/toggle', { method: 'POST', body: { sellerId } }),
  checkFollowSeller: (sellerId) => request(`/follows/check/${sellerId}`),
  getMyFollowing: () => request('/follows/my-following'),

  // Wholesale & Bulk Quotes
  getWholesaleTiers: (productId) => request(`/wholesale/product/${productId}`),
  submitRfq: (data) => request('/wholesale/rfq', { method: 'POST', body: data }),
  getMyRfqs: () => request('/wholesale/my-rfqs'),
  getSellerRfqs: () => request('/wholesale/seller-rfqs'),
  submitRfqQuote: (id, data) => request(`/wholesale/rfq/${id}/quote`, { method: 'PUT', body: data }),

  // Featured, Trending, Personalized, Sellers & Deals (Home Page)
  getFeaturedProducts: () => request('/products/featured'),
  getTrendingProducts: () => request('/products/trending-now'),
  getPickedForYou: () => request('/products/picked-for-you'),
  getExploreSellers: () => request('/products/explore-sellers'),
  submitMakeDeal: (data) => request('/products/make-deal', { method: 'POST', body: data }),

  // Gaming Zone
  getGamingProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/gaming/products${query ? `?${query}` : ''}`);
  },
  buildAiGamingSetup: (data) => request('/gaming/ai-builder', { method: 'POST', body: data }),
  getGamingCommunitySetups: () => request('/gaming/community-setups'),

  // Admin Dashboard
  getAdminMetrics: () => request('/admin/metrics'),
  getAdminSellers: () => request('/admin/sellers'),
  updateSellerStatus: (sellerId, status) => request(`/admin/sellers/${sellerId}/status`, { method: 'PUT', body: { status } }),
  getAdminProducts: () => request('/admin/products'),
  updateProductStatus: (productId, data) => request(`/admin/products/${productId}/status`, { method: 'PUT', body: data }),
  createCoupon: (couponData) => request('/admin/coupons', { method: 'POST', body: couponData }),
  deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
  createCategory: (data) => request('/admin/categories', { method: 'POST', body: data }),
  createBanner: (data) => request('/admin/banners', { method: 'POST', body: data }),
  getAdminFeatureRequests: () => request('/admin/feature-requests'),
  updateFeatureRequestStatus: (requestId, data) => request(`/admin/feature-requests/${requestId}/status`, { method: 'PUT', body: data }),
  removeFeatureRequest: (requestId) => request(`/admin/feature-requests/${requestId}`, { method: 'DELETE' })
};
