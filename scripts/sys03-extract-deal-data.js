const deal = $('Deal Proposal Stage Webhook').first().json;
const config = $('Get Config').first().json;
const body = deal.body && typeof deal.body === 'object' ? deal.body : deal;
const props = body.properties || body;

const valueFrom = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return '';
};

const money = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const normalized = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(normalized) ? normalized : 0;
};

const titleCase = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

/** Parse line items from payload: arrays on body/properties or JSON string. */
const parseLineItemsRaw = () => {
  const candidates = [
    body.lineItems,
    body.line_items,
    props.lineItems,
    props.line_items,
  ];
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
    if (typeof c === 'string' && c.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(c);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (e) { /* ignore */ }
    }
  }
  return [];
};

const normalizeLineItems = (raw) => {
  return raw.map((x, i) => {
    if (!x || typeof x !== 'object') return null;
    const qty = Math.max(1, Number(x.quantity ?? x.qty ?? 1) || 1);
    const unit = money(x.unitPrice ?? x.price ?? x.rate ?? x.hs_price);
    const lineTotal = money(x.amount ?? x.line_amount ?? x.total ?? x.line_total);
    const name = valueFrom(x.name, x.productName, x.title, x.hs_sku, `Line item ${i + 1}`);
    const description = valueFrom(x.description, x.details, x.notes, '');
    let amount = lineTotal;
    if (!amount && unit) amount = unit * qty;
    if (!amount) amount = 0;
    return {
      name,
      description,
      quantity: qty,
      unitPrice: unit || (qty ? amount / qty : amount),
      amount,
    };
  }).filter(Boolean);
};

const rawLineItems = parseLineItemsRaw();
const lineItems = normalizeLineItems(rawLineItems);
const lineItemsTotal = lineItems.reduce((s, li) => s + (Number(li.amount) || 0), 0);

const addressParts = [
  valueFrom(props.address, props.street, props.street_address, props.company_address),
  valueFrom(props.city, props.company_city),
  valueFrom(props.state, props.state_region, props.company_state),
  valueFrom(props.zip, props.zip_code, props.postal_code, props.company_zip),
  valueFrom(props.country, props.company_country)
].filter(Boolean);

const tierKey = valueFrom(props.tier).toLowerCase() || 'starter';
const tierInfo = (config.tiers && (config.tiers[tierKey] || config.tiers.starter)) || {
  name: titleCase(tierKey) || 'Starter',
  monthlyPrice: 0,
  setupFee: 0
};

const rawPainSources = [
  valueFrom(props.deal_pain_points),
  valueFrom(props.painPoints),
  valueFrom(props.pain_point_summary)
].filter(Boolean);

const uniquePainSources = [...new Set(rawPainSources)];
const painPoints = uniquePainSources.join('\n\n');
const contactFirstName = valueFrom(props.contact_firstname, props.firstName, props.firstname);
const contactLastName = valueFrom(props.contact_lastname, props.lastName, props.lastname);
const contactName = [contactFirstName, contactLastName].filter(Boolean).join(' ');
const tierMonthly = money(tierInfo.monthlyPrice);
const upfrontDue = money(tierInfo.setupFee);
const explicitDealAmount = money(props.amount);
const tierAmount =
  explicitDealAmount > 0
    ? explicitDealAmount
    : lineItemsTotal > 0
      ? lineItemsTotal
      : upfrontDue;
const remainingTierBalance = Math.max(tierAmount - upfrontDue, 0);
const launchBalance = remainingTierBalance + tierMonthly;

return [{
  json: {
    clientName: valueFrom(props.dealname, props.name, props.company, props.business_name),
    company: valueFrom(props.company, props.dealname, props.name, props.business_name),
    industry: valueFrom(props.industry),
    painPoints,
    painPointSummary: valueFrom(props.pain_point_summary, props.painPoints),
    rawPainPoints: valueFrom(props.deal_pain_points, painPoints),
    dealValue: tierAmount,
    amountLabel: valueFrom(props.amount),
    tierAmount,
    tier: tierKey,
    tierLabel: tierInfo.name || titleCase(tierKey) || 'Starter',
    tierMonthly,
    monthlyCost: tierMonthly,
    upfrontDue,
    remainingTierBalance,
    launchBalance,
    finalDueAtPreLaunch: launchBalance,
    dealId: valueFrom(body.id, deal.id, body.dealId, deal.dealId),
    contactEmail: valueFrom(props.contact_email, props.email),
    contactPhone: valueFrom(props.contact_phone, props.phone, props.mobilephone),
    contactFirstName,
    contactName: contactName || contactFirstName,
    address: addressParts.join(', '),
    city: valueFrom(props.city, props.company_city),
    state: valueFrom(props.state, props.state_region, props.company_state),
    postalCode: valueFrom(props.zip, props.zip_code, props.postal_code, props.company_zip),
    country: valueFrom(props.country, props.company_country),
    website: valueFrom(props.website, props.domain, props.company_domain),
    driveFolderId: valueFrom(props.client_drive_folder_id),
    lineItems,
    lineItemsTotal,
    config
  }
}];
