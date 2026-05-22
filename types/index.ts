export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  footerText: string;
}

export interface NavigationData {
  overview: string;
  values: string;
  location: string;
  architecture: string;
  amenities: string;
  services: string;
  floorplans: string;
  gallery: string;
  contactBtn: string;
}

export interface HeroData {
  tagline: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  cta: string;
}

export interface OverviewData {
  sectionTag: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  details: { label: string; value: string }[];
}

export interface ValueItem {
  number: string;
  title: string;
  desc: string;
}

export interface ValuesData {
  sectionTag: string;
  titleLine1: string;
  titleLine2: string;
  items: ValueItem[];
}

export interface LocationData {
  sectionTag: string;
  title: string;
  items: { num: string; title: string; desc: string }[];
}

export interface ArchitectureData {
  sectionTag: string;
  title: string;
  description: string;
}

export interface AmenityItem {
  tag: string;
  title: string;
  desc: string;
  img: string;
}

export interface AmenitiesData {
  sectionTag: string;
  title: string;
  description: string;
  items: AmenityItem[];
}

export interface ServiceItem {
  iconType: number; // 1, 2, 3
  title: string;
  desc: string;
}

export interface ServicesData {
  sectionTag: string;
  titleLine1: string;
  titleLine2: string;
  items: ServiceItem[];
}

export interface FloorPlanItem {
  id: string; // plan-1pn
  name: string;
  img: string; // or text if mockup
  spaceName: string;
  desc: string;
  specLeftLabel: string;
  specLeftValue: string;
  specRightLabel: string;
  specRightValue: string;
}

export interface FloorPlansData {
  sectionTag: string;
  title: string;
  description: string;
  plans: FloorPlanItem[];
}

export interface FooterData {
  description: string;
  copyright: string;
  privacy: string;
  terms: string;
}

export interface NavItem {
  id: string;
  label: string;
  isNew?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface PortalProperty {
  id: string;
  transactionType: "sale" | "rent";
  propertyCategory: string;
  isNew: boolean;
  name: string;
  projectId: string;
  projectName: string;
  price: string;
  priceNum: number; // For filtering
  location: string;
  type: string;
  specs: {
    area: string;
    areaNum: number; // For filtering
    beds: number;
    baths: number;
  };
  desc: string;
  img: string;
  gallery: string[];
  coordinates: { lat: number; lng: number };
  
  // Extended Batdongsan features
  features?: {
    legal_status?: string;
    furniture?: string;
    house_direction?: string;
    balcony_direction?: string;
    floors?: number;
    frontage?: number;
    entrance_width?: number;
  };
  agent?: {
    name?: string;
    phone?: string;
    zalo?: string;
    avatar?: string;
  };
  media?: {
    video_url?: string;
    tour_3d_url?: string;
  };
}

export interface PortalData {
  seo: SEOData;
  nav: {
    home: string;
    projects: string;
    sale: NavGroup;
    news: NavGroup;
    tools: string;
    about: string;
    contact: string;
    postPropertyBtn: string;
  };
  hero: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchBtn: string;
  };
  featuredProjects: {
    sectionTag: string;
    title: string;
    desc: string;
    items: {
      id: string;
      name: string;
      location: string;
      type: string;
      status: string;
      price: string;
      img: string;
      href: string;
    }[];
  };
  properties: {
    seo: SEOData;
    hero: {
      title: string;
      subtitle: string;
    };
    items: PortalProperty[];
  };
  news: {
    sectionTag: string;
    title: string;
    items: {
      date: string;
      title: string;
      desc: string;
      img: string;
    }[];
  };
  financeNews: {
    sectionTag: string;
    title: string;
  };
  locationsByCity: {
    title: string;
    items: {
      id: string;
      city: string;
      count: string;
      img: string;
      query: string;
    }[];
  };
  footer: {
    desc: string;
    addressLabel: string;
    addressText: string;
    emailLabel: string;
    footerText?: string;
  };
  tools: {
    title: string;
    subtitle: string;
    tabs: {
      mortgage: string;
      yield: string;
      tax: string;
    };
    mortgage: {
      propertyValue: string;
      loanPercent: string;
      interestRate: string;
      loanTerm: string;
      resultsTitle: string;
      monthlyPayment: string;
      totalPrincipal: string;
      totalInterest: string;
      chartPrincipal: string;
      chartInterest: string;
    };
    yield: {
      propertyValue: string;
      monthlyRent: string;
      operatingCost: string;
      resultsTitle: string;
      grossYield: string;
      netYield: string;
      annualIncome: string;
      annualExpenses: string;
    };
    tax: {
      propertyValue: string;
      resultsTitle: string;
      personalIncomeTax: string;
      registrationFee: string;
      appraisalFee: string;
      notaryFee: string;
      totalEstimated: string;
      note: string;
    };
  };
  projects: {
    seo: SEOData;
    hero: {
      titleLine1: string;
      titleLine2: string;
      description: string;
    };
    card: {
      location: string;
      contactBtn: string;
      detailBtn: string;
      badge: string;
    };
    emptyState: string;
  };
}

export interface BlogArticle {
  slug: string;
  date: string;
  title: string;
  desc: string;
  img: string;
  content: string;
}

export interface BlogData {
  seo: SEOData;
  hero: {
    title: string;
    subtitle: string;
  };
  articles: BlogArticle[];
  readMoreBtn: string;
}

export interface FinanceData {
  seo: SEOData;
  hero: {
    title: string;
    subtitle: string;
  };
  topStories: string;
  latestUpdates: string;
  investmentInsights: string;
  readMoreBtn: string;
}

export interface Dictionary {
  seo: SEOData;
  nav: NavigationData;
  hero: HeroData;
  overview: OverviewData;
  values: ValuesData;
  location: LocationData;
  architecture: ArchitectureData;
  amenities: AmenitiesData;
  services: ServicesData;
  floorplans: FloorPlansData;
  footer: FooterData;
  subpages: SubpagesData;
  portal: PortalData;
  blog: BlogData;
  finance?: FinanceData;
}

export interface GallerySubpageData {
  hero: { tag: string; title1: string; title2: string; desc: string; };
  cat1: { tag: string; title: string; desc: string; images: string[]; };
  cat2: { tag: string; title: string; desc: string; images: string[]; };
  cat3: { tag: string; title: string; desc: string; images: string[]; };
}

export interface ArchitectureSubpageData {
  hero: { tag: string; title1: string; title2: string; desc: string; };
  section1: { tag: string; title1: string; title2: string; desc1: string; desc2: string; };
  section2: { tag: string; title1: string; title2: string; desc1: string; desc2: string; };
}

export interface AmenitiesSubpageData {
  hero: { tag: string; title1: string; title2: string; desc: string; };
  sec1: { tag: string; title1: string; title2: string; desc1: string; desc2: string; };
  sec2: { tag: string; title1: string; title2: string; desc1: string; list: string[]; };
}

export interface ServicesSubpageData {
  tag: string;
  title1: string;
  title2: string;
  desc: string;
  items: { title: string; desc: string; }[];
}

export interface ContactSubpageData {
  tag: string;
  title1: string;
  title2: string;
  desc: string;
  hotlineLabel: string;
  zaloLabel: string;
  zaloText: string;
  addressLabel: string;
  addressText: string;
  formTitle: string;
  formName: string;
  formPhone: string;
  formExtra: string;
  formBtn: string;
}

export interface SubpagesData {
  gallery: GallerySubpageData;
  architecture: ArchitectureSubpageData;
  amenities: AmenitiesSubpageData;
  services: ServicesSubpageData;
  contact: ContactSubpageData;
}
