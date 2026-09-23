"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShieldAlert, Sparkles, AlertCircle, Stethoscope, ChevronDown } from "lucide-react";
import { useFamily, ChatMessage } from "@/context/FamilyContext";
import DateTag from "@/components/ui/DateTag";
import Link from "next/link";

export default function ConsultationPage() {
  const { children, activeChildId, setActiveChildId, activeChild, consultationLogs, addConsultationLog } = useFamily();
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ambil history chat khusus untuk anak yang aktif
  const activeChildLogs = consultationLogs.filter(log => log.childId === activeChildId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChildLogs, isTyping]);

  // Inject pesan sambutan pertama kali jika kosong
  useEffect(() => {
    if (activeChildId && activeChildLogs.length === 0) {
      addConsultationLog({
        childId: activeChildId,
        sender: "ai",
        text: `Halo! Saya Dokter AI KuduSehat. Saya siap membantu menjawab pertanyaan seputar kesehatan dan tumbuh kembang ${activeChild?.name || 'anak Anda'}. Apa yang ingin Anda konsultasikan hari ini?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChildId, activeChildLogs.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChildId) return;

    const userMessage: Omit<ChatMessage, "id"> = {
      childId: activeChildId,
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    addConsultationLog(userMessage);
    setInput("");
    setIsTyping(true);

    // Format data untuk API
    const apiMessages = [...activeChildLogs, { id: "temp", ...userMessage }].map(msg => ({
      sender: msg.sender,
      text: msg.text
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, childContext: activeChild })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi AI");
      }

      addConsultationLog({
        childId: activeChildId,
        sender: "ai",
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (error: any) {
      console.error(error);
      addConsultationLog({
        childId: activeChildId,
        sender: "ai",
        text: `⚠️ Maaf, terjadi kesalahan: ${error.message}. Pastikan GEMINI_API_KEY sudah dikonfigurasi.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-90px)] md:h-[calc(100vh-40px)] p-4 md:p-6 flex flex-col animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
      
      {/* Header & Child Selector (Compact) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shadow-sm border border-primary-200">
              <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            Konsultasi AI
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tanyakan keluhan kesehatan anak.</p>
        </div>

        {/* Child Selector */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-2 border border-slate-200/50 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
          {children.length === 0 ? (
            <span className="text-sm text-slate-400 italic px-4 py-1.5">Belum ada profil anak</span>
          ) : (
            <>
              {/* Mobile Dropdown */}
              <div className="relative w-full md:hidden">
                <select 
                  className="w-full appearance-none bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-shadow"
                  value={activeChildId || ""}
                  onChange={(e) => setActiveChildId(e.target.value)}
                >
                  {children.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Desktop Buttons */}
              <div className="hidden md:flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full">
                {children.map(child => (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => setActiveChildId(child.id)}
                    className={`shrink-0 px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      activeChildId === child.id 
                        ? "bg-primary-600 text-white shadow-md shadow-primary-500/20" 
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {child.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Card */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden relative">
        
        {/* Sticky Chat Header */}
        <header className="bg-white/90 backdrop-blur-lg border-b border-slate-100/50 p-4 shrink-0 flex items-center justify-between gap-4 z-20 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-blue-100/50">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5 leading-tight">
                Dokter AI
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h2>
              <p className="text-xs text-green-600 font-medium">Online</p>
            </div>
          </div>
        </header>

        {/* Warning Banner */}
        <div className="bg-amber-50/80 backdrop-blur-sm border-b border-amber-100/50 p-2.5 px-4 flex items-start gap-2.5 shrink-0 z-10">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
            Hanya informatif. <strong>TIDAK BISA</strong> menggantikan diagnosis dokter sungguhan. Segera ke IGD jika gawat darurat.
          </p>
        </div>

        {!activeChildId ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Pilih Profil Anak</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Silakan pilih profil anak di atas terlebih dahulu untuk memulai konsultasi atau melihat riwayat percakapan.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 space-y-6">
              {activeChildLogs.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[75%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === "user" ? "bg-slate-800 text-white" : "bg-blue-100 text-blue-600"
                    }`}>
                      {msg.sender === "user" ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                    </div>

                    {/* Bubble */}
                    <div className={`relative px-5 py-3.5 shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-blue-600 text-white rounded-2xl rounded-br-sm" 
                        : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-sm"
                    }`}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <span className={`text-[10px] text-slate-400 font-bold mt-1.5 px-10 flex items-center gap-1 ${
                    msg.sender === "user" ? "justify-end text-right" : "justify-start text-left"
                  }`}>
                    {msg.timestamp}
                    {msg.createdAt && <DateTag date={msg.createdAt} />}
                  </span>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white/90 backdrop-blur-lg border-t border-slate-100/50 shrink-0 z-20">
              <form onSubmit={handleSend} className="relative flex items-center max-w-5xl mx-auto group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik keluhan atau pertanyaan Anda..."
                  className="w-full bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 rounded-full py-3.5 pl-5 pr-14 text-[15px] text-slate-900 transition-all outline-none shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all disabled:opacity-40 disabled:hover:bg-primary-600 disabled:cursor-not-allowed shadow-md shadow-primary-500/20 hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                AI dapat membuat kesalahan. Harap periksa ulang informasi penting.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
