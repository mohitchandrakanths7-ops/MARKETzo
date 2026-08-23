import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  Image as ImageIcon,
  CheckCircle2 
} from 'lucide-react';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

export const VisualSearchModal = ({ isOpen, onClose, onNavigate }) => {
  const { formatPrice } = useCurrency();
  const fileInputRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setSelectedImage(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imgData) => {
    setIsAnalyzing(true);
    setResults(null);
    try {
      const res = await api.searchVisualProduct({
        imageBase64: imgData
      });

      if (res.success) {
        setResults(res);
      }
    } catch (err) {
      console.error('Visual search failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">Visual Product Search</h3>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[9px] font-bold">
                  Image AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Upload or snap a photo to find matching products</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${
              selectedImage 
                ? 'border-indigo-400 bg-indigo-50/30' 
                : 'border-slate-300 hover:border-indigo-500 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {selectedImage ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={selectedImage}
                  alt="Uploaded preview"
                  className="w-28 h-28 object-cover rounded-2xl border-2 border-indigo-500 shadow-md"
                />
                <div className="text-xs font-bold text-slate-700">
                  Image loaded. Tap here to choose a different photo.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Upload or drop product photo</div>
                  <p className="text-xs text-slate-500 mt-0.5">Supports JPG, PNG, WEBP from your phone camera or computer</p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis State */}
          {isAnalyzing && (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="font-bold text-xs text-slate-800">Analyzing image features...</div>
              <p className="text-[11px] text-slate-500">Matching visual attributes, colors, and silhouettes against Marketzo catalog.</p>
            </div>
          )}

          {/* Results Display */}
          {results && results.matches && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Visually Matching Products ({results.matches.length})</span>
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ High Match Accuracy
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.matches.map(prod => (
                  <div 
                    key={prod.id}
                    onClick={() => {
                      onClose();
                      onNavigate('product-detail', { id: prod.id });
                    }}
                    className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all flex items-center gap-3 cursor-pointer group shadow-2xs"
                  >
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=120&auto=format&fit=crop&q=80'}
                      alt={prod.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {prod.name}
                      </h5>
                      <div className="font-extrabold text-indigo-600 text-xs mt-0.5">
                        {formatPrice(prod.price)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>★ {prod.rating || 4.8}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">{Math.round(prod.similarityScore * 100)}% Match</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
