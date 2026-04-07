const claudeResult = $('Parse Claude Response').first().json;
const d = $('Extract Deal Data').first().json;
const config = d.config || {};
const branding = config.branding || {};
const owner = config.owner || {};
const companyName = owner.companyName || 'IntraWeb Technologies LLC';
const ownerEmail = owner.email || '';
const ownerPhone = owner.phone || '';
const ownerName = owner.name || 'John Schibelli';
const calendarLink = owner.calendarLink || '';
const bodyContent = (claudeResult.data ? claudeResult.data.text : claudeResult.html || '').trim();
const clientName = d.clientName || 'Client';
const proposalDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const logoSrc = branding.logoUrl || '';

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/\"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number.isFinite(numeric) ? numeric : 0);
};

const renderField = (label, value) => `
  <div class="meta-item">
    <div class="meta-label">${label}</div>
    <div class="meta-value">${escapeHtml(value || 'Not provided')}</div>
  </div>`;

const summaryPainPoints = (d.painPointSummary || '')
  .split(/[,;]\s*/)
  .map((item) => item.trim())
  .filter(Boolean);

const painSummaryHtml = summaryPainPoints.length
  ? `<ul class="bullet-list">${summaryPainPoints.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
  : '';

const rawPainBlock = d.rawPainPoints || d.painPoints || 'No pain points were provided in the payload.';
const contactDisplay = d.contactName || d.contactFirstName || '';
const tierAmountText = d.tierAmount ? formatCurrency(d.tierAmount) : 'Not provided';
const tierMonthlyText = formatCurrency(d.tierMonthly || 0);
const upfrontDueText = formatCurrency(d.upfrontDue || 0);
const launchBalanceText = formatCurrency(d.launchBalance || 0);
const lineItems = Array.isArray(d.lineItems) ? d.lineItems : [];
const lineItemsRowsHtml = lineItems.length
  ? lineItems.map((li) =>
      `<tr><td>${escapeHtml(li.name)} (qty ${li.quantity ?? 1})${li.description ? ' — ' + escapeHtml(String(li.description).slice(0, 120)) : ''}</td><td>${escapeHtml(formatCurrency(li.amount))}</td></tr>`
    ).join('') +
    `<tr><td><strong>Line items subtotal</strong></td><td><strong>${escapeHtml(formatCurrency(lineItems.reduce((s, x) => s + (Number(x.amount) || 0), 0)))}</strong></td></tr>`
  : '';
const calendarHtml = calendarLink
  ? `<a class="cta-button" href="${calendarLink}">Book approval call</a>`
  : '';
const safeBodyContent = bodyContent || '<h2>Executive Summary</h2><p>Proposal content could not be generated.</p>';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Proposal for ${escapeHtml(clientName)} - ${escapeHtml(companyName)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Source+Serif+4:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: Letter; margin: 0.62in; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #ffffff; color: #18212f; }
    body { font-family: 'Manrope', Arial, sans-serif; font-size: 12.5px; line-height: 1.65; }
    img { max-width: 100%; display: block; }
    .document { width: 100%; }
    .hero {
      border: 1px solid #d8deea;
      border-radius: 20px;
      padding: 28px 30px;
      background: linear-gradient(180deg, #ffffff 0%, #f7f8fc 100%);
      margin-bottom: 22px;
      break-inside: avoid;
    }
    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      margin-bottom: 22px;
    }
    .brand-lockup { display: flex; align-items: center; gap: 14px; }
    .brand-lockup img { max-height: 46px; width: auto; }
    .eyebrow {
      display: inline-block;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .hero h1 {
      font-size: 29px;
      line-height: 1.15;
      margin: 0 0 8px 0;
      color: #111827;
    }
    .hero-subtitle {
      margin: 0;
      font-size: 13px;
      color: #4b5563;
      max-width: 520px;
    }
    .prepared-tag {
      min-width: 180px;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 14px 16px;
      background: #ffffff;
      text-align: right;
    }
    .prepared-tag .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #6b7280;
      margin-bottom: 6px;
      font-weight: 700;
    }
    .prepared-tag .value {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }
    .prepared-tag .subvalue {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.95fr;
      gap: 18px;
    }
    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 18px 18px 16px;
      background: #ffffff;
      break-inside: avoid;
    }
    .panel-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #6b7280;
      margin: 0 0 12px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 16px;
    }
    .meta-item { break-inside: avoid; }
    .meta-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 5px;
    }
    .meta-value {
      font-size: 13px;
      color: #111827;
      font-weight: 600;
      word-break: break-word;
    }
    .pricing-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    .pricing-table tr { break-inside: avoid; }
    .pricing-table td {
      padding: 10px 0;
      border-bottom: 1px solid #edf0f5;
      vertical-align: top;
    }
    .pricing-table td:last-child {
      text-align: right;
      font-weight: 700;
      color: #111827;
      padding-left: 20px;
    }
    .pricing-table tr.total td {
      padding-top: 14px;
      border-bottom: none;
      font-size: 15px;
      color: #6B4E9B;
    }
    .pricing-disclaimer {
      font-size: 11px;
      color: #6b7280;
      margin-top: 10px;
      line-height: 1.4;
    }
    .section-card {
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 22px 24px;
      margin-bottom: 20px;
      background: #ffffff;
      break-inside: avoid;
    }
    .section-card h2:first-child,
    .section-card h3:first-child,
    .proposal-body h2:first-child,
    .proposal-body h3:first-child { margin-top: 0; }
    .section-card h2,
    .proposal-body h2 {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 23px;
      line-height: 1.2;
      margin: 26px 0 12px;
      color: #101827;
      break-after: avoid;
    }
    .section-card h3,
    .proposal-body h3 {
      font-size: 16px;
      line-height: 1.3;
      margin: 18px 0 10px;
      color: #18212f;
      break-after: avoid;
    }
    .proposal-body p,
    .section-card p { margin: 0 0 12px; }
    .proposal-body ul,
    .proposal-body ol,
    .bullet-list {
      margin: 0 0 12px 0;
      padding-left: 20px;
    }
    .proposal-body li,
    .bullet-list li { margin-bottom: 6px; }
    .callout {
      background: linear-gradient(180deg, #fff7ed 0%, #fffaf5 100%);
      border: 1px solid #fed7aa;
      border-radius: 16px;
      padding: 18px 18px 14px;
      break-inside: avoid;
    }
    .quote {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 16px;
      line-height: 1.55;
      color: #1f2937;
      margin: 0 0 14px 0;
      white-space: pre-wrap;
    }
    .footer-note {
      margin-top: 22px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }
    .footer-note-text {
      font-size: 11px;
      color: #6b7280;
      max-width: 470px;
    }
    .cta-button {
      display: inline-block;
      text-decoration: none;
      background: #6B4E9B;
      color: #ffffff;
      padding: 12px 18px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="document">
    <section class="hero">
      <div class="brand-row">
        <div>
          <div class="brand-lockup">
            ${logoSrc ? `<img src="${logoSrc}" alt="IntraWeb" />` : ''}
            <div>
              <div class="eyebrow">IntraWeb Technologies LLC</div>
              <h1>Proposal for ${escapeHtml(d.company || clientName)}</h1>
              <p class="hero-subtitle">A delivery-focused implementation proposal designed around the operational bottlenecks, growth priorities, and intake details captured for this opportunity.</p>
            </div>
          </div>
        </div>
        <div class="prepared-tag">
          <div class="label">Prepared On</div>
          <div class="value">${escapeHtml(proposalDate)}</div>
          <div class="subvalue">Prepared by ${escapeHtml(ownerName)}</div>
        </div>
      </div>

      <div class="hero-grid">
        <div class="panel">
          <p class="panel-title">Client Snapshot</p>
          <div class="meta-grid">
            ${renderField('Client', clientName)}
            ${renderField('Company', d.company)}
            ${renderField('Primary Contact', contactDisplay)}
            ${renderField('Contact Email', d.contactEmail)}
            ${renderField('Contact Phone', d.contactPhone)}
            ${renderField('Industry', d.industry)}
            ${renderField('Address', d.address)}
            ${renderField('Website', d.website)}
          </div>
        </div>

        <div class="panel">
          <p class="panel-title">Investment Summary</p>
          <table class="pricing-table">
            ${lineItemsRowsHtml}<tr><td>Tier amount</td><td>${escapeHtml(tierAmountText)}</td></tr>
            <tr><td>Tier monthly</td><td>${escapeHtml(tierMonthlyText)}</td></tr>
            <tr><td>Upfront due</td><td>${escapeHtml(upfrontDueText)}</td></tr>
            <tr class="total"><td>Launch balance</td><td>${escapeHtml(launchBalanceText)}</td></tr>
          </table>
          <p class="pricing-disclaimer">Launch balance is due at approval and includes the remaining project balance plus the first month's subscription; tier monthly applies thereafter.</p>
        </div>
      </div>
    </section>

    <section class="section-card">
      <p class="panel-title">Pain Points Captured From Intake</p>
      <div class="callout">
        <p class="quote">${escapeHtml(rawPainBlock)}</p>
        ${painSummaryHtml}
      </div>
    </section>

    <section class="section-card proposal-body">
      ${safeBodyContent}
      <div class="footer-note">
        <div class="footer-note-text">
          ${escapeHtml(companyName)} | ${escapeHtml(ownerEmail)}${ownerPhone ? ` | ${escapeHtml(ownerPhone)}` : ''}
        </div>
        ${calendarHtml}
      </div>
    </section>
  </div>
</body>
</html>`;

return [{ json: { html, fileName: `IntraWeb - ${d.clientName} - Proposal.pdf` } }];