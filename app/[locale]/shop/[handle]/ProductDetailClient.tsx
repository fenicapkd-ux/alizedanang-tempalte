"use client";
import React, { useState, useEffect } from "react";
import { useStore } from "../../../../lib/store-context";
import { ChevronRight, Heart, Minus, Plus, ShoppingBag, ShieldCheck, Truck, Share2, Phone } from "lucide-react";
import Link from "next/link";
import ConsultationModal from "../../../../components/ConsultationModal";
import { sendGTMEvent } from '@next/third-parties/google';
import { sanitizeProduct } from "../../../../lib/sanitize";

interface ProductDetailClientProps {
  product: any;
  relatedProducts?: any[];
  locale: string;
}

export default function ProductDetailClient({ product, relatedProducts = [], locale }: ProductDetailClientProps) {
  const { addToCart } = useStore();
  const [selectedImage, setSelectedImage] = useState(product.thumbnail || product.images?.[0]?.url || "");
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [showStickyBottom, setShowStickyBottom] = useState(false);

  useEffect(() => {
    sendGTMEvent({
      event: 'view_item',
      value: product.variants?.[0]?.prices?.find((p: any) => p.currency_code === "vnd")?.amount || 0,
      currency: 'VND',
      items: [
        {
          item_id: product.id,
          item_name: product.title,
        }
      ]
    });
  }, [product.id, product.title, product.variants]);

  const price = selectedVariant?.prices?.find((p: any) => p.currency_code === "vnd");
  const formattedPrice = price 
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price.amount) 
    : "Liên hệ";

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(selectedVariant.id, quantity, {
      title: product.title,
      thumbnail: product.thumbnail || product.images?.[0]?.url,
      unit_price: price?.amount || 0,
      variant_title: selectedVariant?.title || ""
    });

    sendGTMEvent({
      event: 'add_to_cart',
      value: (price?.amount || 0) * quantity,
      currency: 'VND',
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          price: price?.amount || 0,
          quantity: quantity
        }
      ]
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã copy link sản phẩm!");
    }
  };

  // Handle sticky bottom bar visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBottom(true);
      } else {
        setShowStickyBottom(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-24 text-pearl-white relative">
        {/* Breadcrumbs & Share */}
        <div className="flex items-center justify-between mb-8">
          <nav className="flex items-center gap-2 text-xs text-white/40 font-light">
            <Link href={`/${locale}`} className="hover:text-gold transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link href={`/${locale}/shop`} className="hover:text-gold transition-colors">Cửa hàng</Link>
            <ChevronRight size={12} />
            <span className="text-white truncate max-w-[150px] sm:max-w-xs">{product.title}</span>
          </nav>
          <button onClick={handleShare} className="flex items-center gap-2 text-xs text-white/40 hover:text-gold transition-colors">
            <Share2 size={14} /> <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center relative">
              {selectedImage ? (
                <img src={selectedImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag size={64} className="text-white/10" />
              )}
              {product.categories?.[0] && (
                <span className="absolute top-4 left-4 bg-gold text-jet-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-lg">
                  {product.categories[0].name}
                </span>
              )}
            </div>
            
            {/* Thumbnails (Desktop) & Swipeable (Mobile) */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2">
                {product.images.map((img: any) => (
                  <button 
                    key={img.id} 
                    onClick={() => setSelectedImage(img.url)}
                    className={`snap-start w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === img.url ? 'border-gold opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img.url} className="w-full h-full object-cover pointer-events-none" alt="thumbnail" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="flex flex-col">
            <h1 className="font-serif text-3xl md:text-4xl text-white font-light tracking-tight mb-4">
              {product.title}
            </h1>
            <p className="text-gold text-3xl font-serif mb-6">{formattedPrice}</p>
            
            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8 border-t border-white/5 pt-6">
                <h3 className="text-white text-sm font-medium mb-3">Tùy chọn:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button 
                      key={v.id} 
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${selectedVariant?.id === v.id ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons (Desktop) */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-white/10 rounded-lg p-1 bg-white/5 w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-white text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              
              <button onClick={handleAddToCart} className="flex-1 bg-gold text-jet-black py-3 px-8 rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-gold/90 transition-all flex items-center justify-center gap-2">
                <ShoppingBag size={18} /> Thêm Vào Giỏ Để Tư Vấn
              </button>
              
              <button className="w-14 h-14 flex items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-gold hover:border-gold transition-all">
                <Heart size={20} />
              </button>
            </div>

            {/* Request Consultation Button */}
            <button onClick={() => setIsConsultOpen(true)} className="hidden sm:flex items-center justify-center gap-2 w-full py-4 border border-gold/40 text-gold hover:bg-gold/10 transition-colors rounded-lg text-sm uppercase tracking-widest font-semibold mb-10">
              <Phone size={16} /> Cần Tư Vấn Thêm Về Sản Phẩm Này?
            </button>

            {/* Subtitle / Specifications */}
            {product.subtitle && (
              <div className="mb-10 p-6 bg-white/5 border border-white/10 rounded-xl">
                <h3 className="text-white font-serif text-lg mb-4">Thông số kỹ thuật / Đặc điểm</h3>
                <div className="text-sm text-white/60 whitespace-pre-line leading-relaxed">
                  {product.subtitle}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="space-y-4 border-t border-white/5 pt-8">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <ShieldCheck size={18} className="text-gold" /> Bảo hành chính hãng 12 tháng
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Truck size={18} className="text-gold" /> Miễn phí vận chuyển toàn quốc
              </div>
            </div>
          </div>
        </div>

        {/* Description Full Width */}
        {product.description && (
          <div className="mt-10 md:mt-14 border-t border-white/5 pt-16">
            <h2 className="font-serif text-2xl md:text-3xl text-white mb-8 text-center font-light">
              {locale === 'vi' ? 'Thông Tin Sản Phẩm' : 'Product Information'}
            </h2>
            <div className="prose prose-invert max-w-4xl mx-auto text-white/60 font-light leading-relaxed prose-p:mb-4 prose-headings:text-white prose-headings:font-serif">
              <div dangerouslySetInnerHTML={{ __html: sanitizeProduct(product.description) }} />
            </div>
          </div>
        )}

        {/* Related Products */}
        <div className="mt-10 md:mt-14 border-t border-white/5 pt-16">
          <h2 className="font-serif text-2xl text-white mb-8">Có Thể Bạn Cũng Thích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((rp: any) => (
                <Link href={`/${locale}/shop/${rp.handle || rp.id}`} key={rp.id} className="group cursor-pointer block">
                  <div className="aspect-[4/3] bg-white/5 border border-white/5 group-hover:border-gold/30 rounded-xl mb-3 overflow-hidden relative">
                    {rp.thumbnail ? (
                      <img src={rp.thumbnail} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 group-hover:scale-105 transition-transform">
                        <ShoppingBag size={32} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-white text-sm line-clamp-2 group-hover:text-gold transition-colors">{rp.title}</h4>
                  <p className="text-gold/80 text-xs mt-2 uppercase tracking-widest">Liên hệ tư vấn</p>
                </Link>
              ))
            ) : (
              <p className="text-white/40 col-span-full">Chưa có sản phẩm liên quan.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar (Mobile Only) */}
      <div className={`sm:hidden fixed bottom-0 left-0 w-full bg-[#0A0C10]/95 backdrop-blur-xl border-t border-white/10 p-4 z-[90] transform transition-transform duration-300 ${showStickyBottom ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white text-sm font-medium line-clamp-1">{product.title}</p>
            <p className="text-gold text-lg font-semibold">{formattedPrice}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsConsultOpen(true)} className="w-12 h-12 flex items-center justify-center border border-gold/40 text-gold rounded-lg flex-shrink-0">
            <Phone size={18} />
          </button>
          <button onClick={handleAddToCart} className="flex-1 bg-gold text-jet-black font-bold uppercase tracking-widest text-xs rounded-lg flex items-center justify-center gap-2">
            Thêm Vào Giỏ Để Tư Vấn
          </button>
        </div>
      </div>

      <ConsultationModal 
        isOpen={isConsultOpen} 
        onClose={() => setIsConsultOpen(false)} 
        productTitle={product.title} 
      />
    </>
  );
}
