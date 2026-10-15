'use strict';

// Set the real presales address here when it is available. Empty opens a draft
// with a blank recipient; the partner can add their Ingram contact.
const INGRAM_PRESALES_EMAIL = '';
let timelineFilter = 'all';

function knownQuantity(pid) { return bom.get(pid)?.quantity ?? null; }
function quantityLabel(pid) {
  const quantity = knownQuantity(pid);
  return quantity === null ? 'Quantity not provided' : 'BOM Qty: ' + quantity;
}
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
  return items.length + ' products · ' + known.reduce((sum, quantity) => sum + quantity, 0) + ' known BOM units' +
    (unknown ? ' · quantity missing for ' + unknown + ' products' : '');
}
function priority(item) {
  if (!item.r?.EOLProductID || item.r.EOXError) return null;
  const rules = [
    ['LastDateOfSupport', 'Last support', 85, 70],
    ['EndOfSecurityVulSupportDate', 'Security support', 80, 65],
    ['EndOfServiceContractRenewal', 'Published renewal cutoff', 75, 60],
    ['EndOfSWMaintenanceReleases', 'Software maintenance', 55, 45],
    ['EndOfSaleDate', 'End of sale', 40, 30]
  ];
  const candidates = [];
  for (const [key, label, passed, soon] of rules) {
    const date = dateVal(item.r[key]), days = dayDiff(date);
    if (days !== null && days <= 365) candidates.push({
      points: days < 0 ? passed : soon,
      reason: label + (days < 0 ? ' passed on ' : ' due on ') + dateDisplay(date)
    });
  }
  candidates.sort((a, b) => b.points - a.points);
  const base = candidates[0]?.points ?? 0;
  const quantity = knownQuantity(item.pid);
  const volume = base > 0 && quantity !== null ? Math.min(15, 3 * Math.floor(Math.log2(quantity))) : 0;
  const reason = candidates[0]?.reason ?? 'No scored milestone within 365 days in the available record';
  return {
    base, volume, score: Math.min(100, base + volume),
    explanation: reason + '. Base ' + base + ' + BOM volume ' + volume + ' = ' + Math.min(100, base + volume) + '/100. ' +
      (quantity === null ? 'Quantity was not provided; no volume points added.' : 'BOM quantity: ' + quantity + '.')
  };
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
  const scored = items.map(item => ({ item, assessment: priority(item) })).filter(row => row.assessment)
    .sort((a, b) => b.assessment.score - a.assessment.score);
  const unverified = items.filter(item => !priority(item));
  const explanation = '<details class="callout"><summary><b>How the Ingram priority score works</b></summary>' +
    'Use the highest applicable base score, never the sum: last support passed 85 / within 365 days 70; security support 80 / 65; published renewal cutoff 75 / 60; software maintenance 55 / 45; end of sale 40 / 30. Otherwise base 0. ' +
    'For a nonzero base, add 3 × floor(log2(BOM quantity)), capped at 15. Missing quantity adds 0. Total capped at 100. Migration availability does not add risk points. ' +
    'This is an Ingram assessment, not a Cisco rating, quotation or confirmation of a customer contract. Missing milestones remain unverified; a score of 0 does not confirm active support.</details>';
  const cards = scored.length ? '<div class="oplist">' + scored.map(({ item, assessment }) =>
    `<article class="op"><div><h3>${esc(item.pid)} ${pill(item.state)}</h3><p>${esc(item.r.ProductIDDescription || '')}</p><p style="margin-top:8px">${esc(assessment.explanation)}</p><p style="margin-top:8px">${esc(renewalStatus(item))}. ${migration(item.r).length ? 'Cisco migration PID: ' + esc(migration(item.r).join(', ')) + '.' : 'No published migration PID.'}</p><p style="margin-top:8px">${link(item.r)}</p></div><div><div class="score">${assessment.score}<span style="font-size:12px">/100</span></div><div class="sub">Priority score</div></div></article>`).join('') + '</div>' : '<div class="empty"><b>No scored opportunities</b>Only products with published lifecycle notices are prioritized.</div>';
  const pending = unverified.length ? '<div class="callout"><b>Verification required — not scored</b><br>' + unverified.map(item => `${esc(item.pid)} · ${esc(quantityLabel(item.pid))} · ${esc(stateName(item.state))}`).join('<br>') + '</div>' : '';
  return explanation + cards + pending;
}
function emailDraft(items = qs()) {
  const lines = items.map(item => {
    const assessment = priority(item);
    return item.pid + ' | ' + quantityLabel(item.pid) + ' | ' + stateName(item.state) +
      ' | ' + renewalStatus(item) + ' | Priority: ' + (assessment ? assessment.score + '/100' : 'Unverified / not scored') +
      (migration(item.r).length ? ' | Cisco migration PID: ' + migration(item.r).join(', ') : '');
  });
  const body = 'Hello Ingram Micro Cisco Team,\n\nPlease validate replacement configurations, licensing, pricing and current lead times for this lifecycle review.\n\n' +
    lines.join('\n') + '\n\nPublished renewal cutoffs are product lifecycle dates, not actual customer contract expirations. Migration references require validation.\n\n' +
    'Customer / project: [Please complete]\nMissing quantities: [Please complete]\nCurrent contracts / requirements: [Please complete]\n\nThank you.';
  const address = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(INGRAM_PRESALES_EMAIL) ? INGRAM_PRESALES_EMAIL : '';
  return 'mailto:' + address + '?subject=' + encodeURIComponent('Cisco Lifecycle Refresh - Configuration, Price & Lead Time Request') + '&body=' + encodeURIComponent(body);
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
    opportunities: ['Ingram Refresh Opportunities', 'Refresh and renewal priorities based on lifecycle evidence and BOM quantities.']
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
  if (view === 'opportunities' && !loading && !searchError && items.length) output += '<div class="ingram-cta"><div><div class="cta-kicker">INGRAM MICRO · CISCO PRESALES</div><h3>Ready to turn lifecycle risk into a refresh project?</h3><p>Contact Ingram for validated configuration, price and lead time. Cisco migration references are a starting point, not a complete orderable BOM.</p><p class="sub">' + (INGRAM_PRESALES_EMAIL ? 'Review the draft before sending.' : 'Add your Ingram contact in the recipient field of the email draft.') + '</p></div><button class="btn primary" id="sendIngram">✉ Send email to Ingram →</button></div>';
  $('viewContent').innerHTML = output;
  document.querySelectorAll('[data-pid]').forEach(row => row.onclick = () => { chosen = row.dataset.pid; render(); });
  document.querySelectorAll('[data-life-filter]').forEach(button => button.onclick = () => { timelineFilter = button.dataset.lifeFilter; render(); });
  const send = $('sendIngram');
  if (send) send.onclick = () => { location.href = emailDraft(); };
}
