'use strict';
// Presentation and local planning only. Cisco requests and permissions stay in the existing pipeline.
let actionFilter='all', exampleOpen=false, detailOpen=true, detailExpanded=false;
function resetActionWorkspace(){actionFilter='all';detailOpen=true;detailExpanded=false;exampleOpen=false;}
const say=(tr,en)=>appLang==='tr'?tr:en;
function detailShell(item){
  if(!item)return '';
  return `<section class="product-inspector ${detailExpanded?'expanded':''}"><header class="inspector-header"><div><span class="cta-kicker">${say('ÜRÜN DETAYI','PRODUCT DETAIL')}</span><h3>${esc(item.pid)}</h3></div><div class="inspector-controls"><button class="btn small" id="toggleProductDetail" aria-expanded="${detailOpen}" aria-controls="productDetailBody">${detailOpen?say('⌃ Daralt','⌃ Collapse'):say('⌄ Aç','⌄ Open')}</button><button class="btn small" id="expandProductDetail" aria-pressed="${detailExpanded}">${detailExpanded?say('↙ Normal görünüm','↙ Normal view'):say('↗ Genişlet','↗ Expand')}</button></div></header><div id="productDetailBody" ${detailOpen?'':'hidden'}>${detail(item)}${advisory(item)}${merakiHelp(item)}</div></section>`;
}
function bindDetailControls(){
  const panel=document.querySelector('.product-inspector');
  if(panel){panel.setAttribute('role',detailExpanded?'dialog':'region');panel.setAttribute('aria-label',say('Ürün detayı','Product detail'));if(detailExpanded)panel.setAttribute('aria-modal','true')}
  document.querySelectorAll('[data-inspect]').forEach(button=>button.onclick=()=>{chosen=button.dataset.inspect;detailOpen=true;render();const panel=document.querySelector('.product-inspector');if(panel){panel.tabIndex=-1;panel.focus({preventScroll:true});panel.scrollIntoView({block:'nearest',behavior:'smooth'})}});
  if($('toggleProductDetail'))$('toggleProductDetail').onclick=()=>{detailOpen=!detailOpen;if(!detailOpen)detailExpanded=false;render();$('toggleProductDetail')?.focus()};
  if($('expandProductDetail'))$('expandProductDetail').onclick=()=>{detailExpanded=!detailExpanded;if(detailExpanded)detailOpen=true;render();$('expandProductDetail')?.focus()};
}
document.addEventListener('keydown',event=>{
 if(!detailExpanded)return;
 if(event.key==='Escape'){event.preventDefault();detailExpanded=false;render();$('expandProductDetail')?.focus()}
 if(event.key==='Tab'){
  const panel=document.querySelector('.product-inspector');
  const controls=Array.from(panel?.querySelectorAll('button,a[href],input,summary')||[]).filter(el=>el.getClientRects().length);
  const first=controls[0],last=controls.at(-1);if(!first)return;
  if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first.focus()}
 }
});
function planningDays(value) {
  if(!value)return null;
  const time=Date.parse(value+'T00:00:00Z');
  if(!Number.isFinite(time))return null;
  const horizon=Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())+365*86400000;
  return {past:dayDiff(value)<0,within:time<=horizon&&dayDiff(value)>=0};
}
function actionMatches(item,key) {
  const support=planningDays(dateVal(item.r?.LastDateOfSupport));
  const renewal=planningDays(dateVal(item.r?.EndOfServiceContractRenewal));
  return key==='all'||(key==='ended'&&item.state==='ended')||(key==='support'&&support?.within&&item.state!=='conflict')||
    (key==='renewal'&&renewal?.within&&item.state!=='conflict')||(key==='verify'&&(!item.r?.EOLProductID||item.state==='conflict'));
}
function actionCards(items) {
  const labels={all:say('Tüm ürünler','All products'),ended:say('Destek sonu geçmiş','Support end passed'),support:say('Destek sonu yaklaşan','Support end approaching'),renewal:say('Yenileme sınırı yaklaşan','Renewal cutoff approaching'),verify:say('İncelenmesi gereken','Needs review')};
  return '<div class="action-cards" role="group" aria-label="'+say('Aksiyon filtreleri','Action filters')+'">'+Object.entries(labels).map(([key,label])=>{
    const group=items.filter(item=>actionMatches(item,key));
    return `<button class="action-card ${key} ${actionFilter===key?'active':''}" data-action-filter="${key}" aria-pressed="${actionFilter===key}"><span>${label}</span><b>${group.length} <small>${say('model','models')}</small></b><span>${group.reduce((n,i)=>n+selectedQuantity(i.pid),0)} ${say('cihaz','units')}</span></button>`;
  }).join('')+'</div>';
}
function serviceContext(item) {
  const support=dayDiff(dateVal(item.r?.LastDateOfSupport)), renewal=dayDiff(dateVal(item.r?.EndOfServiceContractRenewal));
  if(item.state==='conflict')return say('Cisco kayıtlarında çelişen tarihler var. Kaynak kayıtları ve ürün bilgileri birlikte incelenmeli.','Cisco records contain conflicting dates. Review source records and product details together.');
  if(!item.r?.EOLProductID)return say('Yayınlanmış bir destek takvimi doğrulanamadı. Ürün kimliğini ve mevcut servis kapsamını birlikte inceleyelim.','A published support schedule could not be confirmed. Review product identity and existing service coverage.');
  if(support!==null&&support<0)return say('Yayınlanan son destek tarihi geçmiş. Yeni platforma geçiş ve devreye alma planını değerlendirin.','The published last support date has passed. Review migration and deployment planning.');
  if(renewal!==null&&renewal<0)return say('Yayınlanan servis yenileme sınırı geçmiş. Mevcut kapsamı ve geçiş takvimini değerlendirin.','The published service renewal cutoff has passed. Review existing coverage and migration timing.');
  if(renewal!==null&&renewal<=365)return say('Yayınlanan servis yenileme sınırı 12 ay içinde. Mevcut sözleşmenizi ve seçeneklerinizi inceletin.','The published renewal cutoff is within 12 months. Have your existing contract and options reviewed.');
  return say('Teknik destek, donanım değişimi ve geçiş ihtiyaçlarınıza uygun servis kapsamını değerlendirin.','Review service coverage for technical support, hardware replacement and migration needs.');
}
function serviceMail(items,intent='coverage') {
  const intents={coverage:say('Servis kapsamı değerlendirmesi','Service coverage review'),migration:say('Geçiş ve devreye alma planı','Migration and deployment planning'),configuration:say('Konfigürasyon ve lisans doğrulaması','Configuration and licensing validation')};
  const subject=intents[intent]||intents.coverage;
  const lines=items.map(i=>i.pid+' | '+say('Adet: ','Quantity: ')+selectedQuantity(i.pid)+' | '+uiText(stateName(i.state))+'\n'+serviceContext(i)+'\n'+say('Cisco geçiş referansları: ','Cisco migration references: ')+(migration(i.r).join(', ')||say('Yayınlanmamış','Not published')));
  const body=say('Merhaba Ingram Micro Cisco Ekibi,','Hello Ingram Micro Cisco Team,')+'\n\n'+subject+'\n\n'+lines.join('\n\n')+'\n\n'+say('Yayınlanan ürün tarihleri gerçek sözleşme bitişi veya servis uygunluğu onayı değildir. Seri numarası, sözleşme ve gereksinim bilgilerini güvenli kanaldan paylaşarak değerlendirme rica ediyoruz.\n\nMüşteri / proje: [Tamamlayın]\nİş gereksinimi: [Tamamlayın]','Published product dates are not actual contract expirations or confirmation of service eligibility. Please review serial numbers, contracts and requirements with us through a secure channel.\n\nCustomer / project: [Complete]\nBusiness requirement: [Complete]');
  return requestMailto({subject,body});
}
function advisory(item) {
  if(!item)return '';
  return '<section class="service-advice"><div class="cta-kicker">INGRAM MICRO · CISCO</div><h3>'+say('Bu ürün için sonraki adım','Next step for this product')+'</h3><p>'+esc(serviceContext(item))+'</p>'+ingramPresales(item)+`<a class="btn" data-service-product="${esc(item.pid)}" href="${esc(serviceMail([item]))}">${say('Servis değerlendirmesi iste','Request service review')}</a></section>`;
}
function servicePanel() {
 const selected=selectedItems();
 const options=[
  ['coverage','01',say('Servis kapsam\u0131n\u0131 incelet','Review service coverage'),say('Teknik destek ve donan\u0131m de\u011fi\u015fimi ihtiya\u00e7lar\u0131n\u0131z\u0131 de\u011ferlendirelim.','Review technical support and hardware replacement needs.')],
  ['migration','02',say('Ge\u00e7i\u015f plan\u0131 iste','Request migration planning'),say('Yeni platforma ge\u00e7i\u015fi ve devreye alma ad\u0131mlar\u0131n\u0131 birlikte planlayal\u0131m.','Plan your next platform and deployment steps together.')],
  ['configuration','03',say('BOM ve lisans do\u011frulat','Validate BOM & licensing'),say('Konfig\u00fcrasyon, lisans ve abonelik se\u00e7eneklerinizi netle\u015ftirelim.','Validate configuration, licensing and subscription options.')]
 ];
 return `<section id="servicePanel" class="service-panel service-highlight"><div class="service-heading"><div class="cta-kicker">INGRAM MICRO \u00b7 CISCO</div><h3>${say('Analizden sonraki ad\u0131m\u0131 birlikte atal\u0131m.','Take the next step with Ingram.')}</h3><p>${say('Se\u00e7ti\u011finiz \u00fcr\u00fcnler i\u00e7in do\u011fru ekiple g\u00f6r\u00fc\u015fmeyi ba\u015flat\u0131n.','Start a conversation about the products you selected.')}</p><span class="selected-chip">${selected.length} ${say('\u00fcr\u00fcn se\u00e7ili','products selected')}</span></div><div class="service-options">${options.map(([key,n,title,description])=>`<a class="service-option service-${key} ${selected.length?'':'disabled'}" ${selected.length?'href="'+esc(serviceMail(selected,key))+'"':'aria-disabled="true"'}><span class="service-number">${n}</span><strong>${title}</strong><span>${description}</span><b>${say('Ekibe e-posta yaz','Email the team')} \u2192</b></a>`).join('')}</div><div class="service-footer"><p>${say('Se\u00e7ilen \u00fcr\u00fcnler ve adetler e-posta tasla\u011f\u0131na eklenir. Mevcut kapsam ve servis uygunlu\u011fu ayr\u0131ca do\u011frulan\u0131r.','Selected products and quantities are included in the draft. Existing coverage and service eligibility require separate verification.')}</p><button class="btn small" id="downloadRequest" ${selected.length?'':'disabled'}>${say('Talebi indir','Download request')}</button></div></section>`;
}
function exampleAnalysis() {
  return `<section class="example-panel" data-no-translate><div class="inline" style="justify-content:space-between"><h3>${say('Örnek analiz · temsili veriler','Example analysis · illustrative data')}</h3><button class="btn small" id="closeExample">${say('Kapat','Close')}</button></div><p>${say('Örneğin 40 cihazlık bir listede:','For example, in a list of 40 devices:')}</p><div class="example-flow"><div><b>12</b>${say('cihazın destek sonu geçmiş','devices past support end')}<small>${say('Geçiş planını değerlendirin','Review migration planning')}</small></div><div><b>8</b>${say('cihazın yenileme sınırı yakın','devices near renewal cutoff')}<small>${say('Sözleşme ve kapsamı inceletin','Review contracts and coverage')}</small></div><div><b>20</b>${say('cihaz için inceleme sürüyor','devices under review')}<small>${say('Bilinmeyen durum, güncel destek anlamına gelmez','Unknown status does not confirm current support')}</small></div></div><p class="sub">${say('Bu gösterim canlı Cisco sonucu değildir; dosyanızı ve mevcut analizinizi değiştirmez.','This is not live Cisco data; your file and current analysis stay intact.')}</p></section>`;
}
function render() {
  const items=qs(),visible=items.filter(item=>actionMatches(item,actionFilter));
  $('mTotal').textContent=items.length;$('mFound').textContent=items.filter(i=>i.r?.EOLProductID).length;
  $('mEnded').textContent=items.filter(i=>i.state==='ended').length;$('mMigration').textContent=items.reduce((n,i)=>n+migration(i.r).length,0);
  $('viewTitle').textContent=say('Cisco aksiyon planınız','Your Cisco action plan');
  $('viewDesc').textContent=say('Aynı listede destek takvimi, geçiş referansları ve servis değerlendirmesi.','Support milestones, migration references and service review in one list.');
  $('export').disabled=loading||!items.length;
  $('queryTimestamp').textContent=lastQueryAt?uiText('Last queried: ')+timestampText(lastQueryAt):'';
  let output='';
  if(exampleOpen)output+=exampleAnalysis();
  if(loading&&!items.length)output+='<div class="empty"><b>Retrieving lifecycle information…</b>Please wait.</div>';
  else if(searchError)output+='<div class="empty"><b>Lifecycle information unavailable</b>Please retry your search.</div>';
  else if(!items.length)output+=`<div class="welcome-result"><span class="welcome-icon">① → ② → ③</span><h3>${say('Ürün listenizden somut bir plan çıkarın','Turn your product list into a practical plan')}</h3><p>${say('Listenizi ekleyin. Tarihlere göre inceleyin. Seçtiğiniz ürünler için Ingram’dan destek isteyin.','Add your list. Review published dates. Ask Ingram for help with the products you select.')}</p><button class="btn" id="emptyExample">${say('Örnek analiz gör','See example analysis')}</button></div>`;
  else {
    output+='<p class="sub">'+say('Yaklaşan tarihler: önümüzdeki 365 gün. Gruplar örtüşebilir.','Approaching dates: next 365 days. Groups may overlap.')+'</p>'+actionCards(items);
    output+=`<div class="filter-caption" role="status">${visible.length} / ${items.length} ${say('model gösteriliyor','models shown')} <button class="btn small" data-action-filter="all">${say('Filtreyi temizle','Clear filter')}</button><button class="btn small" id="customerReport">${say('Müşteri raporu / PDF','Customer report / PDF')}</button></div>`;
    // Keep selection, quantities and retry scoped to the complete analysis, independent of visibility.
    if(actionFilter!=='all')output+='<p class="sub">'+say('Seçim, e-posta ve CSV işlemleri filtrede gizlenenler dahil tüm analizdeki seçiminizi kullanır.','Selection, email and CSV use your selection across the complete analysis, including hidden rows.')+'</p>';
    let productTable=table(items).replace('<tbody>'+items.map(row).join('')+'</tbody>','<tbody>'+visible.map(row).join('')+'</tbody>');
    const currentDetail=detail(selected());
    if(currentDetail)productTable=productTable.replace(currentDetail,detailShell(selected()));
    output+=productTable;
    if(!visible.length)output+='<p class="callout">'+say('Bu filtreye uyan ürün yok.','No products match this filter.')+'</p>';
    output+=servicePanel();
  }
  $('viewContent').innerHTML=output;bindResultActions();bindRequestActions();bindDetailControls();
  document.querySelectorAll('[data-action-filter]').forEach(b=>b.onclick=()=>{actionFilter=b.dataset.actionFilter;render();document.querySelector('.action-card.active')?.focus()});
  if($('customerReport'))$('customerReport').onclick=()=>printAssessment(items);
  for(const id of ['seeExample','emptyExample'])if($(id))$(id).onclick=()=>{exampleOpen=true;render();document.querySelector('.example-panel')?.scrollIntoView({block:'nearest'})};
  if($('closeExample'))$('closeExample').onclick=()=>{exampleOpen=false;render()};
  document.querySelectorAll('[data-workspace]').forEach(b=>b.onclick=()=>{
    const target=(b.dataset.workspace==='input'?$('pids'):b.dataset.workspace==='services'?$('servicePanel'):document.querySelector('.content'))||$('pids');
    document.querySelectorAll('[data-workspace]').forEach(n=>{n.classList.toggle('on',n===b);n.setAttribute('aria-current',n===b?'location':'false')});
    if(target!==$('pids'))target.tabIndex=-1;
    target.scrollIntoView({block:'start',behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.focus({preventScroll:true});
  });
  document.body.classList.toggle('inspector-open',detailExpanded&&!!items.length);
  applyLanguage();
}
function printAssessment(items) {
  const popup=window.open('','_blank');if(!popup){setStatus(say('Rapor için açılır pencereye izin verin.','Allow pop-ups to open the report.'),true);return}
  const heading=say('Cisco yaşam döngüsü değerlendirmesi','Cisco lifecycle assessment');
  const body=`<h1>${heading}</h1><p>Ingram Micro Türkiye · ${esc(timestampText(lastQueryAt))}</p><label>${say('Müşteri / proje','Customer / project')} <input placeholder="${say('Rapor için buraya yazın','Type here for the report')}"></label><p>${say('Kaynak: Cisco EoX / Product Information. Tarihler ürün yaşam döngüsüne aittir; gerçek sözleşme bitişi, servis uygunluğu veya kesin uyumlu geçiş onayı değildir.','Source: Cisco EoX / Product Information. Dates describe product lifecycles, not actual contract expirations, service eligibility or confirmation of migration compatibility.')}</p>${actionCards(items)}<p>${say('Yakla\u015fan tarihler: 365 g\u00fcn. Gruplar \u00f6rt\u00fc\u015febilir.','Approaching dates: next 365 days. Groups may overlap.')}</p><table><thead><tr>${['Product ID','Quantity','Status','Last Support','Service Contract Renewal','Migration PID','Source checked:'].map(x=>'<th>'+esc(uiText(x))+'</th>').join('')}</tr></thead><tbody>${items.map(i=>'<tr>'+[i.pid,selectedQuantity(i.pid),uiText(stateName(i.state)),dateDisplay(dateVal(i.r?.LastDateOfSupport)),dateDisplay(dateVal(i.r?.EndOfServiceContractRenewal)),migration(i.r).join(', ')||'—',i.r?.lifecycleMeta?.cache?.checked_at?timestampText(i.r.lifecycleMeta.cache.checked_at):say('Doğrulanamadı','Unverified')].map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr><tr><td colspan="7">'+esc(serviceContext(i))+' '+link(i.r)+'</td></tr>').join('')}</tbody></table><p>${say('Konfigürasyon, lisanslama ve servis değerlendirmesi:','Configuration, licensing and service review:')} ${esc(INGRAM_PRESALES_EMAIL)}</p>`;
  popup.opener=null;
  popup.document.write('<!doctype html><html lang="'+appLang+'"><meta charset="utf-8"><title>'+heading+'</title><style>body{font:14px Arial;color:#173654;margin:30px}h1{color:#007eaf}input{border:0;border-bottom:1px solid #aaa;font:inherit;padding:8px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:9px;border:1px solid #ddd;text-align:left;font-size:11px;overflow-wrap:anywhere}tr{break-inside:avoid}.action-cards{display:flex;gap:12px;margin:20px 0}.action-card{flex:1;padding:12px;border:1px solid #ccc;background:white;color:inherit}.action-card span,.action-card b{display:block}button{cursor:pointer;padding:10px}@media print{.print-button{display:none}body{margin:0}@page{size:A4 landscape;margin:12mm}}</style><body><button class="print-button" id="print">'+say('Yazdır / PDF olarak kaydet','Print / Save as PDF')+'</button>'+body+'</body></html>');
  popup.document.close();popup.document.getElementById('print').onclick=()=>popup.print();
}
