'use strict';
let appLang = globalThis.LCI_CONFIG?.defaultLanguage || 'en';
try { const saved = localStorage.getItem('lci-language'); if (saved === 'tr' || saved === 'en') appLang = saved; } catch {}
const TR = {
  'Lifecycle analysis workspace':'Yaşam döngüsü analiz alanı','PARTNER WORKSPACE':'İŞ ORTAĞI ALANI',
  'INGRAM MICRO / CISCO LIFECYCLE INTELLIGENCE':'INGRAM MICRO / CISCO YAŞAM DÖNGÜSÜ',
  'Analyze Cisco product lifecycles, identify renewal exposure and discover refresh opportunities. Search a SKU or upload a BOM to begin.':'Cisco ürünlerinin yaşam döngüsünü inceleyin, yenileme önceliklerini belirleyin. Ürün kodu girin veya ürün listenizi yükleyin.',
  'DISCOVER → ANALYZE → ACT':'KEŞFET → İNCELE → HAREKETE GEÇ','One workspace. Four connected capabilities.':'Tek çalışma alanı. Birbirine bağlı dört bölüm.',
  'Start your analysis':'Analize başlayın','Enter up to 20 unique Cisco product IDs. Your results flow into every module.':'En fazla 20 farklı Cisco ürün kodu girin. Sonuçlar tüm bölümlerde kullanılacaktır.',
  'Search Cisco products (PID / SKU)':'Cisco ürünlerini arayın (PID / SKU)','Cisco Product IDs for lifecycle analysis':'Yaşam döngüsü analizi için Cisco ürün kodları',
  'Analyze Cisco products →':'Cisco ürünlerini analiz et →','Reset':'Temizle','Upload BOM (.xlsx, .csv or .txt)':'Ürün listesi yükle (.xlsx, .csv veya .txt)',
  'Paste up to 20 unique PIDs, separated by newlines, commas, semicolons or tabs. Or upload Excel (.xlsx), CSV or TXT with PID, Quantity and Description columns. Maximum file size: 1 MB.':'Ürün kodlarını satır sonu, virgül, noktalı virgül veya tab ile ayırın. Excel, CSV veya TXT dosyası da yükleyebilirsiniz. Sınır: 20 farklı ürün, 1 MB.',
  'Choose a BOM worksheet':'Ürün listesinin bulunduğu sayfayı seçin','BOM worksheet':'Ürün listesi çalışma sayfası','Choose a worksheet...':'Bir çalışma sayfası seçin...',
  'Four connected capabilities':'Birbirine bağlı dört bölüm','Bulk BOM Analysis':'Toplu Ürün Analizi','Lifecycle Timeline':'Yaşam Döngüsü Takvimi','Migration Advisor':'Geçiş Danışmanı','Ingram Refresh Opportunities':'Ingram Yenileme Fırsatları',
  'Scan product lists and uncover lifecycle exposure.':'Ürün listenizin yaşam döngüsü durumunu inceleyin.','See milestones and renewal exposure by product.':'Tarihleri ve yenileme önceliklerini ürün bazında görün.',
  'Explore manufacturer-published migration references.':'Üreticinin yayınladığı geçiş referanslarını inceleyin.','Identify refresh priorities and ask Ingram for validated options.':'Öncelikleri belirleyin, doğrulanmış seçenekler için Ingram’a danışın.',
  'Products analyzed':'Analiz edilen ürün','Unique requested PIDs':'Farklı ürün kodu','EoX records found':'Bulunan EoX kaydı','Published lifecycle notices':'Yayınlanmış yaşam döngüsü bildirimi','Past last support':'Desteği sona eren','Based on today\'s date':'Bugünün tarihine göre','Migration references':'Geçiş referansı','Cisco-published alternative PIDs':'Cisco tarafından yayınlanan alternatifler',
  'Export CSV':'CSV indir','Download selected CSV':'Seçilenleri CSV indir','Product-by-product lifecycle visibility for your BOM.':'Ürün listenizin yaşam döngüsü durumunu ürün bazında görün.',
  'Lifecycle Timeline & Renewal Exposure':'Yaşam Döngüsü ve Yenileme Takvimi','Filter published milestones and review renewal cutoffs by product.':'Tarihleri filtreleyin ve ürünlerin yenileme son tarihlerini inceleyin.',
  'Cisco-published alternatives requiring configuration and commercial validation.':'Cisco’nun yayınladığı alternatifler; teknik ve ticari doğrulama gerektirir.',
  'Refresh and renewal priorities based on lifecycle evidence and BOM quantities.':'Yaşam döngüsü verilerine ve ürün adetlerine göre yenileme öncelikleri.',
  'Lifecycle visibility across your uploaded product list.':'Yüklediğiniz ürün listesinin yaşam döngüsü görünümü.',
  'No products selected':'Henüz analiz edilecek ürün yok','Enter Cisco PIDs to start the analysis.':'Başlamak için Cisco ürün kodlarını girin veya dosya yükleyin.',
  'Retrieving lifecycle information…':'Yaşam döngüsü bilgileri alınıyor…','Please wait.':'Lütfen bekleyin.','Lifecycle information unavailable':'Yaşam döngüsü bilgileri alınamadı','Please retry your search.':'Lütfen aramayı yeniden deneyin.',
  "We couldn't retrieve lifecycle information for this product. Please try again.":'Bu ürünün yaşam döngüsü bilgilerine ulaşılamadı. Lütfen tekrar deneyin.',
  'Please enter at least one Cisco product ID.':'Lütfen en az bir Cisco ürün kodu girin.','Maximum 20 unique PIDs per analysis. Please shorten your list.':'Bir analizde en fazla 20 farklı ürün olabilir. Lütfen listeyi kısaltın.',
  'Absence of an EoX notice does not confirm active support.':'EoX bildiriminin bulunmaması, ürünün desteğinin sürdüğünü doğrulamaz.',
  'Lifecycle information for':'Yaşam döngüsü analizi:',' requested products.':' ürün.',
  'Product ID':'Ürün Kodu','Status':'Durum','End of Sale':'Satış Sonu','Last Support':'Son Destek','Migration PID':'Geçiş Ürünü','Inspect →':'İncele →','Inspect':'İncele','Select product':'Ürünü seç',
  'Support ended':'Destek sona erdi','Support ≤365 days':'Destek ≤365 gün','EoX published':'EoX bildirimi var','No published EoX notice found':'Yayınlanmış EoX bildirimi bulunamadı','Invalid PID':'Geçersiz ürün kodu','Lookup failed':'Sorgu başarısız','Unverified':'Doğrulanmamış',
  'Not published':'Yayınlanmamış','EoX Announcement':'EoX Duyurusu','Software Maintenance':'Yazılım Bakımı','Security Vulnerability Support':'Güvenlik Açığı Desteği','Service Contract Renewal':'Servis Sözleşmesi Yenileme','Last Date of Support':'Son Destek Tarihi',
  'Cisco migration references:':'Cisco geçiş referansları:','Not published in this record':'Bu kayıtta yayınlanmamış','Bulletin:':'Bülten:','Record updated:':'Cisco kayıt güncellemesi:','Cisco bulletin ↗':'Cisco bülteni ↗','No verified Cisco bulletin link':'Doğrulanmış Cisco bülten bağlantısı yok',
  'BOM quantity:':'Ürün adedi:','Original BOM lines:':'Orijinal dosya satırları:','Quantity not provided':'Adet belirtilmedi','BOM Qty:':'Adet:',
  'BOM quantity':'Ürün adedi','Original quantity:':'Dosyadaki adet:','Edited quantity':'Düzenlenmiş adet','Quantity':'Adet','Lines:':'Satırlar:',
  'Published service contract renewal cutoffs':'Yayınlanmış servis sözleşmesi yenileme son tarihleri',
  'These are Cisco product lifecycle cutoffs, not your actual contract expiration dates.':'Bunlar Cisco ürün yaşam döngüsü son tarihleridir; müşterinin gerçek sözleşme bitiş tarihleri değildir.',
  'Passed:':'Geçmiş:','Within 365 days:':'365 gün içinde:','Beyond 365 days:':'365 günden sonra:',
  ' products · ':' ürün · ',' known BOM units':' bilinen adet',' · quantity missing for ':' · adedi belirtilmeyen ürün: ',' products':' ürün',
  'All milestones':'Tüm tarihler','Expired':'Geçmiş','Upcoming':'Yaklaşan','Unverified / not published':'Doğrulanmamış / yayınlanmamış','Date passed':'Tarih geçti','Due today':'Bugün',' days remaining':' gün kaldı',
  'No milestones match this filter':'Bu filtreyle eşleşen tarih yok','Try All milestones or Unverified.':'Tüm tarihler veya Doğrulanmamış filtresini deneyin.',
  ' products match the selected milestone filter. Missing dates remain unverified.':' ürün seçili tarih filtresiyle eşleşiyor. Eksik tarihler doğrulanmamış olarak kalır.',' of ':' / ',
  'Renewal exposure:':'Yenileme durumu:','Last published service contract renewal date:':'Yayınlanmış son sözleşme yenileme tarihi:',
  'This is a product lifecycle cutoff, not your actual contract expiration date.':'Bu, ürünün yaşam döngüsü son tarihidir; gerçek müşteri sözleşmesinin bitiş tarihi değildir.',
  'Published renewal cutoff passed':'Yayınlanmış yenileme son tarihi geçti','Published renewal cutoff within 365 days':'Yayınlanmış yenileme son tarihi 365 gün içinde','Published renewal cutoff beyond 365 days':'Yayınlanmış yenileme son tarihi 365 günden sonra',
  'Lifecycle status unverified':'Yaşam döngüsü durumu doğrulanmamış','Lifecycle status remains unverified.':'Yaşam döngüsü durumu doğrulanmamış olarak kalır.',
  'Cisco-published migration references are starting points. Technical equivalence, compatibility, ordering availability, stock and current support require verification.':'Cisco geçiş referansları başlangıç noktasıdır. Teknik eşdeğerlik, uyumluluk, sipariş verilebilirlik, stok ve güncel destek ayrıca doğrulanmalıdır.',
  'No published migration description':'Yayınlanmış geçiş açıklaması yok','No published migration PID':'Yayınlanmış geçiş ürünü yok','Migration information unverified':'Geçiş bilgisi doğrulanmamış',
  'How the Ingram priority score works':'Ingram öncelik puanı nasıl hesaplanır?',
  'Use the highest applicable base score, never the sum: last support passed 85 / within 365 days 70; security support 80 / 65; published renewal cutoff 75 / 60; software maintenance 55 / 45; end of sale 40 / 30. Otherwise base 0. ':'Uygulanabilir en yüksek temel puan kullanılır, puanlar toplanmaz: son destek geçmişse 85 / 365 gün içindeyse 70; güvenlik desteği 80 / 65; yayınlanmış yenileme son tarihi 75 / 60; yazılım bakımı 55 / 45; satış sonu 40 / 30. Diğer durumda temel puan 0. ',
  'For a nonzero base, add 3 × floor(log2(BOM quantity)), capped at 15. Missing quantity adds 0. Total capped at 100. Migration availability does not add risk points. ':'Temel puan pozitifse adet için 3 × floor(log2(adet)) eklenir; adet katkısı en fazla 15, toplam puan en fazla 100’dür. Eksik adet katkısı 0’dır. Geçiş ürünü bulunması risk puanını artırmaz. ',
  'This is an Ingram assessment, not a Cisco rating, quotation or confirmation of a customer contract. Missing milestones remain unverified; a score of 0 does not confirm active support.':'Bu, Ingram önceliklendirmesidir; Cisco puanı, ticari teklif veya müşteri sözleşmesi doğrulaması değildir. Eksik tarihler doğrulanmamıştır; 0 puan aktif desteği doğrulamaz.',
  'Priority score':'Öncelik puanı','Verification required — not scored':'Doğrulama gerekli — puan verilmedi','No scored opportunities':'Puanlanmış fırsat yok','Only products with published lifecycle notices are prioritized.':'Yalnızca yayınlanmış yaşam döngüsü kaydı olan ürünler puanlanır.',
  'Last support':'Son destek','Security support':'Güvenlik desteği','Published renewal cutoff':'Yayınlanmış yenileme son tarihi','Software maintenance':'Yazılım bakımı','End of sale':'Satış sonu',
  ' passed on ':' sona erdi: ',' due on ':' son tarih: ','. Base ':'. Temel puan ',' + BOM volume ':' + adet katkısı ','. BOM quantity: ':'. Ürün adedi: ',
  'Quantity was not provided; no volume points added.':'Adet belirtilmediği için adet katkısı eklenmedi.','No scored milestone within 365 days in the available record':'Mevcut kayıtta 365 gün içinde puanlanan bir tarih yok',
  'Cisco migration PID:':'Cisco geçiş ürünü:','INGRAM MICRO · CISCO PRESALES':'INGRAM MICRO · CISCO SATIŞ ÖNCESİ',
  'Ready to turn lifecycle risk into a refresh project?':'Yenileme projenizi birlikte planlayalım',
  'Contact Ingram for validated configuration, price and lead time. Cisco migration references are a starting point, not a complete orderable BOM.':'Doğrulanmış konfigürasyon, fiyat ve teslim süresi için Ingram ile iletişime geçin. Cisco geçiş referansları siparişe hazır, tam bir ürün listesi değildir.',
  'Send email to Ingram →':'Ingram’a e-posta hazırla →','Review the draft before sending.':'Göndermeden önce taslağı inceleyin.','Copy request':'Talebi kopyala','Download request':'Talebi indir','View request':'Talebi görüntüle',
  'Select products for a quotation request.':'Teklif talebi için ürünleri seçin.','Select all':'Tümünü seç',' selected':' seçili','No products selected for the request.':'Talep için ürün seçilmedi.',
  'Request copied.':'Talep kopyalandı.','Copy is unavailable. Select and copy the request text below.':'Kopyalama kullanılamıyor. Aşağıdaki talep metnini seçip kopyalayın.',
  'Request downloaded. Attach it to your email.':'Talep indirildi. E-postanıza ekleyin.','The full request was downloaded. Attach it to the email draft that opens.':'Tam talep indirildi. Açılan e-posta taslağına dosyayı ekleyin.',
  'Please enter a positive whole-number quantity, or leave it blank.':'Pozitif tam sayı adet girin veya boş bırakın.',
  'Support-ended units':'Desteği sona eren adet','Renewal cutoff within 365 days':'Yenileme son tarihi 365 gün içinde','Products requiring verification':'Doğrulama bekleyen ürün','Known total quantity':'Bilinen toplam adet',
  'Last queried:':'Son sorgulama:','Not queried yet':'Henüz sorgulanmadı','Cisco record updated:':'Cisco kayıt güncellemesi:',
  'Download Excel template':'Örnek Excel indir','BOM preview & column mapping':'Dosya önizleme ve sütun eşleme','First row contains column headers':'İlk satır sütun başlıklarını içeriyor',
  'PID column':'Ürün kodu sütunu','Quantity column':'Adet sütunu','Description column':'Açıklama sütunu','Not used':'Kullanılmıyor','Column ':'Sütun ',
  'First 5 data rows. Nothing is sent until you click Analyze.':'İlk 5 veri satırı. Analiz düğmesine basana kadar veri gönderilmez.',
  'Import this BOM':'Bu listeyi içe aktar','Cancel import':'İçe aktarmayı iptal et','Choose different columns for PID, quantity and description.':'Ürün kodu, adet ve açıklama için farklı sütunlar seçin.',
  'Review the preview and column mapping, then import the BOM.':'Önizlemeyi ve sütun eşlemeyi kontrol edip listeyi içe aktarın.',
  'BOM imported. Review the product IDs, then click Analyze.':'Liste içe aktarıldı. Ürün kodlarını kontrol edip Analiz düğmesine basın.',
  'Reading BOM file...':'Dosya okunuyor…','Worksheet: ':'Çalışma sayfası: ',' BOM lines imported; ':' satır içe aktarıldı; ',' unique PIDs; total quantity ':' farklı ürün; toplam adet ',
  '. Click Analyze to retrieve lifecycle information. Quantities default to 1 when omitted.':'. Yaşam döngüsü bilgileri için Analiz düğmesine basın. Boş adetler 1 kabul edilir.',
  'Retrieving lifecycle information for ':'Yaşam döngüsü bilgileri alınıyor: ',
  'Choose a BOM worksheet to continue. Only the selected worksheet will be analyzed.':'Devam etmek için ürün listesinin sayfasını seçin. Yalnızca seçilen sayfa analiz edilir.',
  'Choose a BOM worksheet to continue.':'Devam etmek için bir çalışma sayfası seçin.',
  'Maximum file size is 1 MB.':'Dosya boyutu en fazla 1 MB olabilir.','Choose an Excel (.xlsx), CSV or TXT file.':'Excel (.xlsx), CSV veya TXT dosyası seçin.',
  'This Excel file could not be read. Use an unencrypted .xlsx workbook or save it as CSV.':'Excel dosyası okunamadı. Parolasız bir .xlsx dosyası kullanın veya CSV olarak kaydedin.',
  'This is not a valid .xlsx file. Save it as Excel Workbook (.xlsx) and try again.':'Bu geçerli bir .xlsx dosyası değil. Excel Çalışma Kitabı (.xlsx) olarak kaydedip yeniden deneyin.',
  'Excel support could not be loaded. Please refresh the page or use CSV.':'Excel okuyucusu yüklenemedi. Sayfayı yenileyin veya CSV kullanın.',
  'No visible, nonempty worksheets found.':'Görünür ve dolu bir çalışma sayfası bulunamadı.','This worksheet is empty.':'Bu çalışma sayfası boş.','The file is empty.':'Dosya boş.','No product lines found.':'Ürün satırı bulunamadı.',
  'Maximum 1000 BOM lines per file.':'Dosyada en fazla 1000 veri satırı olabilir.','Maximum 20 unique PIDs per analysis. Please split the BOM into smaller files.':'Bir analizde en fazla 20 farklı ürün olabilir. Listeyi daha küçük dosyalara ayırın.',
  'Excel worksheets must fit within 1001 rows including the header. Remove extra rows or split the file.':'Başlık dahil kullanılan alan ilk 1001 satır içinde olmalıdır. Fazla satırları silin veya dosyayı bölün.',
  'Maximum 100 worksheet columns. Remove unused columns and try again.':'En fazla 100 sütun olabilir. Kullanılmayan sütunları kaldırıp yeniden deneyin.',
  'Unmerge cells in the BOM worksheet before importing.':'İçe aktarmadan önce birleştirilmiş hücreleri ayırın.',
  'Formula found at ':'Formül bulunan hücre: ','. Paste formulas as values before importing.':'. İçe aktarmadan önce formülleri değer olarak yapıştırın.',
  'Excel error at ':'Excel hatası bulunan hücre: ','. Correct it before importing.':'. İçe aktarmadan önce düzeltin.',
  'Date cell found at ':'Tarih hücresi bulundu: ','. Use text PIDs and whole-number quantities.':'. Ürün kodlarını metin, adetleri tam sayı olarak girin.',
  'Quantity must be a positive whole number at line ':'Adet pozitif tam sayı olmalıdır. Satır: ','Missing PID at line ':'Ürün kodu eksik. Satır: ',
  'Column count does not match the header at line ':'Sütun sayısı başlıkla eşleşmiyor. Satır: ','Invalid PID cell at line ':'Geçersiz ürün kodu hücresi. Satır: ','. Use one PID per row, up to 100 characters.':'. Her satırda en fazla 100 karakterlik tek ürün kodu kullanın.',
  'Quantity total is too large for ':'Toplam adet çok büyük: ','Save the file as UTF-8 CSV or TXT and try again.':'Dosyayı UTF-8 CSV veya TXT olarak kaydedip yeniden deneyin.',
  'Unclosed quoted field. Please check the CSV file.':'Kapatılmamış tırnak var. CSV dosyasını kontrol edin.','Unexpected quote at line ':'Beklenmeyen tırnak. Satır: ','Unexpected text after quoted field at line ':'Tırnaklı hücreden sonra beklenmeyen metin. Satır: ',
  'Use exactly one PID / SKU column.':'Tek bir PID / SKU sütunu seçin.','Multi-column files need a PID or SKU header. Optional headers: Quantity, Description.':'Çok sütunlu dosyalarda PID veya SKU başlığı gerekir. İsteğe bağlı başlıklar: Quantity, Description.',
  'Ingram Micro Türkiye · Lifecycle and migration information is manufacturer-published. Configuration compatibility, pricing, lead time and service eligibility require verification.':'Ingram Micro Türkiye · Yaşam döngüsü ve geçiş bilgileri üretici tarafından yayınlanır. Konfigürasyon uyumluluğu, fiyat, teslim süresi ve servis uygunluğu doğrulama gerektirir.',
  'Language':'Dil','Business summary':'İş özeti','Selection':'Seçim','Request for selected products':'Seçilen ürünler için talep',
  'Unverified / not scored':'Doğrulanmamış / puan verilmedi','Use exactly one quantity column.':'Tek bir adet sütunu seçin.','Use exactly one description column.':'Tek bir açıklama sütunu seçin.',
  'The file could not be read. Please check its format.':'Dosya okunamadı. Lütfen biçimini kontrol edin.','Choose a BOM worksheet to continue.':'Devam etmek için bir çalışma sayfası seçin.',
  'Enter PIDs first.':'Önce ürün kodlarını girin.','Data status':'Veri durumu','Description':'Açıklama','EoX announcement':'EoX duyurusu','SW maintenance':'Yazılım bakımı','Last contract renewal':'Son sözleşme yenileme','Last support':'Son destek','Bulletin URL':'Bülten bağlantısı','BOM descriptions':'Dosya açıklamaları','Original BOM lines':'Orijinal dosya satırları','Renewal exposure':'Yenileme durumu','Priority explanation':'Puan açıklaması','Migration descriptions':'Geçiş açıklamaları','Effective quantity':'Kullanılan adet','Quantity edited':'Adet düzenlendi','Last queried (UTC)':'Son sorgulama (UTC)'
};
const translationPattern = new RegExp(Object.keys(TR).sort((a,b)=>b.length-a.length).map(key=>key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
function uiText(value) { return appLang === 'tr' ? String(value).replace(translationPattern, match=>TR[match]) : String(value); }
const textSources = new WeakMap(), attributeSources = new WeakMap();
function applyLanguage() {
  if (!document.createTreeWalker) return;
  document.documentElement.lang = appLang;
  const walker=document.createTreeWalker(document.body,4);let node;
  while((node=walker.nextNode())) {
    if(node.parentElement?.closest('script,style,textarea,.source-text,[data-no-translate]'))continue;
    let cached=textSources.get(node);
    if(!cached||node.nodeValue!==cached.last)cached={source:node.nodeValue};
    cached.last=uiText(cached.source);node.nodeValue=cached.last;textSources.set(node,cached);
  }
  document.querySelectorAll('[aria-label],[title],[placeholder]').forEach(element=>{
    let stored=attributeSources.get(element)||{};
    for(const key of ['aria-label','title','placeholder'])if(element.hasAttribute(key)){
      const current=element.getAttribute(key),cached=stored[key];
      const source=cached&&current===cached.last?cached.source:current;
      const last=uiText(source);element.setAttribute(key,last);stored[key]={source,last};
    }
    attributeSources.set(element,stored);
  });
  const select=document.getElementById('language');if(select)select.value=appLang;
}
function setLanguage(language) {
  if(!['tr','en'].includes(language))return;
  appLang=language;try{localStorage.setItem('lci-language',language)}catch{}
  render();if(typeof renderImportPreview==='function'&&importDraft)renderImportPreview();applyLanguage();
}
