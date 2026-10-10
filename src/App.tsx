import React, { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, Sparkles, Copy, Check, Loader2, User, Shirt, Maximize, MapPin, Sun, Wind } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeImage } from "./services/geminiService";
import { PromptResult } from "./types";

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Lütfen geçerli bir resim dosyası yükleyin.");
      return;
    }
    setError(null);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeImage(image, mimeType);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Görsel analiz edilirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = [
    { id: "kameraVeKadraj", title: "Kamera, Kadraj & Pozisyon", icon: <Maximize className="w-4 h-4" />, content: result?.kameraVeKadraj },
    { id: "vucutDurusu", title: "Vücut", icon: <User className="w-4 h-4" />, content: result?.vucutDurusu },
    { id: "kiyafetVeAksesuarlar", title: "Kıyafet", icon: <Shirt className="w-4 h-4" />, content: result?.kiyafetVeAksesuarlar },
    { id: "sacVeMakyaj", title: "Saç & makyaj", icon: <User className="w-4 h-4" />, content: result?.sacVeMakyaj },
    { id: "konumVePozisyon", title: "Ortam", icon: <MapPin className="w-4 h-4" />, content: result?.konumVePozisyon },
    { id: "isiklandirma", title: "Işık", icon: <Sun className="w-4 h-4" />, content: result?.isiklandirma },
    { id: "atmosfer", title: "Atmosfer", icon: <Wind className="w-4 h-4" />, content: result?.atmosfer },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#1E293B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Prompt Architect</h1>
          </div>
          <p className="text-[10px] font-bold text-blue-200/40 uppercase tracking-[0.2em] hidden sm:block">
            AI Visual Analysis Engine
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/30 mb-4">Görsel Yükle</h2>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative aspect-[4/5] rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                  ${image ? 'border-blue-400/50 bg-blue-900/20' : 'border-blue-800 bg-[#1E293B] hover:bg-blue-900/30 hover:border-blue-700'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center mb-4 border border-blue-800">
                      <Upload className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-blue-100/60">Bir görsel sürükleyin veya tıklayın</p>
                    <p className="text-xs text-blue-100/30 mt-2">PNG, JPG, WEBP (Max 10MB)</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={!image || loading}
                className={`
                  w-full mt-6 py-4 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                  ${!image || loading 
                    ? 'bg-blue-900/50 text-blue-700 cursor-not-allowed border border-blue-800' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-[0.98]'}
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Detaylı Prompt Oluştur
                  </>
                )}
              </button>
              
              {error && (
                <p className="mt-4 text-xs font-medium text-red-400 bg-red-900/20 p-3 rounded-xl border border-red-900/30">
                  {error}
                </p>
              )}
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border border-blue-800 rounded-3xl bg-[#1E293B]"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-6 border border-blue-800">
                    <ImageIcon className="w-6 h-6 text-blue-400/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-100/80">Henüz Analiz Yok</h3>
                  <p className="text-sm text-blue-100/40 mt-2 max-w-xs">
                    Bir görsel yükleyin ve profesyonel prompt detaylarını görmek için butona tıklayın.
                  </p>
                </motion.div>
              ) : loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="h-12 w-48 bg-blue-900/50 animate-pulse rounded-lg" />
                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-32 bg-blue-900/30 animate-pulse rounded-2xl" />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/30">Analiz Sonuçları</h2>
                    <button 
                      onClick={() => copyToClipboard(categories.map(c => `${c.title}: ${c.content}`).join('\n\n'), 'full')}
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors tracking-widest"
                    >
                      {copied === 'full' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      TÜMÜNÜ KOPYALA
                    </button>
                  </div>

                  <div className="space-y-8 bg-[#1E293B] border border-blue-800 rounded-3xl p-8 shadow-inner" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {categories.map((cat) => (
                      <div key={cat.id} className="space-y-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/60 flex items-center gap-2">
                          {cat.icon}
                          {cat.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-blue-100/80">
                          {cat.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-blue-200/20 font-bold tracking-[0.2em] uppercase">
            © 2026 Prompt Architect. Powered by Gemini 3 Flash.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold text-blue-200/20 hover:text-blue-200/40 transition-colors tracking-widest">DOKÜMANTASYON</a>
            <a href="#" className="text-[10px] font-bold text-blue-200/20 hover:text-blue-200/40 transition-colors tracking-widest">API</a>
            <a href="#" className="text-[10px] font-bold text-blue-200/20 hover:text-blue-200/40 transition-colors tracking-widest">GİZLİLİK</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
