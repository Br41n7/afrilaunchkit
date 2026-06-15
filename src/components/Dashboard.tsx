import React, { useState } from 'react';
import { Users, Coins, Key, ShieldAlert, FileText, UserCheck, Plus, Trash2, Copy, Check, BarChart2, TrendingUp, AlertCircle, Eye, EyeOff, Layout } from 'lucide-react';
import { BoilerplateConfig, AuditLog, Member } from '../types';

interface DashboardProps {
  config: BoilerplateConfig;
  auditLogs: AuditLog[];
  onTriggerAudit: (event: string, category: 'payment' | 'kyc' | 'sms' | 'auth' | 'team', status: 'success' | 'warn' | 'failed', details: string) => void;
}

export function Dashboard({ config, auditLogs, onTriggerAudit }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'customer'>('admin');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Admin Dashboard States:
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Customer Dashboard States:
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; key: string; visible: boolean; createdAt: string }[]>([
    { id: '1', name: 'Primary production client SDK Key', key: 'alk_live_a0918ha9sg8ha9shg12389a', visible: false, createdAt: '2026-06-11' },
    { id: '2', name: 'Staging development environment key', key: 'alk_test_489asg98ha9shas029abc', visible: false, createdAt: '2026-06-14' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Org Teammates state:
  const [teammates, setTeammates] = useState<Member[]>([
    { id: '1', name: 'Iyanuola Legan', email: 'iyanuolalegan@gmail.com', role: 'owner', status: 'active' },
    { id: '2', name: 'Kossi Gbenou', email: 'kossi@afrilaunch.com', role: 'admin', status: 'active' },
    { id: '3', name: 'Farai Moyo', email: 'farai@devhub.co', role: 'developer', status: 'invited' },
  ]);
  const [newMail, setNewMail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'developer' | 'support'>('developer');

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

  const borderFocusClasses = {
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    amber: 'focus:border-amber-500 focus:ring-amber-500/20',
    indigo: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    rose: 'focus:border-rose-500 focus:ring-rose-500/20',
    sky: 'focus:border-sky-500 focus:ring-sky-500/20',
  };

  const borderPrimaryClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50',
    amber: 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50',
    indigo: 'border-indigo-500/30 bg-indigo-950/10 hover:border-indigo-500/50',
    rose: 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50',
    sky: 'border-sky-500/30 bg-sky-950/10 hover:border-sky-500/50',
  };

  const currentCurrency = config.primaryCurrency;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Helper adding customer key
  const handleAddApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const pre = `alk_live_${Math.random().toString(36).substring(2, 6)}`;
    const body = Math.random().toString(36).substring(4, 20);
    const generated = `${pre}_${body}`;
    const newKey = {
      id: Math.random().toString(),
      name: newKeyName,
      key: generated,
      visible: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    onTriggerAudit('API Key generated', 'auth', 'success', `Name: ${newKeyName}`);
  };

  const handleDeleteKey = (id: string) => {
    const key = apiKeys.find((k) => k.id === id);
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    if (key) {
      onTriggerAudit('API Key revoked', 'auth', 'warn', `Name: ${key.name}`);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(apiKeys.map((k) => (k.id === id ? { ...k, visible: !k.visible } : k)));
  };

  // Helper inviting workspace teammate
  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMail.trim() || !newMail.includes('@')) {
      alert("Please specify a valid coworker email address");
      return;
    }
    const newMember: Member = {
      id: Math.random().toString(),
      name: newMail.split('@')[0],
      email: newMail,
      role: newRole,
      status: 'invited',
    };
    setTeammates([...teammates, newMember]);
    setNewMail('');
    onTriggerAudit(`Teammate invited: ${newMail}`, 'team', 'success', `Assigned access role: ${newRole}`);
  };

  const handleDeleteTeammate = (id: string) => {
    const member = teammates.find((t) => t.id === id);
    setTeammates(teammates.filter((t) => t.id !== id));
    if (member) {
      onTriggerAudit(`Teammate access revoked`, 'team', 'warn', `Target: ${member.email}`);
    }
  };

  // Filtered audit logs
  const filteredAuditLogs = filterCategory === 'all'
    ? auditLogs
    : auditLogs.filter(log => log.category === filterCategory);

  return (
    <div className="space-y-6" id="dashboards_workspace animate-fade-in">
      {/* Central workspace dashboard switch tabs */}
      <div className="flex justify-between items-center bg-neutral-900/50 p-2 border border-neutral-800 rounded-xl select-none">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'admin' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Admin Control Panel (Platform Operations)</span>
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'customer' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tenant/Customer Dashboard (Workspace Console)</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
            {config.appName} Dev Mode Active
          </span>
        </div>
      </div>

      {activeTab === 'admin' ? (
        /* ~~~~~~~~~~~~~~~~~~~~~~~~~ ADMIN PANEL VIEW ~~~~~~~~~~~~~~~~~~~~~~~~~ */
        <div className="space-y-6">
          {/* Main Visual Counters statistics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
            {/* Total platform revenue */}
            <div className="border border-neutral-800 rounded-xl bg-neutral-950/70 p-4.5 space-y-1 relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Accumulated Sales Volume</span>
              <p className="text-2xl font-bold text-white tracking-tight leading-none mt-1">
                {currentCurrency} 658,400.00
              </p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4% vs last week</span>
              </div>
              <Coins className="w-8 h-8 opacity-[0.03] text-white absolute right-3 bottom-3" />
            </div>

            {/* Platform usage checkouts */}
            <div className="border border-neutral-800 rounded-xl bg-neutral-950/70 p-4.5 space-y-1 relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Active Subscriber Accounts</span>
              <p className="text-2xl font-bold text-white tracking-tight leading-none mt-1">1,248 tenants</p>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+48 new ones today</span>
              </div>
              <Users className="w-8 h-8 opacity-[0.03] text-white absolute right-3 bottom-3" />
            </div>

            {/* Comm quotas */}
            <div className="border border-neutral-800 rounded-xl bg-neutral-950/70 p-4.5 space-y-1 relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">SMS broadcasts processed</span>
              <p className="text-2xl font-bold text-white tracking-tight leading-none mt-1">14,289 texts</p>
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-medium mt-1">
                <span>99.8% gateway delivery score</span>
              </div>
              <FileText className="w-8 h-8 opacity-[0.03] text-white absolute right-3 bottom-3" />
            </div>

            {/* Identity requests */}
            <div className="border border-neutral-800 rounded-xl bg-neutral-950/70 p-4.5 space-y-1 relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Automated KYC Checks</span>
              <p className="text-2xl font-bold text-white tracking-tight leading-none mt-1">3,492 profiles</p>
              <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-medium mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Regulatory compliant checks</span>
              </div>
              <UserCheck className="w-8 h-8 opacity-[0.03] text-white absolute right-3 bottom-3" />
            </div>
          </div>

          {/* Analytical Charts and logs section side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Custom SVG line chart of developer platform adoption */}
            <div className="lg:col-span-3 border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-4 flex flex-col justify-between select-none">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">Daily Revenue Volume Trend</h4>
                  <p className="text-[9.5px] text-neutral-500">Platform transactional totals logged in {currentCurrency} across 7 days.</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  <BarChart2 className="w-3 h-3" /> Live Feed
                </div>
              </div>

              {/* Bespoke Custom responsive line/areachart using styled svg vectors */}
              <div className="flex-1 min-h-[180px] flex items-end justify-between relative mt-4 px-2">
                {/* SVG background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="border-t border-dashed border-white w-full"></div>
                  <div className="border-t border-dashed border-white w-full"></div>
                  <div className="border-t border-dashed border-white w-full"></div>
                </div>

                {/* Aesthetic visual points line */}
                <div className="absolute inset-0 px-2 py-3 z-10">
                  <svg className="w-full h-full overflow-visible" fill="none">
                    {/* Area background */}
                    <path
                      d="M 10 90 Q 60 70 120 110 T 240 40 T 360 10 T 480 30 Q 540 50 630 10 L 630 100 L 10 100 Z"
                      fill="url(#grad)"
                      className="opacity-20"
                    />
                    {/* Stroke */}
                    <path
                      d="M 10 90 Q 60 70 120 110 T 240 40 T 360 10 T 480 30 Q 540 50 630 10"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Day visual bars and labels */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const values = ['NGN 45k', 'NGN 32k', 'NGN 68k', 'NGN 95k', 'NGN 120k', 'NGN 85k', 'NGN 115k'];
                  return (
                    <div key={day} className="flex flex-col items-center gap-1 z-20">
                      <span className="text-[10px] font-bold text-neutral-400 font-mono scale-90">{values[i].replace('NGN', currentCurrency)}</span>
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-neutral-950"></div>
                      <span className="text-[9.5px] font-medium text-neutral-500 mt-1">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audit webhook events logger monitor table */}
            <div className="lg:col-span-2 border border-neutral-800 rounded-xl bg-neutral-950 p-5 flex flex-col justify-between h-[300px] lg:h-auto select-none">
              <div className="border-b border-neutral-800 pb-2.5 mb-3 flex items-center justify-between shrink-0">
                <div>
                  <h4 className="text-xs font-semibold text-neutral-200">System Logs &amp; Audit Trace</h4>
                  <p className="text-[9.5px] text-neutral-500">Live feed tracking operations, triggers, and API events logs.</p>
                </div>

                {/* Log category selector */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-md py-1 px-2 text-[10px] text-neutral-300 outline-none cursor-pointer hover:bg-neutral-800 transition-colors"
                >
                  <option value="all">All Logs ({auditLogs.length})</option>
                  <option value="payment">Payments</option>
                  <option value="kyc">KYC</option>
                  <option value="sms">SMS</option>
                  <option value="team">Team Auth</option>
                </select>
              </div>

              {/* Scroll list items */}
              <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {filteredAuditLogs.length > 0 ? (
                  filteredAuditLogs.map((log) => {
                    const statusColors = {
                      success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                      warn: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                      failed: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                    };
                    return (
                      <div key={log.id} className="p-2.5 border border-neutral-850 rounded-lg flex items-start gap-2.5 hover:bg-neutral-900/20 transition-colors">
                        <span className={`text-[8.5px] uppercase font-bold py-0.5 px-2 rounded border shrink-0 ${statusColors[log.status]}`}>
                          {log.status}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-center select-text">
                            <span className="text-[10.5px] font-semibold text-neutral-200 truncate">{log.event}</span>
                            <span className="text-[8.5px] text-neutral-500 font-mono shrink-0 ml-1.5">{log.timestamp}</span>
                          </div>
                          <p className="text-[9.5px] text-neutral-400 mt-1 leading-normal select-text">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-1 text-[8.5px] text-neutral-500 font-mono mt-1">
                            <span>User Email: {log.user}</span>
                            <span>•</span>
                            <span className="uppercase">{log.category}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] text-neutral-500 text-center py-10 font-sans">No logs found matching selected category filters.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ~~~~~~~~~~~~~~~~~~~~~~~~~ REGULAR CUSTOMER SaaS VIEW ~~~~~~~~~~~~~~~~~~~~~~~~~ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer info column */}
          <div className="col-span-1 border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-5 select-none h-fit">
            <div className="border-b border-neutral-800 pb-3">
              <span className={`text-[10px] uppercase font-bold tracking-widest ${textPrimaryClasses[config.themeColor]}`}>
                Billing Details &amp; Quotas
              </span>
              <h3 className="text-sm font-semibold text-white mt-0.5">Enterprise Starter Pack</h3>
              <p className="text-[10px] text-neutral-500 mt-1">Currently assigned subscription limits and usage analytics metrics.</p>
            </div>

            {/* Subscription active card */}
            <div className={`p-4 border border-dashed rounded-xl ${borderPrimaryClasses[config.themeColor]}`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9.5px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full font-bold">
                    ACTIVE STARTER TIER
                  </span>
                  <p className="text-sm font-semibold text-white mt-2">Naira / Dollar Billing synced</p>
                  <p className="text-[10.5px] text-neutral-400 mt-0.5">Renew date: July 15, 2026</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-neutral-400 font-medium">Monthly cost</span>
                  <p className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {currentCurrency === 'USD' ? 'USD 49' : `${currentCurrency} 25,000`}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Usage bars quotas metering limits */}
            <div className="space-y-3 pt-1">
              <h5 className="text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800/80 pb-1">
                Resource Usage Metering
              </h5>

              {/* Meter 1: API requests calls */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                  <span>API Request Triggers</span>
                  <span>145 / 10,000 queries</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${bgPrimaryClasses[config.themeColor]}`} style={{ width: '1.45%' }}></div>
                </div>
              </div>

              {/* Meter 2: KYC checks BVN NIN */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                  <span>Smile ID / VerifyMe checks</span>
                  <span>42 / 200 validations</span>
                </div>
                <div className="w-full bg-neutral-905 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${bgPrimaryClasses[config.themeColor]}`} style={{ width: '21%' }}></div>
                </div>
              </div>

              {/* Meter 3: SMS credits Termii */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                  <span>SMS Termii notifications</span>
                  <span>16 / 1,000 broadcasts</span>
                </div>
                <div className="w-full bg-neutral-905 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full ${bgPrimaryClasses[config.themeColor]}`} style={{ width: '1.6%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Core keys and organization modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* Component 1: Developer API keys manager */}
            <div className="border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-4">
              <div className="border-b border-neutral-800 pb-2.5">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-400" /> API Keys &amp; tokens Workspace
                </h4>
                <p className="text-[10px] text-neutral-500 mt-1">Expose developer security credentials. Keys should be kept secret.</p>
              </div>

              {/* List of keys and toggle visibility / copy / revoke */}
              <div className="space-y-2 select-none">
                {apiKeys.map((item) => (
                  <div key={item.id} className="p-2.5 border border-neutral-850 rounded-lg flex items-center justify-between hover:bg-neutral-900/10 transition-colors">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="font-semibold text-neutral-200 text-xs truncate">{item.name}</div>
                      <div className="flex items-center gap-2 mt-1.5 font-mono text-[10.5px]">
                        <span className="text-neutral-400 font-mono">
                          {item.visible ? item.key : `${item.key.substring(0, 10)}${'•'.repeat(16)}`}
                        </span>
                        <button
                          onClick={() => toggleKeyVisibility(item.id)}
                          className="text-[9.5px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
                        >
                          {item.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="text-[9px] text-neutral-500 mt-1 font-mono">Created at: {item.createdAt}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(item.key, item.id)}
                        className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors"
                        title="Copy API key"
                      >
                        {copiedKeyId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteKey(item.id)}
                        className="bg-neutral-900 hover:bg-rose-950/20 border border-neutral-800 hover:border-rose-500/30 text-neutral-400 hover:text-rose-400 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors"
                        title="Revoke key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick generator */}
              <form onSubmit={handleAddApiKey} className="flex gap-2.5 pt-2 select-none">
                <input
                  type="text"
                  placeholder="Key alias (e.g. Android payment app)..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className={`flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all ${borderFocusClasses[config.themeColor]}`}
                />
                <button
                  type="submit"
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-xs text-black cursor-pointer font-semibold ${bgPrimaryClasses[config.themeColor]}`}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Generate Key</span>
                </button>
              </form>
            </div>

            {/* Component 2: Organization Workspace team seats manager */}
            <div className="border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-4">
              <div className="border-b border-neutral-800 pb-2.5">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-400" /> Team &amp; Core Organizations seats
                </h4>
                <p className="text-[10px] text-neutral-500 mt-1">Manage, invite, and configure permissions role mappings across developers.</p>
              </div>

              {/* List team members */}
              <div className="space-y-2 select-none">
                {teammates.map((item) => {
                  const roleBadges = {
                    owner: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10',
                    admin: 'text-amber-400 border-amber-500/20 bg-amber-950/10',
                    developer: 'text-purple-400 border-purple-500/20 bg-purple-950/10',
                    support: 'text-sky-400 border-sky-500/20 bg-sky-950/10',
                  };
                  return (
                    <div key={item.id} className="p-2.5 border border-transparent hover:border-neutral-850 rounded-lg hover:bg-neutral-900/10 flex items-center justify-between transition-colors">
                      <div className="min-w-0 pr-4 flex-1">
                        <div className="flex items-center gap-2 select-text">
                          <span className="font-semibold text-neutral-200 text-xs truncate capitalize">{item.name}</span>
                          <span className={`text-[8.5px] font-bold uppercase py-0.5 px-2 rounded border shrink-0 ${roleBadges[item.role]}`}>
                            {item.role}
                          </span>
                          {item.status === 'invited' && (
                            <span className="text-[8.5px] font-bold text-neutral-500 border border-neutral-800/60 bg-neutral-900 px-1.5 py-0.5 rounded uppercase font-mono tracking-wider shrink-0">
                              PENDING INVITE
                            </span>
                          )}
                        </div>
                        <div className="text-[9.5px] text-neutral-500 mt-1 font-mono select-text">{item.email}</div>
                      </div>

                      {item.role !== 'owner' && (
                        <button
                          onClick={() => handleDeleteTeammate(item.id)}
                          className="bg-neutral-900 hover:bg-rose-950/25 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-500/30 p-1.5 rounded cursor-pointer transition-colors"
                          title="Revoke access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Invite teammate form panel */}
              <form onSubmit={handleInviteUser} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 select-none">
                <input
                  type="email"
                  placeholder="Invite email..."
                  value={newMail}
                  onChange={(e) => setNewMail(e.target.value)}
                  className={`sm:col-span-1.5 w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white placeholder-neutral-500 outline-none transition-all ${borderFocusClasses[config.themeColor]}`}
                />
                <select
                  value={newRole}
                  onChange={(e: any) => setNewRole(e.target.value)}
                  className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white outline-none cursor-pointer transition-all ${borderFocusClasses[config.themeColor]}`}
                >
                  <option value="admin">Administrator</option>
                  <option value="developer">Developer Seat</option>
                  <option value="support">Customer Support</option>
                </select>
                <button
                  type="submit"
                  className={`flex items-center justify-center gap-1 px-4 py-2 rounded-lg font-medium text-xs text-black cursor-pointer font-semibold ${bgPrimaryClasses[config.themeColor]}`}
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Send Board Invite</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
