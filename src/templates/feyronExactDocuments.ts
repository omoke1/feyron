// Feyron Exact Business Documents System
// Extracted 1:1 directly from Feyron Business Documents.html

export type ExactDocType =
  | 'milestones'
  | 'proposal'
  | 'service_order'
  | 'invoice'
  | 'receipt'
  | 'change_request'
  | 'acceptance'
  | 'care_report'
  | 'letterhead';

export interface ExactDocData {
  clientName: string;
  clientLegalName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone?: string;
  clientRole?: string;
  projectName: string;
  agreementNo: string;
  docNo: string;
  dateIssued: string;
  dueDate: string;
  currency: string;
  amount: string;
  amountNumeric?: string;
  situationText?: string;
  buildText?: string;
  inScopeText?: string;
  outOfScopeText?: string;
  timelinePhase1?: string;
  timelinePhase2?: string;
  timelinePhase3?: string;
  investmentDetails?: string;
  lineItems?: Array<{ desc: string; qty: string; rate: string; amount: string }>;
  paymentSchedule?: string;
  testCases?: Array<{ name: string; pass?: boolean }>;
  notes?: string;
  feyronSignerName?: string;
  feyronSignerRole?: string;
}

export const EXACT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 32px 16px;
  background: #FAF9F5;
  color: #1E1E1E;
  font-family: Inter, Arial, sans-serif;
  display: flex;
  justify-content: center;
}
.h { font-family: 'Space Grotesk', Arial, sans-serif; }
.lb { font-size: 11px; letter-spacing: 1.6px; text-transform: uppercase; font-weight: 700; color: #5F5F5F; margin: 0 0 8px; }
.mk { width: 44px; height: 44px; border-radius: 10px; background: #FEB47B; display: flex; flex-direction: column; align-items: center; justify-content: center; flex: none; }
.ey { display: flex; gap: 8px; }
.ey i { width: 9px; height: 18px; border-radius: 4px; background: #1E1E1E; display: block; }
.mo { width: 8px; height: 3px; border-radius: 2px; background: #1E1E1E; margin-top: 5px; }
p { margin: 0; font-size: 13px; line-height: 1.5; }
.wm { position: absolute; z-index: 0; width: 150px; height: 150px; border-radius: 34px; background: #FEB47B; opacity: .14; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
.wm div { display: flex; gap: 27px; }
.wm i { width: 31px; height: 61px; border-radius: 14px; background: #1E1E1E; display: block; }
.wm b { width: 27px; height: 10px; border-radius: 7px; background: #1E1E1E; margin-top: 17px; display: block; }
.r { display: flex; gap: 16px; padding: 8px 0; border-bottom: 1px solid #E7E7E7; }
.r p:first-child { width: 150px; color: #5F5F5F; flex: none; }
.r p:last-child { font-weight: 600; }
.t { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #E7E7E7; }
.c { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #E7E7E7; align-items: flex-start; }
.c span { width: 16px; height: 16px; border: 2px solid #1E1E1E; border-radius: 4px; flex: none; margin-top: 1px; display: inline-block; }
.bx { background: #F3F3F3; border-radius: 10px; padding: 12px 16px; min-height: 46px; }
.k { flex: 1; border-radius: 10px; padding: 16px 18px; }

@media print {
  body {
    background: #FFFFFF !important;
    padding: 0 !important;
  }
  .page-container {
    box-shadow: none !important;
    margin: 0 !important;
    page-break-after: always;
  }
}
`;

export function generateExactDocument(type: ExactDocType, data: ExactDocData): string {
  const companyName = 'Feyron Technologies Limited';
  const companyCac = 'RC-7849201';
  const companyTin = '29104820-0001';
  const companyAddress = '7 Elsie Femi Pearse, Victoria Island, Lagos';
  const companyEmail = 'hello@feyron.site';
  const companyPhone = '+234 813 000 4820';
  const companyWeb = 'feyron.site';

  const watermarks = `
    <div class="wm" style="left:70px;top:330px;transform:rotate(-8deg)"><div><i></i><i></i></div><b></b></div>
    <div class="wm" style="left:560px;top:600px;transform:rotate(7deg)"><div><i></i><i></i></div><b></b></div>
    <div class="wm" style="left:150px;top:860px;transform:rotate(-5deg)"><div><i></i><i></i></div><b></b></div>
  `;

  const stripe = `
    <div style="display:flex;height:6px"><div style="flex:34;background:#FEB47B"></div><div style="flex:33;background:#C084FC"></div><div style="flex:33;background:#4ADE80"></div></div>
  `;

  const headerLogo = `
    <div style="display:flex;align-items:center;gap:14px">
      <div class="mk"><div class="ey"><i></i><i></i></div><div class="mo"></div></div>
      <span class="h" style="font-size:24px;font-weight:700">Feyron</span>
      <span style="margin-left:auto;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#A9A9A9">AI Productivity &amp; Technology</span>
    </div>
  `;

  const footer = `
    <div style="background:#1E1E1E;padding:16px 48px;display:flex;justify-content:space-between;align-items:center;margin-top:auto">
      <p style="color:#FEB47B;font-size:12px">Technology that moves work forward.</p>
      <p style="color:#A9A9A9;font-size:11px">${companyName} &bull; CAC ${companyCac} &bull; ${companyWeb}</p>
    </div>
  `;

  let bodyContent = '';

  // 1. INVOICE (Exact match with Feyron Business Documents.html)
  if (type === 'invoice') {
    const items = data.lineItems && data.lineItems.length > 0 ? data.lineItems : [
      { desc: 'AI Workflow Engine & Architecture: Milestone 1 (50%)', qty: '1', rate: data.amount, amount: data.amount },
      { desc: 'Custom Dashboard & Admin Automation Portal', qty: '1', rate: '0', amount: 'Included' },
      { desc: 'Cloud Staging, Database Schema & Resend Webhook Integration', qty: '1', rate: '0', amount: 'Included' },
    ];

    const linesHtml = items.map(it => `
      <div class="t">
        <p style="flex:1">${it.desc}</p>
        <p style="width:50px;text-align:right">${it.qty}</p>
        <p style="width:110px;text-align:right">${data.currency}${it.rate}</p>
        <p style="width:120px;text-align:right;font-weight:600">${data.currency}${it.amount}</p>
      </div>
    `).join('');

    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px 34px;color:#fff">
          ${headerLogo}
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:28px">
            <h1 class="h" style="margin:0;font-size:38px;line-height:1.1">Invoice</h1>
            <p style="color:#E7E7E7;text-align:right">No. ${data.docNo}<br>Issued ${data.dateIssued} &bull; Due ${data.dueDate}</p>
          </div>
        </div>
        ${stripe}
        <div style="padding:28px 48px 0;display:flex;flex-direction:column;gap:22px;flex:1">
          <div style="display:flex;gap:28px">
            <div style="flex:1">
              <p class="lb">From</p>
              <p><b>${companyName}</b><br>CAC ${companyCac} &bull; TIN ${companyTin}<br>${companyAddress}<br>${companyEmail} &bull; ${companyPhone}</p>
            </div>
            <div style="flex:1">
              <p class="lb">Bill to</p>
              <p><b>${data.clientLegalName || data.clientName}</b><br>${data.clientAddress || 'Client Office Address'}<br>${data.clientName}, ${data.clientEmail}<br>Agreement no. ${data.agreementNo}</p>
            </div>
          </div>
          <div>
            <div class="t" style="border-bottom:2px solid #1E1E1E">
              <p class="lb" style="margin:0;flex:1">Description</p>
              <p class="lb" style="margin:0;width:50px;text-align:right">Qty</p>
              <p class="lb" style="margin:0;width:110px;text-align:right">Unit price</p>
              <p class="lb" style="margin:0;width:120px;text-align:right">Amount</p>
            </div>
            ${linesHtml}
          </div>
          <div style="align-self:flex-end;width:320px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between"><p>Subtotal</p><p>${data.currency}${data.amount}</p></div>
            <div style="display:flex;justify-content:space-between"><p>VAT (7.5%, if applicable)</p><p>${data.currency}0.00</p></div>
            <div style="display:flex;justify-content:space-between;align-items:center;background:#1E1E1E;color:#fff;border-radius:10px;padding:14px 16px;margin-top:6px">
              <p style="color:#FEB47B;font-weight:700">Total due</p>
              <p class="h" style="font-size:22px;font-weight:700">${data.currency}${data.amount}</p>
            </div>
          </div>
          <div style="display:flex;gap:28px">
            <div style="flex:1;background:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:16px 18px">
              <p class="lb">Pay by bank transfer</p>
              <p>Bank: Access Bank / Zenith Bank<br>Account name: ${companyName}<br>Account number: 1840294821<br>Reference: <b>${data.docNo}</b></p>
            </div>
            <div style="flex:1">
              <p class="lb">Terms</p>
              <p>Payment is due by ${data.dueDate}. Please quote the invoice number so we can match your payment. Questions? Reply to this invoice or write to ${companyEmail}.</p>
            </div>
          </div>
        </div>
        ${footer}
      </div>
    `;
  }

  // 2. PAYMENT RECEIPT (Exact match with Feyron Business Documents.html)
  else if (type === 'receipt') {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px;color:#fff">
          ${headerLogo}
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:28px">
            <h1 class="h" style="margin:0;font-size:38px;line-height:1.1">Payment receipt</h1>
            <p style="color:#E7E7E7;text-align:right">No. ${data.docNo}<br>Date ${data.dateIssued}</p>
          </div>
        </div>
        ${stripe}
        <div style="padding:28px 48px 0;display:flex;flex-direction:column;gap:24px;flex:1">
          <div style="background:#1E1E1E;color:#fff;border-radius:12px;padding:22px 26px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <p class="lb" style="color:#4ADE80;margin:0 0 4px">Amount received</p>
              <p style="color:#E7E7E7">Thank you. Your payment has been received.</p>
            </div>
            <p class="h" style="font-size:34px;font-weight:700;color:#FEB47B">${data.currency}${data.amount}</p>
          </div>
          <div>
            <div class="r"><p>Received from</p><p>${data.clientLegalName || data.clientName}</p></div>
            <div class="r"><p>For</p><p>${data.docNo} &bull; ${data.projectName}</p></div>
            <div class="r"><p>Agreement no.</p><p>${data.agreementNo}</p></div>
            <div class="r"><p>Payment date</p><p>${data.dateIssued}</p></div>
            <div class="r"><p>Payment method</p><p>Bank transfer</p></div>
            <div class="r"><p>Payment reference</p><p>${data.docNo}</p></div>
          </div>
          <div>
            <p class="lb">Account summary</p>
            <div style="display:flex;gap:12px">
              <div style="flex:1;background:#F3F3F3;border-radius:10px;padding:14px 16px"><p class="lb" style="margin:0 0 4px">Invoice total</p><p class="h" style="font-size:18px;font-weight:700">${data.currency}${data.amount}</p></div>
              <div style="flex:1;background:#F3F3F3;border-radius:10px;padding:14px 16px"><p class="lb" style="margin:0 0 4px">Paid to date</p><p class="h" style="font-size:18px;font-weight:700">${data.currency}${data.amount}</p></div>
              <div style="flex:1;background:#F3F3F3;border-left:4px solid #FEB47B;border-radius:10px;padding:14px 16px"><p class="lb" style="margin:0 0 4px">Balance remaining</p><p class="h" style="font-size:18px;font-weight:700">${data.currency}0.00</p></div>
            </div>
          </div>
          <p style="color:#5F5F5F">This receipt confirms payment only. Questions? Write to ${companyEmail}.</p>
          <div style="margin-top:auto;padding-bottom:26px;width:300px">
            <div style="height:34px;border-bottom:1px solid #1E1E1E"></div>
            <p style="font-size:12px;color:#5F5F5F;padding-top:6px">Issued by ${data.feyronSignerName || 'Executive Team'}, ${data.feyronSignerRole || 'Delivery Lead'}, Feyron</p>
          </div>
        </div>
        ${footer}
      </div>
    `;
  }

  // 3. PROPOSAL (Exact match with Feyron Business Documents.html)
  else if (type === 'proposal') {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px 36px;color:#fff">
          ${headerLogo}
          <p class="lb" style="color:#FEB47B;margin:30px 0 10px">Proposal</p>
          <h1 class="h" style="margin:0;font-size:38px;line-height:1.1">${data.projectName}</h1>
          <p style="margin-top:12px;color:#E7E7E7">Prepared for ${data.clientName} &bull; ${data.dateIssued} &bull; Valid for 30 days</p>
        </div>
        ${stripe}
        <div style="padding:30px 48px 0;display:flex;flex-direction:column;gap:20px;flex:1">
          <div>
            <p class="lb">The situation</p>
            <p>${data.situationText || 'Current operations involve manual re-keying, fragmented client communications across channels, and delayed follow-ups that lead to lost customer opportunities.'}</p>
          </div>
          <div>
            <p class="lb">What we will build</p>
            <p>${data.buildText || 'An autonomous AI agent and interactive digital portal that automates client onboarding, message extraction, dynamic document processing, and human approval gates.'}</p>
          </div>
          <div style="display:flex;gap:28px">
            <div style="flex:1">
              <p class="lb">In scope</p>
              <p>${data.inScopeText || 'Autonomous agent engine<br>Custom web management portal<br>Resend email & webhook integrations<br>Production deployment & handover'}</p>
            </div>
            <div style="flex:1">
              <p class="lb">Not included</p>
              <p>${data.outOfScopeText || 'Custom third-party API reverse engineering<br>Unscoped mobile app store deployment<br>Changes outside this scope are quoted before they are built.'}</p>
            </div>
          </div>
          <div>
            <p class="lb">Timeline</p>
            <div style="display:flex;gap:12px">
              <div style="flex:1;border-top:4px solid #FEB47B;padding-top:8px"><p><b>Understand</b><br>Sprint 01: Architecture & Data Schema</p></div>
              <div style="flex:1;border-top:4px solid #C084FC;padding-top:8px"><p><b>Build and review</b><br>Sprint 02: Core Engine & Testing</p></div>
              <div style="flex:1;border-top:4px solid #4ADE80;padding-top:8px"><p><b>Launch and handover</b><br>Sprint 03: Go-Live & 30-Day SLA</p></div>
            </div>
          </div>
          <div>
            <p class="lb">Investment</p>
            <div style="background:#F3F3F3;border-radius:10px;padding:16px 20px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between"><p>${data.projectName}</p><p><b>${data.currency}${data.amount}</b></p></div>
              <div style="display:flex;justify-content:space-between"><p>Payment schedule: 50% at signing, 30% at the build milestone, 20% before launch</p><p>Scheduled Milestones</p></div>
              <div style="display:flex;justify-content:space-between"><p>Third-party costs (model usage, messaging, hosting) are billed separately at cost</p><p>At Cost</p></div>
            </div>
          </div>
          <div>
            <p class="lb">Next steps</p>
            <p>1. Sign the service order form and pay the first instalment. 2. We schedule the kickoff within 3 working days. 3. We start building and keep you updated at each milestone.</p>
          </div>
          <div style="display:flex;gap:28px;margin-top:6px">
            <div style="flex:1;border-top:1px solid #1E1E1E;padding-top:6px"><p style="font-size:12px;color:#5F5F5F">Accepted for ${data.clientName}: name, signature, date</p></div>
            <div style="flex:1;border-top:1px solid #1E1E1E;padding-top:6px"><p style="font-size:12px;color:#5F5F5F">For Feyron: name, signature, date</p></div>
          </div>
        </div>
        ${footer}
      </div>
    `;
  }

  // 4. SERVICE ORDER FORM (Exact match with Feyron Business Documents.html)
  else if (type === 'service_order') {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px 34px;color:#fff">
          ${headerLogo}
          <p class="lb" style="color:#4ADE80;margin:28px 0 10px">Agreement no. ${data.agreementNo}</p>
          <h1 class="h" style="margin:0;font-size:34px;line-height:1.1">Service order form</h1>
        </div>
        ${stripe}
        <div style="padding:26px 48px 0;display:flex;flex-direction:column;gap:18px;flex:1">
          <div style="display:flex;gap:28px">
            <div style="flex:1"><p class="lb">Service provider</p><p><b>${companyName}</b> (“Feyron”)<br>CAC ${companyCac}<br>${companyAddress}<br>${companyEmail}</p></div>
            <div style="flex:1"><p class="lb">Client</p><p><b>${data.clientLegalName || data.clientName}</b><br>${data.clientAddress || 'Client Legal Address'}<br>${data.clientName}, ${data.clientEmail}</p></div>
          </div>
          <div>
            <p class="lb">Project details</p>
            <div class="r"><p>Services</p><p>${data.projectName}</p></div>
            <div class="r"><p>Deliverables</p><p>${data.inScopeText || 'Engine build, custom UI, API connectors, 30-day warranty'}</p></div>
            <div class="r"><p>Not included</p><p>${data.outOfScopeText || 'Scope changes not agreed in writing'}</p></div>
            <div class="r"><p>Timeline</p><p>${data.dateIssued} to ${data.dueDate}</p></div>
            <div class="r"><p>Fees</p><p>${data.currency}${data.amount}, excluding VAT where applicable</p></div>
            <div class="r"><p>Payment schedule</p><p>50% at signing, 30% at build milestone, 20% before launch</p></div>
            <div class="r"><p>Third-party costs</p><p>Billed separately at cost: model usage, messaging, hosting</p></div>
            <div class="r"><p>Acceptance</p><p>UAT test cases verified within 2 business days of handover</p></div>
          </div>
          <div>
            <p class="lb">Key terms</p>
            <p>1. <b>Scope.</b> Work outside this form is quoted in writing before it starts. &nbsp;2. <b>Approvals.</b> Agents prepare actions and a person approves sensitive ones, unless the client agrees otherwise in writing. &nbsp;3. <b>Ownership.</b> The client owns what is built for it on full payment. Feyron keeps its pre-existing tools and reusable components and grants the client a licence to use them. &nbsp;4. <b>Data.</b> Personal data is handled under the Nigeria Data Protection Act and written processing terms. &nbsp;5. <b>Payments.</b> Feyron does not hold or move client funds. &nbsp;6. <b>Full terms.</b> The Feyron Standard Terms of Service apply to this order.</p>
          </div>
          <div style="display:flex;gap:28px;margin-top:auto;padding-bottom:20px">
            <div style="flex:1"><div style="height:34px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For ${data.clientLegalName || data.clientName}<br>Name, title, signature, date</p></div>
            <div style="flex:1"><div style="height:34px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For ${companyName}<br>Name, title, signature, date</p></div>
          </div>
        </div>
        ${footer}
      </div>
    `;
  }

  // 5. ACCEPTANCE AND GO-LIVE SIGN-OFF (Exact match with Feyron Business Documents.html)
  else if (type === 'acceptance') {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px;color:#fff">
          ${headerLogo}
          <p class="lb" style="color:#4ADE80;margin:26px 0 10px">Project ${data.projectName} &bull; Agreement ${data.agreementNo}</p>
          <h1 class="h" style="margin:0;font-size:34px;line-height:1.1">Acceptance and go-live sign-off</h1>
        </div>
        ${stripe}
        <div style="padding:22px 48px 0;display:flex;flex-direction:column;gap:16px;flex:1">
          <div>
            <p class="lb">1. Acceptance tests (from the order form)</p>
            <div class="t" style="border-bottom:2px solid #1E1E1E">
              <p class="lb" style="margin:0;flex:1">Test case</p>
              <p class="lb" style="margin:0;width:70px;text-align:center">Pass</p>
              <p class="lb" style="margin:0;width:70px;text-align:center">Fail</p>
            </div>
            <div class="t"><p style="flex:1">Incoming lead capture and prompt auto-reply trigger</p><p style="width:70px;text-align:center">[ ✓ ]</p><p style="width:70px;text-align:center">[ ]</p></div>
            <div class="t"><p style="flex:1">Structured document data parsing and line item extraction</p><p style="width:70px;text-align:center">[ ✓ ]</p><p style="width:70px;text-align:center">[ ]</p></div>
            <div class="t"><p style="flex:1">Human approval gate and Telegram/Email admin escalation</p><p style="width:70px;text-align:center">[ ✓ ]</p><p style="width:70px;text-align:center">[ ]</p></div>
            <div class="t"><p style="flex:1">Edge cases: duplicate entries, rate limits, network retries</p><p style="width:70px;text-align:center">[ ✓ ]</p><p style="width:70px;text-align:center">[ ]</p></div>
          </div>
          <div>
            <p class="lb">2. Ready for launch</p>
            <div class="c"><span></span><p>Agent permissions and approval points set as agreed</p></div>
            <div class="c"><span></span><p>Spending limits set and the off switch tested</p></div>
            <div class="c"><span></span><p>Technical review completed and signed off</p></div>
            <div class="c"><span></span><p>Staff trained and a one-page guide provided</p></div>
            <div class="c"><span></span><p>Documentation, access and credentials handed over</p></div>
            <div class="c"><span></span><p>Backups configured and recovery explained</p></div>
          </div>
          <div>
            <p class="lb">3. Known limitations and what stays manual</p>
            <div style="background:#F3F3F3;border-radius:10px;padding:12px 16px;min-height:44px">
              <p>${data.notes || 'High-value transactions above threshold require 1-click human admin approval.'}</p>
            </div>
          </div>
          <div style="background:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:12px 16px">
            <p>By signing, the client confirms the work meets the acceptance tests above, approves go-live, and agrees that the final instalment is due on ${data.dueDate}. The first week after launch is supervised by Feyron.</p>
          </div>
          <div style="display:flex;gap:28px;margin-top:auto;padding-bottom:20px">
            <div style="flex:1"><div style="height:34px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For ${data.clientLegalName || data.clientName}: name, signature, date</p></div>
            <div style="flex:1"><div style="height:34px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For ${companyName}: name, signature, date</p></div>
          </div>
        </div>
        ${footer}
      </div>
    `;
  }

  // 6. CHANGE REQUEST (Exact match with Feyron Business Documents.html)
  else if (type === 'change_request') {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px;color:#fff">
          ${headerLogo}
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:28px">
            <h1 class="h" style="margin:0;font-size:36px;line-height:1.1">Change request</h1>
            <p style="color:#E7E7E7;text-align:right">No. ${data.docNo}<br>Date ${data.dateIssued}</p>
          </div>
        </div>
        ${stripe}
        <div style="padding:24px 48px 0;display:flex;flex-direction:column;gap:18px;flex:1">
          <div>
            <div class="r"><p>Client</p><p>${data.clientLegalName || data.clientName}</p></div>
            <div class="r"><p>Agreement no.</p><p>${data.agreementNo}</p></div>
            <div class="r"><p>Requested by</p><p>${data.clientName}, Client</p></div>
          </div>
          <div>
            <p class="lb">Description of the change</p>
            <div class="bx"><p>${data.notes || 'Additional custom webhook endpoint and bespoke CRM synchronization module.'}</p></div>
          </div>
          <div>
            <p class="lb">Reason</p>
            <div class="bx"><p>Client expanding workflow to integrate second legacy CRM system.</p></div>
          </div>
          <div>
            <p class="lb">Impact</p>
            <div class="r"><p>Scope</p><p>Added: 1 endpoint handler, authentication validation, retry queue</p></div>
            <div class="r"><p>Timeline</p><p>Adds 3 working days to final go-live milestone</p></div>
            <div class="r"><p>Price</p><p>${data.currency}${data.amount} (excluding VAT where applicable)</p></div>
            <div class="r"><p>Third-party costs</p><p>None</p></div>
          </div>
          <div style="background:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:14px 18px">
            <p>Feyron does not start this work until both parties sign below. Approved changes become part of the agreement, and all other terms stay the same.</p>
          </div>
          <div style="display:flex;gap:28px;margin-top:auto;padding-bottom:22px">
            <div style="flex:1"><p class="lb" style="margin:0">Decision</p><p>[ ✓ ] Approved &nbsp;&nbsp; [ ] Rejected</p><div style="height:30px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For ${data.clientName}: name, signature, date</p></div>
            <div style="flex:1"><p class="lb" style="margin:0">&nbsp;</p><p>&nbsp;</p><div style="height:30px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For Feyron: name, signature, date</p></div>
          </div>
        </div>
        ${footer}
      </div>
    `;
  }

  // 7. MONTHLY CARE REPORT (Exact match with Feyron Business Documents.html)
  else if (type === 'care_report') {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px;color:#fff">
          ${headerLogo}
          <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-top:26px">
            <div>
              <p class="lb" style="color:#4ADE80;margin:0 0 8px">Care Plan: Growth Support &amp; SLA</p>
              <h1 class="h" style="margin:0;font-size:34px;line-height:1.1">Monthly care report</h1>
            </div>
            <p style="color:#E7E7E7;text-align:right">${data.clientName}<br>${data.dateIssued}</p>
          </div>
        </div>
        ${stripe}
        <div style="padding:22px 48px 0;display:flex;flex-direction:column;gap:16px;flex:1">
          <div style="display:flex;gap:12px">
            <div class="k" style="background:#FFE7D3"><p class="lb" style="margin:0 0 4px">Staff hours saved</p><p class="h" style="font-size:28px;font-weight:700">46h</p></div>
            <div class="k" style="background:#EBDDFD"><p class="lb" style="margin:0 0 4px">Tasks handled</p><p class="h" style="font-size:28px;font-weight:700">1,280</p></div>
            <div class="k" style="background:#D4F7E1"><p class="lb" style="margin:0 0 4px">Success rate</p><p class="h" style="font-size:28px;font-weight:700">99.4%</p></div>
          </div>
          <div>
            <p class="lb">Against the baseline</p>
            <div class="t" style="border-bottom:2px solid #1E1E1E">
              <p class="lb" style="margin:0;flex:1">Measure</p>
              <p class="lb" style="margin:0;width:120px;text-align:right">Baseline</p>
              <p class="lb" style="margin:0;width:120px;text-align:right">This month</p>
              <p class="lb" style="margin:0;width:120px;text-align:right">Change</p>
            </div>
            <div class="t"><p style="flex:1">Time to reply to an enquiry</p><p style="width:120px;text-align:right">4 to 18 hours</p><p style="width:120px;text-align:right">&lt; 60 seconds</p><p style="width:120px;text-align:right;color:#16A34A;font-weight:700">-98%</p></div>
            <div class="t"><p style="flex:1">Staff hours per week on document filing</p><p style="width:120px;text-align:right">12 hours</p><p style="width:120px;text-align:right">30 mins</p><p style="width:120px;text-align:right;color:#16A34A;font-weight:700">-96%</p></div>
            <div class="t"><p style="flex:1">Errors or missed follow-ups</p><p style="width:120px;text-align:right">8 per month</p><p style="width:120px;text-align:right">0</p><p style="width:120px;text-align:right;color:#16A34A;font-weight:700">-100%</p></div>
          </div>
          <div style="display:flex;gap:16px">
            <div style="flex:1"><p class="lb">Agent activity</p><div class="bx"><p>Runs: 1,280 &bull; Escalated to a person: 14<br>Awaiting approval: 0 &bull; Failed and fixed: 2</p></div></div>
            <div style="flex:1"><p class="lb">Third-party costs</p><div class="bx"><p>Model usage: $18.40 &bull; Resend email: $0.00<br>Within allowance: Yes</p></div></div>
          </div>
          <div><p class="lb">Incidents and fixes</p><div class="bx"><p>None. System operated within 99.98% uptime SLA throughout the billing cycle.</p></div></div>
          <div><p class="lb">Improvements made this month</p><div class="bx"><p>Added automatic PDF receipt delivery and fine-tuned edge LLM classification latency.</p></div></div>
        </div>
        ${footer}
      </div>
    `;
  }

  // 8. LETTERHEAD (Exact match with Feyron Business Documents.html)
  else if (type === 'letterhead') {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        <div class="wm" style="left:560px;top:420px;transform:rotate(7deg)"><div><i></i><i></i></div><b></b></div>
        <div class="wm" style="left:70px;top:640px;transform:rotate(-8deg)"><div><i></i><i></i></div><b></b></div>
        <div class="wm" style="left:500px;top:860px;transform:rotate(-5deg)"><div><i></i><i></i></div><b></b></div>
        ${stripe}
        <div style="padding:34px 64px 0;display:flex;align-items:center;gap:14px">
          <div class="mk"><div class="ey"><i></i><i></i></div><div class="mo"></div></div>
          <span class="h" style="font-size:26px;font-weight:700;letter-spacing:-0.5px">Feyron</span>
          <span style="margin-left:auto;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#5F5F5F">AI Productivity &amp; Technology</span>
        </div>
        <div style="padding:70px 64px 0;flex:1;display:flex;flex-direction:column;gap:16px">
          <p style="color:#5F5F5F">${data.dateIssued}</p>
          <p>${data.clientName}<br>${data.clientRole || 'Managing Director'}<br>${data.clientLegalName || 'Organization'}<br>${data.clientAddress || 'Lagos, Nigeria'}</p>
          <p style="font-weight:700;margin-top:10px">${data.projectName}</p>
          <p>Dear ${data.clientName},</p>
          <p>${data.situationText || 'We are pleased to provide this official transmission regarding our scheduled technical engagement and platform architecture.'}</p>
          <p>${data.buildText || 'Our delivery engineering team has completed initialization protocols, staging infrastructure verification, and security controls.'}</p>
          <p style="margin-top:6px">Yours sincerely,</p>
          <p style="margin-top:34px;font-weight:700">${data.feyronSignerName || 'Delivery Engineering Lead'}<br><span style="font-weight:400;color:#5F5F5F">${data.feyronSignerRole || 'Principal Architect'}, Feyron</span></p>
        </div>
        <div style="border-top:1px solid #E7E7E7;margin:0 64px;padding:18px 0 26px;display:flex;justify-content:space-between;gap:24px">
          <p style="font-size:11px;color:#5F5F5F;line-height:1.5">${companyName} &bull; CAC ${companyCac}<br>${companyAddress}, Nigeria</p>
          <p style="font-size:11px;color:#5F5F5F;line-height:1.5;text-align:right">${companyWeb}<br>${companyEmail} &bull; ${companyPhone}</p>
        </div>
      </div>
    `;
  }

  // 9. MILESTONES & DELIVERABLES ROADMAP (Constructed using the EXACT Feyron design system & markup)
  else {
    bodyContent = `
      <div class="page-container" style="width:794px;min-height:1123px;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;position:relative;isolation:isolate;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.08)">
        ${watermarks}
        <div style="background:#1E1E1E;padding:34px 48px 34px;color:#fff">
          ${headerLogo}
          <p class="lb" style="color:#4ADE80;margin:28px 0 10px">Roadmap &amp; Delivery Schedule &bull; Agreement ${data.agreementNo}</p>
          <h1 class="h" style="margin:0;font-size:34px;line-height:1.1">Milestones &amp; Deliverables</h1>
          <p style="margin-top:10px;color:#E7E7E7">Ref: ${data.docNo} &bull; Target Go-Live: ${data.dueDate} &bull; Total Value: ${data.currency}${data.amount}</p>
        </div>
        ${stripe}
        <div style="padding:24px 48px 0;display:flex;flex-direction:column;gap:18px;flex:1">
          <div style="display:flex;gap:28px">
            <div style="flex:1">
              <p class="lb">Client</p>
              <p><b>${data.clientLegalName || data.clientName}</b><br>${data.clientName}, ${data.clientEmail}</p>
            </div>
            <div style="flex:1">
              <p class="lb">Project</p>
              <p><b>${data.projectName}</b><br>Target completion: ${data.dueDate}</p>
            </div>
          </div>

          <div>
            <p class="lb">1. Sprint Milestones &amp; Deliverables Table</p>
            <div class="t" style="border-bottom:2px solid #1E1E1E">
              <p class="lb" style="margin:0;width:95px">Sprint</p>
              <p class="lb" style="margin:0;flex:1">Deliverables &amp; Output</p>
              <p class="lb" style="margin:0;width:140px">Client Dependencies</p>
              <p class="lb" style="margin:0;width:105px;text-align:right">Timeline / Gate</p>
            </div>

            <div class="t">
              <p style="width:95px;font-weight:700">Sprint 01</p>
              <p style="flex:1"><b>Architecture, Schema &amp; Environment:</b> Blueprint, API contracts, sandboxed staging environments, CI/CD pipeline.</p>
              <p style="width:140px;color:#5F5F5F;font-size:12px">Cloud access, credentials, brand assets</p>
              <p style="width:105px;text-align:right;font-size:12px"><b>Week 1-2</b><br><span style="color:#16A34A">40% Deposit</span></p>
            </div>

            <div class="t">
              <p style="width:95px;font-weight:700">Sprint 02</p>
              <p style="flex:1"><b>Core Agent Engine &amp; Connectors:</b> LLM tool calling, Resend webhook triggers, data extraction pipeline.</p>
              <p style="width:140px;color:#5F5F5F;font-size:12px">SOP documentation, sample forms</p>
              <p style="width:105px;text-align:right;font-size:12px"><b>Week 3-4</b><br><span style="color:#2563EB">30% Gate</span></p>
            </div>

            <div class="t">
              <p style="width:95px;font-weight:700">Sprint 03</p>
              <p style="flex:1"><b>Admin Console &amp; Real-time Telemetry:</b> Client dashboard, human approval gates, Telegram/Email alerts.</p>
              <p style="width:140px;color:#5F5F5F;font-size:12px">Admin user list, UI reviews</p>
              <p style="width:105px;text-align:right;font-size:12px"><b>Week 5-6</b><br><span style="color:#7C3AED">20% Gate</span></p>
            </div>

            <div class="t">
              <p style="width:95px;font-weight:700">Sprint 04</p>
              <p style="flex:1"><b>Hardening, UAT &amp; Production Cutover:</b> Vulnerability scanning, load testing, DNS cutover, team training.</p>
              <p style="width:140px;color:#5F5F5F;font-size:12px">Stakeholder sign-off (2-day SLA)</p>
              <p style="width:105px;text-align:right;font-size:12px"><b>Week 7-8</b><br><span style="color:#16A34A">10% Final</span></p>
            </div>
          </div>

          <div>
            <p class="lb">2. Commitments &amp; Accountability</p>
            <div class="c"><span></span><p><b>Review SLA:</b> Client commits to a <b>2 business-day turnaround</b> for milestone approvals to keep timelines intact.</p></div>
            <div class="c"><span></span><p><b>30-Day SLA Warranty:</b> Feyron provides <b>30 calendar days</b> of post-deployment bug fixing and performance monitoring.</p></div>
          </div>

          <div style="background:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:12px 16px">
            <p>Milestone completions trigger the corresponding payment gates. Work on subsequent sprints proceeds seamlessly upon gate settlement.</p>
          </div>

          <div style="display:flex;gap:28px;margin-top:auto;padding-bottom:18px">
            <div style="flex:1"><div style="height:34px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For ${data.clientLegalName || data.clientName}: name, signature, date</p></div>
            <div style="flex:1"><div style="height:34px;border-bottom:1px solid #1E1E1E"></div><p style="font-size:12px;color:#5F5F5F;padding-top:6px">For ${companyName}: name, signature, date</p></div>
          </div>
        </div>
        ${footer}
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${type.toUpperCase()} &bull; ${data.projectName}</title>
<style>${EXACT_CSS}</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}
