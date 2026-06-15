export type CountryCode = 'NG' | 'GH' | 'KE' | 'ZA' | 'US';
export type CurrencyCode = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD';
export type TimezoneCode = 'Africa/Lagos' | 'Africa/Accra' | 'Africa/Nairobi' | 'Africa/Johannesburg' | 'UTC';

export interface BoilerplateConfig {
  appName: string;
  primaryCountry: CountryCode;
  primaryCurrency: CurrencyCode;
  timezone: TimezoneCode;
  themeColor: 'emerald' | 'amber' | 'indigo' | 'rose' | 'sky';
  enablePaystack: boolean;
  enableFlutterwave: boolean;
  enableSmileId: boolean;
  enableVerifyMe: boolean;
  enableMonoIdentity: boolean;
  enableTermii: boolean;
  enableAfricasTalking: boolean;
  enableMonoBanking: boolean;
  enableOkraBanking: boolean;
  whiteLabelMode: boolean;
  platformFeePercent: number;
}

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  content?: string;
  language?: string;
  description?: string;
}

export interface DocPage {
  id: string;
  title: string;
  category: string;
  purpose: string;
  architecture: string;
  steps: string[];
  codeExample: string;
  commonErrors: string[];
  bestPractices: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  category: 'payment' | 'kyc' | 'sms' | 'auth' | 'team';
  status: 'success' | 'warn' | 'failed';
  user: string;
  details: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'support';
  status: 'active' | 'invited';
}
