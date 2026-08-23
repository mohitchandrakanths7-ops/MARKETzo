import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Store, 
  Send, 
  Loader2, 
  CheckCheck, 
  User,
  Search,
  ExternalLink 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export const ChatInbox = ({ isSellerView = false, onNavigate }) => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  const loadConversations = async () => {
    try {
      setIsLoadingList(true);
      const res = await api.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        if (res.conversations?.length > 0 && !activeConvId) {
          setActiveConvId(res.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Load conversations error:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      setIsLoadingMessages(true);
      const res = await api.getMessages(convId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error('Load messages error:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await api.sendMessage(activeConvId, { text });
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
        // Update conversation last message in list
        setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, lastMessage: text, lastMessageTime: new Date().toISOString() } : c));
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  const filteredConversations = conversations.filter(c => {
    const targetName = isSellerView ? c.customerName : c.sellerName;
    return !searchQuery || targetName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.productName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col md:flex-row h-[620px]">
      
      {/* Left Sidebar: Conversations List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>{isSellerView ? 'Customer Messages' : 'Seller Chats'}</span>
            </h3>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black">
              {conversations.length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600 font-medium"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingList ? (
            <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isActive = conv.id === activeConvId;
              const title = isSellerView ? conv.customerName : conv.sellerName;
              const unread = isSellerView ? conv.unreadCountSeller : conv.unreadCountCustomer;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3.5 transition-all flex items-start gap-3 cursor-pointer ${
                    isActive ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs shadow-2xs">
                    {isSellerView ? <User className="w-4 h-4 text-slate-500" /> : <Store className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-extrabold text-xs text-slate-900 truncate">{title}</span>
                      {unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                    {conv.productName && (
                      <p className="text-[10px] font-semibold text-indigo-600 truncate mb-0.5">
                        📦 {conv.productName}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Main: Active Message Thread */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {isSellerView ? <User className="w-5 h-5" /> : <Store className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    {isSellerView ? activeConv.customerName : activeConv.sellerName}
                  </h4>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Verified Active Marketplace Thread
                  </p>
                </div>
              </div>

              {activeConv.productId && onNavigate && (
                <button
                  onClick={() => onNavigate('product-detail', { id: activeConv.productId })}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>View Product</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-100/50">
              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-xs">Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-center p-8">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                  <div className="text-xs font-bold text-slate-700">No messages in this thread</div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = isSellerView 
                    ? msg.senderRole === 'seller' || msg.senderId === user?.id
                    : msg.senderRole === 'customer' || msg.senderId === user?.id;

                  return (
                    <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="text-[10px] text-slate-400 mb-1 px-1 font-semibold">
                        {isMe ? 'You' : msg.senderName || (isSellerView ? 'Customer' : 'Seller')}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
                        isMe 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-xs' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
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
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder={isSellerView ? 'Reply to customer inquiry...' : 'Type your message to the seller...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
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
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-8 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300" />
            <div className="font-extrabold text-sm text-slate-800">Select a conversation</div>
            <p className="text-xs text-slate-400 max-w-sm">Choose a chat thread from the left menu to view the full dialogue and respond in real-time.</p>
          </div>
        )}
      </div>

    </div>
  );
};
