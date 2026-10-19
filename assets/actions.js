'use strict';
// Presentation and local planning only. Cisco requests and permissions stay in the existing pipeline.
let actionFilter='all', planningDate='', exampleOpen=false;
function resetActionWorkspace(){actionFilter='all';planningDate='';exampleOpen=false;}
const say=(tr,en)=>appLang==='tr'?tr:en;
function planningDays(value) {
  if(!value)return null;
  const time=Date.parse(value+'T00:00:00Z');
  if(!Number.isFinite(time))return null;
  const horizon=planningDate?Date.parse(planningDate+'T00:00:00Z'):Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())+365*86400000;
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
  return '<section class="service-advice"><div class="cta-kicker">INGRAM MICRO · CISCO</div><h3>'+say('Bu ürün için sonraki adım','Next step for this product')+'</h3><p>'+esc(serviceContext(item))+'</p>'+ingramPresales(item)+`<a class="btn" data-service-product="${esc(item.pid)}" href="${esc(serviceMail([item]))}">${say('Servis değerlendirmesi iste','Request service review')}</a><button class="btn small" data-calendar="${esc(item.pid)}">${say('Tarihleri takvime ekle','Add dates to calendar')}</button></section>`;
}
function servicePanel() {
  const selected=selectedItems();
  return `<section id="servicePanel" class="service-panel"><div><div class="cta-kicker">${say('SEÇİLEN ÜRÜNLER İÇİN','FOR SELECTED PRODUCTS')}</div><h3>${say('Ingram ile bir sonraki adımı planlayın','Plan your next step with Ingram')}</h3><p>${say('İhtiyacınızı seçin. Ürünler ve güncel adetler e-posta taslağına aktarılır.','Choose your need. Products and current quantities are included in the email draft.')}</p><p class="sub">${selected.length} ${say('ürün seçili. Servis uygunluğu ve mevcut kapsam ayrıca doğrulanır.','products selected. Service eligibility and existing coverage require separate verification.')}</p></div><div class="service-buttons">${[['coverage',say('Servis kapsamını incelet','Review service coverage')],['migration',say('Geçiş planı iste','Request migration planning')],['configuration',say('BOM ve lisans doğrulat','Validate BOM & licensing')]].map(([key,label])=>`<a class="btn ${selected.length?'':'disabled'}" ${selected.length?'href="'+esc(serviceMail(selected,key))+'"':'aria-disabled="true"'}>${label}</a>`).join('')}<button class="btn small" id="downloadRequest" ${selected.length?'':'disabled'}>${say('Talebi indir','Download request')}</button></div></section>`;
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
    output+=`<div class="planning-bar"><label>${say('Planlama ufku','Planning horizon')} <input id="planningDate" type="date" value="${esc(planningDate)}"></label><button class="btn small" id="resetHorizon">${say('Önümüzdeki 12 ay','Next 12 months')}</button><span>${say('Kartlar örtüşebilir. Yayınlanmış ürün tarihleri kullanılır; destek kapsamı onaylanmaz.','Groups can overlap. Published product dates are used; service coverage is not confirmed.')}</span></div>`+actionCards(items);
    output+=`<div class="filter-caption" role="status">${visible.length} / ${items.length} ${say('model gösteriliyor','models shown')} <button class="btn small" data-action-filter="all">${say('Filtreyi temizle','Clear filter')}</button><button class="btn small" id="customerReport">${say('Müşteri raporu / PDF','Customer report / PDF')}</button></div>`;
    // Keep selection, quantities and retry scoped to the complete analysis, independent of visibility.
    if(actionFilter!=='all')output+='<p class="sub">'+say('Seçim, e-posta ve CSV işlemleri filtrede gizlenenler dahil tüm analizdeki seçiminizi kullanır.','Selection, email and CSV use your selection across the complete analysis, including hidden rows.')+'</p>';
    output+=table(items).replace('<tbody>'+items.map(row).join('')+'</tbody>','<tbody>'+visible.map(row).join('')+'</tbody>');
    if(!visible.length)output+='<p class="callout">'+say('Bu filtreye uyan ürün yok.','No products match this filter.')+'</p>';
    output+=advisory(selected())+servicePanel();
  }
  $('viewContent').innerHTML=output;bindResultActions();bindRequestActions();
  document.querySelectorAll('[data-action-filter]').forEach(b=>b.onclick=()=>{actionFilter=b.dataset.actionFilter;render();document.querySelector('.action-card.active')?.focus()});
  if($('planningDate'))$('planningDate').onchange=()=>{planningDate=$('planningDate').value;render()};
  if($('resetHorizon'))$('resetHorizon').onclick=()=>{planningDate='';render()};
  if($('customerReport'))$('customerReport').onclick=()=>printAssessment(items);
  for(const id of ['seeExample','emptyExample'])if($(id))$(id).onclick=()=>{exampleOpen=true;render();document.querySelector('.example-panel')?.scrollIntoView({block:'nearest'})};
  if($('closeExample'))$('closeExample').onclick=()=>{exampleOpen=false;render()};
  document.querySelectorAll('[data-calendar]').forEach(b=>b.onclick=()=>downloadCalendar(get(b.dataset.calendar)));
  document.querySelectorAll('[data-workspace]').forEach(b=>b.onclick=()=>{
    const target=(b.dataset.workspace==='input'?$('pids'):b.dataset.workspace==='services'?$('servicePanel'):document.querySelector('.content'))||$('pids');
    document.querySelectorAll('[data-workspace]').forEach(n=>{n.classList.toggle('on',n===b);n.setAttribute('aria-current',n===b?'location':'false')});
    if(target!==$('pids'))target.tabIndex=-1;
    target.scrollIntoView({block:'start',behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});target.focus({preventScroll:true});
  });
  applyLanguage();
}
function downloadCalendar(item) {
  const safe=v=>String(v).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const events=[['LastDateOfSupport',say('Yayınlanan son destek tarihi','Published last support date')],['EndOfServiceContractRenewal',say('Yayınlanan servis yenileme sınırı','Published service renewal cutoff')]].flatMap(([key,label])=>{
    const date=dateVal(item.r?.[key]);if(!date)return [];
    return ['BEGIN:VEVENT','UID:'+encodeURIComponent(item.pid)+'-'+key+'-'+date+'@lifecycle.cihanalacamli.github.io','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+date.replaceAll('-',''),'SUMMARY:'+safe(item.pid+' — '+label),'DESCRIPTION:'+safe(serviceContext(item)+' '+say('Ürün yaşam döngüsü tarihidir; gerçek sözleşme bitişi değildir.','Product lifecycle date; not an actual contract expiration.')),'END:VEVENT'];
  });
  if(!events.length){setStatus(say('Takvime eklenebilecek doğrulanmış tarih yok.','No confirmed date available for the calendar.'),true);return}
  // Fold at <=75 UTF-8 octets, without splitting code points (RFC 5545).
  const fold=line=>{let result='',part='',size=0;for(const char of line){const n=new TextEncoder().encode(char).length;if(size+n>74){result+=part+'\r\n ';part='';size=1}part+=char;size+=n}return result+part};
  const data=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LCI//Lifecycle Planning//EN','CALSCALE:GREGORIAN',...events,'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
  const url=URL.createObjectURL(new Blob([data],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='cisco-lifecycle.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function printAssessment(items) {
  const popup=window.open('','_blank');if(!popup){setStatus(say('Rapor için açılır pencereye izin verin.','Allow pop-ups to open the report.'),true);return}
  const heading=say('Cisco yaşam döngüsü değerlendirmesi','Cisco lifecycle assessment');
  const body=`<h1>${heading}</h1><p>Ingram Micro Türkiye · ${esc(timestampText(lastQueryAt))}</p><label>${say('Müşteri / proje','Customer / project')} <input placeholder="${say('Rapor için buraya yazın','Type here for the report')}"></label><p>${say('Kaynak: Cisco EoX / Product Information. Tarihler ürün yaşam döngüsüne aittir; gerçek sözleşme bitişi, servis uygunluğu veya kesin uyumlu geçiş onayı değildir.','Source: Cisco EoX / Product Information. Dates describe product lifecycles, not actual contract expirations, service eligibility or confirmation of migration compatibility.')}</p>${actionCards(items)}<p>${say('Gruplar örtüşebilir. Planlama ufku:','Groups may overlap. Planning horizon:')} ${esc(planningDate||say('Önümüzdeki 12 ay','Next 12 months'))}</p><table><thead><tr>${['Product ID','Quantity','Status','Last Support','Service Contract Renewal','Migration PID','Source checked:'].map(x=>'<th>'+esc(uiText(x))+'</th>').join('')}</tr></thead><tbody>${items.map(i=>'<tr>'+[i.pid,selectedQuantity(i.pid),uiText(stateName(i.state)),dateDisplay(dateVal(i.r?.LastDateOfSupport)),dateDisplay(dateVal(i.r?.EndOfServiceContractRenewal)),migration(i.r).join(', ')||'—',i.r?.lifecycleMeta?.cache?.checked_at?timestampText(i.r.lifecycleMeta.cache.checked_at):say('Doğrulanamadı','Unverified')].map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr><tr><td colspan="7">'+esc(serviceContext(i))+' '+link(i.r)+'</td></tr>').join('')}</tbody></table><p>${say('Konfigürasyon, lisanslama ve servis değerlendirmesi:','Configuration, licensing and service review:')} ${esc(INGRAM_PRESALES_EMAIL)}</p>`;
  popup.opener=null;
  popup.document.write('<!doctype html><html lang="'+appLang+'"><meta charset="utf-8"><title>'+heading+'</title><style>body{font:14px Arial;color:#173654;margin:30px}h1{color:#007eaf}input{border:0;border-bottom:1px solid #aaa;font:inherit;padding:8px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:9px;border:1px solid #ddd;text-align:left;font-size:11px;overflow-wrap:anywhere}tr{break-inside:avoid}.action-cards{display:flex;gap:12px;margin:20px 0}.action-card{flex:1;padding:12px;border:1px solid #ccc;background:white;color:inherit}.action-card span,.action-card b{display:block}button{cursor:pointer;padding:10px}@media print{.print-button{display:none}body{margin:0}@page{size:A4 landscape;margin:12mm}}</style><body><button class="print-button" id="print">'+say('Yazdır / PDF olarak kaydet','Print / Save as PDF')+'</button>'+body+'</body></html>');
  popup.document.close();popup.document.getElementById('print').onclick=()=>popup.print();
}
