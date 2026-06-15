import React, { useState } from 'react';
import { Sparkles, Sliders, ShieldCheck, Database, BookOpen, Layers, Terminal, ArrowRight, ExternalLink, Download, Coins, Check, CheckCircle2, ShieldAlert, KeyRound, Globe } from 'lucide-react';
import { BoilerplateConfig, AuditLog } from './types';
import { ConfigWizard } from './components/ConfigWizard';
import { CodeExplorer } from './components/CodeExplorer';
import { IntegrationsPlayground } from './components/IntegrationsPlayground';
import { Dashboard } from './components/Dashboard';
import { DocsReader } from './components/DocsReader';

export default function App() {
  const [view, setView] = useState<'wizard' | 'code' | 'playground' | 'portals' | 'docs' | 'roadmap'>('wizard');
  
  // App Config State
  const [config, setConfig] = useState<BoilerplateConfig>({
    appName: "AfriLaunch Premium",
    primaryCountry: "NG",
    primaryCurrency: "NGN",
    timezone: "Africa/Lagos",
    themeColor: "emerald",
    enablePaystack: true,
    enableFlutterwave: false,
    enableSmileId: true,
    enableVerifyMe: false,
    enableMonoIdentity: false,
    enableTermii: true,
    enableAfricasTalking: false,
    enableMonoBanking: false,
    enableOkraBanking: false,
    whiteLabelMode: false,
    platformFeePercent: 1.5,
  });

  // Monetization License validation state
  const [licenseKeyInput, setLicenseKeyInput] = useState('ALK-PREMIUM-DEVKIT-X8921A');
  const [licenseStatus, setLicenseStatus] = useState<'valid' | 'invalid' | null>('valid');

  // Audit Logs State:
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '09:12:45',
      event: 'NextAuth.js Provider Init',
      category: 'auth',
      status: 'success',
      user: 'system_daemon',
      details: 'NextAuth dynamic session credentials synced with Postgres local indexes successfully.'
    },
    {
      id: '2',
      timestamp: '11:04:10',
      event: 'Paystack Adapter Bind',
      category: 'payment',
      status: 'success',
      user: 'iyanuolalegan@gmail.com',
      details: 'Paystack client initialized with PK_TEST credentials. Callback route sets: /api/checkout/callback'
    },
    {
      id: '3',
      timestamp: '14:23:19',
      event: 'Smile ID API authorization',
      category: 'kyc',
      status: 'success',
      user: 'admin@devhub.co',
      details: 'Smile Identity credentials verified in sandbox cluster. Connection speed: 185ms.'
    }
  ]);

  const handleUpdateConfig = (newConfig: BoilerplateConfig) => {
    setConfig(newConfig);
    // Trigger custom logs on configuration updates
    triggerAuditLog(
      'Starter configs updated',
      'auth',
      'success',
      `Base: ${newConfig.primaryCountry} | Currency: ${newConfig.primaryCurrency} | Theme: ${newConfig.themeColor}`
    );
  };

  const triggerAuditLog = (
    event: string,
    category: 'payment' | 'kyc' | 'sms' | 'auth' | 'team',
    status: 'success' | 'warn' | 'failed',
    details: string
  ) => {
    const freshLog: AuditLog = {
      id: Math.random().toString(),
      timestamp: new Date().toTimeString().split(' ')[0],
      event,
      category,
      status,
      user: 'dev_sandbox',
      details
    };
    setAuditLogs((prev) => [freshLog, ...prev]);
  };

  const handleLogTransaction = (amount: number, status: 'success' | 'warn' | 'failed', gateway: string, details: string) => {
    triggerAuditLog(
      `Transaction Complete [${gateway.toUpperCase()}]`,
      'payment',
      status,
      `${details} | Total: ${config.primaryCurrency} ${amount.toLocaleString()}`
    );
  };

  const runConfigurationSetupAction = () => {
    alert(`Applying SaaS setups configuration: Initializing Prisma connections, establishing NextAuth paths, and routing active modules targeting ${config.primaryCountry}. \n\nPrisma client database models generated successfully!`);
    triggerAuditLog(
      'System Setup Initialized',
      'auth',
      'success',
      `Prisma DB sync: npx prisma db push complete. Synced active modules for ${config.appName}.`
    );
  };

  const handleVerifyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (licenseKeyInput.startsWith('ALK-PREMIUM-')) {
      setLicenseStatus('valid');
      triggerAuditLog('License key validated', 'auth', 'success', `Key input accepted: ${licenseKeyInput}`);
    } else {
      setLicenseStatus('invalid');
      triggerAuditLog('License validation rejected', 'auth', 'failed', `Invalid key attempt: ${licenseKeyInput}`);
    }
  };

  // Color Mapping Classes
  const textCols = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    indigo: 'text-indigo-400',
    rose: 'text-rose-400',
    sky: 'text-sky-450',
  };

  const borderCols = {
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 focus:border-emerald-500',
    amber: 'border-amber-500/20 hover:border-amber-500/40 focus:border-amber-500',
    indigo: 'border-indigo-500/20 hover:border-indigo-500/40 focus:border-indigo-500',
    rose: 'border-rose-500/20 hover:border-rose-500/40 focus:border-rose-500',
    sky: 'border-sky-500/20 hover:border-sky-500/40 focus:border-sky-500',
  };

  const activeTabs = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  };

  const bgPrimary = {
    emerald: 'bg-emerald-500 hover:bg-emerald-400',
    amber: 'bg-amber-500 hover:bg-amber-400',
    indigo: 'bg-indigo-500 hover:bg-indigo-400',
    rose: 'bg-rose-500 hover:bg-rose-400',
    sky: 'bg-sky-500 hover:bg-sky-400',
  };

  return (
    <div className={`min-h-screen bg-[#07080c] text-neutral-300 font-sans antialiased selection:bg-neutral-800 selection:text-white flex flex-col justify-between`} style={{
      colorScheme: 'dark'
    }}>
      {/* 1. Main visual background element glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Primary header bar */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <span className="font-extrabold text-emerald-400 text-sm tracking-tight">AL</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight">AfriLaunch Kit</span>
                <span className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-mono">v1.2.0</span>
              </div>
              <p className="text-[9.5px] text-neutral-400 mt-0.5">SaaS Developer Boilerplate Hub</p>
            </div>
          </div>

          {/* Quick status bar */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-neutral-900/60 border border-neutral-850 rounded-full text-xs text-neutral-400 font-medium">
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              <span>Base Country: {config.primaryCountry}</span>
              <span className="text-neutral-700">|</span>
              <span>Currency: {config.primaryCurrency}</span>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main app workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 flex flex-col gap-6 relative">
        
        {/* Boilerplate Marketing Intro Panel - Sells like Gumroad/LemonSqueezy preview */}
        <div className="border border-neutral-800 bg-neutral-950/40 rounded-2xl p-5 select-none relative overflow-hidden backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 md:max-w-2xl">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] bg-[#0c1e15] border border-emerald-500/20 text-emerald-400 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                COMMERCIAL SaaS STARTER KIT
              </span>
              <span className="text-[9.5px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                $199 Premium tier
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Launch Fintech, Logtech, &amp; SaaS in Africa Within Hours
            </h1>
            <p className="text-xs text-neutral-400 leading-normal">
              AfriLaunch Kit is an enterprise Next.js boilerplates framework mapping plug-and-play local banking, payments (Paystack/Flutterwave), OTP Termii SMS messengers, and Smile ID identity biometrics lookups.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => alert(" Boilerplate package downloaded successfully! Explore the folder explorer to study code structures, deploy container settings, or copy modules directly.")}
              className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black font-semibold text-xs transition-all shadow hover:shadow-lg cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Free Starter DL (.zip)</span>
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs workspace bar */}
        <div className="flex gap-1.5 border-b border-neutral-900 pb-1 flex-wrap select-none">
          <button
            onClick={() => setView('wizard')}
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 border-b-2 font-semibold transition-all cursor-pointer ${
              view === 'wizard' ? `border-emerald-500 ${textCols[config.themeColor]}` : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configurator Wizard</span>
          </button>

          <button
            onClick={() => setView('code')}
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 border-b-2 font-semibold transition-all cursor-pointer ${
              view === 'code' ? `border-emerald-500 ${textCols[config.themeColor]}` : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Boilerplate Files</span>
          </button>

          <button
            onClick={() => setView('playground')}
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 border-b-2 font-semibold transition-all cursor-pointer ${
              view === 'playground' ? `border-emerald-500 ${textCols[config.themeColor]}` : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Integrations Simulator</span>
          </button>

          <button
            onClick={() => setView('portals')}
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 border-b-2 font-semibold transition-all cursor-pointer ${
              view === 'portals' ? `border-emerald-500 ${textCols[config.themeColor]}` : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Operational Portals</span>
          </button>

          <button
            onClick={() => setView('docs')}
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 border-b-2 font-semibold transition-all cursor-pointer ${
              view === 'docs' ? `border-emerald-500 ${textCols[config.themeColor]}` : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Documentation Guides</span>
          </button>

          <button
            onClick={() => setView('roadmap')}
            className={`flex items-center gap-1.5 text-xs py-2 px-3.5 border-b-2 font-semibold transition-all cursor-pointer ${
              view === 'roadmap' ? `border-emerald-500 ${textCols[config.themeColor]}` : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Startup Launch Roadmap</span>
          </button>
        </div>

        {/* 2. Sub-views rendering */}
        <div className="flex-1">
          {view === 'wizard' && (
            <div className="space-y-6">
              <ConfigWizard
                config={config}
                onChange={handleUpdateConfig}
                onRunSetupAction={runConfigurationSetupAction}
              />
            </div>
          )}

          {view === 'code' && (
            <CodeExplorer themeColor={config.themeColor} />
          )}

          {view === 'playground' && (
            <IntegrationsPlayground
              config={config}
              onLogTransaction={handleLogTransaction}
              onTriggerAudit={triggerAuditLog}
            />
          )}

          {view === 'portals' && (
            <Dashboard
              config={config}
              auditLogs={auditLogs}
              onTriggerAudit={triggerAuditLog}
            />
          )}

          {view === 'docs' && (
            <DocsReader themeColor={config.themeColor} />
          )}

          {view === 'roadmap' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Checklist launcher */}
              <div className="lg:col-span-2 border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-4 select-none">
                <div className="border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#10b981]">Launch checklist</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">SaaS Boilerplate deployment milestones</h3>
                  <p className="text-[10px] text-neutral-500 mt-1">Checklist tracker for successful business deployment operations.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { title: "Define Database Connection Strings (.env)", desc: "Mount local PostgreSQL database on VPS or Railway accounts.", done: true },
                    { title: "Execute initial Prisma migrations tables setup", desc: "Sync organizations, ledgers, audit models, and keys schemas.", done: true },
                    { title: "Configure Paystack/Flutterwave production secret keys", desc: "Configure billing details to authorize instant customer checkout processes.", done: false },
                    { title: "Authenticate Identity integrations KYC adapters", desc: "Acquire partner credentials keys on Smile identity dashboards.", done: false },
                    { title: "Establish Termii API routes for OTPSMS validation links", desc: "Set up sender IDs to broadcast direct generic transactional codes.", done: false },
                    { title: "Sync multi-tenant Auth configurations", desc: "Setup authorization providers (Google Provider credentials schemas) under NextAuth.", done: false },
                    { title: "Deploy modular container nodes via Docker", desc: "Build workspace cluster Docker volumes and expose port operations metrics.", done: false },
                  ].map((task, idx) => (
                    <div key={idx} className="flex gap-3 bg-neutral-900/30 p-3 rounded-lg border border-neutral-850">
                      <div className="shrink-0 pt-0.5">
                        {task.done ? (
                          <div className="w-4.5 h-4.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-4.5 h-4.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer rounded-full" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-200">{task.title}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{task.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* License Key Validation & Monetization check demo */}
              <div className="col-span-1 border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-4 select-none h-fit">
                <div className="border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <KeyRound className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#6366f1]">Boilerplate Monetization</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mt-0.5">Product License Verification</h3>
                  <p className="text-[10px] text-neutral-500 mt-1">Demo showing how you can easily gate your SaaS using license keys validation.</p>
                </div>

                <form onSubmit={handleVerifyLicense} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Boilerplate Purchase Key</label>
                    <input
                      type="text"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value.toUpperCase())}
                      className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all focus:border-indigo-500`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition-all cursor-pointer"
                  >
                    Verify License Status
                  </button>
                </form>

                {/* Status messages indicator */}
                {licenseStatus !== null && (
                  <div className={`p-3.5 border rounded-xl flex items-start gap-2.5 ${
                    licenseStatus === 'valid'
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-950/25 border-rose-500/25 text-rose-400'
                  }`}>
                    {licenseStatus === 'valid' ? (
                      <>
                        <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold uppercase">License key authenticated</span>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Premium developer seat active. Lifetime support &amp; update updates sync validated.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold uppercase">License check rejected</span>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Could not authenticate key index. Double-check code syntax or contact developer support.</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer operations */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-5 select-none shrink-0 mb-4 font-mono text-[9.5px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-neutral-500 text-center md:text-left">
            <span>© 2026 AfriLaunch Kit Boilerplate frameworks. All rights reserved.</span>
          </div>
          <div className="flex gap-4 flex-wrap justify-center text-neutral-500 font-mono">
            <span>DATABASE_URL: Synced</span>
            <span>•</span>
            <span>NEXTAUTH_SERVER: Configured</span>
            <span>•</span>
            <span>METRICS: Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
