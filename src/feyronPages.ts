export interface FeyronPageSection {
  kicker?: string;
  heading: string;
  body?: string[];
  bullets?: { title?: string; text: string; linkText?: string; linkHref?: string }[];
  steps?: { num: string; title: string; text: string }[];
  note?: string;
  ctaText?: string;
  ctaAction?: 'contact' | 'audit' | string;
}

export interface FeyronPageData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  headline: string;
  subheading?: string;
  sections: FeyronPageSection[];
  closingLine?: string;
  primaryCta: { label: string; action: 'contact' | 'audit' | string };
  isProductsPage?: boolean;
  isContactPage?: boolean;
}

export const FEYRON_PAGES: Record<string, FeyronPageData> = {
  solutions: {
    slug: 'solutions',
    title: 'Solutions',
    metaTitle: 'Solutions | Feyron',
    metaDescription:
      'AI automation, websites and platforms, integrations and payments. Fixed-scope projects from Feyron, with support after launch.',
    kicker: 'Solutions overview',
    headline: 'What we build',
    subheading:
      'Feyron has three divisions. Each is its own project with a clear scope, a fixed price and a defined finish line. You can buy one, combine them, or add an agent to a website or platform later.',
    sections: [
      {
        kicker: 'Three launch divisions',
        heading: 'Choose one division, or combine them',
        bullets: [
          {
            title: 'AI automation.',
            text: 'Agents that take repetitive work off your team: customer enquiries and follow-ups, document processing, onboarding, reporting and internal assistants.',
            linkText: 'Explore AI automation →',
            linkHref: '/ai-automation',
          },
          {
            title: 'Websites and platforms.',
            text: 'Business websites, real estate platforms, school portals, church hubs, online stores, booking systems, web apps and marketplaces — all built with automation around how you operate.',
            linkText: 'Explore websites and platforms →',
            linkHref: '/websites-platforms',
          },
          {
            title: 'Integrations and payments.',
            text: 'API, CRM and WhatsApp connections, payment checkout and payouts, and stablecoin payments through licensed providers.',
            linkText: 'Explore integrations and payments →',
            linkHref: '/integrations-payments',
          },
        ],
      },
      {
        kicker: 'Sector websites + built-in automation',
        heading: 'Websites that do the work, not just look good',
        bullets: [
          {
            title: 'Real estate platforms.',
            text: 'Property listings and search paired with automated WhatsApp/email lead qualification, instant inspection booking, and buyer/tenant intake.',
          },
          {
            title: 'School & educational portals.',
            text: 'School website and student/parent portal with online admission registration, fee payment and auto-receipts, grade notifications, and parent broadcasts.',
          },
          {
            title: 'Church & faith hubs.',
            text: 'Church website and sermon hub with online tithes/offerings, automated first-timer welcome messages, event registration, and member updates.',
          },
          {
            title: 'Commercial & professional sites.',
            text: 'Online stores, clinics, and service portals with automated appointment booking, invoicing, inventory sync, and client onboarding.',
          },
        ],
      },
      {
        kicker: 'Not sure where to start?',
        heading: 'Start with a workflow audit',
        body: [
          'We spend a few days mapping one process, find where time is lost, and give you a written plan with a scope and a price. If you decide to build with us within 30 days, the audit fee counts towards the project.',
        ],
        ctaText: 'Book a workflow audit',
        ctaAction: 'contact',
      },
      {
        kicker: 'After launch',
        heading: 'We stay after launch',
        body: [
          'Every system we build can come with a monthly care plan: monitoring, fixes, small improvements and a monthly report on what it is saving you.',
        ],
      },
    ],
    primaryCta: { label: 'Book a workflow audit', action: 'contact' },
  },

  'ai-automation': {
    slug: 'ai-automation',
    title: 'AI Automation',
    metaTitle: 'AI automation | Feyron',
    metaDescription:
      'AI agents that handle customer enquiries, documents, onboarding and reporting, with people approving what matters.',
    kicker: 'Division 01 · AI Automation',
    headline: 'Agents that take repetitive work off your team.',
    subheading:
      'We find one repetitive workflow and build an agent that does it reliably, using your own tools and your own information.',
    sections: [
      {
        kicker: 'What an agent does',
        heading: 'One job, with clear limits',
        body: [
          'A chatbot answers questions. An agent can understand a request, look things up, use the tools you approve, take action and report back. It does one job, with clear limits.',
        ],
      },
      {
        kicker: 'What we automate',
        heading: 'Workflows we build for your team',
        bullets: [
          {
            title: 'Customer enquiries and follow-ups.',
            text: 'Capture messages from WhatsApp, email and your website, record the details, draft replies for approval and schedule the next reminder.',
          },
          {
            title: 'Documents.',
            text: 'Read invoices, forms and applications, extract the fields, check them against your rules and send anything uncertain to a person.',
          },
          {
            title: 'Client onboarding.',
            text: 'Collect information, check documents, create records and tasks, notify your team and track what is still outstanding.',
          },
          {
            title: 'Customer operations.',
            text: 'Sort requests, find the right information, escalate urgent cases and keep an eye on unresolved ones.',
          },
          {
            title: 'Invoices and payment follow-up.',
            text: 'Prepare invoices, send reminders and help with reconciliation. Agents never make payments or change financial records without approval.',
          },
          {
            title: 'Reporting.',
            text: 'Pull information from your tools into a daily or weekly summary and flag anything unusual.',
          },
          {
            title: 'Internal assistants.',
            text: "Search your team's own documents and policies and answer questions from them.",
          },
        ],
      },
      {
        kicker: 'Ways to start',
        heading: 'Packages with a fixed scope',
        bullets: [
          {
            title: 'Workflow audit.',
            text: 'A few days of mapping, then a written plan, scope and price.',
          },
          {
            title: 'Workflow sprint.',
            text: 'One agent workflow, built and launched in two to four weeks, with integrations, approval controls, monitoring, documentation and 30 days of fixes.',
          },
          {
            title: 'Function agent.',
            text: 'One agent that owns a whole business function, such as sales follow-up, customer support or operations.',
          },
          {
            title: 'Business agent suite.',
            text: 'Three to five connected agent workflows with a shared dashboard and reporting.',
          },
          {
            title: 'Custom agent system.',
            text: 'A tailored AI application built to a signed specification.',
          },
        ],
      },
      {
        kicker: 'What every agent comes with',
        heading: 'Built-in safety and control',
        body: [
          'Clear permissions, approval before sensitive actions, a record of every action, spending limits, a manual fallback and an off switch.',
        ],
        ctaText: 'Read about responsible AI →',
        ctaAction: '/responsible-ai',
      },
    ],
    closingLine: 'We would rather automate one thing properly than ten things badly.',
    primaryCta: { label: 'Book a workflow audit', action: 'contact' },
  },

  'websites-platforms': {
    slug: 'websites-platforms',
    title: 'Websites & Platforms',
    metaTitle: 'Websites and platforms | Feyron',
    metaDescription:
      'Business websites, real estate platforms, school portals, church hubs, online stores and custom software with built-in automation.',
    kicker: 'Division 02 · Websites & Platforms',
    headline: 'Software built around how you operate.',
    subheading:
      'From a clear business website to a full sector platform, we design and build what you need — with built-in automation, a fixed scope and a launch date.',
    sections: [
      {
        kicker: 'Sector websites with built-in automation',
        heading: 'Websites and portals that run the admin for you',
        body: [
          'A website should not just sit there like a static brochure. Every website and portal we build comes wired with practical automation for your sector:',
        ],
        bullets: [
          {
            title: 'Real estate platforms + automation.',
            text: 'Property showcase and search paired with automated WhatsApp and email lead qualification, instant inspection booking, digital buyer or tenant intake, and automated agent follow-ups.',
          },
          {
            title: 'School & educational portals + automation.',
            text: 'School website and student/parent portal with automated online admissions, digital fee payment and instant receipt generation, automated result notifications, and parent broadcasts.',
          },
          {
            title: 'Church & faith organisation platforms + automation.',
            text: 'Church website and media/sermon hub with online tithe, offering and project giving, automated first-timer welcome follow-ups, event registration, and scheduled WhatsApp/SMS updates.',
          },
          {
            title: 'Commercial, clinic & service platforms + automation.',
            text: 'Online stores, clinic appointment systems and professional service portals with automated booking reminders, invoice generation, inventory sync and client onboarding.',
          },
        ],
      },
      {
        kicker: 'Core capabilities',
        heading: 'Websites, portals and custom applications',
        bullets: [
          {
            title: 'Business websites.',
            text: 'Clear pages, contact forms, a WhatsApp button and search basics, built to work well on a phone.',
          },
          {
            title: 'Online stores.',
            text: 'Product pages, checkout and payments, and an admin panel you can run yourself.',
          },
          {
            title: 'Booking systems and customer portals.',
            text: 'Let customers book, pay, upload documents and check progress without calling you.',
          },
          {
            title: 'Web apps and dashboards.',
            text: 'Management systems, reports and internal tools built around your process.',
          },
          {
            title: 'SaaS products and marketplaces.',
            text: 'Custom platforms, built in phases against a signed specification.',
          },
          {
            title: 'Redesigns.',
            text: 'Make an existing site clearer, faster and easier to manage.',
          },
        ],
      },
      {
        kicker: 'How it works',
        heading: 'Written scope and milestone delivery',
        body: [
          'Every project follows our five-step process, with a written scope, milestone payments and a technical review before launch. After launch, a monthly plan covers hosting, updates and support.',
        ],
      },
      {
        kicker: 'Add an agent',
        heading: 'An option, never a requirement',
        body: [
          'If you want one, we can add an AI agent to your site or platform to answer enquiries, take bookings or process documents. It is an option, never a requirement.',
        ],
      },
    ],
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  'integrations-payments': {
    slug: 'integrations-payments',
    title: 'Integrations & Payments',
    metaTitle: 'Integrations and payments | Feyron',
    metaDescription:
      'Connect your tools and take payments, including stablecoin payments through licensed providers. We build the software; we never hold your money.',
    kicker: 'Division 03 · Integrations & Payments',
    headline: 'Your tools, connected.',
    subheading:
      'We make the software you already use work together, and add the payment options your customers expect.',
    sections: [
      {
        kicker: 'Integrations',
        heading: 'Move information without retyping',
        bullets: [
          {
            title: 'CRM, accounting and messaging.',
            text: 'Connect WhatsApp, email, your CRM and your accounting tools so information moves without retyping.',
          },
          {
            title: 'Data syncing.',
            text: 'Keep records the same across systems.',
          },
          {
            title: 'Custom connections.',
            text: 'Build the missing link between two systems through their APIs.',
          },
        ],
      },
      {
        kicker: 'Payments',
        heading: 'Checkout, payouts and cross-border rails',
        bullets: [
          {
            title: 'Checkout and payouts.',
            text: 'Add card and bank payments, collections and payouts to your website or platform.',
          },
          {
            title: 'Stablecoin payments.',
            text: 'Accept and send stablecoin payments through licensed providers, for businesses that work across borders.',
          },
          {
            title: 'Reconciliation and reporting.',
            text: 'Match payments to orders and invoices and see clear reports.',
          },
        ],
      },
      {
        kicker: 'How we handle money',
        heading: 'We build the software; we never hold your money',
        body: [
          "We build the software. We do not hold, pool or move your customers' money, and we do not run an exchange or offer financial services. Payments go through licensed providers, and every project states who is responsible for what.",
        ],
      },
    ],
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  'how-we-work': {
    slug: 'how-we-work',
    title: 'How We Work',
    metaTitle: 'How we work | Feyron',
    metaDescription:
      'Five steps on every project: understand, design, build, review, launch and improve.',
    kicker: 'Delivery process',
    headline: 'The same five steps on every project.',
    subheading: 'So you always know what is happening and what comes next.',
    sections: [
      {
        kicker: 'The 5 steps',
        heading: 'Understand, design, build, review, launch and improve',
        steps: [
          {
            num: '01',
            title: 'Understand.',
            text: 'We learn how the work happens today and what it costs you in time, errors and missed follow-ups. We set a baseline so we can measure the improvement later.',
          },
          {
            num: '02',
            title: 'Design.',
            text: 'You get a plain-language plan: what we will build, what it connects to, where people approve, what it is not, the timeline and the price. Work starts after you sign and pay the first instalment.',
          },
          {
            num: '03',
            title: 'Build.',
            text: 'We build in small pieces and test them against real cases, including the awkward ones: missing information, duplicates, failures and unusual requests.',
          },
          {
            num: '04',
            title: 'Review.',
            text: 'A technical review checks security, permissions, spending limits, the off switch and any payment code before anything goes live.',
          },
          {
            num: '05',
            title: 'Launch and improve.',
            text: 'We connect the live systems, train your team, hand over the documentation and watch the first week closely. After that, a care plan keeps it healthy and improving.',
          },
        ],
      },
      {
        kicker: 'What done means',
        heading: 'A clear definition of finished',
        body: [
          'A project is finished when the workflow runs in production, the expected and unexpected cases are tested, failures are visible, sensitive actions need approval, your team knows how to use it, documentation and access are handed over, and the result can be measured against where you started.',
        ],
      },
      {
        kicker: 'Clear terms',
        heading: 'No surprises in scope or billing',
        bullets: [
          { text: 'Fixed scope and price for each package' },
          { text: 'Payment in stages, with the last instalment before launch' },
          { text: 'Changes outside the scope are quoted before they are built' },
          { text: 'Third-party costs, such as AI usage and messaging, are shown separately' },
          { text: 'Your accounts and data stay yours' },
        ],
      },
      {
        kicker: 'After launch: care plans',
        heading: 'Ongoing support and improvement',
        bullets: [
          {
            title: 'Essential:',
            text: 'monitoring, fixes and integration upkeep',
          },
          {
            title: 'Growth:',
            text: 'everything in Essential, plus improvement hours and a monthly results report',
          },
          {
            title: 'Managed:',
            text: 'priority support for several systems, with ongoing technical capacity',
          },
        ],
      },
    ],
    primaryCta: { label: 'Book a workflow audit', action: 'contact' },
  },

  'who-we-serve': {
    slug: 'who-we-serve',
    title: 'Who We Serve',
    metaTitle: 'Who we serve | Feyron',
    metaDescription:
      'Feyron works with small and growing businesses, startups and professionals who want less repetitive work.',
    kicker: 'Audience & sectors',
    headline: 'Built for businesses. Designed for people.',
    subheading:
      'Our best fit is a team of roughly 5 to 50 people that handles recurring customer enquiries, runs on spreadsheets, email and messaging, uses several tools that do not connect, and wants fewer manual steps.',
    sections: [
      {
        kicker: 'Businesses and organisations',
        heading: 'Teams we build for',
        bullets: [
          {
            title: 'Professional services.',
            text: 'Consultants, accountants, marketing and recruitment firms and training providers: lead intake, proposals, onboarding, documents and reporting.',
          },
          {
            title: 'Commerce and distribution.',
            text: 'Orders, customer enquiries, inventory updates and invoicing.',
          },
          {
            title: 'Logistics and field operations.',
            text: 'Dispatch, status updates and reporting.',
          },
          {
            title: 'Real estate & property firms.',
            text: 'Property platforms with automated WhatsApp/email lead qualification, inspection scheduling, and digital buyer or tenant intake.',
          },
          {
            title: 'Schools & educational institutions.',
            text: 'School websites and student/parent portals with automated admission workflows, fee payments and instant receipts, result alerts and parent broadcasts.',
          },
          {
            title: 'Churches & faith organisations.',
            text: 'Church hubs with online tithe and offering collections, automated visitor follow-ups, event registration and member communications.',
          },
          {
            title: 'Startups and technology companies.',
            text: 'Build faster than you can hire, with custom applications, integrations and AI systems.',
          },
          {
            title: 'Fintech companies.',
            text: 'Payment workflows, reconciliation and integrations, scoped carefully.',
          },
        ],
      },
      {
        kicker: 'Professionals and individuals',
        heading: 'Personal workflows and assistants',
        body: [
          'Consultants, freelancers, founders and creators who juggle email, research, documents and projects. We set up personal workflows and assistants around the way you work, and we are building our own tools for this too.',
        ],
      },
      {
        kicker: 'Working with us from outside Nigeria',
        heading: 'Nigeria and international clients',
        body: [
          'We start in Nigeria and work with clients internationally, remotely. Pricing for international projects is quoted in US dollars or another agreed currency.',
        ],
      },
    ],
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  products: {
    slug: 'products',
    title: 'Products',
    metaTitle: 'Products | Feyron',
    metaDescription:
      'Feyron is building its own AI productivity tools from the problems we see repeat in client work.',
    kicker: 'Feyron products',
    headline: 'What we are building next.',
    subheading:
      'Alongside client projects, we are developing our own products. We do not build a product because it sounds interesting. We build when several businesses have the same problem and a standard solution would help them.',
    isProductsPage: true,
    sections: [
      {
        kicker: 'Areas we are exploring',
        heading: 'Standard tools from repeated business problems',
        bullets: [
          {
            title: 'Customer operations.',
            text: 'Enquiries, replies, escalation and follow-ups in one place.',
          },
          {
            title: 'Document intelligence.',
            text: 'Read, sort and check business documents.',
          },
          {
            title: 'Internal knowledge assistant.',
            text: 'Ask questions of your own documents and policies.',
          },
          {
            title: 'Workflow and approvals.',
            text: 'Requests, approvals and reminders for everyday processes.',
          },
        ],
      },
    ],
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  'responsible-ai': {
    slug: 'responsible-ai',
    title: 'Responsible AI',
    metaTitle: 'Responsible AI and security | Feyron',
    metaDescription:
      'How Feyron keeps agents limited, accountable and under your control.',
    kicker: 'Responsible AI & security',
    headline: 'Agents prepare. People decide.',
    subheading:
      'You are trusting us with your customers, your records and your reputation. These are the rules every agent we build follows.',
    sections: [
      {
        kicker: 'Three permission levels',
        heading: 'Clear boundaries for every agent',
        steps: [
          {
            num: '01',
            title: 'Read only.',
            text: 'The agent looks things up and reports.',
          },
          {
            num: '02',
            title: 'Draft for approval.',
            text: 'The agent prepares an action, such as a reply or an invoice, and a person approves it.',
          },
          {
            num: '03',
            title: 'Act within limits.',
            text: 'The agent acts alone inside strict limits, such as amounts, recipients and frequency.',
          },
        ],
        note: 'New agents start at the first or second level. Anything that moves money, deletes data, messages many people or affects decisions about people stays at approval level unless you accept the risk in writing.',
      },
      {
        kicker: 'On every agent',
        heading: 'Standard controls included on every build',
        bullets: [
          { text: 'A clear job and defined permissions' },
          { text: 'An off switch you can use at any time' },
          { text: 'Daily and monthly spending limits' },
          { text: 'A log of every action' },
          { text: 'A handover to a person when the agent is unsure' },
          { text: 'A manual fallback if the agent is switched off' },
          { text: 'Testing against real scenarios before launch and after every change' },
          {
            text: 'Protection against hidden instructions in emails and documents: outside content is treated as information, never as a command',
          },
        ],
      },
      {
        kicker: 'Your data',
        heading: 'Agreements, access control and data protection',
        body: [
          'We handle your data under a written agreement, give each client separate access, keep keys and passwords out of code, use encryption, and keep backups. We delete your data according to the agreed schedule. Where practical, your cloud accounts and data stay in your name, and we work with controlled access. We follow the Nigeria Data Protection Act and assess international requirements for clients abroad.',
        ],
      },
      {
        kicker: 'Payments & promises',
        heading: 'What we do and what we will not promise',
        body: [
          "Payments: We never hold or move your customers' money, and we only integrate with licensed providers.",
          'What we will not promise: We will not promise that an agent is always right. We promise it is tested, limited, monitored and correctable.',
        ],
      },
    ],
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  about: {
    slug: 'about',
    title: 'About',
    metaTitle: 'About Feyron',
    metaDescription:
      'Feyron is an AI productivity and technology company building practical software for businesses and professionals.',
    kicker: 'About Feyron',
    headline: 'Building better ways to work.',
    subheading:
      'Many of the systems people rely on every day are still fragmented, repetitive and harder than they need to be. Feyron is an AI productivity and technology company that builds practical software, AI agents and connected systems to change that.',
    sections: [
      {
        kicker: 'Who we are',
        heading: 'Practical software and connected systems',
        body: [
          'We bring together AI, software development, automation and modern payment and data infrastructure. We start with how the work really happens, then build what helps.',
          'We start in Nigeria and work with clients internationally. Alongside client projects, we are developing our own products from the problems we see repeat across businesses.',
          'Our vision: To build intelligent technology that makes work and everyday life more productive.',
          'Our mission: To develop practical software, AI solutions and connected digital systems that simplify complex processes and create real value.',
        ],
      },
      {
        kicker: 'What we believe',
        heading: 'Principles behind our work',
        bullets: [
          { text: 'Technology should solve real problems.' },
          { text: 'AI should be useful, accessible and practical.' },
          { text: 'Good software simplifies. It does not complicate.' },
          { text: 'Connected systems create better experiences.' },
          { text: 'Progress should be measured, not claimed.' },
          { text: 'The best products are built around the people who use them.' },
        ],
      },
      {
        kicker: 'How we are different',
        heading: 'How we operate',
        bullets: [
          { text: 'We start with the work, not a tool.' },
          { text: 'We use AI only where it helps, and ordinary software where that is more reliable.' },
          { text: 'We sell clear packages with a clear scope.' },
          { text: 'We stay after launch.' },
          { text: 'We keep a person in control.' },
        ],
      },
      {
        kicker: 'Team',
        heading: 'Founder and team',
        body: [
          '[Add real names, roles and short bios when ready. Do not use stock photos or invented profiles.]',
        ],
      },
    ],
    closingLine: 'Feyron. Technology that moves work forward.',
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  contact: {
    slug: 'contact',
    title: 'Contact',
    metaTitle: 'Contact | Feyron',
    metaDescription:
      'Tell us about the work that slows your team down. We reply with questions or an idea.',
    kicker: 'Contact Feyron',
    headline: 'Tell us about the work that slows you down.',
    subheading:
      'A short note is enough. You can also write to us directly at hello@feyron.co.',
    isContactPage: true,
    sections: [
      {
        kicker: 'Email & location',
        heading: 'Direct email and where we work',
        body: [
          'Email: hello@feyron.co',
          'Based in Lagos, Nigeria. We work with businesses, startups and professionals locally and internationally.',
          'Not sure what to build first? Start with a workflow audit and we will give you a written plan, clear scope and price before you commit to a larger build.',
        ],
      },
    ],
    primaryCta: { label: 'Send to Feyron', action: 'contact' },
  },

  privacy: {
    slug: 'privacy',
    title: 'Privacy policy',
    metaTitle: 'Privacy policy | Feyron',
    metaDescription:
      'How Feyron collects, uses and protects personal and business information under the Nigeria Data Protection Act (NDPA).',
    kicker: 'Legal · Privacy policy',
    headline: 'Privacy policy',
    subheading:
      'Effective date: 2026. This Privacy Policy explains how Feyron collects, uses, stores and protects information when you use our website, request a workflow audit or work with us on a project.',
    sections: [
      {
        kicker: '01 · Information we collect',
        heading: 'What we collect and how we receive it',
        body: [
          'We only collect the information needed to respond to your enquiries, scope and deliver projects, and keep our website running securely.',
        ],
        bullets: [
          {
            title: 'Enquiry and contact details:',
            text: 'Your name, contact details, company name and descriptions of your workflows or project needs when you fill in our contact form or book a workflow audit.',
          },
          {
            title: 'Product early-access list:',
            text: 'Your contact details when you ask to be notified about upcoming Feyron products.',
          },
          {
            title: 'Client project information:',
            text: 'Business documents, workflow rules, system documentation and test examples shared with us during a scoped engagement.',
          },
          {
            title: 'Device preferences and technical logs:',
            text: 'Basic browser and device data required to load the site, plus local storage preferences (such as your chosen theme, sound setting and arcade score) stored directly on your device.',
          },
        ],
      },
      {
        kicker: '02 · How we use your information',
        heading: 'Why we process your data',
        bullets: [
          {
            title: 'Responding to you:',
            text: 'To review your note, ask clarifying questions, prepare a workflow audit or provide a project scope and price.',
          },
          {
            title: 'Delivering client work:',
            text: 'To design, build, test, launch and support the AI automation, websites, platforms or integrations you hire us to deliver.',
          },
          {
            title: 'Product updates:',
            text: 'To notify you when a Feyron product is ready to try, if you joined our early-access list. You can opt out at any time.',
          },
          {
            title: 'Security and reliability:',
            text: 'To protect our website and client systems against misuse, unauthorized access or technical faults.',
          },
        ],
      },
      {
        kicker: '03 · AI & client data safeguards',
        heading: 'How we protect business data in AI & automation projects',
        body: [
          'When we build AI agents or workflow automations for your business, we apply strict boundaries to how data is accessed and processed:',
        ],
        bullets: [
          {
            title: 'Minimum necessary access:',
            text: 'We only connect the specific tools, folders, tables or records required for the agreed workflow.',
          },
          {
            title: 'No training of public models:',
            text: 'We never use your confidential business data or customer records to train public AI models.',
          },
          {
            title: 'Separate test and live environments:',
            text: 'We build and test in a staging environment before connecting live production systems, and every agent action is logged for review.',
          },
        ],
      },
      {
        kicker: '04 · Sharing, retention & security',
        heading: 'Who we share data with and how long we keep it',
        body: [
          'We do not sell, rent or trade your personal or business information.',
          'We only share data with trusted infrastructure or service providers when necessary to host our website or deliver an agreed client project, under strict confidentiality obligations.',
          'We retain enquiry records only as long as needed to follow up on your request or comply with applicable Nigerian legal, tax or accounting requirements. Client project data is handed over or deleted according to your signed client agreement.',
        ],
      },
      {
        kicker: '05 · Your rights (Nigeria Data Protection Act)',
        heading: 'Your data protection rights',
        body: [
          'In accordance with the Nigeria Data Protection Act (NDPA) and applicable international privacy laws, you have the right to:',
        ],
        bullets: [
          {
            title: 'Access and correction:',
            text: 'Request a copy of the personal data we hold about you and ask us to correct any inaccurate information.',
          },
          {
            title: 'Deletion and withdrawal of consent:',
            text: 'Ask us to delete your personal information or withdraw consent for product updates at any time.',
          },
          {
            title: 'Objection and restriction:',
            text: 'Object to or request a restriction on how we process your personal information.',
          },
        ],
        note: 'To exercise any of these rights, contact us at hello@feyron.co or reach out through our Contact page.',
      },
    ],
    closingLine: 'Questions about how we handle data? Send us a note.',
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  terms: {
    slug: 'terms',
    title: 'Terms',
    metaTitle: 'Terms of use | Feyron',
    metaDescription:
      'Terms of use governing the Feyron website, client project scopes, intellectual property and service boundaries.',
    kicker: 'Legal · Terms of use',
    headline: 'Terms of use',
    subheading:
      'Effective date: 2026. These Terms of Use govern your access to and use of the Feyron website and describe the basis on which Feyron provides AI automation, websites, platforms and integration services.',
    sections: [
      {
        kicker: '01 · Using our website',
        heading: 'Website access and acceptable use',
        body: [
          'By using this website, you agree to use it lawfully and not to attempt to disrupt, scrape, reverse-engineer or gain unauthorized access to any part of our site, forms or interactive systems.',
          'Information on this website is provided to explain what Feyron builds and how we work. Submitting an enquiry through our site does not create a binding client contract until a written scope and agreement are signed by both parties.',
        ],
      },
      {
        kicker: '02 · Client projects & workflow audits',
        heading: 'How client work is scoped and governed',
        bullets: [
          {
            title: 'Written scope and price:',
            text: 'Every workflow audit, AI automation build, website, platform, integration or monthly care plan is governed by a separate written client agreement setting out the exact deliverables, timeline, approval rules and payment schedule.',
          },
          {
            title: 'Changes in scope:',
            text: 'If you ask to add features or workflows outside the agreed scope, we will agree on the updated timeline and cost in writing before building the additional work.',
          },
          {
            title: 'Client responsibilities:',
            text: 'Timely delivery depends on your team providing necessary access, content, test examples and review feedback at agreed milestones.',
          },
        ],
      },
      {
        kicker: '03 · Ownership & intellectual property',
        heading: 'Who owns what we build',
        bullets: [
          {
            title: 'Your custom deliverables:',
            text: 'Upon full payment of the agreed project fees, the custom code, workflows, designs and documentation built specifically for your business belong to you, as detailed in your client agreement.',
          },
          {
            title: 'Feyron website and pre-existing tools:',
            text: 'The Feyron name, brand, website design, copy, interactive mascots and any reusable internal frameworks remain the intellectual property of Feyron.',
          },
        ],
      },
      {
        kicker: '04 · AI automation & human oversight',
        heading: 'Responsible use of AI agents',
        body: [
          'Feyron designs AI agents with clear limits, approval gates, audit logs and an off switch. Because AI models can occasionally produce incomplete or inaccurate outputs, you remain responsible for reviewing actions placed in approval mode and maintaining appropriate human oversight for financial, legal, compliance or customer-critical decisions.',
        ],
      },
      {
        kicker: '05 · Payments & regulatory boundaries',
        heading: 'Technology and integration role',
        body: [
          'Feyron is a software engineering and technology integration company. We are not a bank, payment processor, money transmitter, virtual asset service provider or financial institution.',
          'We do not hold, custody, pool or move client or customer funds. Where a project includes card checkout, bank transfers, payouts or stablecoin payments, those regulated payment services are provided directly by licensed third-party providers integrated into your software.',
        ],
      },
      {
        kicker: '06 · Liability & governing law',
        heading: 'Disclaimers and jurisdiction',
        body: [
          'This website is provided on an "as is" basis without warranties of uninterrupted availability. To the fullest extent permitted by law, Feyron is not liable for indirect or consequential losses arising from your use of this website.',
          'These Terms of Use are governed by the laws of the Federal Republic of Nigeria, with operations based in Lagos, Nigeria.',
        ],
      },
    ],
    closingLine: 'Have a question about our terms or how we scope projects?',
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },

  cookies: {
    slug: 'cookies',
    title: 'Cookies',
    metaTitle: 'Cookie policy | Feyron',
    metaDescription:
      'The plain facts about cookies and local storage on Feyron. No tracking cookies, no advertising pixels.',
    kicker: 'Privacy · Cookie policy',
    headline: 'Cookie policy',
    subheading:
      'The plain facts about how cookies and storage work on the Feyron website. No tracking cookies, no advertising pixels, and nothing following you across the web.',
    sections: [
      {
        kicker: '01 · What we use',
        heading: 'Essential storage only',
        body: [
          'We believe in keeping things simple. When you visit our website, we only use standard browser storage to keep essential functions running smoothly—such as remembering your preferences or temporary submission status when you fill out an enquiry form.',
          'We do not use advertising cookies, behavioural profiling trackers, or third-party pixel beacons that monitor your browsing activity across other websites.',
        ],
      },
      {
        kicker: '02 · Managing cookies',
        heading: 'Control in your browser',
        body: [
          'Because our website relies only on essential functions, you do not have to battle complex consent popups. You can at any time clear or block cookies and local storage through your browser settings.',
        ],
      },
    ],
    closingLine: 'Questions about our privacy or storage practices?',
    primaryCta: { label: 'Talk to our team', action: 'contact' },
  },
};

