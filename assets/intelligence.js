'use strict';

// Public recipient is configured in assets/config.js.
const INGRAM_PRESALES_EMAIL = globalThis.LCI_CONFIG?.presalesEmail || 'cisco.tr@ingrammicro.com';
let timelineFilter = 'all';

function knownQuantity(pid) { return selectedQuantity(pid); }
function quantityLabel(pid) { return 'Quantity: ' + knownQuantity(pid); }
function milestones(item) {
  return fields.map(([key, label]) => {
    const date = dateVal(item.r?.[key]);
    const days = dayDiff(date);
    return { key, label, date, days, state: days === null ? 'unverified' : days < 0 ? 'expired' : 'upcoming' };
  });
}
function filteredTimeline(items, filter = timelineFilter) {
  return items.map(item => ({ item, events: milestones(item).filter(event => filter === 'all' || event.state === filter) }))
    .filter(product => product.events.length);
}
function renewalStatus(item) {
  const days = dayDiff(dateVal(item.r?.EndOfServiceContractRenewal));
  if (days === null) return 'Unverified';
  if (days < 0) return 'Published renewal cutoff passed';
  return days <= 365 ? 'Published renewal cutoff within 365 days' : 'Published renewal cutoff beyond 365 days';
}
function renewalGroups(items) {
  const groups = { passed: [], upcoming: [], later: [], unverified: [] };
  for (const item of items) {
    const days = dayDiff(dateVal(item.r?.EndOfServiceContractRenewal));
    groups[days === null ? 'unverified' : days < 0 ? 'passed' : days <= 365 ? 'upcoming' : 'later'].push(item);
  }
  return groups;
}
function exposureCount(items) {
  const quantities = items.map(item => knownQuantity(item.pid));
  const known = quantities.filter(quantity => quantity !== null);
  const unknown = quantities.length - known.length;
  return items.length + ' products · ' + known.reduce((sum, quantity) => sum + quantity, 0) + ' units' +
    (unknown ? ' · quantity missing for ' + unknown + ' products' : '');
}
function officialUrl(value) {
  try {
    const url = new URL(String(value || ''));
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return '';
    if (url.hostname !== 'cisco.com' && !url.hostname.endsWith('.cisco.com')) return '';
    url.protocol = 'https:';
    return url.href;
  } catch { return ''; }
}
function migrationEntries(record) {
  const raw = record?.EOXMigrationDetails;
  return (Array.isArray(raw) ? raw : raw ? [raw] : []).map(entry => ({
    pids: [...new Set(String(entry?.MigrationProductId || '').split(/[,;]+/).map(pid => pid.trim()).filter(Boolean))],
    information: String(entry?.MigrationInformation || entry?.MigrationProductName || '')
  })).filter(entry => entry.pids.length);
}
function renderTimeline(items) {
  const groups = renewalGroups(items);
  const summary = '<div class="callout"><b>Published service contract renewal cutoffs</b><br>' +
    'Passed: ' + exposureCount(groups.passed) + '<br>Within 365 days: ' + exposureCount(groups.upcoming) +
    '<br>Beyond 365 days: ' + exposureCount(groups.later) + '<br>Unverified: ' + exposureCount(groups.unverified) +
    '<br>These are Cisco product lifecycle cutoffs, not your actual contract expiration dates.</div>';
  const filters = '<div class="stack" role="group" aria-label="Lifecycle milestone filters">' +
    [['all', 'All milestones'], ['expired', 'Expired'], ['upcoming', 'Upcoming'], ['unverified', 'Unverified']].map(([key, text]) =>
      `<button class="btn small ${timelineFilter === key ? 'primary' : ''}" data-life-filter="${key}" aria-pressed="${timelineFilter === key}">${text}</button>`).join('') + '</div>';
  const products = filteredTimeline(items);
  const list = products.length ? '<div class="timelineproducts">' + products.map(({ item, events }, index) => {
    const renewal = dateVal(item.r?.EndOfServiceContractRenewal);
    return `<details class="lifeproduct" ${products.length === 1 || index === 0 ? 'open' : ''}><summary><span><b>${esc(item.pid)}</b><span class="sub">${esc(item.r?.ProductIDDescription || item.r?.EOXError?.ErrorDescription || 'Lifecycle status unverified')} · ${esc(quantityLabel(item.pid))}</span></span><span class="lifesummary">${pill(item.state)}</span><span class="expandicon">⌄</span></summary><div class="lifeevents"><div class="milestone-grid">${events.map(event =>
      `<div class="milestone ${event.key === 'EndOfServiceContractRenewal' ? 'renewal-mile' : ''}"><span>${esc(event.label)}</span><b>${esc(dateDisplay(event.date))}</b><small>${event.days === null ? 'Unverified / not published' : event.days < 0 ? 'Date passed' : event.days === 0 ? 'Due today' : event.days + ' days remaining'}</small></div>`).join('')}</div><div class="renewalnote"><b>Renewal exposure:</b> ${esc(renewalStatus(item))}. Last published service contract renewal date: ${esc(dateDisplay(renewal))}. This is a product lifecycle cutoff, not your actual contract expiration date.</div><div class="recordlink">${link(item.r)}</div></div></details>`;
  }).join('') + '</div>' : '<div class="empty"><b>No milestones match this filter</b>Try All milestones or Unverified.</div>';
  return summary + filters + `<p class="sub" role="status">${products.length} of ${items.length} products match the selected milestone filter. Missing dates remain unverified.</p>` + list;
}
function renderMigration(items) {
  return '<div class="callout">Cisco-published migration references are starting points. Technical equivalence, compatibility, ordering availability, stock and current support require verification.</div><div class="oplist">' + items.map(item => {
    const entries = migrationEntries(item.r);
    return `<article class="op"><div><h3>${esc(item.pid)}</h3><p>${esc(quantityLabel(item.pid))}</p>${entries.length ? entries.map(entry => `<p style="margin-top:8px"><b>${esc(entry.pids.join(', '))}</b><br>${esc(entry.information || 'No published migration description')}</p>`).join('') : `<p style="margin-top:8px">${item.r?.EOLProductID || item.state === 'no_notice' ? 'No published migration PID' : 'Migration information unverified'}</p>`}<p style="margin-top:8px">${link(item.r)}</p></div>${pill(item.state)}</article>`;
  }).join('') + '</div>';
}
function renderOpportunities(items) {
  const published=items.filter(item=>item.r?.EOLProductID&&!item.r.EOXError);
  const unverified=items.filter(item=>!item.r?.EOLProductID||item.r.EOXError);
  const cards=published.length?'<div class="oplist">'+published.map(item=>
    `<article class="op"><div><h3>${esc(item.pid)} ${pill(item.state)}</h3><p class="source-text">${esc(item.r.ProductIDDescription||'')}</p><p class="op-quantity">${esc(quantityLabel(item.pid))}</p><div class="op-dates"><span>End of Sale <b>${esc(dateDisplay(dateVal(item.r.EndOfSaleDate)))}</b></span><span>Last Support <b>${esc(dateDisplay(dateVal(item.r.LastDateOfSupport)))}</b></span><span>Service Contract Renewal <b>${esc(dateDisplay(dateVal(item.r.EndOfServiceContractRenewal)))}</b></span></div><p>${esc(renewalStatus(item))}.</p><p style="margin-top:8px">${migration(item.r).length?'Cisco migration PID: '+esc(migration(item.r).join(', '))+'.':'No published migration PID.'}</p><p style="margin-top:8px">${link(item.r)}</p></div></article>`).join('')+'</div>':'<div class="empty"><b>No published lifecycle records</b>Products without a published notice remain unverified.</div>';
  const pending=unverified.length?'<div class="callout"><b>Verification required</b><br>'+unverified.map(item=>`${esc(item.pid)} · ${esc(quantityLabel(item.pid))} · ${esc(stateName(item.state))}`).join('<br>')+'</div>':'';
  return '<div class="callout">Plan refresh and renewal discussions using Cisco-published dates and your quantities. Published renewal cutoffs are not actual customer contract expiration dates.</div>'+cards+pending;
}
function requestActions() {
  const selected=selectedItems();
  return '<div class="ingram-cta"><div><div class="cta-kicker">INGRAM MICRO · CISCO PRESALES</div><h3>Ready to turn lifecycle risk into a refresh project?</h3><p>Contact Ingram for validated configuration, price and lead time. Cisco migration references are a starting point, not a complete orderable BOM.</p><p class="sub">Select products for a quotation request. '+selected.length+' / '+query.length+' selected</p><p class="source-text"><a href="mailto:'+esc(INGRAM_PRESALES_EMAIL)+'">'+esc(INGRAM_PRESALES_EMAIL)+'</a></p></div><div class="request-actions"><button class="btn primary" id="sendIngram" '+(selected.length?'':'disabled')+'>Send email to Ingram →</button><button class="btn" id="downloadRequest" '+(selected.length?'':'disabled')+'>Download request</button></div></div>';
}
function render() {
  const items = qs();
  $('mTotal').textContent = items.length;
  $('mFound').textContent = items.filter(item => item.r?.EOLProductID).length;
  $('mEnded').textContent = items.filter(item => item.state === 'ended').length;
  $('mMigration').textContent = items.reduce((total, item) => total + migration(item.r).length, 0);
  const names = {
    bom: ['Bulk BOM Analysis', 'Product-by-product lifecycle visibility for your BOM.'],
    timeline: ['Lifecycle Timeline & Renewal Exposure', 'Filter published milestones and review renewal cutoffs by product.'],
    migration: ['Migration Advisor', 'Cisco-published alternatives requiring configuration and commercial validation.'],
    opportunities: ['Ingram Refresh Opportunities', 'Refresh planning based on published lifecycle dates and your quantities.']
  };
  $('viewTitle').textContent = names[view][0];
  $('viewDesc').textContent = names[view][1];
  document.querySelectorAll('.module').forEach(button => button.classList.toggle('on', button.dataset.view === view));
  $('export').disabled = loading || !items.length;
  let output;
  if (loading) output = '<div class="empty"><b>Retrieving lifecycle information…</b>Please wait.</div>';
  else if (searchError) output = '<div class="empty"><b>Lifecycle information unavailable</b>Please retry your search.</div>';
  else if (!items.length) output = '<div class="empty"><b>No products selected</b>Enter Cisco PIDs to start the analysis.</div>';
  else if (view === 'bom') output = `<div class="callout">Lifecycle information for <b>${items.length}</b> requested products. Absence of an EoX notice does not confirm active support.</div>` + table(items);
  else if (view === 'timeline') output = renderTimeline(items);
  else if (view === 'migration') output = renderMigration(items);
  else output = renderOpportunities(items);
  if(view==='opportunities'&&!loading&&!searchError&&items.length)output+=requestActions();
  $('queryTimestamp').textContent=lastQueryAt?'Last queried: '+timestampText(lastQueryAt):'';
  $('viewContent').innerHTML = output;
  bindResultActions();
  document.querySelectorAll('[data-life-filter]').forEach(button => button.onclick = () => { timelineFilter = button.dataset.lifeFilter; render(); });
  bindRequestActions();applyLanguage();
}
