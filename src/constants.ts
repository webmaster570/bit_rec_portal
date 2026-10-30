import { PortalBranding, WeightageConfig, MailConfig } from './types.js';

export const INITIAL_BRANDING: PortalBranding = {
  title: 'Birla Institute of Technology',
  subtitle: 'Online Recruitment & Merit Application System',
  logoType: 'icon',
  logoIconName: 'Building2',
  logoImageUrl: '',
  theme: 'bit_mesra',
  allowDevRoleSelector: true,
  navbarColor: 'bit_mesra',
  sidebarColor: 'bit_mesra',
  showNavbarShadow: true,
  showSidebarShadow: false,
  showCardShadow: true,
};

export const DEFAULT_WEIGHTAGE_CONFIG: WeightageConfig = {
  writtenTestWeight: 50,
  interviewWeight: 30,
  academicWeight: 20,
  tieBreakerRule: 'Age',
};

export const INITIAL_MAIL_CONFIG: MailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  user: '',
  pass: '',
  fromName: 'Recruitment Portal',
  fromEmail: '',
  encryption: 'tls',
};
