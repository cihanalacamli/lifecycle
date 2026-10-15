'use strict';
let manualQuantities = new Map(), selectedPids = new Set(), lastQueryAt = null;
let importDraft = null;

function clearAnalysis() {
  records.clear(); query=[]; chosen=null; searchError=''; lastQueryAt=null;
  manualQuantities.clear(); selectedPids.clear();
}
function sourceQuantity(pid) { return bom.get(pid)?.quantity ?? null; }
function selectedItems() { return qs().filter(item=>selectedPids.has(item.pid)); }
function selectedQuantity(pid) { return manualQuantities.has(pid)?manualQuantities.get(pid):sourceQuantity(pid); }
function timestampText(value) {
  return value?new Intl.DateTimeFormat(appLang==='tr'?'tr-TR':'en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):uiText('Not queried yet');
}
function scrollToResults() {
  const content=document.querySelector('.content');if(!content)return;
  content.focus({preventScroll:true});
  content.scrollIntoView({behavior:globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
function businessSummary(items) {
  const ended=items.filter(item=>item.state==='ended');
  const cutoff=items.filter(item=>{const days=dayDiff(dateVal(item.r?.EndOfServiceContractRenewal));return days!==null&&days>=0&&days<=365});
  const sum=group=>group.reduce((total,item)=>total+(knownQuantity(item.pid)??0),0);
  const unknown=items.filter(item=>!item.r?.EOLProductID).length;
  return `<div class="business-summary" aria-label="Business summary"><span><b>${sum(ended)}</b>Support-ended units<br><small>${ended.length} products${ended.some(item=>knownQuantity(item.pid)===null)?' · Quantity not provided':''}</small></span><span><b>${cutoff.length}</b>Renewal cutoff within 365 days</span><span><b>${unknown}</b>Products requiring verification</span><span><b>${sum(items)}</b>Known total quantity${items.some(item=>knownQuantity(item.pid)===null)?'<br><small>Quantity not provided</small>':''}</span></div>`;
}
function bulkToolbar(items) {
  const count=selectedItems().length;
  return `<div class="bulk-toolbar"><label><input type="checkbox" id="selectAll" ${count===items.length&&items.length?'checked':''}>Select all</label><span role="status">${count} / ${items.length} selected</span><button class="btn small" id="quoteSelected" ${count?'':'disabled'}>Request for selected products</button><button class="btn small" id="exportSelected" ${count?'':'disabled'}>Download selected CSV</button></div>`;
}
function editableQuantity(item) {
  const quantity=knownQuantity(item.pid),original=sourceQuantity(item.pid);
  return `<div class="row-quantity"><label for="quantity-${query.indexOf(item.pid)}">Quantity</label><input class="quantity-input" id="quantity-${query.indexOf(item.pid)}" data-quantity="${esc(item.pid)}" type="number" min="1" step="1" max="9007199254740991" inputmode="numeric" aria-label="${esc('Quantity: '+item.pid)}" value="${quantity??''}" placeholder="—">${manualQuantities.has(item.pid)?`<small>Edited quantity${original!==null?' · Original quantity: '+original:''}</small>`:''}</div>`;
}
function bindResultActions() {
  document.querySelectorAll('[data-inspect]').forEach(button=>button.onclick=()=>{
    chosen=button.dataset.inspect;render();
    const detail=document.querySelector('.detail');if(detail){detail.tabIndex=-1;detail.focus({preventScroll:true});detail.scrollIntoView({behavior:'smooth',block:'nearest'})}
  });
  document.querySelectorAll('[data-select]').forEach(checkbox=>checkbox.onchange=()=>{
    if(checkbox.checked)selectedPids.add(checkbox.dataset.select);else selectedPids.delete(checkbox.dataset.select);render();
    Array.from(document.querySelectorAll('[data-select]')).find(element=>element.dataset.select===checkbox.dataset.select)?.focus();
  });
  const all=$('selectAll');if(all){all.indeterminate=selectedItems().length>0&&selectedItems().length<query.length;all.onchange=()=>{selectedPids=all.checked?new Set(query):new Set();render();$('selectAll')?.focus()}}
  document.querySelectorAll('[data-quantity]').forEach(input=>input.onchange=()=>{
    const raw=input.value.trim(),value=raw===''?null:Number(raw);
    if(raw!==''&&(!/^\d+$/.test(raw)||!Number.isSafeInteger(value)||value<1)){setStatus('Please enter a positive whole-number quantity, or leave it blank.',true);input.value=knownQuantity(input.dataset.quantity)??'';return}
    if(value===sourceQuantity(input.dataset.quantity))manualQuantities.delete(input.dataset.quantity);else manualQuantities.set(input.dataset.quantity,value);
    setStatus('');render();Array.from(document.querySelectorAll('[data-quantity]')).find(element=>element.dataset.quantity===input.dataset.quantity)?.focus();
  });
  const quote=$('quoteSelected');if(quote)quote.onclick=()=>{view='opportunities';render();document.querySelector('.ingram-cta')?.scrollIntoView({behavior:'smooth',block:'center'});$('sendIngram')?.focus({preventScroll:true})};
  const exportSelected=$('exportSelected');if(exportSelected)exportSelected.onclick=()=>exportAnalysis(selectedItems());
}
function downloadText(filename,text,type='text/plain;charset=utf-8') {
  const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type})),anchor=document.createElement('a');
  anchor.href=url;anchor.download=filename;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function requestContent(items=selectedItems()) {
  const lines=items.map(item=>{
    const assessment=priority(item);
    return item.pid+' | '+uiText(quantityLabel(item.pid))+' | '+uiText(stateName(item.state))+' | '+uiText(renewalStatus(item))+
      ' | '+(appLang==='tr'?'Öncelik: ':'Priority: ')+(assessment?assessment.score+'/100':uiText('Unverified / not scored'))+
      (migration(item.r).length?' | '+uiText('Cisco migration PID:')+' '+migration(item.r).join(', '):'');
  });
  const subject=appLang==='tr'?'Cisco Yaşam Döngüsü - Konfigürasyon, Fiyat ve Teslim Süresi Talebi':'Cisco Lifecycle Refresh - Configuration, Price & Lead Time Request';
  const body=appLang==='tr'?'Merhaba Ingram Micro Cisco Ekibi,\n\nAşağıdaki ürünler için alternatif konfigürasyon, lisanslama, fiyat ve güncel teslim sürelerini doğrulamanızı rica ederiz.\n\n'+lines.join('\n')+'\n\nSon sorgulama: '+timestampText(lastQueryAt)+'\n\nYayınlanan yenileme son tarihleri ürün yaşam döngüsü tarihleridir; gerçek müşteri sözleşmesi bitişleri değildir. Geçiş referansları doğrulama gerektirir.\n\nMüşteri / proje: [Lütfen tamamlayın]\nEksik adetler: [Lütfen tamamlayın]\nMevcut sözleşmeler / gereksinimler: [Lütfen tamamlayın]\n\nTeşekkürler.':
    'Hello Ingram Micro Cisco Team,\n\nPlease validate replacement configurations, licensing, pricing and current lead times for this lifecycle review.\n\n'+lines.join('\n')+'\n\nLast queried: '+timestampText(lastQueryAt)+'\n\nPublished renewal cutoffs are product lifecycle dates, not actual customer contract expirations. Migration references require validation.\n\nCustomer / project: [Please complete]\nMissing quantities: [Please complete]\nCurrent contracts / requirements: [Please complete]\n\nThank you.';
  return {subject,body,text:subject+'\n\n'+body};
}
function requestMailto(content) {
  const address=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(INGRAM_PRESALES_EMAIL)?INGRAM_PRESALES_EMAIL:'';
  return 'mailto:'+address+'?subject='+encodeURIComponent(content.subject)+'&body='+encodeURIComponent(content.body);
}
function emailDraft(items=selectedItems()) { return requestMailto(requestContent(items)); }
function bindRequestActions() {
  const send=$('sendIngram');if(send)send.onclick=()=>{
    if(!selectedItems().length)return;
    const content=requestContent();let url=requestMailto(content);
    if(url.length>1800){downloadText('ingram-lifecycle-request.txt',content.text);url=requestMailto({subject:content.subject,body:appLang==='tr'?'Merhaba,\n\nYaşam döngüsü analizine ilişkin konfigürasyon, fiyat ve teslim süresi talebimiz indirilen ingram-lifecycle-request.txt dosyasındadır.\n\n[Lütfen indirilen dosyayı bu e-postaya ekleyin.]\n\nTeşekkürler.':'Hello,\n\nPlease review our configuration, price and lead time request in ingram-lifecycle-request.txt.\n\n[Please attach the downloaded file to this email.]\n\nThank you.'});setStatus('The full request was downloaded. Attach it to the email draft that opens.')}
    location.href=url;
  };
  const copy=$('copyRequest');if(copy)copy.onclick=async()=>{
    try{await navigator.clipboard.writeText(requestContent().text);setStatus('Request copied.')}
    catch{const preview=$('requestPreview');if(preview)preview.open=true;$('requestText')?.focus();$('requestText')?.select();setStatus('Copy is unavailable. Select and copy the request text below.')}
  };
  const download=$('downloadRequest');if(download)download.onclick=()=>{downloadText('ingram-lifecycle-request.txt',requestContent().text);setStatus('Request downloaded. Attach it to your email.')};
}
function closeImportPreview() {importDraft=null;const panel=$('importPreview');if(panel){panel.innerHTML='';panel.classList.toggle('hide',true)}}
function openImportPreview(rows,sheetName='') {
  if(!rows.length)throw Error('The file is empty.');
  if(rows.length>1001)throw Error('Maximum 1000 BOM lines per file.');
  const keys=rows[0].cells.map(value=>String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]/g,''));
  const find=aliases=>keys.findIndex(key=>aliases.includes(key));
  const pid=find(['pid','sku','productid','productnumber','product','partnumber','partno','urun','urunkodu','stok','stokkodu']);
  const quantity=find(['quantity','qty','units','adet','miktar']),description=find(['description','desc','aciklama','uruntanimi']);
  const hasHeader=pid>=0||quantity>=0||description>=0||rows[0].cells.length>1;
  importDraft={rows,sheetName,mapping:{pid:pid>=0?pid:0,quantity,description,hasHeader}};
  bom.clear();manualQuantities.clear();clearAnalysis();$('pids').value='';$('bomSummary').textContent='';
  renderImportPreview();setStatus('Review the preview and column mapping, then import the BOM.');
}
function parseMappedBomRows(rows,mapping) {
  const indices=[mapping.pid,mapping.quantity,mapping.description].filter(index=>index>=0);
  const columns=Math.max(...rows.map(row=>row.cells.length));
  if(!Number.isInteger(mapping.pid)||mapping.pid<0||indices.some(index=>!Number.isInteger(index)||index>=columns)||new Set(indices).size!==indices.length)throw Error('Choose different columns for PID, quantity and description.');
  const data=rows.slice(mapping.hasHeader?1:0);
  const canonical=[{line:rows[0].line,cells:['PID','Quantity','Description']},...data.map(row=>({line:row.line,sheet:row.sheet,cells:[row.cells[mapping.pid]??'',mapping.quantity>=0?row.cells[mapping.quantity]??'':'',mapping.description>=0?row.cells[mapping.description]??'':'']}))];
  const parsed=parseBomRows(canonical);
  for(const item of parsed.items.values())for(const line of item.lines){const original=data.find(row=>row.line===line.line);line.cells=original.cells;line.sheet=original.sheet||''}
  return parsed;
}
function renderImportPreview() {
  if(!importDraft)return;
  const {rows,mapping,sheetName}=importDraft,panel=$('importPreview');if(!panel)return;
  const count=Math.max(...rows.map(row=>row.cells.length));
  const options=(selected,optional)=> (optional?'<option value="-1">Not used</option>':'')+Array.from({length:count},(_,index)=>`<option value="${index}" ${selected===index?'selected':''}>${esc('Column '+(index+1)+(mapping.hasHeader?' · '+(rows[0].cells[index]||'—'):''))}</option>`).join('');
  const data=rows.slice(mapping.hasHeader?1:0).slice(0,5);
  panel.innerHTML='<h3>BOM preview &amp; column mapping</h3>'+(sheetName?`<p class="source-text">${esc(sheetName)}</p>`:'')+`<label><input id="mappingHeader" type="checkbox" ${mapping.hasHeader?'checked':''}> First row contains column headers</label><div class="mapping-grid"><label>PID column<select id="mapPid">${options(mapping.pid,false)}</select></label><label>Quantity column<select id="mapQuantity">${options(mapping.quantity,true)}</select></label><label>Description column<select id="mapDescription">${options(mapping.description,true)}</select></label></div><p class="sub">First 5 data rows. Nothing is sent until you click Analyze.</p><div class="tablewrap"><table><thead><tr><th>#</th>${Array.from({length:count},(_,index)=>`<th>${index+1}</th>`).join('')}</tr></thead><tbody>${data.map(row=>`<tr><td>${row.line}</td>${Array.from({length:count},(_,index)=>`<td class="source-text">${esc(row.cells[index]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p id="mappingError" class="preview-error" role="alert"></p><div class="stack"><button class="btn primary" id="applyImport">Import this BOM</button><button class="btn" id="cancelImport">Cancel import</button></div>`;
  panel.classList.toggle('hide',false);
  for(const [id,key] of [['mapPid','pid'],['mapQuantity','quantity'],['mapDescription','description']])$(id).onchange=()=>{importDraft.mapping[key]=Number($(id).value)};
  $('mappingHeader').onchange=()=>{importDraft.mapping.hasHeader=$('mappingHeader').checked;renderImportPreview()};
  $('applyImport').onclick=()=>{
    try{const parsed=parseMappedBomRows(importDraft.rows,importDraft.mapping),name=importDraft.sheetName;closeImportPreview();commitBom(parsed,name);render();$('analyze')?.focus()}
    catch(error){$('mappingError').textContent=error.message;applyLanguage()}
  };
  $('cancelImport').onclick=()=>{closeImportPreview();setStatus('');render()};applyLanguage();
}
function initExperience() {
  const language=$('language');if(language)language.onchange=()=>setLanguage(language.value);
  const template=$('downloadTemplate');if(template)template.onclick=()=>{
    const workbook=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['PID','Quantity','Description'],['WS-C3850-48P-S',2,'Catalyst 3850'],['C9300-48P-A',1,'Catalyst 9300'],['WS-C3850-48P-S',3,'Duplicate PID example']]),'BOM');
    const bytes=XLSX.write(workbook,{type:'array',bookType:'xlsx'}),url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})),anchor=document.createElement('a');anchor.href=url;anchor.download='ingram-bom-template.xlsx';document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
}
