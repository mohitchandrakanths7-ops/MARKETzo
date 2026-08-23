import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Store, 
  CheckCheck, 
  MessageSquare, 
  Loader2,
  ExternalLink 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export const SellerChatModal = ({ isOpen, onClose, sellerId, sellerName, product, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && sellerId && isAuthenticated) {
      initChat();
    }
  }, [isOpen, sellerId, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initChat = async () => {
    try {
      setIsLoading(true);
      const res = await api.startChat({
        sellerId,
        productId: product?.id || null,
        initialMessage: product ? `Hi, I am inquiring about "${product.name}".` : null
      });

      if (res.success && res.conversation) {
        setConversation(res.conversation);
        loadMessages(res.conversation.id);
      }
    } catch (err) {
      console.error('Chat init error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await api.getMessages(convId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation || isSending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await api.sendMessage(conversation.id, { text: textToSend });
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[580px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">{sellerName || conversation?.sellerName || 'Merchant Store'}</h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Verified Marketplace Merchant Support</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Context Banner (if inquiring from a product) */}
        {product && (
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80'} 
                alt={product.name} 
                className="w-8 h-8 rounded-lg object-cover bg-white border border-slate-200 shrink-0" 
              />
              <div className="truncate">
                <div className="font-bold text-slate-900 truncate">{product.name}</div>
                <div className="text-[11px] text-indigo-600 font-black">{formatPrice(product.price)}</div>
              </div>
            </div>
            {onNavigate && (
              <button
                onClick={() => {
                  onClose();
                  onNavigate('product-detail', { id: product.id });
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 shrink-0"
              >
                <span>View Item</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Message Thread Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold">Connecting to merchant chat...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-6 text-center">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <div className="text-xs font-bold text-slate-700">Start the conversation</div>
              <div className="text-[11px] text-slate-400 max-w-xs">Ask questions about product specifications, shipping, bulk discounts, or warranty.</div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === user?.id || msg.senderRole === 'customer';
              return (
                <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] text-slate-400 mb-1 px-1 font-semibold">
                    {isMe ? 'You' : msg.senderName || 'Merchant'}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                    isMe 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs' 
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="Attachment" className="rounded-xl max-h-48 object-cover mb-2 border border-black/10" />
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1 px-1">
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && <CheckCheck className="w-3 h-3 text-indigo-500" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Type your message to the seller..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending || isLoading}
            style={{
              color: '#0f172a',
              WebkitTextFillColor: '#0f172a',
              caretColor: '#0f172a',
              backgroundColor: '#ffffff'
            }}
            className="flex-1 px-4 py-2.5 bg-white hover:bg-white focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-600 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none font-medium transition-all focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100 disabled:text-slate-400 cursor-text"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

      </div>
    </div>
  );
};
