"use client";

import React, { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import { MessageCircle, X, Send, User, ShieldAlert, Paperclip } from "lucide-react";
import { 
  client, 
  databases, 
  account, 
  setupAnonymousSession,
  APPWRITE_DATABASE_ID,
  APPWRITE_COLLECTION_ID,
  storage 
} from "../lib/appwrite";
import { ID, Query } from "appwrite";

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  
  // Lead info
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [hasLeadInfo, setHasLeadInfo] = useState(false);

  // File Attachment
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tạo preview URL cho file đính kèm, tự động revoke khi đổi file (tránh memory leak)
  const previewUrl = useMemo(
    () => (attachment ? URL.createObjectURL(attachment) : null),
    [attachment]
  );
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  
  // Audio
  const playTing = () => {
    try {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch(e) {}
  };

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Load lead info
  useEffect(() => {
    const storedName = localStorage.getItem('g_estate_guest_name');
    const storedPhone = localStorage.getItem('g_estate_guest_phone');
    if (storedName && storedPhone) {
      setGuestName(storedName);
      setGuestPhone(storedPhone);
      setHasLeadInfo(true);
    }
  }, []);

  // Khởi tạo Chat (Anonymous Session + Subscription)
  useEffect(() => {
    let unsubscribe: () => void;

    const initChat = async () => {
      try {
        console.log("Đang khởi tạo Appwrite Chat...");
        const session = await setupAnonymousSession();
        setUserId(session.$id);

        // Fetch lịch sử tin nhắn của Browser Session hiện tại
        try {
          const history = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            [
              Query.orderAsc("$createdAt"),
              Query.limit(50),
              Query.equal("senderId", session.$id)
            ]
          );
          setMessages(history.documents);
        } catch (dbErr: any) {
          console.warn("Chưa tạo Collection hoặc Lỗi DB:", dbErr.message);
          setConnectionError(true);
        }

        // Lắng nghe Realtime (WebSockets)
        unsubscribe = client.subscribe(
          `databases.${APPWRITE_DATABASE_ID}.collections.${APPWRITE_COLLECTION_ID}.documents`,
          (response) => {
            console.log("Thấy event realtime:", response);
            if (response.events.some(e => e.includes('.create'))) {
              const payload = response.payload as any;
              // Ngăn không cho tin nhắn bị duplicate (nếu Appwrite SDK lỡ trigger 2 lần)
              setMessages(prev => {
                if (prev.some(m => m.$id === payload.$id)) return prev;
                // Chỉ hiển thị tin nhắn thuộc về Guest hiện tại
                if (payload.senderId === session.$id) {
                  // Kêu Ting nếu có tin nhắn mới từ Admin
                  if (payload.senderType === 'agent') {
                    playTing();
                  }
                  return [...prev, payload];
                }
                return prev;
              });
            }
          }
        );

        setIsInitializing(false);
      } catch (err: any) {
        console.error("Lỗi khởi tạo Chat:", err.message);
        setConnectionError(true);
        setIsInitializing(false);
      }
    };

    if (isOpen && isInitializing) {
      initChat();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, isInitializing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as FormEvent);
    }
  };

  const handleLeadSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (guestName.trim() && guestPhone.trim()) {
      localStorage.setItem('g_estate_guest_name', guestName);
      localStorage.setItem('g_estate_guest_phone', guestPhone);
      setHasLeadInfo(true);
      
      // Save directly to CRM Leads
      if (userId) {
         try {
           await databases.createDocument(APPWRITE_DATABASE_ID, 'crm_leads', userId, {
              userId: userId,
              name: guestName,
              phone: guestPhone,
              status: "NEW",
              notes: ""
           });
         } catch(e) { 
           // Ignore if already exists (DocumentID already exists error)
         }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || !userId || !hasLeadInfo) return;

    setIsUploading(true);

    let finalAttachmentUrl = "";
    if (attachment) {
      try {
        const uploaded = await storage.createFile('chat_media', ID.unique(), attachment);
        finalAttachmentUrl = String(storage.getFileView('chat_media', uploaded.$id));
      } catch(err) {
         console.error("Lỗi Upload File:", err);
         alert("Lỗi tải file lên máy chủ!");
         setIsUploading(false);
         return;
      }
    }

    const msgPayload = {
      content: inputText,
      senderId: userId,
      senderType: "user", // "user" hoặc "agent"
      guestName: guestName,
      guestPhone: guestPhone,
      attachmentUrl: finalAttachmentUrl || undefined
    };

    setInputText("");
    setAttachment(null);

    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_COLLECTION_ID,
        ID.unique(),
        msgPayload
      );
      
      // Bạn có thể giả lập Webhook gọi API Server ở đây để Agent auto-reply:
      fetch('/api/chat/reply', { method: 'POST', body: JSON.stringify(msgPayload) }).catch(() => {});

    } catch (err: any) {
      console.error("Lỗi gửi tin nhắn:", err.message);
      alert("Bạn cần tạo Database và Collection trước trong Appwrite!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      {/* Nút Bong bóng Chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-gradient-to-tr from-gold to-[#F5D061] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(212,175,55,0.4)] hover:scale-105 hover:shadow-[0_6px_25px_rgba(212,175,55,0.6)] transition-all duration-300 relative group z-50"
      >
        {isOpen ? (
          <X className="text-jet-black group-hover:rotate-90 transition-transform duration-300" size={22} />
        ) : (
          <>
            <MessageCircle className="text-jet-black group-hover:scale-110 transition-transform duration-300" size={24} />
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-gold rounded-full"></span>
            </span>
          </>
        )}
      </button>

      {/* Cửa sổ Chat */}
      <div 
        className={`absolute bottom-16 right-0 w-[320px] bg-jet-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen ? "scale-100 opacity-100 visible translate-y-0" : "scale-95 opacity-0 invisible translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-[#1A1A1A]/90 backdrop-blur-sm p-4 flex items-center gap-3 border-b border-white/5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="text-white font-semibold text-sm">Chuyên viên Tư Vấn</h3>
            <p className="text-[10px] text-champagne/60 uppercase tracking-widest">Sẵn sàng hỗ trợ (Realtime)</p>
          </div>
        </div>

        <div className="h-[350px] p-4 overflow-y-auto bg-jet-black/95 flex flex-col gap-3">
          {!hasLeadInfo ? (
            <div className="flex-1 flex flex-col justify-center animate-fade-in-up">
              <div className="text-center mb-6">
                <ShieldAlert size={32} className="mx-auto text-gold mb-2" />
                <h4 className="text-white text-sm font-semibold">G-Estate Xin Chào!</h4>
                <p className="text-xs text-champagne/60 mt-1">Để chúng tôi hỗ trợ tốt nhất, xin vui lòng để lại thông tin liên lạc.</p>
              </div>
              <form onSubmit={handleLeadSubmit} className="flex flex-col gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Tên của bạn"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  className="bg-charcoal text-white text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-gold outline-none"
                />
                <input 
                  type="tel" 
                  required
                  placeholder="Số điện thoại"
                  value={guestPhone}
                  onChange={e => setGuestPhone(e.target.value)}
                  className="bg-charcoal text-white text-sm px-4 py-3 rounded-lg border border-white/10 focus:border-gold outline-none"
                />
                <button type="submit" className="bg-gold text-jet-black font-semibold py-3 rounded-lg hover:scale-[1.02] transition-transform">
                  Bắt Đầu Trò Chuyện
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center text-xs text-champagne/40 my-2">-- Bắt đầu phiên Chat với {guestName} --</div>
              
              {connectionError && (
                 <div className="bg-red-500/20 text-red-300 text-xs p-3 rounded text-center">
                     Dường như thiếu thông tin cấu hình PROJECT_ID hoặc Collection chưa được tạo trên Appwrite!
                 </div>
              )}

              {isInitializing && !connectionError ? (
                <div className="text-sm text-champagne/50 text-center animate-pulse">Đang kết nối...</div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderType !== 'agent';
                  return (
                    <div key={msg.$id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center mr-2 self-end mb-1 shrink-0">
                          <User size={12} className="text-gold" />
                        </div>
                      )}
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-gold text-jet-black rounded-br-sm' : 'bg-charcoal text-white rounded-bl-sm border border-white/5'}`}>
                        {msg.attachmentUrl && (
                          <div className="mb-2">
                            <img src={msg.attachmentUrl} alt="Đính kèm" className="rounded-lg w-full object-cover max-h-40 shadow-md" />
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-3 bg-[#1A1A1A] border-t border-white/5 flex gap-2">
          <input
            type="file"
            id="chat-file-upload"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            disabled={connectionError || isInitializing || !hasLeadInfo || isUploading}
          />
          <label 
            htmlFor="chat-file-upload" 
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${attachment ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-champagne hover:bg-white/10 cursor-pointer'} ${(!hasLeadInfo || isUploading) && 'opacity-50 pointer-events-none'}`}
          >
            {attachment ? <img src={previewUrl!} alt="preview" className="w-6 h-6 object-cover rounded" /> : <Paperclip size={18} />}
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!hasLeadInfo ? "Vui lòng nhập thông tin" : isUploading ? "Đang gửi..." : "Nhập tin nhắn..."}
            disabled={connectionError || isInitializing || !hasLeadInfo || isUploading}
            className="flex-1 bg-jet-black text-white px-4 py-2 rounded-full text-sm outline-none border border-white/10 focus:border-gold/50 transition-colors placeholder:text-white/30 min-w-0"
          />
          <button 
            type="submit" 
            disabled={(!inputText.trim() && !attachment) || connectionError || isInitializing || !hasLeadInfo || isUploading}
            className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-jet-black hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shrink-0"
          >
            {isUploading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <Send size={16} className="ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
}
