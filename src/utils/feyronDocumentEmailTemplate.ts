function escapeHtml(input: any): string {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface DocumentDispatchEmailOptions {
  clientName?: string;
  recipientName?: string;
  projectName?: string;
  docTitle?: string;
  docRef?: string;
  dateIssued?: string;
  targetDate?: string;
  currency?: string;
  totalAmount?: string;
  scopeSummary?: string;
}

export function buildDocumentDispatchEmailHtml(opts: DocumentDispatchEmailOptions): string {
  const firstName = (opts.clientName || opts.recipientName || 'there').split(/\s+/)[0] || 'there';
  const safeFirstName = escapeHtml(firstName);
  const safeClientName = escapeHtml(opts.clientName || opts.recipientName || 'Valued Client');
  const safeProjectName = escapeHtml(opts.projectName || 'Technology Engagement');
  const safeDocTitle = escapeHtml(opts.docTitle || 'Official Document');
  const safeDocRef = escapeHtml(opts.docRef || 'FEY-DOC-2026');
  const safeDateIssued = escapeHtml(opts.dateIssued || new Date().toISOString().slice(0, 10));
  const safeTargetDate = escapeHtml(opts.targetDate || 'As scheduled');
  const safeCurrency = escapeHtml(opts.currency || '$');
  const safeAmount = escapeHtml(opts.totalAmount || '0.00');
  const safeTotal = `${safeCurrency}${safeAmount}`;
  const safeScope = escapeHtml(
    opts.scopeSummary || 'Complete engineering scope, deliverables roadmap, and specifications as agreed.'
  ).replace(/\r?\n/g, '<br/>');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Feyron | ${safeDocTitle}</title>
<style>
  html,body{margin:0 !important;padding:0 !important;width:100% !important;}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
  table{border-collapse:collapse;}
  img{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
  a{text-decoration:none;}
  @media only screen and (max-width:620px){
    .container{width:100% !important;}
    .px{padding-left:22px !important;padding-right:22px !important;}
    .hero-h{font-size:28px !important;line-height:34px !important;}
    .stack{display:block !important;width:100% !important;}
    .btn-td{display:block !important;}
    .btn-a{display:block !important;text-align:center !important;}
    .hide-m{display:none !important;max-height:0 !important;overflow:hidden !important;}
  }
  @media (prefers-color-scheme:dark){
    .body-bg{background-color:#111111 !important;}
    .card{background-color:#262626 !important;}
    .t-dark{color:#E7E7E7 !important;}
    .t-muted{color:#A9A9A9 !important;}
    .callout{background-color:#1E1E1E !important;}
    .rule{border-color:#3A3A3A !important;}
  }
</style>
</head>
<body id="body" class="body-bg" style="margin:0;padding:0;background-color:#E7E7E7;word-spacing:normal;">
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
  Official ${safeDocTitle} for ${safeProjectName} (${safeDocRef}) &bull; Prepared by Feyron.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
</div>
<table role="presentation" class="body-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E7E7E7;">
<tr>
<td align="center" style="padding:28px 12px;">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
    <tr>
      <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:26px 40px;border-radius:16px 16px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="middle" width="44" style="width:44px;">
              <table role="presentation" width="44" height="44" cellpadding="0" cellspacing="0" border="0" bgcolor="#FEB47B" style="width:44px;height:44px;background-color:#FEB47B;border-radius:10px;">
                <tr><td height="8" style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td align="center" valign="top" style="font-size:0;line-height:0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="9" height="18" bgcolor="#1E1E1E" style="width:9px;height:18px;background-color:#1E1E1E;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td>
                        <td width="9" height="18" bgcolor="#1E1E1E" style="width:9px;height:18px;background-color:#1E1E1E;border-radius:4px;font-size:0;line-height:0;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="5" style="height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td align="center" valign="top" style="font-size:0;line-height:0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr><td width="8" height="3" bgcolor="#1E1E1E" style="width:8px;height:3px;background-color:#1E1E1E;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
                <tr><td height="10" style="height:10px;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
            <td valign="middle" style="padding-left:14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:24px;line-height:28px;font-weight:700;letter-spacing:-0.5px;color:#FFFFFF;">
              <a href="https://feyron.site" style="color:#FFFFFF;text-decoration:none;">Feyron</a>
            </td>
            <td align="right" valign="middle" class="hide-m" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;color:#A9A9A9;">
              Official Client Document
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="font-size:0;line-height:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="34%" height="5" bgcolor="#FEB47B" style="height:5px;background-color:#FEB47B;font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" height="5" bgcolor="#C084FC" style="height:5px;background-color:#C084FC;font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" height="5" bgcolor="#4ADE80" style="height:5px;background-color:#4ADE80;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:46px 40px 48px 40px;">
        <p style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#FEB47B;">OFFICIAL TRANSMISSION &bull; ${safeDocRef}</p>
        <h1 class="hero-h" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:34px;line-height:40px;font-weight:700;letter-spacing:-0.8px;color:#FFFFFF;">${safeDocTitle}</h1>
        <p style="margin:16px 0 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16.5px;line-height:26px;color:#E7E7E7;">${safeProjectName}</p>
      </td>
    </tr>
    <tr>
      <td class="px card" bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:40px 40px 8px 40px;">
        <h2 class="t-dark" style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:22px;line-height:28px;font-weight:700;letter-spacing:-0.3px;color:#1E1E1E;">Hi ${safeFirstName},</h2>
        <p class="t-dark" style="margin:0 0 24px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Please find your official <strong>${safeDocTitle}</strong> for <strong>${safeProjectName}</strong> attached to this email. A complete summary of the document terms and specifications is outlined below.</p>

        <!-- DOCUMENT SPECIFICATIONS TABLE -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px 0;background-color:#F8F8F6;border-radius:12px;border:1px solid #E5E5E0;">
          <tr>
            <td style="padding:18px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#666666;width:150px;">Document Reference:</td>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#1E1E1E;">${safeDocRef}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#666666;">Prepared For:</td>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:#1E1E1E;">${safeClientName}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#666666;">Date Issued:</td>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#1E1E1E;">${safeDateIssued}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#666666;">Target Delivery / Due:</td>
                  <td style="padding:6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;color:#1E1E1E;">${safeTargetDate}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 4px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;color:#666666;border-top:1px dashed #D5D5D0;">Total Consideration:</td>
                  <td style="padding:10px 0 4px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;font-weight:800;color:#15803d;border-top:1px dashed #D5D5D0;">${safeTotal}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- SCOPE SUMMARY CALLOUT -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px 0;">
          <tr>
            <td class="callout" bgcolor="#F3F3F3" style="background-color:#F3F3F3;border-left:4px solid #FEB47B;border-radius:0 10px 10px 0;padding:18px 22px;">
              <p class="t-muted" style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11.5px;line-height:16px;letter-spacing:1.4px;text-transform:uppercase;font-weight:700;color:#5F5F5F;">Executive Scope & Purpose</p>
              <p class="t-dark" style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14.5px;line-height:23px;color:#1E1E1E;">${safeScope}</p>
            </td>
          </tr>
        </table>

        <!-- ATTACHMENT NOTICE CALLOUT -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px 0;">
          <tr>
            <td bgcolor="#EFF6FF" style="background-color:#EFF6FF;border:1.5px solid #BFDBFE;border-radius:10px;padding:16px 20px;">
              <p style="margin:0 0 4px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:#1E40AF;">&#128206; Official Document Files Attached</p>
              <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#1E3A8A;">This email includes the full document in two formats: an official <strong>PDF (.pdf)</strong> ready for print or digital signature, and a standalone <strong>Web Document (.html)</strong> for high-definition viewing in your browser.</p>
            </td>
          </tr>
        </table>

        <!-- CTA BUTTON -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 34px 0;">
          <tr>
            <td class="btn-td" bgcolor="#1E1E1E" style="background-color:#1E1E1E;border-radius:10px;">
              <a class="btn-a" href="https://feyron.site" style="display:inline-block;padding:14px 28px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;line-height:20px;font-weight:700;color:#FEB47B;text-decoration:none;border-radius:10px;">Explore Feyron Platform &rarr;</a>
            </td>
          </tr>
        </table>

        <!-- SIGN-OFF -->
        <p class="t-dark" style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#1E1E1E;">Best regards,</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0 0;">
          <tr>
            <td class="rule" style="border-top:1px solid #E7E7E7;padding:24px 0 36px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="36" style="width:36px;">
                    <table role="presentation" width="36" height="36" cellpadding="0" cellspacing="0" border="0" bgcolor="#FEB47B" style="width:36px;height:36px;background-color:#FEB47B;border-radius:8px;">
                      <tr><td height="6" style="height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
                      <tr>
                        <td align="center" valign="top" style="font-size:0;line-height:0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                            <td width="7" height="14" bgcolor="#1E1E1E" style="width:7px;height:14px;background-color:#1E1E1E;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                            <td width="6" style="width:6px;font-size:0;line-height:0;">&nbsp;</td>
                            <td width="7" height="14" bgcolor="#1E1E1E" style="width:7px;height:14px;background-color:#1E1E1E;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr><td height="4" style="height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
                      <tr>
                        <td align="center" valign="top" style="font-size:0;line-height:0;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="6" height="3" bgcolor="#1E1E1E" style="width:6px;height:3px;background-color:#1E1E1E;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                        </td>
                      </tr>
                      <tr><td height="9" style="height:9px;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:14px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
                    <p class="t-dark" style="margin:0;font-size:16px;line-height:22px;font-weight:700;color:#1E1E1E;">Fredy &bull; Feyron Operations</p>
                    <p class="t-muted" style="margin:2px 0 0 0;font-size:14px;line-height:20px;color:#5F5F5F;"><a href="mailto:hello@feyron.site" style="color:#5F5F5F;text-decoration:none;">hello@feyron.site</a> &nbsp;|&nbsp; <a href="https://feyron.site" style="color:#5F5F5F;text-decoration:none;">feyron.site</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="px" bgcolor="#1E1E1E" style="background-color:#1E1E1E;padding:34px 40px 38px 40px;border-radius:0 0 16px 16px;">
        <p style="margin:0 0 6px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:18px;line-height:24px;font-weight:700;letter-spacing:-0.3px;color:#FFFFFF;">Feyron</p>
        <p style="margin:0 0 16px 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#FEB47B;">Technology that moves work forward.</p>
        <p style="margin:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;color:#A9A9A9;">
          Feyron Technologies &bull; Lagos, Nigeria<br>
          &copy; 2026 Feyron. AI Productivity &amp; Technology. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</td>
</tr>
</table>
</body>
</html>`;
}
