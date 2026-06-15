import { DocPage } from '../types';

export const DOCS_CONTENT: DocPage[] = [
  {
    id: 'installation',
    title: '1. Installation Guide',
    category: 'Getting Started',
    purpose: 'Get AfriLaunch Kit installed, database seeded, and server running in under 5 minutes.',
    architecture: `
+-------------------------------------------------------------+
|                     AL_CLIENT (DEVELOPER ADAPTER)           |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                AFRILAUNCH CONTROLLER ENGINE                 |
|       +----------------- NEXT.JS FRAMEWORK ----------------+ |
+-------------------------------------------------------------+
          |                    |                  |
          v                    v                  v
    [Paystack API]       [SmileID KYC]       [SMS Service]
`,
    steps: [
      'Extract the AfriLaunch Kit ZIP package or clone your private GitHub Repository.',
      'Run npm install (or pnpm/yarn install) from your root project terminal directories.',
      'Copy .env.example to a new .env file: cp .env.example .env and supply your connection details.',
      'Run npx prisma db push to synchronize database tables and structures in Postgres.',
      'Launch development server instantly using npm run dev and inspect at http://localhost:3000.'
    ],
    codeExample: `// Quick Initialization & Verification CLI script
# Clone & install dependencies
$ npm install

# Provision db tables
$ npx prisma generate
$ npx prisma db push

# Launch development environment (Vite/Next.js routes)
$ npm run dev`,
    commonErrors: [
      'Error: PrismaClientInitializationError: Fix by updating the DATABASE_URL environment schema to point to a running, accessible PostgreSQL database.',
      'ModuleNotFoundError: Common compilation error. Run npm install again to resolve any missing node_modules or uncompleted transfers.'
    ],
    bestPractices: [
      'Always utilize standard package-lock.json configurations during install phases to avoid package drift.',
      'Use nodemon or tsx watch files for server auto-reload systems during backend development.'
    ]
  },
  {
    id: 'environment',
    title: '2. Environment Variables',
    category: 'Getting Started',
    purpose: 'Verify variable properties and setup keys securely to connect with individual providers.',
    architecture: `
+-----------------------------------------------------------------+
|                       OS SHELL / .ENV CONTAINER                 |
+-----------------------------------------------------------------+
          | (Decrypts variables)
          v
+-----------------------------------------------------------------+
|                           NEXTAUTH & PRISMA                     |
+-----------------------------------------------------------------+
          | (Initializes adaptors with secure local credentials)
          v
+-----------------------------------------------------------------+
|               PAYSTACK, SMILE ID, MONO, TERMII SERVICES         |
+-----------------------------------------------------------------+
`,
    steps: [
      'Locate and edit .env in your physical project root directory.',
      'Replace PLACEHOLDER keys with verified Sandbox credentials from individual carrier dashboards.',
      'Verify NEXTAUTH_SECRET is configured with high entropy: openssl rand -base64 32.',
      'Check APP_URL is correctly matched (e.g. http://localhost:3000 in dev or https://api.yourdomain.com in prod).'
    ],
    codeExample: `# Core Database Credentials
DATABASE_URL="postgresql://postgres:secret@localhost:5432/afrilaunch_db?schema=public"

# Auth.js Secrets
NEXTAUTH_SECRET="v9bAas8haSF9YHa9SH98AhsF98ahs987HAsg9"
NEXTAUTH_URL="http://localhost:3000"

# Payments Configs
PAYSTACK_PUBLIC_KEY="pk_test_a09187a6bcae8d712ce6e..."
PAYSTACK_SECRET_KEY="sk_test_109287abcdef9e0129bc..."
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-90ab128796..."
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-abcdef123..."
FLUTTERWAVE_SECRET_HASH="my_webhook_secret_hash_value"

# KYC Adapters
SMILE_PARTNER_ID="partner_98124"
SMILE_API_KEY="sk_smile_0291abc89e1..."
SMILE_SANDBOX="true"
VERIFYME_API_KEY="vm_test_abc1293a102bc..."

# SMS Credentials
TERMII_API_KEY="tl_test_029abc819..."
TERMII_SENDER_ID="AfriLaunch"
AFRICAS_TALKING_USERNAME="sandbox"
AFRICAS_TALKING_API_KEY="at_sk_abc0918..."`,
    commonErrors: [
      'Error: Missing credentials for PAYSTACK/FLW: Verify that the exact keys match the names listed in AfriLaunch configuration scripts.',
      'Database connection timeout: Check your db host address is correct and firewall/Docker port mappings are properly exposed.'
    ],
    bestPractices: [
      'Never commit real environment secrets directly to Github. Always secure with Environment Secrets.',
      'Segregate dev keys from prod dashboard namespaces strictly.'
    ]
  },
  {
    id: 'deployment',
    title: '3. Deployment Guide',
    category: 'Production',
    purpose: 'Deploy production-grade Docker containers to Railway, Render, DigitalOcean VPS, or Vercel with zero-configuration workflows.',
    architecture: `
+------------------+     +------------------+     +------------------+
|    Vercel Hub    |     |   Railway App    |     |  DigitalOcean    |
| (Frontend Pages) |     |  (Worker/Server) |     |  (VPS / Docker)  |
+------------------+     +------------------+     +------------------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                                  v
                    [PostgreSQL cloud instance]
`,
    steps: [
      'Log into Railway/Vercel console and verify database options.',
      'Deploy the compiled Nest app via Vercel for fast geo-cached servers or Railway via Git-triggers.',
      'Utilize our production-grade Dockerfile to deploy directly onto DigitalOcean Droplets or CapRover VPS systems.',
      'Run migrations on startup inside VPS setups: npx prisma migrate deploy.'
    ],
    codeExample: `# VPS Manual Deploy Commands
$ docker build -t afrilaunch-app .
$ docker run -d -p 3000:3000 --env-file .env afrilaunch-app

# Run runtime schema migrations directly
$ npx prisma migrate deploy`,
    commonErrors: [
      'Railway: Build Out of Memory. Remedy: increase the build memory limit allocations from 512MB to 1GB if compiling complex Next.js bundles.',
      'Database Sync Failure: Confirm database instances are live and fully reachable from your container cluster.'
    ],
    bestPractices: [
      'Use volume mounting protocols if hosting databases in-house inside the VPS.',
      'Verify Cloud CDN capabilities across Africa (e.g. Cloudflare) to optimize latency for local users.'
    ]
  },
  {
    id: 'auth',
    title: '4. Authentication Guide',
    category: 'Core Features',
    purpose: 'Understand Credentials system, Google OAuth setups, and Role-Based Access Control configuration.',
    architecture: `
+------------------+       +-------------------+       +--------------------+
|   User Browser   | ----> | NextAuth Middleware| ----> | User Authorization |
|  (Client Session)|       |  (Validate Token) |       |  (Owner/Admin/Dev) |
+------------------+       +-------------------+       +--------------------+
                                      |
                                      v
                             [Prisma DB session]
`,
    steps: [
      'Configure AuthProviders inside NextAuth configurations using PrismaAdapter instances.',
      'Register callback URLs on google developer credentials dashboard for OAuth flows.',
      'Use role authorization middlewares inside api routes to secure sensitive metrics.',
      'Fetch authentication profiles within Client JSX using standard useSession hooks.'
    ],
    codeExample: `// Check session scopes inside React Page
import { useSession, signIn } from 'next-auth/react';

export default function SecurityPage() {
  const { data: session, status } = useSession({ required: true });

  if (status === 'loading') return <p>Loading credentials...</p>;
  
  return (
    <div>
      <h1>Welcome back, {session?.user?.email}</h1>
      <p>Role authorization tier: {session?.user?.role}</p>
    </div>
  );
}`,
    commonErrors: [
      'Error: Invalid callback URL on OAuth flow: Confirm redirect URIs on Google API developer dashboards match exact http endpoints.',
      'JWT decryption failure: Generate secondary NextAuth secret with high entropy metrics.'
    ],
    bestPractices: [
      'Store minimum identity claims inside tokens (avoid caching heavy files / large profiles inside JWT tokens).',
      'Consistently enforce server actions checks on sensitive mutate queries.'
    ]
  },
  {
    id: 'payments',
    title: '5. Payments Adapter',
    category: 'African Integrations',
    purpose: 'Complete walkthrough on establishing Paystack and Flutterwave connections, recurring subscriptions, and secure verified webhooks.',
    architecture: `
+---------------------+     +-----------------+     +-----------------+
|   Launch Checkout   | --> | Paystack Popup  | --> | Webhook Trigger |
| (Initiate Payment)  |     |  (User Payment) |     |  (Verify & Save)|
+---------------------+     +-----------------+     +-----------------+
                                                             |
                                                             v
                                                    [Authorize Account]
`,
    steps: [
      'Initialize Paystack checkout payloads via client gateways.',
      'Verify payments by querying references inside security route headers.',
      'Process subscriptions by syncing plans inside Paystack accounts dashboards.',
      'Use HMAC SHA512 header hashes to verify webhook deliveries.'
    ],
    codeExample: `// Paystack payment initialization example inside Next.js API Routes
import { PaystackService } from '@/src/integrations/payments/paystack';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paystack = new PaystackService();
    
    // Amount must be multiplied to lowest unit (kobo/pesewas)
    const checkout = await paystack.initializePayment({
      email: body.email,
      amount: body.amount * 100, // e.g. 500 NGN => 50000 kobo
      callback_url: \`\${process.env.APP_URL}/api/checkout/callback\`,
    });

    return Response.json(checkout);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}`,
    commonErrors: [
      'Error: Paystack signature mismatch: Double check webhooks hash keys match standard Paystack credentials.',
      'Double charging users: Ensure check logic is fully unique on database transaction refs.'
    ],
    bestPractices: [
      'Save webhook histories inside audit logs databases to monitor and retry any missed messages.',
      'Always use sandbox mode tests during API implementation setups.'
    ]
  },
  {
    id: 'kyc',
    title: '6. KYC Adapters',
    category: 'African Integrations',
    purpose: 'Utilize Smile ID and VerifyMe adapters to verify BVN and NIN instantly, matching registrations or running biometric assessments.',
    architecture: `
+-------------------+      +------------------+      +-------------------+
| Check BVN / NIN   | ---> | SmileID API Eng  | ---> | National Archives |
|  Input Credentials|      | (E-KYC Service)  |      |  (NIMC/NIBSS DB)  |
+-------------------+      +------------------+      +-------------------+
                                                              |
                                                              v
                                                    [Return Match Payload]
`,
    steps: [
      'Choose selected verification adapter (Smile ID or VerifyMe) and confirm API Sandbox status.',
      'Create structured payload containing verification code (BVN/NIN), full names, and date of births.',
      'Use adapter verifyId() method inside endpoints to verify against registry records.',
      'Store tracking token references for future transaction/audit queries.'
    ],
    codeExample: `// Standard verification endpoint inside Express/Next.js API route
import { SmileIdService } from '@/src/integrations/kyc/smileId';

export async function POST(req: Request) {
  try {
    const { idNumber, idType, userId } = await req.json();
    const smile = new SmileIdService();
    
    const result = await smile.verifyId({
      userId,
      idNumber,
      idType, // 'BVN' or 'NIN'
      countryCode: 'NG'
    });

    return Response.json({ verified: result.success, details: result.resultText });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}`,
    commonErrors: [
      'Verification returned "ResultCode: 1014" (ID dataMismatch): Check formatting on client profiles, especially exact spellings of first/last names.',
      'BVN verify timeout: NIBSS database latency is common in Africa. Employ elegant client reattempts or error fallbacks.'
    ],
    bestPractices: [
      'Observe regulatory rules matching compliance storage constraints (never keep raw, undecrypted client NIN/BVN numbers on plaintext servers).',
      'Mask critical fields on response logs.'
    ]
  },
  {
    id: 'sms',
    title: '7. SMS Guide & Gateway',
    category: 'African Integrations',
    purpose: 'Deploy reliable transactional communications across West/East Africa via Termii, Africa’s Talking, and Twilio gateways.',
    architecture: `
+------------------------+      +--------------------+      +--------------------+
| Transaction Completed  | ---> |   Termii Gateway   | ---> |   User Phone UI    |
|   (Dispatch SMS event) |      | (Africa's Talking) |      | (Direct SMS Alert) |
+------------------------+      +--------------------+      +--------------------+
                                           |
                                           v
                                  [Check DND Status]
`,
    steps: [
      'Initialize Termii wrapper using verified authorization keys.',
      'Ensure client target phone contains absolute international prefixes (e.g. "234..." for Nigeria instead of "0...").',
      'Trigger fast-route generic channels for critical transaction updates (OTPs).',
      'Monitor status callback requests to verify absolute message deliveries.'
    ],
    codeExample: `// Initializing Termii Wrapper to broadcast SMS notifications
import { TermiiSmsService } from '@/src/integrations/sms/termii';

export async function sendDeliveryNotification(phone: string, orderId: string) {
  const messenger = new TermiiSmsService();
  const msg = \`Your order #\${orderId} is out for delivery! Track item details inside portal.\`;
  
  const receipt = await messenger.sendMessage(phone, msg);
  return receipt;
}`,
    commonErrors: [
      'SMS delivery failed on DND numbers: Termii generic channel will fail. Switch default routes to "dnd" channel configurations for transactional pins.',
      'Phone formatting exceptions: Translate standard phone indices securely to E.164 formats on input.'
    ],
    bestPractices: [
      'Implement quick, secure, in-memory rate-limiting triggers on SMS pathways to limit abuse vectors.',
      'Monitor daily SMS wallet credit thresholds using automated alerts.'
    ]
  },
  {
    id: 'banking',
    title: '8. Banking APIs Core',
    category: 'African Integrations',
    purpose: 'Link customer accounts, fetch transaction histories, and analyze income metrics using Mono or Okra.',
    architecture: `
+-----------------------+     +------------------+     +--------------------+
|  User Account Links   | --> | Mono Widget Flow | --> | Fetch Ledger Data  |
|  (Authorize via bank) |     |  (Connect Auth)  |     | (Statements/Trans) |
+-----------------------+     +------------------+     +--------------------+
                                                                 |
                                                                 v
                                                        [Calculate Analytics]
`,
    steps: [
      'Mount Mono interactive Connect widgets inside React components to collect client codes.',
      'Send collected authentication code to Mono API route exchanges to save permanent token codes.',
      'Query detailed transactions list or core profile schemas using security identifiers.',
      'Generate balance checks or ledger audit models using account details queries.'
    ],
    codeExample: `// Account Exchange and details lookups
import { MonoBankingService } from '@/src/integrations/banking/mono';

export async function linkNewBankAccount(authCode: string) {
  const service = new MonoBankingService();
  
  // Exchange code
  const accountId = await service.exchangeAuthCode(authCode);
  
  // Fetch details
  const info = await service.getAccountDetails(accountId);
  return { accountId, info };
}`,
    commonErrors: [
      'Account disconnected: Customer credential changes at linked bank require prompt Connect widget relaunch actions.',
      'Statement fetching takes to much time: Mono processes historical data in stages. Subscribe to incoming statement webhook events.'
    ],
    bestPractices: [
      'Regularly scrub and encrypt statement exports to shield database schemas.',
      'Limit connection re-attempts to safeguard bank metrics.'
    ]
  },
  {
    id: 'teams',
    title: '9. Teams & Organizations',
    category: 'Core Features',
    purpose: 'Enable multiple developer seats, organization parameters, multi-tenant schemas, and role permissions checks.',
    architecture: `
+-------------------------+      +-------------------------+
|     User Profile        | ---> |      Organization       |
|    (Unique User)        |      | (SaaS Billing Entity)   |
+-------------------------+      +-------------------------+
             |                                |
             +--------------+-----------------+
                            |
                            v
               [OrganizationMember Interface]
                (Owner, Admin, Dev, Support)
`,
    steps: [
      'Define unified Organizations wrapping User profiles inside database arrays.',
      'Establish dynamic permissions boundaries checking roles (Owner, Admin, Developer, Support).',
      'Create secure invitations tokens to onboard additional team members.',
      'Check tenant boundaries strictly across all database query pathways.'
    ],
    codeExample: `// Schema verification wrapper for multi-tenant controllers
import { prisma } from '@/src/lib/prisma';

export async function getTenantResources(orgId: string, callingUserId: string) {
  const member = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: { organizationId: orgId, userId: callingUserId }
    }
  });

  if (!member) {
    throw new Error("Access Denied: You do not belong to this organization.");
  }

  return prisma.transaction.findMany({
    where: { metadata: { path: { equals: orgId } } }
  });
}`,
    commonErrors: [
      'Cross-organization leakage: Avoid broad SELECT queries without explicit organizationId parameters.',
      'Invitation link expiry failures: Set token life variables on creation schemas.'
    ],
    bestPractices: [
      'Construct tight relational schemas in Prisma incorporating cascade deleted dependencies on Org removal.',
      'Routinely log team administration update operations inside audit databases.'
    ]
  },
  {
    id: 'rest_api',
    title: '10. API Schema & Sandbox',
    category: 'Developer Experience',
    purpose: 'Expose OpenAPI schemas, secure API paths with keys, and integrate testing paradigms during development.',
    architecture: `
+--------------------------+      +-------------------------+      +-------------------------+
|    Developer Endpoint    | ---> |   X-API-KEY Middleware  | ---> |   Core Microservice     |
|   (Request with key)     |      |  (Compare DB keyHash)   |      |  (Payments/KYC/Utility) |
+--------------------------+      +-------------------------+      +-------------------------+
`,
    steps: [
      'Generate API pairs containing readable secret keys using high entropy hashes before DB entries.',
      'Mount API security authorization routers on global path contexts.',
      'Provide interactive Swagger UI nodes incorporating OpenAPI.json specifications document.',
      'Validate queries using standard automation testing schemas.'
    ],
    codeExample: `// Custom Route interceptor executing key checks inside Next.js Routes
import { prisma } from '@/src/lib/prisma';
import crypto from 'crypto';

export async function authorizeApiKey(req: Request) {
  const headerKey = req.headers.get('X-API-KEY');
  if (!headerKey) return null;

  // Key is in format "alk_live_abcdef123"
  const hash = crypto.createHash('sha256').update(headerKey).digest('hex');
  
  const keyMatch = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { organization: true, user: true }
  });

  if (!keyMatch || !keyMatch.active) return null;
  return keyMatch;
}`,
    commonErrors: [
      'CORS Denied API triggers: Allow custom domain connections inside CORS express parameters.',
      'API call throttle failure: Implement Redis rate limit tokens.'
    ],
    bestPractices: [
      'Include clear response schema details in error exceptions.',
      'Consistently version standard API route changes (e.g., /v1, /v2).'
    ]
  }
];
