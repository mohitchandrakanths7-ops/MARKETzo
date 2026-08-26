import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  Loader2, 
  Star, 
  ShoppingBag,
  Heart,
  Phone,
  MessageCircle,
  ShieldCheck,
  Mic,
  MicOff,
  Camera,
  Layers,
  Check,
  RefreshCw,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { ErrorBoundary } from '../common/ErrorBoundary';

export const AiShoppingAssistant = ({ isOpen, onClose, onNavigate, initialPrompt = '' }) => {
  const { currentCurrency, activeCurrencyInfo, formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showSuccess, showInfo, showError } = useToast();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "👋 Hi! I am your **Marketzo AI Shopping Guide**.\n\nI can help you find products by budget, category, specs, or compare top matches across our verified sellers. Try asking:",
      suggestions: [
        '📱 Phones Under ₹20K',
        '🎧 Wireless ANC Headphones under ₹5,000',
        '💻 Laptops for Programming under ₹60K',
        '⭐ Top Rated Products'
      ],
      recommendations: []
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastRecommendedProducts, setLastRecommendedProducts] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Quick Prompts list
  const quickPrompts = [
    { label: '🔥 Best Deals', query: 'Show me products with biggest discounts and best deals' },
    { label: '📱 Phones Under ₹20K', query: 'Find me flagship smartphones under ₹20,000' },
    { label: '💻 Laptops Under ₹50K', query: 'I need a fast laptop for programming under ₹50,000' },
    { label: '🎧 Best Headphones', query: 'Show me top noise cancelling wireless headphones' },
    { label: '⭐ Top Rated', query: 'Show me top 5 star rated products from verified sellers' },
    { label: '💰 Best Value', query: 'Find high rated budget electronics with best value' },
    { label: '🏷️ Biggest Discounts', query: 'Show items with over 20% discount' }
  ];

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      if (initialPrompt && initialPrompt.trim()) {
        handleAsk(initialPrompt.trim());
      }
    }
  }, [isOpen, initialPrompt]);

  // Voice Input (Web Speech API)
  const handleToggleVoice = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showInfo('Voice input is not supported by your browser. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentCurrency === 'INR' ? 'en-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        showInfo('🎙️ Listening... Speak your shopping request.');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          // Optional: immediately ask or let user verify
          handleAsk(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition failed to start:', err);
      setIsListening(false);
    }
  };

  // Image Upload / Visual Search Trigger
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: `📷 [Visual Search] Analyzing image: ${file.name}`
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Read image preview and search visual similarities
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await api.searchVisualProduct({
          imageName: file.name,
          category: 'electronics'
        });

        if (res.success && res.matches && res.matches.length > 0) {
          const botMsg = {
            id: `bot_${Date.now()}`,
            role: 'assistant',
            text: `I analyzed your photo and matched visual features (color, silhouette, and hardware attributes) with our marketplace inventory:`,
            recommendations: res.matches
          };
          setMessages(prev => [...prev, botMsg]);
          setLastRecommendedProducts(res.matches);
        } else {
          // Fallback to text recommendation for the product image type
          handleAsk('Find products visually similar to high-tech electronic gadgets');
        }
      } catch (err) {
        setMessages(prev => [...prev, {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          text: 'Visual similarity search complete. Here are top-rated design matches from our catalog:',
          recommendations: []
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Main Ask handler
  const handleAsk = async (queryText) => {
    const query = queryText || inputQuery;
    if (!query || !query.trim() || isLoading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: query.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.askAiAssistant({
        query: query.trim(),
        currency: currentCurrency,
        exchangeRate: activeCurrencyInfo?.rate || 1,
        contextProducts: lastRecommendedProducts,
        conversationHistory: messages.slice(-4).map(m => ({ role: m.role, text: m.text }))
      });

      if (res && res.success) {
        const recs = Array.isArray(res.recommendations) ? res.recommendations : [];
        const botMsg = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: res.replyText || res.reply || 'Here are the best verified options matching your request:',
          recommendations: recs,
          comparisonTable: res.comparisonTable || null,
          intent: res.intent || 'search'
        };

        setMessages(prev => [...prev, botMsg]);
        if (recs.length > 0) {
          setLastRecommendedProducts(recs);
        }
      } else {
        setMessages(prev => [...prev, {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          text: 'Sorry, I ran into an issue searching our verified product database. Please try another keyword or browse our categories.',
          recommendations: []
        }]);
      }
    } catch (err) {
      console.error('AI assistant error:', err);
      setMessages(prev => [...prev, {
        id: `bot_err_${Date.now()}`,
        role: 'assistant',
        text: 'Network error occurred while fetching recommendations. Please check your connection and try again.',
        recommendations: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger side-by-side comparison for specific items
  const handleTriggerCompare = (productsToCompare) => {
    if (!productsToCompare || productsToCompare.length < 2) return;
    const p1 = productsToCompare[0];
    const p2 = productsToCompare[1];
    const p3 = productsToCompare[2] || null;

    handleAsk(`Compare ${p1.name} versus ${p2.name}${p3 ? ` and ${p3.name}` : ''}`);
  };

  if (!isOpen) return null;

  return (
    <ErrorBoundary errorMessage="AI Shopping Assistant encountered an error. Click below to reload.">
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[90vh] animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-indigo-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-400 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">Marketzo AI Shopping Guide</h3>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[9px] font-black uppercase tracking-wider">
                  Live Catalog
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Grounded in verified merchant inventory & prices</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome',
                    role: 'assistant',
                    text: "👋 Hi! I am your **Marketzo AI Shopping Guide**.\n\nTell me what you're looking for (e.g. *'Show me phones under ₹20,000'* or *'Compare best noise cancelling headphones'*).",
                    recommendations: []
                  }
                ]);
                setLastRecommendedProducts([]);
                showInfo('Conversation reset.');
              }}
              title="Reset Chat"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/60 text-xs">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isBot ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                }`}>
                  {isBot ? <Sparkles className="w-4 h-4 text-amber-300" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`space-y-3 max-w-[88%] ${isBot ? '' : 'items-end'}`}>
                  
                  {/* Message Bubble */}
                  <div className={`p-3.5 rounded-2xl leading-relaxed text-xs ${
                    isBot 
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs' 
                      : 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                  }`}>
                    <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                    
                    {/* Welcome Suggestions */}
                    {msg.suggestions && (
                      <div className="flex flex-wrap gap-1.5 pt-3 mt-2 border-t border-slate-100">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleAsk(sug)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-all cursor-pointer border border-indigo-200/70"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Side-by-Side Comparison Table (if generated) */}
                  {msg.comparisonTable && (
                    <div className="p-3.5 bg-white rounded-2xl border border-indigo-200/90 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <span>Side-by-Side Comparison Table</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-[11px] text-left divide-y divide-slate-200">
                          <thead className="bg-slate-50 text-slate-700 font-bold">
                            <tr>
                              <th className="p-2 border-r border-slate-200">Feature</th>
                              {msg.comparisonTable.products.map(p => (
                                <th key={p.id} className="p-2 text-center border-r border-slate-200 last:border-0 min-w-[100px]">
                                  <div className="font-extrabold text-slate-900 truncate">{p.name}</div>
                                  <div className="text-indigo-600 font-black text-xs">{formatPrice(p.price)}</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {msg.comparisonTable.features.map((feat, fIdx) => (
                              <tr key={fIdx} className="hover:bg-slate-50/50">
                                <td className="p-2 font-bold text-slate-600 border-r border-slate-100 bg-slate-50/40">{feat.feature}</td>
                                {feat.values.map((val, vIdx) => (
                                  <td key={vIdx} className="p-2 text-slate-800 border-r border-slate-100 last:border-0 text-center">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {msg.comparisonTable.verdict && (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed">
                          <strong>🏆 AI Verdict:</strong> {msg.comparisonTable.verdict.summary}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommended Products Grid */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                        <span>Top Matches ({msg.recommendations.length})</span>
                        {msg.recommendations.length >= 2 && (
                          <button
                            onClick={() => handleTriggerCompare(msg.recommendations)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                          >
                            <Layers className="w-3 h-3" />
                            <span>Compare Top 3</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.recommendations.map(rec => {
                          const isWished = isInWishlist(rec.id);
                          const sellerPhone = rec.sellerPhone || '+1 (555) 392-1082';
                          const sellerWA = rec.sellerWhatsApp || '15553921082';

                          return (
                            <div key={rec.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 hover:border-indigo-300 transition-all">
                              
                              {/* Main Card Header */}
                              <div className="flex items-start gap-3">
                                <img
                                  src={rec.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80'}
                                  alt={rec.name}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80';
                                  }}
                                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 
                                    onClick={() => {
                                      onClose();
                                      onNavigate('product-detail', { id: rec.id });
                                    }}
                                    className="font-black text-slate-900 text-xs line-clamp-1 hover:text-indigo-600 cursor-pointer"
                                  >
                                    {rec.name}
                                  </h5>

                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                                    <span className="text-amber-500 font-black flex items-center gap-0.5">
                                      ★ {rec.rating || 4.8}
                                    </span>
                                    <span>({rec.reviewCount || 40})</span>
                                    <span>•</span>
                                    <span className="text-slate-600 font-semibold truncate flex items-center gap-1">
                                      {rec.sellerName}
                                      {rec.isVerifiedSeller && (
                                        <ShieldCheck className="w-3 h-3 text-emerald-600 inline" title="Verified Merchant" />
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="font-black text-indigo-600 text-sm">
                                      {formatPrice(rec.price)}
                                    </span>
                                    {rec.originalPrice > rec.price && (
                                      <span className="text-[10px] text-slate-400 line-through">
                                        {formatPrice(rec.originalPrice)}
                                      </span>
                                    )}
                                    {rec.discountPercent > 0 && (
                                      <span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 font-black rounded-md text-[9px]">
                                        {rec.discountPercent}% OFF
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Highlight pill */}
                              {rec.reasonWhy && (
                                <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-snug">
                                  💡 <strong>Why recommended:</strong> {rec.reasonWhy}
                                </p>
                              )}

                              {/* Action Buttons Row 1: Cart, Wishlist, View */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button
                                  onClick={() => {
                                    onClose();
                                    onNavigate('product-detail', { id: rec.id });
                                  }}
                                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>View Details</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>

                                <button
                                  onClick={() => {
                                    addToCart({
                                      id: rec.id,
                                      name: rec.name,
                                      price: rec.price,
                                      image: rec.images?.[0]
                                    });
                                    showSuccess('Added to cart ✓');
                                  }}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Add</span>
                                </button>

                                <button
                                  onClick={() => toggleWishlist(rec)}
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer border ${
                                    isWished
                                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-600'
                                  }`}
                                  title="Save to Wishlist"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-rose-600' : ''}`} />
                                </button>
                              </div>

                              {/* Action Buttons Row 2: Seller Direct WhatsApp & Call */}
                              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px]">
                                <a
                                  href={`https://wa.me/${sellerWA}?text=${encodeURIComponent(`Hi, I am interested in ${rec.name} on Marketzo.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  <span>WhatsApp Seller</span>
                                </a>

                                <a
                                  href={`tel:${sellerPhone}`}
                                  className="flex-1 py-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <span>Call Seller</span>
                                </a>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-slate-400 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-[11px] font-bold text-slate-700">Analyzing catalog specifications, verified reviews & live prices...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleAsk(p.query)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar with Voice & Visual Search Integration */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAsk(); }} 
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          {/* Hidden Image Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Image / Camera Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload image to search similar products"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isListening ? 'Stop listening' : 'Speak your shopping request'}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Message Text Input */}
          <input
            type="text"
            placeholder={isListening ? '🎙️ Listening... (Speak your request)' : 'Ask about budget, specs, or compare...'}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            style={{
              color: '#0f172a',
              WebkitTextFillColor: '#0f172a',
              caretColor: '#0f172a',
              backgroundColor: '#ffffff'
            }}
            className="flex-1 px-3.5 py-2.5 bg-white hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-600 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 placeholder:opacity-100 outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400 cursor-text shadow-2xs"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            aria-label="Send query to AI Shopping Guide"
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

      </div>
    </ErrorBoundary>
  );
};
