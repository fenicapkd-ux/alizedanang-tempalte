import { Dictionary } from "../types";

// Fallback to Vietnamese translation logic for minimal setup, with strings localized to EN
export const enDict: Dictionary = {
  seo: {
    title: "ALIZE - Luxury Real Estate",
    description: "The Icon of Luxury Living - Experience living beyond all standards.",
    keywords: "alize, luxury real estate, ocean view apartment, da nang",
    ogImage: "/images/sky-pool-alize-da-nang.webp",
    footerText: "Touch the pinnacle of living spaces - ALIZE Residence."
  },
  nav: {
    overview: "Overview",
    values: "Values",
    location: "Location",
    architecture: "Architecture",
    amenities: "Amenities",
    services: "Services",
    floorplans: "Floorplans",
    gallery: "Gallery",
    contactBtn: "Get Privileges"
  },
  hero: {
    tagline: "The Icon of Luxury Living",
    titleLine1: "MASTERPIECE",
    titleLine2: "of Space",
    description: "Golden coordinates, infinity views, unique design. A place that transcends boundaries for the elite community.",
    cta: "Discover"
  },
  overview: {
    sectionTag: "01 — Project Overview",
    titleLine1: "The Icon of Living",
    titleLine2: "Diamond Coordinates",
    description: "Not just a project near the sea, ALIZE owns a direct view of My Khe beach, just a few minutes walk to the sandy shore. The intersection between bustling urban space and quiet coastal nature creates a true icon of living, an endless heritage.",
    details: [
      { label: "Project", value: "Alize Da Nang Residence" },
      { label: "Developer", value: "A&T Group" },
      { label: "Location", value: "Vo Nguyen Giap, An Hai, Da Nang" },
      { label: "Scale", value: "2,867 m2, 1 tower with 40 floors" },
      { label: "Architects", value: "AEDAS / CUBIC Architects" }
    ]
  },
  values: {
    sectionTag: "02 — Endless Heritage",
    titleLine1: "Investment Masterpiece",
    titleLine2: "Beyond Time",
    items: [
      { number: "I.", title: "Direct Ocean View", desc: "Owning the frontage of Vo Nguyen Giap Avenue, infinity view directly to My Khe beach." },
      { number: "II.", title: "Sustainable Growth", desc: "Located in the core tourist area. Increasing value due to scarce coastal land." },
      { number: "III.", title: "Rental Exploitation", desc: "Strong synergy from tourism ecology, suitable for luxury resort rentals." }
    ]
  },
  location: {
    sectionTag: "03 — Unique Location",
    title: "Diamond Coordinates",
    items: [
      { num: "01", title: "2 - 5 Mins Travel", desc: "Just 2 minutes to Dragon Bridge. Quick connection to Da Nang International Airport in 5 mins." },
      { num: "02", title: "10 - 25 Mins Connection", desc: "Explore Marble Mountains in 10 mins and travel flexibly to charming Hoi An Ancient Town." }
    ]
  },
  architecture: {
    sectionTag: "04 — Design Masterpiece",
    title: "Language of the Future",
    description: "Alizé Da Nang provides a smart 'turning face' solution, helping to optimize the Panorama view in all four directions. The floors are terraced, mingling traditional layout with modern charm."
  },
  amenities: {
    sectionTag: "05 — Elite Privileges",
    title: "5-Star Experience",
    description: "Low construction density. Residents immerse themselves in the 1,655m2 internal park. From 4-season flower gardens to gym centers.",
    items: [
      { tag: "Rooftop", title: "Infinity Sky Pool", desc: "Own an infinity sky pool, relax to catch the sunrise.", img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070&auto=format&fit=crop" },
      { tag: "Internal Amenities", title: "Sky Garden & Gym", desc: "Lush hanging gardens in tune with modern sports centers.", img: "/images/phoi-canh-can-ho-view-bien-du-an-alize.webp" },
      { tag: "Lower Floors", title: "Shopping & Kids Area", desc: "Bustling shophouses with diverse flavors and a safe playground.", img: "https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?q=80&w=2070&auto=format&fit=crop" }
    ]
  },
  services: {
    sectionTag: "06 — Diamond Services",
    titleLine1: "Personal Care",
    titleLine2: "Billionaire Standard",
    items: [
      { iconType: 1, title: "24/7 Private Butler", desc: "Marriott-standard butlers ready to meet any request." },
      { iconType: 2, title: "Closed Security", desc: "Iris recognition and absolute identification. Elite security team." },
      { iconType: 3, title: "Culinary Art", desc: "Michelin-star chefs ready at home, preparing premium ingredients directly." }
    ]
  },
  floorplans: {
    sectionTag: "07 — Space Map",
    title: "Unique Blueprint",
    description: "Impressive scale. Providing 640 luxury apartments, open spaces to catch natural light.",
    plans: [
      { id: "plan-1pn", name: "Classic (1BR)", img: "/images/thiet-ke-can-ho-2pn-alize-da-nang.webp", spaceName: "The Classic Space", desc: "Smart design optimized for living spaces of independent individuals.", specLeftLabel: "Area", specLeftValue: "57.8 m²", specRightLabel: "Status", specRightValue: "On sale" },
      { id: "plan-2pn", name: "Signature (2BR)", img: "", spaceName: "The Signature", desc: "Experience open living spaces with panoramic balconies embracing nature.", specLeftLabel: "Area", specLeftValue: "91.5 m²", specRightLabel: "View", specRightValue: "Ocean Bay" },
      { id: "plan-penthouse", name: "Sky Villa", img: "", spaceName: "Sky Villa Edition", desc: "Masterpiece on the clouds with top amenities: spectacular private pool.", specLeftLabel: "Area", specLeftValue: "345.0 m²", specRightLabel: "Privilege", specRightValue: "Private Pool" }
    ]
  },
  footer: {
    description: "Touch the pinnacle of living spaces. ALIZE architecture masterpiece - A place for tranquility.",
    copyright: "© 2026 ALIZE Residence.",
    privacy: "Privacy Policy",
    terms: "Terms of Use"
  },
  subpages: {
    gallery: {
      hero: { tag: "VISUAL EXHIBITION", title1: "EXCLUSIVE LIBRARY", title2: "Of Masterpieces", desc: "Admire the exquisite architectural lines and the most luxurious interiors, where every photo is a condensed film of a regal lifestyle." },
      cat1: { tag: "Zone 01", title: "Architectural Impressions", desc: "The structure of 2 iconic towers stands prominently on the diamond coastal avenue.", images: ["/images/du-an-alize-dan-nang-doc.webp", "/images/phoi-canh-can-ho-view-bien-du-an-alize.webp", "/images/sky-pool-alize-da-nang.webp"] },
      cat2: { tag: "Zone 02", title: "Exclusive Amenities", desc: "From the infinity pool watching the sunrise to the private space of the entertainment room.", images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120", "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2070", "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1974"] },
      cat3: { tag: "Zone 03", title: "Stylish Living Spaces", desc: "Every corner is a masterpiece reflecting the unique ego of the elite.", images: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000", "https://images.unsplash.com/photo-1628114918270-e5bf0d9aa179?q=80&w=1974", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070"] }
    },
    architecture: {
      hero: { tag: "UNIQUE ARCHITECTURE", title1: "THE LANGUAGE", title2: "Of The Future", desc: "A seamless combination of familiar architecture and sophisticated modernity, ALIZE sets the standard of empathy with the natural landscape through a breakthrough 'Twist' solution." },
      section1: { tag: "Design Philosophy 01", title1: "The Solution", title2: "Twisting Faces", desc1: "Understanding the desire to capture the beauty of nature inside high-rise housing, global architects have applied a smart twisting solution.", desc2: "Each line is tweaked at a subtle angle to help break down rigid cubes, optimizing four-way Panoramic views." },
      section2: { tag: "Design Philosophy 02", title1: "Traditional", title2: "Contemporary", desc1: "Not cold, futuristic lines, ALIZE touches the heart of high-end limits with a Traditional Contemporary style.", desc2: "The familiarity of natural materials (Wood, Wood, Stone) perfectly blends into a modern cascading frame." }
    },
    amenities: {
      hero: { tag: "ELITE PRIVILEGES", title1: "PREMIUM EXPERIENCE", title2: "5-Star Standard", desc: "With a low building density of only 38.55%, residents fully immerse themselves in the 1,655m2 internal park and enclosed amenity ecosystem." },
      sec1: { tag: "Sky Amenities", title1: "Infinity Pool", title2: "In The Sky", desc1: "Possessing an infinity Sky Pool, where the boundary between water and horizon is blurred.", desc2: "International standard saline water filtration system protects your skin." },
      sec2: { tag: "Internal Amenities", title1: "Sky Garden", title2: "& Sports", desc1: "The lush hanging garden harmonizes with a peaceful yoga space.", list: ["Serene Zen Garden in Japanese style", "Gym with advanced equipment imported from Europe"] }
    },
    services: {
      tag: "Services", title1: "Standards", title2: "5 Stars", desc: "Experience premium butler services, 24/7 housekeeping, and a luxury reception system managed by the most prestigious brands.",
      items: [{ title: "Dedicated Concierge", desc: "Ticket booking support, airport transfer, and exclusive personal services." }, { title: "Multi-layered Security", desc: "24/7 security with AI camera system, elevator magnetic cards, and continuous patrol guards." }]
    },
    contact: {
      tag: "Contact", title1: "Become", title2: "An Owner", desc: "Leave your information so our consultants can contact you and provide the most exclusive policies.",
      hotlineLabel: "Hotline", zaloLabel: "Zalo", zaloText: "Chat Now", addressLabel: "Sales Gallery", addressText: "My Khe Beach, Da Nang",
      formTitle: "VR360 Simulation Tour", formName: "Full Name *", formPhone: "Phone Number *", formExtra: "Additional Requests", formBtn: "Send Info"
    }
  },
  portal: {
    seo: {
      title: "G-Estate | Luxury Real Estate Portal",
      description: "Find your dream living space at the exclusive project distribution system.",
      keywords: "real estate portal, luxury apartment, alize da nang",
      ogImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053",
      footerText: "Touch the pinnacle of living spaces."
    },
    nav: {
      home: "Home",
      projects: "Projects",
      sale: {
        label: "Properties for Sale",
        items: [
          { id: "apartments", label: "Apartments for sale" },
          { id: "serviced-apartments", label: "Mini apartments, serviced apartments for sale", isNew: true },
          { id: "private-houses", label: "Private houses for sale" },
          { id: "villas", label: "Villas, townhouses for sale" },
          { id: "street-houses", label: "Street houses for sale" },
          { id: "shophouses", label: "Shophouses, commercial townhouses for sale" },
          { id: "project-land", label: "Project land plots for sale" },
          { id: "land", label: "Land for sale" },
          { id: "resort-farms", label: "Farms, resorts for sale" },
          { id: "condotels", label: "Condotels for sale" },
          { id: "warehouses", label: "Warehouses, factories for sale" },
          { id: "others", label: "Other types of real estate for sale" }
        ]
      },
      news: {
        label: "News",
        items: [
          { id: "blog", label: "Project News" },
          { id: "finance", label: "Finance" }
        ]
      },
      tools: "Tools",
      about: "About Us",
      contact: "Contact",
      postPropertyBtn: "Post Property"
    },
    hero: {
      title: "Discover Your Dream Living Space",
      subtitle: "The leading exchange platform deploying top-tier luxury real estate projects.",
      searchPlaceholder: "Enter project name, area...",
      searchBtn: "Search"
    },
    featuredProjects: {
      sectionTag: "FEATURED PROJECTS",
      title: "Limited Collection",
      desc: "Honoring architectural masterpieces and living spaces imbued with the elite's signature.",
      items: [
        { id: "alize-danang", name: "ALIZE Residence", location: "My Khe Beach, Da Nang", type: "Luxury Apartment", status: "On Sale", price: "From $200K / Unit", img: "/images/sky-pool-alize-da-nang.webp", href: "alize" }
      ]
    },
    properties: {
      seo: {
        title: "Real Estate for Sale & Rent - G-Estate",
        description: "Explore a diverse real estate portfolio from apartments, villas to shophouses.",
        keywords: "house for sale, buy apartment, g-estate, properties for sale, properties for rent",
        ogImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053",
        footerText: "Touch the pinnacle of living spaces."
      },
      hero: {
        title: "Property Catalog",
        subtitle: "A diverse ecosystem from projects to personal lodging products."
      },
      items: []
    },
    news: {
      sectionTag: "MARKET INSIGHTS",
      title: "News & Events",
      items: [
        { date: "10-04-2026", title: "Da Nang Real Estate Market Welcomes New Investment Wave", desc: "The appearance of ultra-luxury coastal projects is strongly attracting capital... ", img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2000" },
        { date: "05-04-2026", title: "ALIZE Residence Grand Launching Event", desc: "This morning in Da Nang, the kickoff ceremony introduced the masterpiece ALIZE...", img: "https://images.unsplash.com/photo-1551882547-ff40c0d13c11?q=80&w=2000" }
      ]
    },
    financeNews: {
      sectionTag: "FINANCE & BUSINESS",
      title: "Financial News"
    },
    locationsByCity: {
      title: "Properties by Location",
      items: [
        { id: "hcm", city: "Ho Chi Minh City", count: "87,232", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=2070", query: "Ho Chi Minh" },
        { id: "hn", city: "Hanoi", count: "52,805", img: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?q=80&w=2070", query: "Hanoi" },
        { id: "dn", city: "Da Nang", count: "11,376", img: "/images/du-an-alize-da-nang-bien-my-khe.webp", query: "Da Nang" },
        { id: "bd", city: "Binh Duong", count: "9,552", img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000", query: "Binh Duong" },
        { id: "dnai", city: "Dong Nai", count: "4,900", img: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=2000", query: "Dong Nai" }
      ]
    },
    footer: {
      desc: "The leading reputable real estate brokerage platform, providing sustainable settlement and investment solutions.",
      addressLabel: "Headquarters:",
      addressText: "Level 20, A&T Twin Tower, My Khe, Da Nang",
      emailLabel: "Support Email:"
    },
    tools: {
      title: "Real Estate Tools",
      subtitle: "Financial analysis and investment decision support.",
      tabs: {
        mortgage: "Mortgage",
        yield: "Rental Yield",
        tax: "Fees & Taxes"
      },
      mortgage: {
        propertyValue: "Property Value (VND)",
        loanPercent: "Loan Ratio (%)",
        interestRate: "Interest Rate (%/year)",
        loanTerm: "Loan Term (Years)",
        resultsTitle: "Estimated Results",
        monthlyPayment: "Monthly Payment",
        totalPrincipal: "Total Principal",
        totalInterest: "Total Interest",
        chartPrincipal: "Principal",
        chartInterest: "Interest"
      },
      yield: {
        propertyValue: "Property Value (VND)",
        monthlyRent: "Monthly Rent (VND)",
        operatingCost: "Operating Cost (%/year)",
        resultsTitle: "Yield Rate",
        grossYield: "Gross Yield",
        netYield: "Net Yield",
        annualIncome: "Annual Income (VND)",
        annualExpenses: "Annual Expenses (VND)"
      },
      tax: {
        propertyValue: "Transaction Value (VND)",
        resultsTitle: "Estimated Taxes & Fees",
        personalIncomeTax: "Personal Income Tax (2%)",
        registrationFee: "Registration Fee (0.5%)",
        appraisalFee: "Appraisal Fee (0.15%)",
        notaryFee: "Notary Fee (Estim.)",
        totalEstimated: "Total Estimated Costs",
        note: "* Figures are for reference only based on current regulations."
      }
    },
    projects: {
      seo: {
        title: "All Projects - G-Estate",
        description: "Explore our portfolio of luxury projects and high-yield real estate developments.",
        keywords: "real estate projects, projects, luxury real estate",
        ogImage: "/images/sky-pool-alize-da-nang.webp",
        footerText: "Touch the pinnacle of living spaces."
      },
      hero: {
        titleLine1: "G-ESTATE",
        titleLine2: "Projects",
        description: "A breathtaking collection of architectural masterpieces and luxury living spaces beyond standards."
      },
      card: {
        location: "Location",
        contactBtn: "Contact",
        detailBtn: "Details",
        badge: "PROJECT"
      },
      emptyState: "No projects announced yet."
    }
  },
  blog: {
    seo: {
      title: "News & Insights - G-Estate",
      description: "Stay updated with the latest news and trends in the luxury real estate market.",
      keywords: "real estate news, market analysis, real estate blog",
      ogImage: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2000",
      footerText: "Touch the pinnacle of living spaces."
    },
    hero: {
      title: "Expert Perspectives",
      subtitle: "In-depth analysis and the latest luxury real estate market news."
    },
    readMoreBtn: "Read More",
    articles: [
      {
        slug: "thi-truong-bds-da-nang-don-song-dau-tu-moi",
        date: "10-04-2026",
        title: "Da Nang Real Estate Market Welcomes New Investment Wave",
        desc: "The appearance of ultra-luxury coastal projects is strongly attracting capital...",
        img: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?q=80&w=2000",
        content: "<p>In early 2026, the Da Nang real estate market witnessed the strong rise of the luxury coastal apartment segment. Thanks to the boost from city planning, a series of million-dollar projects have been launched.</p><br/><p>In particular, the arrival of international brands has set a new standard of living, attracting huge capital from domestic billionaires as well as FDI streams flowing into the Central region.</p>"
      },
      {
        slug: "le-ra-mat-du-an-alize-residence",
        date: "05-04-2026",
        title: "ALIZE Residence Grand Launching Event",
        desc: "This morning in Da Nang, the kickoff ceremony introduced the masterpiece ALIZE...",
        img: "https://images.unsplash.com/photo-1551882547-ff40c0d13c11?q=80&w=2000",
        content: "<p>In a solemn and classy atmosphere, the launching ceremony of ALIZE Residence project officially took place on the morning of April 5, 2026.</p><br/><p>The project quickly made a big splash in the market with its unique 'twisting face' design philosophy, providing breathtaking Panoramic views straight to My Khe beach.</p><p>More than 50% of the first phase's inventory was registered with intent within the first 2 hours of sale.</p>"
      }
    ]
  },
  finance: {
    seo: {
      title: "Finance News - G-Estate",
      description: "Fastest updates on market news, financial reports, and investment insights.",
      keywords: "finance news, financial reports, investment insights, stock market",
      ogImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070",
      footerText: "In-depth financial analysis - G-Estate."
    },
    hero: {
      title: "Market Highlights",
      subtitle: "Featured finance news and the latest stock market updates."
    },
    topStories: "Top Stories",
    latestUpdates: "Latest Updates",
    investmentInsights: "Investment Insights",
    readMoreBtn: "Read More"
  }
};
