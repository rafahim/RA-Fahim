export interface Service {
  number: string;
  name: string;
  description: string;
}

export interface Project {
  number: string;
  category: string;
  name: string;
  col1Image1: string;
  col1Image2: string;
  col2Image: string;
  liveUrl?: string | null;
  year?: number | null;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export interface SkillLevel {
  name: string;
  level: 'Expert' | 'Advanced' | 'Intermediate';
  value: number;
}

export const profileFallback = {
  name: 'RA Fahim',
  professionalTitle: 'Web Developer building modern websites, SaaS products, and e-commerce experiences',
  experience: '1 Year',
  availabilityStatus: 'Available for new projects — Web Developer',
  aboutHeading: 'About me',
  aboutDescription:
    'I am RA Fahim, a Web Developer with 1 year of hands-on experience building modern, responsive, and user-focused web applications. I enjoy turning ideas into clean, functional digital products, from business websites and e-commerce platforms to SaaS applications and custom dashboards.',
  additionalInfo:
    'Focused on practical, polished solutions with responsive UI, strong performance, clean code, and reliable integrations.',
  profileImageUrl: '/profile.webp',
};

export const websiteSettingsFallback = {
  websiteTitle: 'RA Fahim — Web Developer',
  websiteDescription:
    'RA Fahim is a Web Developer from Rajshahi, Bangladesh, building modern websites, SaaS applications, e-commerce platforms, and custom web solutions.',
  logoUrl: null,
  faviconUrl: '/favicon.svg',
  seoTitle: 'RA Fahim — Web Developer',
  seoDescription:
    'RA Fahim is a Web Developer from Rajshahi, Bangladesh, building modern websites, SaaS applications, e-commerce platforms, and custom web solutions.',
  ogImageUrl: '/profile.webp',
};

export const contactSettingsFallback = {
  email: 'rafahimn@sites.bd',
  phone: '01576964319',
  whatsapp: '01576964319',
  facebook: 'https://www.facebook.com/rafahimn',
  instagram: null,
  linkedin: null,
  behance: null,
  otherLinks: [],
};

// Decorative project strip. These are bundled locally so a third-party
// image host outage can never break the public portfolio's visual layer.
export const marqueeImages = [
  '/projects/elite-global-store.svg',
  '/projects/sitesbd.svg',
  '/projects/ra-fahim-portfolio.svg',
  '/projects/elite-global-store.svg',
  '/projects/sitesbd.svg',
  '/projects/ra-fahim-portfolio.svg',
];

export const marqueeRow1 = marqueeImages.slice(0, 3);
export const marqueeRow2 = marqueeImages.slice(3);

export const services: Service[] = [
  {
    number: '01',
    name: 'Business Websites',
    description: 'Modern, responsive websites designed to present a business professionally and convert visitors into customers.',
  },
  {
    number: '02',
    name: 'E-commerce Development',
    description: 'Complete online stores with product catalogs, cart, checkout, orders, search, and admin-ready workflows.',
  },
  {
    number: '03',
    name: 'SaaS & Web Applications',
    description: 'Practical full-stack applications with authentication, dashboards, database-backed features, and scalable structure.',
  },
  {
    number: '04',
    name: 'Dashboard & CMS',
    description: 'Custom admin panels and content management systems that make day-to-day website updates easier.',
  },
  {
    number: '05',
    name: 'API & Database Integration',
    description: 'Reliable integrations with services such as Supabase, payment systems, media storage, email, and external APIs.',
  },
];

const projectImage = (file: string) => `/projects/${file}`;

export const projects: Project[] = [
  {
    number: '01',
    category: 'E-commerce',
    name: 'Elite Global Store',
    col1Image1: projectImage('elite-global-store.svg'),
    col1Image2: projectImage('elite-global-store.svg'),
    col2Image: projectImage('elite-global-store.svg'),
    liveUrl: 'https://eliteglobalstore.sites.bd/',
    year: 2026,
  },
  {
    number: '02',
    category: 'SaaS / Platform',
    name: 'SitesBD',
    col1Image1: projectImage('sitesbd.svg'),
    col1Image2: projectImage('sitesbd.svg'),
    col2Image: projectImage('sitesbd.svg'),
    liveUrl: 'https://sites.bd/',
    year: 2026,
  },
  {
    number: '03',
    category: 'Portfolio / CMS',
    name: 'RA Fahim Portfolio',
    col1Image1: projectImage('ra-fahim-portfolio.svg'),
    col1Image2: projectImage('ra-fahim-portfolio.svg'),
    col2Image: projectImage('ra-fahim-portfolio.svg'),
    liveUrl: null,
    year: 2026,
  },
];

// No invented client reviews. The testimonials section stays hidden until
// real testimonials are added through the CMS.
export const testimonials: Testimonial[] = [];

export const skillLevels: SkillLevel[] = [
  { name: 'Next.js', level: 'Advanced', value: 88 },
  { name: 'React', level: 'Advanced', value: 86 },
  { name: 'TypeScript', level: 'Advanced', value: 82 },
  { name: 'Tailwind CSS', level: 'Advanced', value: 90 },
  { name: 'Supabase', level: 'Advanced', value: 80 },
];
