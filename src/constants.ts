import { PortalBranding, WeightageConfig } from './types.js';

export const INITIAL_BRANDING: PortalBranding = {
  title: 'Enterprise Recruitment Portal',
  subtitle: 'Centralized Public Job Advertisements & Merit Application System',
  logoType: 'icon',
  logoIconName: 'Building2',
  logoImageUrl: '',
  theme: 'classic',
  allowDevRoleSelector: true,
};

export const DEFAULT_WEIGHTAGE_CONFIG: WeightageConfig = {
  writtenTestWeight: 50,
  interviewWeight: 30,
  academicWeight: 20,
  tieBreakerRule: 'Age',
};
