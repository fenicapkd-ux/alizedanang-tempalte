"use client";
import React, { useState } from "react";

interface ContactFormProps {
  title?: string;
  projectName?: string;
  projectId?: string;
  hotline?: string;
  locale?: string;
  apiUrl?: string;
}

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactFormSection({
  title = "Đăng Ký Tham Quan",
  projectName = "",
  projectId = "",
  hotline = "0799036842",
  locale = "vi",
  apiUrl = "http://localhost:3001",
}: ContactFormProps) {
  const [form, setForm] = useState({ full_name: "", phone: "", notes: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  const isVI = locale === "vi";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) {
      setError(isVI ? "Vui lòng nhập Họ Tên và Số Điện Thoại." : "Please enter Name and Phone.");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/projects/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          project_name: projectName,
          full_name: form.full_name,
          phone: form.phone,
          notes: form.notes,
          lead_source: "website_contact_form",
          utm_source: typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("utm_source") || "" : "",
          referrer_url: typeof window !== "undefined" ? document.referrer : "",
        }),
      });
      if (!res.ok) throw new Error("API error");
      setStatus("success");
      setForm({ full_name: "", phone: "", notes: "" });
    } catch {
      setStatus("error");
      setError(isVI ? "Có lỗi xảy ra. Vui lòng gọi hotline." : "An error occurred. Please call the hotline.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white/5 border border-gold/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-light text-pearl-white mb-3">
          {isVI ? "Đã Nhận Thông Tin!" : "Information Received!"}
        </h3>
        <p className="text-champagne/60 text-sm font-light leading-relaxed max-w-xs">
          {isVI
            ? "Chuyên viên tư vấn sẽ liên hệ lại trong vòng 30 phút. Cảm ơn bạn đã quan tâm đến dự án!"
            : "Our consultant will contact you within 30 minutes. Thank you for your interest!"}
        </p>
        <a
          href={`tel:${hotline}`}
          className="mt-8 inline-flex items-center gap-2 text-gold text-sm font-light border border-gold/30 px-6 py-3 rounded hover:bg-gold/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {isVI ? "Gọi Ngay" : "Call Now"}: {hotline}
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white/3 border border-white/10 rounded-2xl p-8 lg:p-10">
      <h3 className="font-serif text-2xl font-light text-pearl-white mb-2">{title}</h3>
      <p className="text-champagne/40 text-xs font-light mb-8 uppercase tracking-widest">
        {isVI ? "Phản hồi trong 30 phút" : "Response within 30 minutes"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-champagne/40 mb-2">
            {isVI ? "Họ Tên *" : "Full Name *"}
          </label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            placeholder={isVI ? "Nguyễn Văn A" : "John Smith"}
            required
            className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-champagne/40 mb-2">
            {isVI ? "Số Điện Thoại *" : "Phone Number *"}
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="0901 234 567"
            required
            className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-champagne/40 mb-2">
            {isVI ? "Ghi Chú" : "Notes"}
          </label>
          <textarea
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder={isVI ? "Quan tâm loại căn 2PN, tầm nhìn biển..." : "Interested in 2BR, sea view..."}
            rows={3}
            className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors placeholder:text-white/20 resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-xs font-light">{error}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-gold text-jet-black font-bold text-[11px] uppercase tracking-[0.3em] py-4 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === "sending" ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isVI ? "Đang Gửi..." : "Sending..."}
            </>
          ) : (
            isVI ? "Gửi Thông Tin" : "Send"
          )}
        </button>

        <p className="text-[10px] text-champagne/30 text-center leading-relaxed">
          {isVI
            ? "Thông tin của bạn được bảo mật hoàn toàn. Chúng tôi không chia sẻ với bên thứ ba."
            : "Your information is kept strictly confidential and is never shared with third parties."}
        </p>
      </form>
    </div>
  );
}
