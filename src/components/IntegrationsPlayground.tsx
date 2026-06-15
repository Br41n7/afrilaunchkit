import React, { useState } from 'react';
import { Play, Sparkles, Send, CreditCard, Shield, Smartphone, Coins, Database, RefreshCw, Key, Code, HelpCircle, Check, Loader2 } from 'lucide-react';
import { BoilerplateConfig, CountryCode, CurrencyCode } from '../types';

interface IntegrationsPlaygroundProps {
  config: BoilerplateConfig;
  onLogTransaction: (amount: number, status: 'success' | 'warn' | 'failed', gateway: string, details: string) => void;
  onTriggerAudit: (event: string, category: 'payment' | 'kyc' | 'sms' | 'auth' | 'team', status: 'success' | 'warn' | 'failed', details: string) => void;
}

export function IntegrationsPlayground({ config, onLogTransaction, onTriggerAudit }: IntegrationsPlaygroundProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'kyc' | 'sms' | 'banking'>('payments');
  const [loading, setLoading] = useState(false);

  // Payments State
  const [payGateway, setPayGateway] = useState<'paystack' | 'flutterwave'>(config.enableFlutterwave && !config.enablePaystack ? 'flutterwave' : 'paystack');
  const [payAmount, setPayAmount] = useState('5000');
  const [payEmail, setPayEmail] = useState('user@example.com');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payRef, setPayRef] = useState('');
  const [payLogs, setPayLogs] = useState<string[]>([]);

  // KYC State
  const [kycProvider, setKycProvider] = useState<'smile' | 'verifyme'>(config.enableVerifyMe && !config.enableSmileId ? 'verifyme' : 'smile');
  const [idType, setIdType] = useState<'BVN' | 'NIN'>('BVN');
  const [idNumber, setIdNumber] = useState('22234567890');
  const [kycResult, setKycResult] = useState<any | null>(null);
  const [kycLogs, setKycLogs] = useState<string[]>([]);

  // SMS State
  const [smsPhone, setSmsPhone] = useState('08031234567');
  const [smsGateway, setSmsGateway] = useState<'termii' | 'africastalking'>(config.enableAfricasTalking && !config.enableTermii ? 'africastalking' : 'termii');
  const [smsMessage, setSmsMessage] = useState('Hello from AfriLaunch! Enter code 4892 to verify your security session.');
  const [smsLogs, setSmsLogs] = useState<string[]>([]);
  const [phoneMessageReceived, setPhoneMessageReceived] = useState<string | null>(null);

  // Banking State
  const [bankingToken, setBankingToken] = useState('');
  const [linkedBankAccount, setLinkedBankAccount] = useState<any | null>(null);
  const [bankingLogs, setBankingLogs] = useState<string[]>([]);

  // Theme support colors
  const textCols = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    indigo: 'text-indigo-400',
    rose: 'text-rose-400',
    sky: 'text-sky-400',
  };

  const bgCols = {
    emerald: 'bg-emerald-500 hover:bg-emerald-400',
    amber: 'bg-amber-500 hover:bg-amber-400',
    indigo: 'bg-indigo-500 hover:bg-indigo-400',
    rose: 'bg-rose-500 hover:bg-rose-400',
    sky: 'bg-sky-500 hover:bg-sky-400',
  };

  const borderFocusClasses = {
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    amber: 'focus:border-amber-500 focus:ring-amber-500/20',
    indigo: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    rose: 'focus:border-rose-500 focus:ring-rose-500/20',
    sky: 'focus:border-sky-500 focus:ring-sky-500/20',
  };

  const currentCurrency = config.primaryCurrency;

  // 1. Simulating Payments Checkout Initialize
  const initializePaymentPlay = () => {
    if (!payAmount || Number(payAmount) <= 0) {
      alert("Please specify a valid transaction amount");
      return;
    }
    setLoading(true);
    setPayLogs([
      `[CLIENT] Trigger API request POST /api/payments/${payGateway}/initialize`,
      `[CLIENT] Payload: { email: "${payEmail}", amount: ${payAmount}, currency: "${currentCurrency}" }`,
      `[SERVER] Payload conversion to lowest units (e.g. kobo/pesewas): ${Number(payAmount) * 100}`,
      `[GATEWAY] Transmitting query payload parameters back to API nodes at ${payGateway}.co...`,
    ]);

    setTimeout(() => {
      const generatedRef = `alk_${payGateway.substring(0, 3)}_${Math.random().toString(36).substring(4, 10)}`;
      setPayRef(generatedRef);
      setPayLogs((prev) => [
        ...prev,
        `[GATEWAY] Session authorized successfully. Status Code: 200`,
        `[SERVER] response schema payload returned:`,
        `         { status: true, reference: "${generatedRef}", checkout_url: "https://checkout.${payGateway}.com/${generatedRef}" }`,
        `[CLIENT] Launching frame popup overlay...`,
      ]);
      setLoading(false);
      setPayModalOpen(true);
    }, 1200);
  };

  const completePaymentSim = (status: 'success' | 'failure') => {
    setPayModalOpen(false);
    setLoading(true);
    setPayLogs((prev) => [
      ...prev,
      `[CLIENT] checkout popup closed. User operation status: ${status === 'success' ? 'authorized' : 'cancelled'}`,
      `[CLIENT] Trigger API query verify /api/payments/${payGateway}/verify?reference=${payRef}`,
      `[GATEWAY] Querying database reference status...`,
    ]);

    setTimeout(() => {
      if (status === 'success') {
        setPaySuccess(true);
        setPayLogs((prev) => [
          ...prev,
          `[GATEWAY] Verified transaction status: 'SUCCESSFUL'`,
          `[SERVER] Prisma models update: Created table entries inside Transaction:`,
          `         { reference: "${payRef}", amount: ${payAmount}, currency: "${currentCurrency}", status: "SUCCESS" }`,
          `[SERVER] Directing mock success callback event trigger... Webhook received charges.success`,
        ]);
        onLogTransaction(Number(payAmount), 'success', payGateway, `Payment verification complete. Reference: ${payRef}`);
        onTriggerAudit(`Payment success via ${payGateway}`, 'payment', 'success', `Reference: ${payRef}, Amount: ${currentCurrency} ${payAmount}`);
      } else {
        setPaySuccess(false);
        setPayLogs((prev) => [
          ...prev,
          `[GATEWAY] Verified transaction status: 'FAILED' | 'CANCELLED'`,
          `[SERVER] Prisma models update: Transaction state set to 'FAILED'.`,
        ]);
        onTriggerAudit(`Payment canceled/failed on ${payGateway}`, 'payment', 'failed', `Reference: ${payRef}`);
      }
      setLoading(false);
    }, 1500);
  };

  // 2. Simulating KYC verification
  const executeKycPlay = () => {
    if (!idNumber || idNumber.length < 5) {
      alert("Please enter a valid BVN or NIN number index");
      return;
    }
    setLoading(true);
    setKycLogs([
      `[CLIENT] Emit POST /api/kyc/verify-id`,
      `[CLIENT] Payload params: { idNumber: "${idNumber}", idType: "${idType}", provider: "${kycProvider}" }`,
      `[SERVER] Authorizing X-API-KEY secret identifiers...`,
      `[SERVER] API match: 'alk_dev_testkeys_92has92'`,
      `[GATEWAY] Transmitting encrypted payloads to ${kycProvider === 'smile' ? 'Smile ID Enhanced Server Registry' : 'VerifyMe NIMC registry API'}...`,
    ]);

    setTimeout(() => {
      const confidence = Math.floor(Math.random() * 15) + 85; // 85% to 99%
      const responseData = {
        success: true,
        resultCode: kycProvider === 'smile' ? '1012' : '00',
        resultText: "Identification query matches registry successfully.",
        customer: {
          firstName: "Chinedu",
          lastName: "Okonkwo",
          dob: "1994-11-23",
          registryMatch: `${confidence}% confidence metric`,
          officialID: idNumber,
          gender: "Male"
        }
      };
      setKycResult(responseData);
      setKycLogs((prev) => [
        ...prev,
        `[GATEWAY] Database response received in 850ms. API query Status: OK`,
        `[SERVER] Result matched successfully: Confidence level ${confidence}%`,
        `[SERVER] Audit Log entry: KYC_VERIFICATION_RUN logged to AuditLog DB table.`,
      ]);
      onTriggerAudit(`KYC Query lookup completed`, 'kyc', 'success', `Type: ${idType}, Ref: ${idNumber}`);
      setLoading(false);
    }, 1800);
  };

  // 3. Simulating OTP Message Deliveries
  const dispatchSmsPlay = () => {
    if (!smsPhone || smsPhone.length < 5) {
      alert("Please configure standard destination phone index.");
      return;
    }
    setLoading(true);
    setSmsLogs([
      `[CLIENT] Trigger action route dispatch POST /api/sms/send`,
      `[CLIENT] Params payload: { to: "${smsPhone}", message: "...", gatewaySelector: "${smsGateway}" }`,
      `[SERVER] Local credits assertion... organization remaining SMS limits: [985/1000]`,
      `[GATEWAY] Standard phone index cleanup for E.164 standardization: ${smsPhone} -> E.164 standard conversion`,
      `[GATEWAY] Delivering message dispatch signals packets to ${smsGateway === 'termii' ? 'Termii fast lane routing' : 'Africa’s Talking core SMS gateway'}...`,
    ]);

    setTimeout(() => {
      setSmsLogs((prev) => [
        ...prev,
        `[GATEWAY] Dispatched successfully. Gateway response: { status: "success", message_id: "al_sms_8912g8shg19" }`,
        `[SERVER] SMS logged successfully to UsageMeter DB. Quota remaining: [984/1000]`,
      ]);
      setPhoneMessageReceived(smsMessage);
      onTriggerAudit('SMS broadcast dispatched', 'sms', 'success', `Number target: ${smsPhone}, size: ${smsMessage.length} bytes`);
      setLoading(false);
    }, 1500);
  };

  const generateOtpSimValue = () => {
    const pin = Math.floor(Math.random() * 900000) + 100000;
    setSmsMessage(`[AfriLaunch Security pin] Your otp is < ${pin} > valid for 10 minutes. Do not disclose this pin.`);
  };

  // 4. Simulating Banking Link connect
  const executeBankingConnectPlay = () => {
    setLoading(true);
    setBankingLogs([
      `[CLIENT] Mounting Mono open-banking connect widget UI...`,
      `[CLIENT] Directing customer authorization bank selections... [Authorized: Guaranteed Trust Bank GTB]`,
      `[CLIENT] Widget callback triggered with auth exchange code: 'code_gtb_981ahas9a'`,
      `[CLIENT] Emitting API code exchangesPOST /api/banking/mono/exchange`,
    ]);

    setTimeout(() => {
      setLinkedBankAccount({
        bankName: "GTBank Nigeria",
        accountName: "Chinedu Okonkwo",
        accountNumber: "0219874534",
        balance: `${currentCurrency} 1,245,600.00`,
        status: "Active",
        holderType: "INDIVIDUAL"
      });
      setBankingLogs((prev) => [
        ...prev,
        `[SERVER] Token exchange processed. Received accountId permanent token: 'mono_acc_token_980abc18'`,
        `[SERVER] Calling Mono banking ledger account metadata details...`,
        `[SERVER] account statements matched successfully:`,
        `         { accountName: "Chinedu Okonkwo", currency: "NGN", institution: "GTB" }`,
        `[SERVER] Account saved to Prisma db Organization banking configurations.`,
      ]);
      onTriggerAudit('Bank account linked via Mono', 'auth', 'success', 'Linked GTBank account 0219874534');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6" id="playground_simulator">
      {/* Simulation controller */}
      <div className="lg:col-span-2 border border-neutral-800 rounded-xl bg-neutral-950 p-5 space-y-4 select-none">
        <div className="flex gap-2 border-b border-neutral-800 pb-3 flex-wrap">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg cursor-pointer font-medium transition-colors ${
              activeTab === 'payments' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payments API</span>
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg cursor-pointer font-medium transition-colors ${
              activeTab === 'kyc' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>KYC Verification</span>
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg cursor-pointer font-medium transition-colors ${
              activeTab === 'sms' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>SMS/OTP Pin</span>
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg cursor-pointer font-medium transition-colors ${
              activeTab === 'banking' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Mono Open-Bank</span>
          </button>
        </div>

        {/* Dynamic Inner Panel based on active tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-neutral-200">Initialize Unified Payment Adapter</h4>
                <p className="text-[10px] text-neutral-500">Initialize checkout links or process automated card settlements.</p>
              </div>
              <div className="flex gap-2 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setPayGateway('paystack')}
                  className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-md cursor-pointer transition-colors ${
                    payGateway === 'paystack' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  disabled={!config.enablePaystack && config.enableFlutterwave}
                >
                  Paystack
                </button>
                <button
                  onClick={() => setPayGateway('flutterwave')}
                  className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-md cursor-pointer transition-colors ${
                    payGateway === 'flutterwave' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  disabled={!config.enableFlutterwave && config.enablePaystack}
                >
                  Flutterwave
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">Transaction Amount ({currentCurrency})</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white outline-none ${borderFocusClasses[config.themeColor]}`}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">Customer Email Address</label>
                <input
                  type="email"
                  value={payEmail}
                  onChange={(e) => setPayEmail(e.target.value)}
                  className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white outline-none ${borderFocusClasses[config.themeColor]}`}
                />
              </div>
            </div>

            <button
              onClick={initializePaymentPlay}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-black cursor-pointer transition-all ${bgCols[config.themeColor]}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Initialize payment with {payGateway === 'paystack' ? 'Paystack' : 'Flutterwave'}</span>
            </button>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-neutral-200">KYC verification adapters checks</h4>
                <p className="text-[10px] text-neutral-500">Cross verify BVN or National Identity NIN indices with standard records.</p>
              </div>
              <div className="flex gap-2 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setKycProvider('smile')}
                  className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-md cursor-pointer transition-colors ${
                    kycProvider === 'smile' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  disabled={!config.enableSmileId && config.enableVerifyMe}
                >
                  Smile ID
                </button>
                <button
                  onClick={() => setKycProvider('verifyme')}
                  className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-md cursor-pointer transition-colors ${
                    kycProvider === 'verifyme' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  disabled={!config.enableVerifyMe && config.enableSmileId}
                >
                  VerifyMe
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">Identification index type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIdType('BVN'); if (idNumber === '22234567890') setIdNumber('22234567890'); }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs border cursor-pointer font-medium transition-colors ${
                      idType === 'BVN' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                    }`}
                  >
                    BVN Lookup
                  </button>
                  <button
                    onClick={() => { setIdType('NIN'); if (idNumber === '22234567890') setIdNumber('38945672109'); }}
                    className={`flex-1 py-1.5 px-3 rounded-md text-xs border cursor-pointer font-medium transition-colors ${
                      idType === 'NIN' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-900/50 text-neutral-400 border-neutral-800 hover:bg-neutral-900'
                    }`}
                  >
                    NIN Check
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">{idType} Number (11 digits)</label>
                <input
                  type="text"
                  maxLength={11}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                  className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white outline-none ${borderFocusClasses[config.themeColor]}`}
                />
              </div>
            </div>

            <button
              onClick={executeKycPlay}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-black cursor-pointer transition-all ${bgCols[config.themeColor]}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Verify profile via {kycProvider === 'smile' ? 'Smile ID' : 'VerifyMe'}</span>
            </button>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-neutral-200">SMS communications dispatch panel</h4>
                <p className="text-[10px] text-neutral-500">Dispatch transactional messages or authentication validation codes OTPs.</p>
              </div>
              <div className="flex gap-2 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                <button
                  onClick={() => setSmsGateway('termii')}
                  className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-md cursor-pointer transition-colors ${
                    smsGateway === 'termii' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  disabled={!config.enableTermii && config.enableAfricasTalking}
                >
                  Termii
                </button>
                <button
                  onClick={() => setSmsGateway('africastalking')}
                  className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-md cursor-pointer transition-colors ${
                    smsGateway === 'africastalking' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                  disabled={!config.enableAfricasTalking && config.enableTermii}
                >
                  Africa's Talking
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1 space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">Phone Index</label>
                <input
                  type="text"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white outline-none ${borderFocusClasses[config.themeColor]}`}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase block">Text message payload</label>
                  <button
                    onClick={generateOtpSimValue}
                    className="text-[9.5px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Generate OTP
                  </button>
                </div>
                <input
                  type="text"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  className={`w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white outline-none ${borderFocusClasses[config.themeColor]}`}
                />
              </div>
            </div>

            <button
              onClick={dispatchSmsPlay}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-black cursor-pointer transition-all ${bgCols[config.themeColor]}`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send SMS via {smsGateway === 'termii' ? 'Termii' : "Africa's Talking"}</span>
            </button>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-neutral-200">Mono and Okra banking flow simulations</h4>
              <p className="text-[10px] text-neutral-500">Authorize accounts link cycles to query balances and statement histories.</p>
            </div>

            {linkedBankAccount ? (
              <div className="bg-neutral-900/50 p-4 border border-teal-500/15 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-neutral-200">Connection status linked successfully</span>
                  </div>
                  <button
                    onClick={() => setLinkedBankAccount(null)}
                    className="text-[10px] text-rose-500 hover:text-rose-400 underline cursor-pointer"
                  >
                    Disconnect account
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-neutral-800/80 pt-2.5">
                  <div>
                    <span className="text-neutral-500 text-[10px]">Financial Institution</span>
                    <p className="font-semibold text-neutral-300 mt-0.5">{linkedBankAccount.bankName}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px]">Account Holder Name</span>
                    <p className="font-semibold text-neutral-300 mt-0.5">{linkedBankAccount.accountName}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px]">Assigned Account Index</span>
                    <p className="font-semibold text-neutral-300 mt-0.5">{linkedBankAccount.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px]">Extractable Balance Ledger</span>
                    <p className="font-semibold text-neutral-300 mt-0.5">{linkedBankAccount.balance}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900/20 border border-dashed border-neutral-800 rounded-xl p-6 text-center select-none">
                <Database className="w-7 h-7 mx-auto opacity-30 text-neutral-400 mb-2" />
                <h5 className="text-xs font-semibold text-neutral-300">No bank accounts linked yet</h5>
                <p className="text-[10px] text-neutral-500 mt-1 max-w-sm mx-auto">
                  Relaunch interactive Mono Bank connect dialog widget simulation to pull user balances and statements data streams.
                </p>
              </div>
            )}

            <button
              onClick={executeBankingConnectPlay}
              disabled={loading || linkedBankAccount !== null}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold text-black cursor-pointer transition-all ${
                linkedBankAccount ? 'bg-neutral-800/20 text-neutral-500 border border-neutral-800 cursor-not-allowed' : bgCols[config.themeColor]
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Link user account via Mono connect widget</span>
            </button>
          </div>
        )}
      </div>

      {/* Console output display */}
      <div className="col-span-1 border border-neutral-800 rounded-xl bg-neutral-950 p-5 flex flex-col h-[480px] lg:h-auto select-none">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-1">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest">Live Output Viewer</h4>
          </div>
          <button
            onClick={() => { setPayLogs([]); setKycLogs([]); setSmsLogs([]); setBankingLogs([]); setKycResult(null); setPhoneMessageReceived(null); }}
            className="text-[10px] text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
          >
            Clear Screen
          </button>
        </div>

        {/* Console view / Phone display for SMS receipts */}
        <div className="flex-1 mt-4 overflow-y-auto no-scrollbar flex flex-col justify-between">
          {activeTab === 'sms' && phoneMessageReceived ? (
            /* Apple iPhone device mockup interface */
            <div className="w-full max-w-[210px] mx-auto bg-neutral-900 border-[6px] border-neutral-800 rounded-[28px] p-2 aspect-[9/18] relative shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Phone ear notch speaker */}
              <div className="w-16 h-3 bg-neutral-800 rounded-full mx-auto absolute top-1 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                <span className="w-2.5 h-1 bg-neutral-950 rounded-full"></span>
              </div>

              {/* Status bar */}
              <div className="flex justify-between items-center text-[8px] text-neutral-400 px-3 pt-3 select-none">
                <span>09:41</span>
                <span>LTE 🔋</span>
              </div>

              {/* Recipient Message body bubbles */}
              <div className="flex-1 px-1.5 py-4 flex flex-col justify-end">
                <div className="bg-neutral-850 border border-neutral-800/80 p-2.5 rounded-2xl rounded-bl-sm text-[9.5px] leading-relaxed text-neutral-200 select-text max-w-[85%] self-start relative shadow">
                  <div className="text-[7.5px] font-bold text-emerald-400 uppercase mb-0.5 tracking-wide">
                    {smsGateway === 'termii' ? 'Termii Gateway' : 'AT Gateway'}
                  </div>
                  {phoneMessageReceived}
                </div>
                <div className="text-[7px] text-neutral-500 mt-1 pl-1">Delivered instantly</div>
              </div>

              {/* Mock input text bar */}
              <div className="border-t border-neutral-800/50 pt-1 flex gap-1 items-center select-none shrink-0">
                <input
                  type="text"
                  readOnly
                  placeholder="Text Message"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-full px-2 py-1 text-[8.5px] text-neutral-400 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* Standard API Log messages */
            <div className="flex-1 font-mono text-[10px] bg-[#0a0a0f] p-3 rounded-lg border border-neutral-900 overflow-y-auto max-h-[320px] lg:max-h-none select-text">
              <span className="text-neutral-500 font-sans block mb-2">// Server microservices execution paths logging output:</span>
              <div className="space-y-1.5">
                {activeTab === 'payments' &&
                  (payLogs.length > 0 ? (
                    payLogs.map((log, i) => (
                      <div key={i} className={`whitespace-pre-wrap leading-relaxed ${log.includes('[CLIENT]') ? 'text-blue-400' : log.includes('[SERVER]') ? 'text-emerald-400' : 'text-neutral-300'}`}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600 italic py-10 text-center font-sans">Initialize payment transactions simulator to view API request logs...</p>
                  ))}

                {activeTab === 'kyc' &&
                  (kycLogs.length > 0 ? (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        {kycLogs.map((log, i) => (
                          <div key={i} className={`whitespace-pre-wrap leading-relaxed ${log.includes('[CLIENT]') ? 'text-blue-400' : log.includes('[SERVER]') ? 'text-emerald-400' : 'text-neutral-300'}`}>
                            {log}
                          </div>
                        ))}
                      </div>
                      {kycResult && (
                        <div className="bg-neutral-900/60 p-2.5 rounded border border-emerald-500/10 text-emerald-400 font-mono text-[9px] mt-2 whitespace-pre mt-2 select-text">
                          {JSON.stringify(kycResult, null, 2)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-neutral-600 italic py-10 text-center font-sans">Submit a BVN/NIN identity lookup inquiry to inspect JSON payload results...</p>
                  ))}

                {activeTab === 'sms' &&
                  (smsLogs.length > 0 ? (
                    smsLogs.map((log, i) => (
                      <div key={i} className={`whitespace-pre-wrap leading-relaxed ${log.includes('[CLIENT]') ? 'text-blue-400' : log.includes('[SERVER]') ? 'text-emerald-400' : 'text-neutral-300'}`}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600 italic py-10 text-center font-sans">Dispatch transactional SMS/OTP messages to see carrier API response structures...</p>
                  ))}

                {activeTab === 'banking' &&
                  (bankingLogs.length > 0 ? (
                    bankingLogs.map((log, i) => (
                      <div key={i} className={`whitespace-pre-wrap leading-relaxed ${log.includes('[CLIENT]') ? 'text-blue-400' : log.includes('[SERVER]') ? 'text-emerald-400' : 'text-neutral-300'}`}>
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600 italic py-10 text-center font-sans">Launch open-banking linking widget flow to review ledger details logs...</p>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paystack checkout modal frame popup simulator overlay */}
      {payModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 text-neutral-800 flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0b2b40] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold leading-none">
                  P
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans uppercase tracking-widest">{payGateway} Secure Checkout</h4>
                  <p className="text-[10px] opacity-75 mt-0.5">{payEmail}</p>
                </div>
              </div>
              <button
                onClick={() => completePaymentSim('failure')}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-center">
              <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">Pay Amount Outright</span>
              <p className="text-2xl font-bold font-sans tracking-tight text-neutral-900 mt-0.5">
                {currentCurrency} {Number(payAmount).toLocaleString()}
              </p>

              {/* Simulated Card form */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-left space-y-3 mt-4">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-bold text-neutral-400 uppercase">Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="4012  8834  9912  3456"
                    className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 tracking-wider outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-neutral-400 uppercase">Expiry Date</label>
                    <input
                      type="text"
                      disabled
                      value="12 / 29"
                      className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold text-neutral-400 uppercase">Cvv index</label>
                    <input
                      type="text"
                      disabled
                      value="• • •"
                      className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-600 outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-neutral-400 leading-normal max-w-xs mx-auto">
                This is a sandbox simulation mock. Clicking authorize checkout executes success verification pipelines and updates ledger balances.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 grid grid-cols-2 gap-3">
              <button
                onClick={() => completePaymentSim('failure')}
                className="w-full py-2 bg-neutral-200 hover:bg-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 cursor-pointer text-center"
              >
                Cancel Checkout
              </button>
              <button
                onClick={() => completePaymentSim('success')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-semibold text-white cursor-pointer text-center"
              >
                Authorize Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
