import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Check, Copy, Sliders, Play, Settings, Database, Code, Globe, Shield, Coins, Sparkles, Download } from 'lucide-react';
import { BoilerplateConfig, CountryCode, CurrencyCode, TimezoneCode } from '../types';

interface ConfigWizardProps {
  config: BoilerplateConfig;
  onChange: (newConfig: BoilerplateConfig) => void;
  onRunSetupAction?: () => void;
}

export function ConfigWizard({ config, onChange, onRunSetupAction }: ConfigWizardProps) {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'env' | 'schema'>('env');

  const themeColors: ('emerald' | 'amber' | 'indigo' | 'rose' | 'sky')[] = ['emerald', 'amber', 'indigo', 'rose', 'sky'];

  const colorClasses = {
    emerald: 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20',
    amber: 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20',
    rose: 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20',
    sky: 'text-sky-500 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20',
  };

  const focusRingClasses = {
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500/10',
    amber: 'focus:border-amber-500 focus:ring-amber-500/10',
    indigo: 'focus:border-indigo-500 focus:ring-indigo-500/10',
    rose: 'focus:border-rose-500 focus:ring-rose-500/10',
    sky: 'focus:border-sky-500 focus:ring-sky-500/10',
  };

  const textPrimaryClasses = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    indigo: 'text-indigo-400',
    rose: 'text-rose-400',
    sky: 'text-sky-400',
  };

  const bgPrimaryClasses = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
  };

  const handleCountryChange = (country: CountryCode) => {
    let currency: CurrencyCode = 'USD';
    let timezone: TimezoneCode = 'UTC';

    if (country === 'NG') {
      currency = 'NGN';
      timezone = 'Africa/Lagos';
    } else if (country === 'GH') {
      currency = 'GHS';
      timezone = 'Africa/Accra';
    } else if (country === 'KE') {
      currency = 'KES';
      timezone = 'Africa/Nairobi';
    } else if (country === 'ZA') {
      currency = 'ZAR';
      timezone = 'Africa/Johannesburg';
    }

    onChange({
      ...config,
      primaryCountry: country,
      primaryCurrency: currency,
      timezone: timezone,
    });
  };

  const handleToggle = (key: keyof BoilerplateConfig) => {
    onChange({
      ...config,
      [key]: !config[key],
    });
  };

  const generateEnvContent = () => {
    let env = `# ---------------------------------------------------------\n`;
    env += `# AfriLaunch Kit Boilerplate Custom Environment Configurations\n`;
    env += `# Generated dynamically for Startup: ${config.appName}\n`;
    env += `# Target Country: ${config.primaryCountry} | Currency: ${config.primaryCurrency} | Zone: ${config.timezone}\n`;
    env += `# ---------------------------------------------------------\n\n`;

    env += `# Core App Settings\n`;
    env += `APP_URL="http://localhost:3000"\n`;
    env += `APP_NAME="${config.appName}"\n`;
    env += `DEFAULT_CURRENCY="${config.primaryCurrency}"\n`;
    env += `PRIMARY_COUNTRY="${config.primaryCountry}"\n`;
    env += `TIMEZONE="${config.timezone}"\n`;
    env += `PLATFORM_FEE_PERCENT=${config.platformFeePercent}\n\n`;

    env += `# Core Database Configurations\n`;
    env += `DATABASE_URL="postgresql://postgres:user_pwd@localhost:5432/${config.appName.toLowerCase().replace(/\s+/g, '_')}_db?schema=public"\n\n`;

    env += `# Authentication Secrets\n`;
    env += `NEXTAUTH_URL="http://localhost:3000"\n`;
    env += `NEXTAUTH_SECRET="alk_auth_${Math.random().toString(36).substring(2, 15)}"\n`;
    env += `GOOGLE_CLIENT_ID="your_google_client_id_here.apps.googleusercontent.com"\n`;
    env += `GOOGLE_CLIENT_SECRET="GOCSPX-your_google_client_secret_here"\n\n`;

    if (config.enablePaystack || config.enableFlutterwave) {
      env += `# Payments Section Integrations\n`;
      if (config.enablePaystack) {
        env += `PAYSTACK_PUBLIC_KEY="pk_test_a09187a6bcae8d712ce6e..."\n`;
        env += `PAYSTACK_SECRET_KEY="sk_test_109287abcdef9e0129bc..."\n`;
      }
      if (config.enableFlutterwave) {
        env += `FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-90ab128796..."\n`;
        env += `FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-abcdef123..."\n`;
        env += `FLUTTERWAVE_SECRET_HASH="custom_flw_webhook_secret_hash_value"\n`;
      }
      env += `\n`;
    }

    if (config.enableSmileId || config.enableVerifyMe || config.enableMonoIdentity) {
      env += `# Identity Verification Adapters\n`;
      if (config.enableSmileId) {
        env += `SMILE_PARTNER_ID="your_smile_id_partner_id"\n`;
        env += `SMILE_API_KEY="sk_smile_029abc09187..."\n`;
        env += `SMILE_SANDBOX="true"\n`;
      }
      if (config.enableVerifyMe) {
        env += `VERIFYME_API_KEY="vm_test_abc1293a102bc..."\n`;
        env += `VERIFYME_ENVIRONMENT="sandbox"\n`;
      }
      env += `\n`;
    }

    if (config.enableTermii || config.enableAfricasTalking) {
      env += `# Communications SMS Delivery Gateway Networks\n`;
      if (config.enableTermii) {
        env += `TERMII_API_KEY="tl_test_029abc819..."\n`;
        env += `TERMII_SENDER_ID="CO_NAME"\n`;
      }
      if (config.enableAfricasTalking) {
        env += `AFRICAS_TALKING_USERNAME="sandbox"\n`;
        env += `AFRICAS_TALKING_API_KEY="at_sk_abc0918..."\n`;
      }
      env += `\n`;
    }

    if (config.enableMonoBanking || config.enableOkraBanking) {
      env += `# Open Banking APIs core integrations\n`;
      if (config.enableMonoBanking) {
        env += `MONO_SECRET_KEY="mono_sec_abc102987..."\n`;
      }
      if (config.enableOkraBanking) {
        env += `OKRA_SECRET_KEY="okra_sec_10928a..."\n`;
      }
      env += `\n`;
    }

    return env;
  };

  const generateSchemaContent = () => {
    let schema = `// prisma/schema.prisma\n`;
    schema += `datasource db {\n`;
    schema += `  provider = "postgresql"\n`;
    schema += `  url      = env("DATABASE_URL")\n`;
    schema += `}\n\n`;

    schema += `generator client {\n`;
    schema += `  provider = "prisma-client-js"\n`;
    schema += `}\n\n`;

    schema += `enum Role {\n`;
    schema += `  OWNER\n`;
    schema += `  ADMIN\n`;
    schema += `  DEVELOPER\n`;
    schema += `  SUPPORT\n`;
    schema += `  USER\n`;
    schema += `}\n\n`;

    schema += `model User {\n`;
    schema += `  id            String    @id @default(uuid())\n`;
    schema += `  name          String?\n`;
    schema += `  email         String    @unique\n`;
    schema += `  emailVerified DateTime?\n`;
    schema += `  image         String?\n`;
    schema += `  passwordHash  String?\n`;
    schema += `  role          Role      @default(USER)\n`;
    schema += `  createdAt     DateTime  @default(now())\n`;
    schema += `  updatedAt     DateTime  @updatedAt\n`;
    schema += `  // Reciprocal Connections\n`;
    schema += `  organizations OrganizationMember[]\n`;
    schema += `  apiKeys       ApiKey[]\n`;
    if (config.enablePaystack || config.enableFlutterwave) {
      schema += `  transactions  Transaction[]\n`;
    }
    schema += `}\n\n`;

    schema += `model Organization {\n`;
    schema += `  id                 String   @id @default(uuid())\n`;
    schema += `  name               String\n`;
    schema += `  slug               String   @unique\n`;
    schema += `  createdAt          DateTime @default(now())\n`;
    schema += `  updatedAt          DateTime @updatedAt\n`;
    schema += `  members            OrganizationMember[]\n`;
    schema += `  apiKeys            ApiKey[]\n`;
    schema += `  usageMeter         UsageQuota[]\n`;
    schema += `}\n\n`;

    schema += `model OrganizationMember {\n`;
    schema += `  id             String  @id @default(uuid())\n`;
    schema += `  organizationId String\n`;
    schema += `  userId         String\n`;
    schema += `  role           Role    @default(DEVELOPER)\n`;
    schema += `  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)\n`;
    schema += `  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)\n`;
    schema += `  @@unique([organizationId, userId])\n`;
    schema += `}\n\n`;

    schema += `model ApiKey {\n`;
    schema += `  id             String   @id @default(uuid())\n`;
    schema += `  name           String\n`;
    schema += `  keyHash        String   @unique\n`;
    schema += `  prefix         String   //alk_live_...\n`;
    schema += `  organizationId String\n`;
    schema += `  active         Boolean  @default(true)\n`;
    schema += `  createdAt      DateTime @default(now())\n`;
    schema += `  user           User     @relation(fields: [userId], references: [id])\n`;
    schema += `  userId         String\n`;
    schema += `  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)\n`;
    schema += `}\n\n`;

    schema += `model UsageQuota {\n`;
    schema += `  id             String   @id @default(uuid())\n`;
    schema += `  organizationId String\n`;
    schema += `  featureKey     String   //api_requests, kyc_checks, sms\n`;
    schema += `  used           Int      @default(0)\n`;
    schema += `  limit          Int      @default(100)\n`;
    schema += `  renewalDate    DateTime\n`;
    schema += `  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)\n`;
    schema += `  @@unique([organizationId, featureKey])\n`;
    schema += `}\n`;

    if (config.enablePaystack || config.enableFlutterwave) {
      schema += `\nmodel Transaction {\n`;
      schema += `  id             String   @id @default(uuid())\n`;
      schema += `  reference      String   @unique\n`;
      schema += `  amount         Decimal  @db.Decimal(12, 2)\n`;
      schema += `  currency       String   @default("${config.primaryCurrency}")\n`;
      schema += `  status         String\n`;
      schema += `  channel        String\n`;
      schema += `  userId         String?\n`;
      schema += `  createdAt      DateTime @default(now())\n`;
      schema += `  user           User?    @relation(fields: [userId], references: [id])\n`;
      schema += `}\n`;
    }

    return schema;
  };

  const copyToClipboard = (text: string, type: 'env' | 'schema') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const downloadEnvFile = () => {
    const text = generateEnvContent();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '.env';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="wizard_configurator">
      {/* Parameters Panel */}
      <div className="lg:col-span-2 border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-5 select-none h-fit">
        <div className="border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
            <Sliders className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-widest">Configuration Wizard</span>
          </div>
          <h3 className="text-sm font-semibold text-white">Customize AfriLaunch Core Parameters</h3>
          <p className="text-[10px] text-neutral-500 mt-1">Configure your target region and modular packages instantly.</p>
        </div>

        {/* 1. App name */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">App / Startup Name</label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => onChange({ ...config, appName: e.target.value })}
            className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all ${focusRingClasses[config.themeColor]}`}
          />
        </div>

        {/* 2. Primary Launch country & currency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Startup Base</label>
            <div className="relative">
              <select
                value={config.primaryCountry}
                onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
                className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white outline-none appearance-none transition-all cursor-pointer ${focusRingClasses[config.themeColor]}`}
              >
                <option value="NG">🇳🇬 Nigeria</option>
                <option value="GH">🇬🇭 Ghana</option>
                <option value="KE">🇰🇪 Kenya</option>
                <option value="ZA">🇿🇦 South Africa</option>
                <option value="US">🇺🇸 Global (USD)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Local Settlement</label>
            <input
              type="text"
              readOnly
              value={`${config.primaryCurrency} (${config.timezone.split('/')[1] || 'UTC'})`}
              className="w-full bg-neutral-900/50 border border-neutral-800/40 rounded-lg px-3 py-2 text-xs text-neutral-400 outline-none font-mono"
            />
          </div>
        </div>

        {/* 3. Theme styling color */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block">Applet Branding Theme</label>
          <div className="flex gap-2">
            {themeColors.map((color) => {
              const bgCols = {
                emerald: 'bg-emerald-500 hover:bg-emerald-400 border-emerald-500/40',
                amber: 'bg-amber-500 hover:bg-amber-400 border-amber-500/40',
                indigo: 'bg-indigo-500 hover:bg-indigo-400 border-indigo-500/40',
                rose: 'bg-rose-500 hover:bg-rose-400 border-rose-500/40',
                sky: 'bg-sky-500 hover:bg-sky-400 border-sky-500/40',
              };
              const isSelected = config.themeColor === color;
              return (
                <button
                  key={color}
                  onClick={() => onChange({ ...config, themeColor: color })}
                  className={`w-6 h-6 rounded-full border-2 ${bgCols[color]} cursor-pointer transition-transform ${
                    isSelected ? 'ring-2 ring-white scale-110' : 'border-transparent scale-100 hover:scale-105'
                  }`}
                  title={`${color}`}
                />
              );
            })}
          </div>
        </div>

        {/* 4. Modular Enablers */}
        <div className="space-y-3 pt-2">
          <label className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider block border-b border-neutral-800/60 pb-1">
            Toggle Integrations Modules
          </label>

          {/* Payments */}
          <div className="space-y-2">
            <div className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3" /> Payments Providers
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggle('enablePaystack')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enablePaystack ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">Paystack</div>
                  <div className="text-[9px] text-neutral-500">Nig, Gh, Ke, Za</div>
                </div>
                {config.enablePaystack ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>

              <button
                onClick={() => handleToggle('enableFlutterwave')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enableFlutterwave ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">Flutterwave</div>
                  <div className="text-[9px] text-neutral-500">Pan-African</div>
                </div>
                {config.enableFlutterwave ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* KYC Identity Verification */}
          <div className="space-y-2">
            <div className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3" /> KYC Biometric Adapters
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggle('enableSmileId')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enableSmileId ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">Smile Identity</div>
                  <div className="text-[9px] text-neutral-500">NIN, BVN, Biometrics</div>
                </div>
                {config.enableSmileId ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>

              <button
                onClick={() => handleToggle('enableVerifyMe')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enableVerifyMe ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">VerifyMe</div>
                  <div className="text-[9px] text-neutral-500">Nig Corporate, BVN</div>
                </div>
                {config.enableVerifyMe ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* SMS Transactional */}
          <div className="space-y-2">
            <div className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3" /> Communication Gateway
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggle('enableTermii')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enableTermii ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">Termii SMS</div>
                  <div className="text-[9px] text-neutral-500">OTP Delivery Fast</div>
                </div>
                {config.enableTermii ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>

              <button
                onClick={() => handleToggle('enableAfricasTalking')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enableAfricasTalking ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">Africa's Talking</div>
                  <div className="text-[9px] text-neutral-500">East & Southern regional</div>
                </div>
                {config.enableAfricasTalking ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>
            </div>
          </div>

          {/* Open Banking linking */}
          <div className="space-y-2">
            <div className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3 h-3" /> Open Banking Linkings
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleToggle('enableMonoBanking')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enableMonoBanking ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">Mono Bank Link</div>
                  <div className="text-[9px] text-neutral-500">Nig State Queries</div>
                </div>
                {config.enableMonoBanking ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>

              <button
                onClick={() => handleToggle('enableOkraBanking')}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                  config.enableOkraBanking ? 'bg-neutral-900 border-emerald-500/30' : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-900/30'
                }`}
              >
                <div>
                  <div className="font-semibold text-neutral-200">Okra Banking</div>
                  <div className="text-[9px] text-neutral-500">Statement processing</div>
                </div>
                {config.enableOkraBanking ? (
                  <ToggleRight className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-neutral-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 5. Custom white-label toggles */}
        <div className="space-y-3 border-t border-neutral-800/80 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-neutral-200">White-label branding mode</div>
              <p className="text-[9px] text-neutral-500">Strip kit branding, use custom layout assets.</p>
            </div>
            <button
              onClick={() => handleToggle('whiteLabelMode')}
              className="cursor-pointer"
            >
              {config.whiteLabelMode ? (
                <ToggleRight className={`w-6 h-6 ${textPrimaryClasses[config.themeColor]}`} />
              ) : (
                <ToggleLeft className="w-6 h-6 text-neutral-600" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
              <span>Platform billing fee</span>
              <span>{config.platformFeePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={config.platformFeePercent}
              onChange={(e) => onChange({ ...config, platformFeePercent: parseFloat(e.target.value) })}
              className={`w-full accent-emerald-500 block h-1 bg-neutral-800 rounded-lg cursor-pointer appearance-none`}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Outputs Block */}
      <div className="lg:col-span-3 border border-neutral-800 rounded-xl bg-neutral-950 p-5 flex flex-col h-[720px] lg:h-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('env')}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium cursor-pointer transition-colors ${
                activeTab === 'env'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configured Env (.env)</span>
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium cursor-pointer transition-colors ${
                activeTab === 'schema'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Prisma Schema Models</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'env' ? (
              <>
                <button
                  onClick={() => copyToClipboard(generateEnvContent(), 'env')}
                  className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs border border-neutral-800 cursor-pointer transition-colors"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={downloadEnvFile}
                  className="bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 p-1.5 rounded-lg border border-neutral-800 cursor-pointer transition-colors"
                  title="Download .env file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => copyToClipboard(generateSchemaContent(), 'schema')}
                className="flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 px-2.5 py-1.5 rounded-lg text-xs border border-neutral-800 cursor-pointer transition-colors"
              >
                {copiedSchema ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Contents Pane */}
        <div className="flex-1 overflow-y-auto bg-[#0a0b10] p-4 rounded-lg font-mono text-[11.5px] select-text border border-neutral-900 relative">
          <div className="absolute right-3 top-3 select-none flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
            <Sparkles className="w-2.5 h-2.5" /> Dynamic Setup Customizer
          </div>
          <pre className="text-neutral-300 leading-relaxed whitespace-pre font-mono">
            <code>{activeTab === 'env' ? generateEnvContent() : generateSchemaContent()}</code>
          </pre>
        </div>

        <div className="pt-4 border-t border-neutral-800 shrink-0 select-none">
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-900 border border-neutral-800/80">
            <div>
              <h5 className="text-xs font-semibold text-neutral-200">Deploy initialized starter configs</h5>
              <p className="text-[10px] text-neutral-500 mt-0.5">Applies generated models to the active repository database context.</p>
            </div>
            <button
              onClick={onRunSetupAction}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-xs cursor-pointer text-black font-semibold hover:shadow-lg transition-all ${bgPrimaryClasses[config.themeColor]}`}
            >
              <Play className="w-3.5 h-3.5 shrink-0" />
              <span>Apply Configs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
