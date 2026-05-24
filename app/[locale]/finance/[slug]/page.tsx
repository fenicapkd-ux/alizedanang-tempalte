import React from "react";
import PortalHeader from "../../../../components/PortalHeader";
import PortalFooter from "../../../../components/PortalFooter";
import { getDictionary } from "../../../../dictionaries";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BlogCard from "../../../../components/BlogCard";
import { sanitizeHtml, sanitizeTitle } from "../../../../lib/sanitize";

// ── Shared cached fetch — có try-catch — trả null nếu WP API lỗi (404 thay vì 500)
async function getFinancePostBySlug(slug: string, WP_API: string) {
  try {
    const res = await fetch(`${WP_API}/posts?slug=${slug}&_embed=1`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const posts = await res.json();
    return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
  } catch (err) {
    console.error('[Finance] Lỗi kéo bài viết WP:', err);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://alizedanang.net";
  const WP_API = process.env.NEXT_PUBLIC_FINANCE_WP_API_URL || 'https://atservice.com.vn/wp-json/wp/v2';

  try {
    const p = await getFinancePostBySlug(slug, WP_API);
    if (p) {
      const title = p.title.rendered.replace(/<[^>]+>/g, '');
      const desc = p.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 150);
      const img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/can-ho-view-bien-my-khe-alize.webp';
      return {
        title: `${title} - G-Estate Finance`,
        description: desc,
        openGraph: { title, description: desc, images: [{ url: img }], url: `${baseUrl}/${locale}/finance/${slug}` },
        alternates: { canonical: `${baseUrl}/${locale}/finance/${slug}` }
      };
    }
  } catch (err) {}
  return { title: "Not Found" };
}

export default async function FinanceDetailPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);
  const financeDict: any = dict.finance || dict.blog;

  const WP_API = process.env.NEXT_PUBLIC_FINANCE_WP_API_URL || 'https://atservice.com.vn/wp-json/wp/v2';
  const post = await getFinancePostBySlug(slug, WP_API);
  if (!post) notFound();

  // Lấy thêm danh sách bài viết liên quan (loại trừ bài hiện tại)
  let relatedPosts: any[] = [];
  try {
    const relRes = await fetch(`${WP_API}/posts?_embed=1&per_page=7&exclude=${post.id}`, {
      next: { revalidate: 3600 }
    });
    relatedPosts = await relRes.json();
  } catch (error) {
    console.error("Lỗi kéo tin tức liên quan Tài Chính WP:", error);
  }

  const title = sanitizeTitle(post.title.rendered);
  const content = sanitizeHtml(post.content.rendered);
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/can-ho-view-bien-my-khe-alize.webp';
  const date = new Date(post.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="relative w-full min-h-screen bg-[#070A10] text-pearl-white flex flex-col pt-32">
      <PortalHeader nav={dict.portal.nav} locale={locale} />
      
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 md:py-12 w-full flex-1 flex flex-col lg:flex-row gap-12 lg:gap-20">
        
        {/* CỘT TRÁI: NỘI DUNG BÀI VIẾT */}
        <div className="lg:w-2/3 w-full">
          <span className="text-gold text-[10px] uppercase font-bold tracking-widest mb-6 block text-center lg:text-left">{date}</span>
          <h1 className="font-serif text-3xl md:text-5xl font-light mb-12 tracking-tight leading-tight text-center lg:text-left" dangerouslySetInnerHTML={{ __html: title }} />
          
          <div className="w-full aspect-[16/9] mb-12 overflow-hidden rounded-xl border border-white/5 bg-charcoal/20 shadow-2xl shadow-gold/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img fetchPriority="high" loading="eager" decoding="sync" src={featuredMedia} className="w-full h-full object-cover filter brightness-[0.85]" alt={title.replace(/<[^>]+>/g, '')} />
          </div>

          {/* Thay đổi style hiển thị content nhẹ nhàng, phù hợp Finance */}
          <div className="text-champagne/90 font-light leading-loose text-base md:text-lg flex flex-col gap-6 blog-content wp-content finance-content" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {/* CỘT PHẢI: TIN TỨC LIÊN QUAN */}
        <div className="lg:w-1/3 w-full flex flex-col gap-8">
          <div className="sticky top-32">
            <h3 className="font-serif text-2xl text-gold mb-6 border-b border-gold/20 pb-4">{financeDict.investmentInsights || 'Góc Nhìn Đầu Tư'}</h3>
            <div className="flex flex-col gap-6">
              {Array.isArray(relatedPosts) && relatedPosts.slice(0, 4).map(rp => {
                const rpTitle = rp.title.rendered;
                const rpImg = rp._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/can-ho-view-bien-my-khe-alize.webp';
                const rpDate = new Date(rp.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
                return (
                  <Link href={`/${locale}/finance/${rp.slug}`} key={rp.id} className="group flex gap-4 items-center bg-white/5 p-3 rounded-lg border border-white/5 hover:border-gold/30 transition-all">
                    <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 relative bg-charcoal">
                      <img loading="lazy" src={rpImg} alt={rpTitle.replace(/<[^>]+>/g, '')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gold/70 text-[9px] uppercase font-bold tracking-widest mb-1">{rpDate}</span>
                      <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-gold transition-colors leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeTitle(rpTitle) }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DƯỚI BÀI VIẾT: TIN TỨC MỚI NHẤT */}
      {Array.isArray(relatedPosts) && relatedPosts.length > 4 && (
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pb-24 w-full">
          <div className="border-t border-white/10 pt-16">
            <h3 className="font-serif text-3xl md:text-4xl text-white mb-10 text-center font-light">{financeDict.latestUpdates || 'Cập Nhật Mới Nhất'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {relatedPosts.slice(4, 7).map(rp => {
                const rpTitle = rp.title.rendered;
                const rpImg = rp._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/can-ho-view-bien-my-khe-alize.webp';
                const rpExcerpt = rp.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 150) + '...';
                const rpDate = new Date(rp.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
                return (
                  <BlogCard 
                    key={rp.id.toString()}
                    id={rp.id}
                    slug={rp.slug}
                    title={rpTitle}
                    excerpt={rpExcerpt}
                    date={rpDate}
                    imageUrl={rpImg}
                    locale={locale}
                    readMoreBtnText={financeDict.readMoreBtn || 'Đọc Thêm'}
                    basePath="finance"
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* JSON-LD FOR SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article", // Updated to generic Article for Finance
            "headline": title.replace(/<[^>]+>/g, ''),
            "image": [featuredMedia],
            "datePublished": post.date,
            "dateModified": post.modified || post.date,
            "author": {
              "@type": "Organization",
              "name": "G-Estate",
              "url": "https://alizedanang.net"
            },
            "publisher": {
              "@type": "Organization",
              "name": "G-Estate",
              "logo": {
                "@type": "ImageObject",
                "url": "https://alizedanang.net/images/sky-pool-alize-da-nang.webp"
              }
            },
            "description": post.excerpt?.rendered?.replace(/<[^>]+>/g, '').substring(0, 150)
          })
        }}
      />

      <PortalFooter footer={dict.portal.footer} locale={locale} />
    </div>
  );
}
