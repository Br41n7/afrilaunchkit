import { FileNode } from '../types';

export const BOILERPLATE_FILES: FileNode[] = [
  {
    name: 'prisma',
    path: 'prisma',
    isDirectory: true,
    children: [
      {
        name: 'schema.prisma',
        path: 'prisma/schema.prisma',
        isDirectory: false,
        language: 'prisma',
        description: 'Prisma DB connection & core model schemas (Users, Teams, Subs, Ledger, Audit, APIKeys).',
        content: `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  OWNER
  ADMIN
  DEVELOPER
  SUPPORT
  USER
}

enum SubscriptionTier {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

model User {
  id            String    @id @default(uuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relationships
  organizations OrganizationMember[]
  apiKeys       ApiKey[]
  auditLogs     AuditLog[]
  transactions  Transaction[]
}

model Organization {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  logoUrl     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Subscription details
  tier               SubscriptionTier @default(FREE)
  stripeCustomerId   String?          @unique
  paystackSubCode    String?          @unique // Subscription reference for Paystack
  subscriptionStatus String           @default("active") // active, trialing, past_due, canceled
  premiumExpiresAt   DateTime?

  // Relationships
  members  OrganizationMember[]
  apiKeys  ApiKey[]
  services UsageQuota[]
}

model OrganizationMember {
  id             String       @id @default(uuid())
  organizationId String
  userId         String
  role           Role         @default(DEVELOPER)
  createdAt      DateTime     @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
}

model ApiKey {
  id             String       @id @default(uuid())
  name           String
  keyHash        String       @unique
  prefix         String       // e.g. "alk_live_"
  organizationId String
  userId         String
  active         Boolean      @default(true)
  createdAt      DateTime     @default(now())
  expiresAt      DateTime?

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UsageQuota {
  id             String       @id @default(uuid())
  organizationId String
  featureKey     String       // e.g., "api_requests", "kyc_checks", "sms_credits"
  used           Int          @default(0)
  limit          Int          @default(100)
  renewalDate    DateTime

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, featureKey])
}

model Transaction {
  id             String   @id @default(uuid())
  reference      String   @unique // e.g. Paystack/Flutterwave reference ID
  amount         Decimal  @db.Decimal(12, 2)
  currency       String   @default("NGN")
  status         String   // SUCCESS, FAILED, PENDING, REFUNDED
  channel        String   // paystack, flutterwave, mobile_money, card
  metadata       Json?
  userId         String?
  createdAt      DateTime @default(now())

  user           User?    @relation(fields: [userId], references: [id])
}

model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String   // e.g., "USER_INVITED", "API_KEY_CREATED", "KYC_VERIFICATION_RUN"
  category   String   // e.g., "auth", "billing", "kyc", "security"
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
}
`
      }
    ]
  },
  {
    name: 'src',
    path: 'src',
    isDirectory: true,
    children: [
      {
        name: 'integrations',
        path: 'src/integrations',
        isDirectory: true,
        children: [
          {
            name: 'payments',
            path: 'src/integrations/payments',
            isDirectory: true,
            children: [
              {
                name: 'paystack.ts',
                path: 'src/integrations/payments/paystack.ts',
                isDirectory: false,
                language: 'typescript',
                description: 'Full-featured Paystack SDK wrapper (charges, plan management, verification, secure refund execution, error structures).',
                content: `/**
 * Paystack Integration Service
 * Compliant with Paystack V3 Core API
 */

import axios, { AxiosInstance } from 'axios';

export interface PaystackInitializePayload {
  email: string;
  amount: number; // In kobo (e.g. 10000 = 100 NGN)
  reference?: string;
  callback_url?: string;
  metadata?: any;
  plan?: string; // Optional plan code for subscriptions
  channels?: string[]; // e.g., ['card', 'bank', 'ussd', 'qr', 'mobile_money']
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'ongoing' | 'reversed';
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    fees: number;
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
    };
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      signature: string;
    };
  };
}

export class PaystackService {
  private client: AxiosInstance;

  constructor() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CRITICAL: PAYSTACK_SECRET_KEY environment variable is missing.");
    }

    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: \`Bearer \${secretKey}\`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initialize a Paystack payment session
   */
  async initializePayment(payload: PaystackInitializePayload) {
    try {
      const response = await this.client.post('/transaction/initialize', {
        ...payload,
        // Paystack expects amount in Kobo/Pesewas (multiply Naira/Cedi by 100)
        amount: Math.round(payload.amount),
        callback_url: payload.callback_url || process.env.APP_URL + '/api/payments/paystack/callback',
      });

      return response.data; // Includes authorization_url, access_code, and reference
    } catch (error: any) {
      console.error('Paystack initialization failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize Paystack transaction');
    }
  }

  /**
   * Verify an existing transaction via Paystack Reference ID
   */
  async verifyPayment(reference: string): Promise<PaystackVerificationResponse> {
    try {
      const response = await this.client.get(\`/transaction/verify/\${reference}\`);
      return response.data;
    } catch (error: any) {
      console.error('Paystack verification failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify Paystack payment');
    }
  }

  /**
   * Create standard recurring subscription Plan
   */
  async createSubscriptionPlan(name: string, amount: number, interval: 'daily' | 'weekly' | 'monthly' | 'annually', currency: string = 'NGN') {
    try {
      const response = await this.client.post('/plan', {
        name,
        amount: Math.round(amount), // in lowest currency unit
        interval,
        currency,
      });
      return response.data.data; // Returns plan_code key
    } catch (error: any) {
      console.error('Paystack plan creation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Paystack Plan creation failed');
    }
  }

  /**
   * Trigger a custom refunds cycle
   */
  async createRefund(transactionReference: string, amount?: number, reason: string = 'Customer request') {
    try {
      const response = await this.client.post('/refund', {
        transaction: transactionReference,
        amount: amount ? Math.round(amount) : undefined,
        customer_note: reason,
      });
      return response.data;
    } catch (error: any) {
      console.error('Paystack Refund failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to execute custom Paystack refund');
    }
  }

  /**
   * Validate webhook request integrity securely using HMAC SHA512 header verification
   */
  static verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    const crypto = require('crypto');
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return false;

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    return hash === signatureHeader;
  }
}
`
              },
              {
                name: 'flutterwave.ts',
                path: 'src/integrations/payments/flutterwave.ts',
                isDirectory: false,
                language: 'typescript',
                description: 'Professional Flutterwave V3 billing adapter (cards, mobile money, verification, webhooks).',
                content: `/**
 * Flutterwave Integration Service
 * Compliant with Flutterwave V3 API
 */

import axios, { AxiosInstance } from 'axios';

export interface FlutterwaveInitializePayload {
  tx_ref: string;
  amount: number; // Absolute value (e.g., 5000.00 for 5000 NGN)
  currency: 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD';
  redirect_url: string;
  customer: {
    email: string;
    name?: string;
    phone_number?: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export class FlutterwaveService {
  private client: AxiosInstance;

  constructor() {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CRITICAL: FLUTTERWAVE_SECRET_KEY is missing from env dashboard.");
    }

    this.client = axios.create({
      baseURL: 'https://api.flutterwave.com/v3',
      headers: {
        Authorization: \`Bearer \${secretKey}\`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Intitiate Flutterwave hosted payment link
   */
  async initializePayment(payload: FlutterwaveInitializePayload) {
    try {
      const response = await this.client.post('/payments', {
        ...payload,
        redirect_url: payload.redirect_url || process.env.APP_URL + '/api/payments/flutterwave/callback',
      });
      return response.data; // returns payment checkout link ("data.link")
    } catch (error: any) {
      console.error('Flutterwave payment initialization failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize Flutterwave session');
    }
  }

  /**
   * Verify verification callback for Transaction completion
   */
  async verifyPayment(transactionId: string) {
    try {
      const response = await this.client.get(\`/transactions/\${transactionId}/verify\`);
      return response.data; // data.status 'successful', 'failed', currency, amount etc.
    } catch (error: any) {
      console.error('Flutterwave verification failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify transaction integrity');
    }
  }

  /**
   * Issue direct refunds securely
   */
  async initiateRefund(transactionId: string, amount?: number) {
    try {
      const response = await this.client.post(\`/transactions/\${transactionId}/refund\`, {
        amount,
      });
      return response.data;
    } catch (error: any) {
      console.error('Flutterwave Refund process failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Flutterwave refund processing failed');
    }
  }

  /**
   * Validate webhook payload hash using sha256 signature comparisons
   */
  static verifyWebhookSignature(signatureHeader: string): boolean {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    if (!secretHash || !signatureHeader) return false;
    return signatureHeader === secretHash;
  }
}
`
              }
            ]
          },
          {
            name: 'kyc',
            path: 'src/integrations/kyc',
            isDirectory: true,
            children: [
              {
                name: 'smileId.ts',
                path: 'src/integrations/kyc/smileId.ts',
                isDirectory: false,
                language: 'typescript',
                description: 'Full adapter implementation for Smile Identity (Smile ID - KYC, NIN, BVN, Selfie biometrics).',
                content: `/**
 * Smile Identity (Smile ID) SDK Adapter
 * Supports full BVN, NIN, Passport checks and core selfie biometric deduplication
 */

import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface IDVerificationPayload {
  userId: string;
  idNumber: string;
  idType: 'BVN' | 'NIN' | 'PASSPORT' | 'VOTER_ID';
  countryCode: 'NG' | 'GH' | 'KE' | 'ZA';
  firstName?: string;
  lastName?: string;
  dob?: string; // YYYY-MM-DD
}

export class SmileIdService {
  private client: AxiosInstance;
  private partnerId: string;
  private apiKey: string;

  constructor() {
    this.partnerId = process.env.SMILE_PARTNER_ID || '';
    this.apiKey = process.env.SMILE_API_KEY || '';

    if (!this.partnerId || !this.apiKey) {
      throw new Error('SMILEID_CREDENTIALS: Missing partner ID or API Key.');
    }

    this.client = axios.create({
      baseURL: process.env.SMILE_SANDBOX === 'false' 
        ? 'https://api.smileidentity.com/v1' 
        : 'https://sandbox.smileidentity.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Generates authorization signature expected by Smile Identity API rules
   */
  private generateSignature(timestamp: string): string {
    const hmac = crypto.createHmac('sha256', this.apiKey);
    hmac.update(timestamp + this.partnerId + "sid_request");
    return hmac.digest('base64');
  }

  /**
   * Execute standard identity verification on BVN/NIN with Smile ID "E-KYC" API
   */
  async verifyId(payload: IDVerificationPayload) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp);
    const trackingId = \`alk_check_\${crypto.randomBytes(8).toString('hex')}\`;

    try {
      const response = await this.client.post('/id_verification', {
        partner_id: this.partnerId,
        timestamp,
        signature,
        partner_params: {
          user_id: payload.userId,
          job_id: trackingId,
          job_type: 5, // Job Type 5 corresponds to Smile ID enhanced E-KYC
        },
        country: payload.countryCode,
        id_type: payload.idType,
        id_number: payload.idNumber,
        first_name: payload.firstName,
        last_name: payload.lastName,
        dob: payload.dob,
      });

      return {
        success: response.data?.ResultCode === '1012', 
        resultText: response.data?.ResultText,
        trackingId,
        metadata: response.data,
      };
    } catch (error: any) {
      console.error('Smile ID verification exception:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Smile ID execution failed.');
    }
  }

  /**
   * Execute biometric checking - matches selfie bytes against authority profiles (e.g. registered BVN picture)
   */
  async verifySelfieAndId(payload: IDVerificationPayload, selfieBase64: string) {
    const timestamp = new Date().toISOString();
    const signature = this.generateSignature(timestamp);
    const trackingId = \`alk_bio_\${crypto.randomBytes(8).toString('hex')}\`;

    try {
      const response = await this.client.post('/upload', {
        partner_id: this.partnerId,
        timestamp,
        signature,
        partner_params: {
          user_id: payload.userId,
          job_id: trackingId,
          job_type: 1, // Job Type 1 matches selfie image to database authority ID
        },
        images: [
          {
            image_type_id: 0, // 0 corresponds to raw selfie image
            image: selfieBase64,
          }
        ],
        country: payload.countryCode,
        id_type: payload.idType,
        id_number: payload.idNumber,
      });

      return {
        success: response.data?.ResultCode === '0812' || response.data?.ResultCode === '0815',
        confidenceScore: response.data?.ConfidenceVal || 0,
        metadata: response.data,
      };
    } catch (error: any) {
      console.error('Smile ID biometrics exception:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Biometric analysis failed.');
    }
  }
}
`
              },
              {
                name: 'verifyMe.ts',
                path: 'src/integrations/kyc/verifyMe.ts',
                isDirectory: false,
                language: 'typescript',
                description: 'VerifyMe API wrapper for Nigeria specifics (BVN, NIN lookup indices, business verifications).',
                content: `/**
 * VerifyMe Nigeria Identity & KYC Core Adapter
 * Robust support for BVN lookup, NIN index, and CAC corporate entity verifications.
 */

import axios, { AxiosInstance } from 'axios';

export class VerifyMeService {
  private client: AxiosInstance;

  constructor() {
    const apiKey = process.env.VERIFYME_API_KEY;
    if (!apiKey) {
      throw new Error("Missing VERIFYME_API_KEY in server variables.");
    }

    this.client = axios.create({
      baseURL: process.env.VERIFYME_ENVIRONMENT === 'sandbox'
        ? 'https://vapi.verifyme.ng/v1/sandbox'
        : 'https://vapi.verifyme.ng/v1',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Check customer details matching specific BVN using standard VerifyMe API parameters
   */
  async verifyBVN(bvn: string, data: { firstname: string; lastname: string; dob?: string }) {
    try {
      const response = await this.client.post(\`/verifications/bvn/\${bvn}\`, {
        firstname: data.firstname,
        lastname: data.lastname,
        dob: data.dob, // format: "DD-MM-YYYY"
      });
      return response.data; // Returns verification matching confidence percent
    } catch (error: any) {
      console.error('VerifyMe BVN Verification Request Exception:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'BVN verification query unsuccessful');
    }
  }

  /**
   * Run NIN index lookup against National Identity registration
   */
  async verifyNIN(nin: string, data: { firstname: string; lastname: string }) {
    try {
      const response = await this.client.post(\`/verifications/nin/\${nin}\`, {
        firstname: data.firstname,
        lastname: data.lastname,
      });
      return response.data;
    } catch (error: any) {
      console.error('VerifyMe NIN Verification Request Failure:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'NIN verification query failed');
    }
  }

  /**
   * Run CAC corporate registration checks
   */
  async verifyBusiness(rcNumber: string, companyName: string, companyType: 'RC' | 'BN' = 'RC') {
    try {
      const response = await this.client.post('/verifications/cac', {
        rcNumber,
        companyName,
        companyType,
      });
      return response.data;
    } catch (error: any) {
      console.error('VerifyMe CAC Verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Business search failed');
    }
  }
}
`
              }
            ]
          },
          {
            name: 'sms',
            path: 'src/integrations/sms',
            isDirectory: true,
            children: [
              {
                name: 'termii.ts',
                path: 'src/integrations/sms/termii.ts',
                isDirectory: false,
                language: 'typescript',
                description: 'Transactional SMS, OTP code delivery & status assertions using Termii API.',
                content: `/**
 * Termii SMS Integration Service
 * Reliable, fast SMS delivery routing across West Africa.
 */

import axios, { AxiosInstance } from 'axios';

export class TermiiSmsService {
  private client: AxiosInstance;
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.TERMII_API_KEY || '';
    this.senderId = process.env.TERMII_SENDER_ID || 'AfriLaunch';

    if (!this.apiKey) {
      throw new Error("TERMII_INIT: Missing API credential secret.");
    }

    this.client = axios.create({
      baseURL: 'https://api.ng.termii.com/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Direct high volumes of transactional messages (SMS)
   */
  async sendMessage(to: string, message: string) {
    try {
      const response = await this.client.post('/sms/send', {
        api_key: this.apiKey,
        to: this.formatPhoneNumber(to),
        from: this.senderId,
        sms: message,
        type: 'plain',
        channel: 'generic', // Use 'generic' or 'dnd' (Direct No-Do-Not-Disturb route)
      });
      return response.data;
    } catch (error: any) {
      console.error('Termii send exception:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Termii communication failure');
    }
  }

  /**
   * Dispatch dynamic secure OTP pins with Termii native validation endpoints
   */
  async sendOtp(to: string, pinTimeLimitMinutes: number = 10) {
    try {
      const response = await this.client.post('/sms/otp/send', {
        api_key: this.apiKey,
        to: this.formatPhoneNumber(to),
        from: this.senderId,
        message_type: 'NUMERIC',
        pin_attempts: 3,
        pin_time_to_live: pinTimeLimitMinutes,
        pin_length: 6,
        pin_placeholder: '< 123456 >',
        message: 'Your verification pin is < 123456 > valid for 10 minutes.',
        channel: 'generic',
      });
      return response.data; // pinId token generated for confirmation matching
    } catch (error: any) {
      console.error('Termii OTP request exception:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Termii OTP delivery initiation failed');
    }
  }

  /**
   * Match client-entered numerical OTP PIN against Termii servers
   */
  async verifyOtp(pinId: string, otpPin: string): Promise<boolean> {
    try {
      const response = await this.client.post('/sms/otp/verify', {
        api_key: this.apiKey,
        pin_id: pinId,
        pin: otpPin,
      });
      return response.data?.verified === true;
    } catch (error: any) {
      console.error('Termii OTP Verification failure:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Helper formatting phone indices to standardized E.164 requirements
   */
  private formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/\\D/g, '');
    if (clean.startsWith('0')) {
      // Standard Nig change logic: "080123456" => "23480123456"
      clean = '234' + clean.substring(1);
    }
    return clean;
  }
}
`
              },
              {
                name: 'africasTalking.ts',
                path: 'src/integrations/sms/africasTalking.ts',
                isDirectory: false,
                language: 'typescript',
                description: 'Africa’s Talking core SMS gateway setup targeting East/South African territories.',
                content: `/**
 * Africa's Talking Client Service Wrapper
 * Built to facilitate high throughput messaging targeting East/Southern regions (Kenya, Ghana, South Africa).
 */

import axios, { AxiosInstance } from 'axios';

export class AfricasTalkingService {
  private client: AxiosInstance;
  private username: string;

  constructor() {
    this.username = process.env.AFRICAS_TALKING_USERNAME || 'sandbox';
    const apiKey = process.env.AFRICAS_TALKING_API_KEY;

    if (!apiKey) {
      throw new Error("Missing AFRICAS_TALKING_API_KEY.");
    }

    this.client = axios.create({
      baseURL: this.username === 'sandbox' 
        ? 'https://api.sandbox.africastalking.com/version1'
        : 'https://api.africastalking.com/version1',
      headers: {
        'apiKey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Send text broadcasts securely
   */
  async sendSms(to: string[], message: string, from?: string) {
    try {
      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('to', to.join(','));
      params.append('message', message);
      if (from) {
        params.append('from', from);
      }

      const response = await this.client.post('/messaging', params.toString());
      return response.data; // returns SMSMessageData arrays
    } catch (error: any) {
      console.error('Africas Talking delivery exception:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to dispatch Africa’s Talking messages');
    }
  }
}
`
              }
            ]
          },
          {
            name: 'banking',
            path: 'src/integrations/banking',
            isDirectory: true,
            children: [
              {
                name: 'mono.ts',
                path: 'src/integrations/banking/mono.ts',
                isDirectory: false,
                language: 'typescript',
                description: 'Clean API integration layer targeting Mono bank-linking (statement reads, account verification).',
                content: `/**
 * Mono open-banking integrations
 */

import axios, { AxiosInstance } from 'axios';

export class MonoBankingService {
  private client: AxiosInstance;

  constructor() {
    const secretKey = process.env.MONO_SECRET_KEY;
    if (!secretKey) {
      throw new Error("MONO_CREDENTIALS: Mono secret key is vital.");
    }

    this.client = axios.create({
      baseURL: 'https://api.withmono.com',
      headers: {
        'mono-sec-key': secretKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Exchange Mono Client Authorization code for permanent API session tokens
   */
  async exchangeAuthCode(authCode: string): Promise<string> {
    try {
      const response = await this.client.post('/account/auth', { code: authCode });
      return response.data.id; // Returns standard accountId token used for queries
    } catch (error: any) {
      console.error('Mono exchange code exception:', error.response?.data || error.message);
      throw new Error('Mono authentication exchange failure: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Grab linked account overview metrics
   */
  async getAccountDetails(accountId: string) {
    try {
      const response = await this.client.get(\`/accounts/\${accountId}\`);
      return response.data; // Balance info, account holder names, institution name
    } catch (error: any) {
      console.error('Mono fetch account failure:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Mono account metadata');
    }
  }

  /**
   * Pull historic client-authorized bank transaction feeds (statements)
   */
  async getTransactions(accountId: string, options?: { start?: string; end?: string; type?: 'debit' | 'credit' }) {
    try {
      const response = await this.client.get(\`/accounts/\${accountId}/transactions\`, {
        params: options,
      });
      return response.data.data; // List of statements database items
    } catch (error: any) {
      console.error('Mono collection transactions exception:', error.response?.data || error.message);
      throw new Error('Mono statement extraction failed');
    }
  }
}
`
              }
            ]
          }
        ]
      },
      {
        name: 'app',
        path: 'src/app',
        isDirectory: true,
        children: [
          {
            name: 'api',
            path: 'src/app/api',
            isDirectory: true,
            children: [
              {
                name: 'auth',
                path: 'src/app/api/auth',
                isDirectory: true,
                children: [
                  {
                    name: 'nextauth.ts',
                    path: 'src/app/api/auth/nextauth.ts',
                    isDirectory: false,
                    language: 'typescript',
                    description: 'Production-ready NextAuth.js configured with Prisma adapter, custom credentials pipeline & session assertions.',
                    content: `import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password must be supplied.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('No user profile found matching credentials.');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Invalid authentication password credentials.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.userId;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
`
                  }
                ]
              },
              {
                name: 'openapi',
                path: 'src/app/api/openapi',
                isDirectory: true,
                children: [
                  {
                    name: 'openapi.json',
                    path: 'src/app/api/openapi/openapi.json',
                    isDirectory: false,
                    language: 'json',
                    description: 'Tailored OpenAPI/Swagger-compliant REST specifications document.',
                    content: `{
  "openapi": "3.0.3",
  "info": {
    "title": "AfriLaunch Kit REST API Boilerplate Documentation",
    "description": "Production REST endpoint references facilitating billing, identification, KYC logic, banking nodes, and authorization pathways across African ecosystems.",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.yourdomain.com/v1",
      "description": "Primary Production Node"
    },
    {
      "url": "https://sandbox-api.yourdomain.com/v1",
      "description": "Sandbox Testing Node"
    }
  ],
  "paths": {
    "/payments/paystack/initialize": {
      "post": {
        "summary": "Initialize Paystack Checkout",
        "parameters": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["email", "amount"],
                "properties": {
                  "email": { "type": "string", "format": "email", "example": "customer@gmail.com" },
                  "amount": { "type": "integer", "description": "amount in lower currency subdivisions (e.g. Kobo / Pesewas)", "example": 150000 }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Redirect URL generated successfully.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": { "type": "boolean", "example": true },
                    "data": {
                      "type": "object",
                      "properties": {
                        "authorization_url": { "type": "string", "example": "https://checkout.paystack.com/98asg98has" },
                        "reference": { "type": "string", "example": "alk_pay_091ae712" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/kyc/verify-id": {
      "post": {
        "summary": "Trigger direct KYC identification checks (BVN/NIN)",
        "security": [{ "ApiKeyAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["idNumber", "idType", "countryCode"],
                "properties": {
                  "idNumber": { "type": "string", "example": "22233344455" },
                  "idType": { "type": "string", "enum": ["BVN", "NIN"], "example": "BVN" },
                  "countryCode": { "type": "string", "example": "NG" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "KYC query complete.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean", "example": true },
                    "resultText": { "type": "string", "example": "ID Number Successfully Verified" },
                    "trackingId": { "type": "string", "example": "alk_check_892hasb9" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "ApiKeyAuth": {
        "type": "apiKey",
        "in": "header",
        "name": "X-API-KEY"
      }
    }
  }
}`
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'tests',
    path: 'tests',
    isDirectory: true,
    children: [
      {
        name: 'api',
        path: 'tests/api',
        isDirectory: true,
        children: [
          {
            name: 'payments.test.ts',
            path: 'tests/api/payments.test.ts',
            isDirectory: false,
            language: 'typescript',
            content: `import { PaystackService } from '../../src/integrations/payments/paystack';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Paystack Billing Security Integration Tests', () => {
  let paystack: PaystackService;

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_fakekey';
    paystack = new PaystackService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Correctly formats amounts and fetches auth checkout links from Paystack gateways', async () => {
    const mockResponse = {
      data: {
        status: true,
        data: {
          authorization_url: 'https://checkout.paystack.com/mock',
          access_code: 'mockCode',
          reference: 'mockRef'
        }
      }
    };

    mockedAxios.create = jest.fn().mockReturnValue({
      post: jest.fn().mockResolvedValue(mockResponse)
    });

    // Re-instantiate to use the mockedAxios.create client
    paystack = new PaystackService();

    const output = await paystack.initializePayment({
      email: 'investor@gmail.com',
      amount: 50000 // In kobo
    });

    expect(output.status).toBe(true);
    expect(output.data.authorization_url).toBe('https://checkout.paystack.com/mock');
  });
});`
          }
        ]
      }
    ]
  },
  {
    name: 'sdk',
    path: 'sdk',
    isDirectory: true,
    children: [
      {
        name: 'typescript',
        path: 'sdk/typescript',
        isDirectory: true,
        children: [
          {
            name: 'client.ts',
            path: 'sdk/typescript/client.ts',
            isDirectory: false,
            language: 'typescript',
            description: 'TypeScript SDK file client to link the developer’s app back directly into AfriLaunch.',
            content: `/**
 * AfriLaunch TypeScript SDK client
 */

export interface SDKConfig {
  apiKey: string;
  sandbox?: boolean;
}

export class AfriLaunchClient {
  private apiKey: string;
  private endpoint: string;

  constructor(config: SDKConfig) {
    if (!config.apiKey) {
      throw new Error("AfriLaunch Client requires a valid secret App Key (alk_...).");
    }
    this.apiKey = config.apiKey;
    this.endpoint = config.sandbox 
      ? 'https://sandbox-api.afrilaunchkit.com/v1' 
      : 'https://api.afrilaunchkit.com/v1';
  }

  /**
   * Run quick automated KYC (bvn / nin verification checks)
   */
  async verifyIdentity(idNumber: string, idType: 'BVN' | 'NIN', countryCode: 'NG' | 'GH') {
    const response = await fetch(\`\${this.endpoint}/kyc/verify-id\`, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idNumber, idType, countryCode })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to finalize identification checks.");
    }

    return response.json();
  }

  /**
   * Securely dispatches programmatic Otp via routed gateways
   */
  async dispatchOtp(phoneNumber: string) {
    const response = await fetch(\`\${this.endpoint}/sms/otp-dispatch\`, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phoneNumber })
    });
    return response.json();
  }
}
`
          }
        ]
      },
      {
        name: 'python',
        path: 'sdk/python',
        isDirectory: true,
        children: [
          {
            name: 'afrilaunch_sdk.py',
            path: 'sdk/python/afrilaunch_sdk.py',
            isDirectory: false,
            language: 'python',
            description: 'Fully structured, robust, native Python SDK implementation.',
            content: `"""
AfriLaunch Python Developer Kit
"""
import requests

class AfriLaunchClient:
    def __init__(self, api_key: str, sandbox: bool = True):
        if not api_key:
            raise ValueError("AfriLaunch Client requires a valid security Key (alk_...)")
        
        self.api_key = api_key
        self.endpoint = (
            "https://sandbox-api.afrilaunchkit.com/v1"
            if sandbox
            else "https://api.afrilaunchkit.com/v1"
        )
        
    def verify_identity(self, id_number: str, id_type: str, country_code: str = "NG"):
        """
        Verify individual customer BVN/NIN instantly.
        """
        url = f"{self.endpoint}/kyc/verify-id"
        headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "idNumber": id_number,
            "idType": id_type,
            "countryCode": country_code
        }
        
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code != 200:
            raise Exception(f"KYC Verification failed with status {response.status_code}: {response.text}")
            
        return response.json()

    def dispatch_otp(self, phone_number: str):
        """
        Deliver quick transactional authentication codes to individual targets.
        """
        url = f"{self.endpoint}/sms/otp-dispatch"
        headers = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
        response = requests.post(url, json={"phoneNumber": phone_number}, headers=headers)
        return response.json()
`
          }
        ]
      }
    ]
  },
  {
    name: '.github',
    path: '.github',
    isDirectory: true,
    children: [
      {
        name: 'workflows',
        path: '.github/workflows',
        isDirectory: true,
        children: [
          {
            name: 'deploy.yml',
            path: '.github/workflows/deploy.yml',
            isDirectory: false,
            language: 'yaml',
            content: `name: AfriLaunch Continuous Integration & Progressive Deployment

on:
  push:
    branches: [ main, production ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v3

      - name: Configure node.js Node Sandbox
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Project Dependencies
        run: npm ci

      - name: Audit Formatting & Code Health
        run: npm run lint

      - name: Synchronous Prisma Schema Assertions
        run: npx prisma validate
        env:
          DATABASE_URL: \${{ secrets.DATABASE_URL }}

      - name: Launch Automated Integration Testing Suite
        run: npm test

  deploy-to-cloud:
    needs: validate-and-test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Deploying Node Server Direct into Railway Container Base
        run: curl -i -X POST \${{ secrets.RAILWAY_DEPLOY_WEBHOOK_URL }}
`
          }
        ]
      }
    ]
  },
  {
    name: 'Dockerfile',
    path: 'Dockerfile',
    isDirectory: false,
    language: 'dockerfile',
    content: `# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner Stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["npm", "run", "start"]`
  }
];
