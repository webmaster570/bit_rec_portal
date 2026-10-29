import { PortalBranding, WeightageConfig, MailConfig } from './types.js';

export const INITIAL_BRANDING: PortalBranding = {
  title: 'Enterprise Recruitment Portal',
  subtitle: 'Centralized Public Job Advertisements & Merit Application System',
  logoType: 'icon',
  logoIconName: 'Building2',
  logoImageUrl: '',
  theme: 'classic',
  allowDevRoleSelector: true,
  navbarColor: 'default',
  sidebarColor: 'default',
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
