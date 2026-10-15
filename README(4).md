# Lifecycle Intelligence Platform — Adım 2

Bu paket, onaylı Partner UI dosyasını tasarımı ve davranışları değiştirilmeden GitHub Pages üzerinde yayınlamak içindir. `index.html` kaynak HTML dosyasının birebir kopyasıdır. Kurulum veya derleme gerekmez.

## Dosyalar

- `index.html`: Yayınlanacak sayfa; CSS ve JavaScript içindedir.
- `.nojekyll`: GitHub Pages'in dosyaları doğrudan sunmasını sağlar.
- `README.md`: Bu yayınlama ve kontrol rehberi.

Logo, kaynak dosyadaki Business Wire adresinden yüklenir; yüklenemezse mevcut INGRAM MICRO yazısı görünür. İlave statik dosya gerekmiyor.

## Önce bilgisayarında kontrol et

`index.html` dosyasına çift tıkla. Mevcut arayüz, dört modül ve iki ürün görünmeli. Bu işlem yerel dosyayı açar; henüz internette yayınlamaz.

## GitHub deposunu oluştur

1. GitHub hesabınla https://github.com/new adresini aç.
2. **Repository name** alanına `lifecycle-intelligence-platform` yaz.
3. Ücretsiz GitHub Pages kullanmak için **Public** seç. Bu depoya yüklediğin dosyalar herkes tarafından görülebilir.
4. **Add a README file** seçeneğini işaretle; **Create repository** düğmesine bas.
5. Yeni depoda **Add file → Upload files** seç. Dar ekranda bu seçenek `+` menüsünde olabilir.
6. Bilgisayarındaki bu klasörden `index.html`, `.nojekyll` ve `README.md` dosyalarını yükle. Dosyalar depo kökünde olmalı; üst klasörü veya ZIP dosyasını yükleme.
7. **Commit changes** ile kaydet. Mevcut README dosyasının bu rehberle güncellenmesi normaldir.

Windows'ta `.nojekyll` görünmüyorsa: depoda **Add file → Create new file** seç; dosya adı olarak `.nojekyll` yaz. İçeriğe `# Static site` yazıp kaydetmen de aynı işi görür.

Bu aşamada `eox_test.json`, eski prototipler, ZIP arşivleri veya herhangi bir kimlik bilgisi yükleme. Sayfanın çalışması için gereken iki ürünlük referans verisi zaten onaylı HTML içindedir.

## GitHub Pages'i aç

1. Depoda **Settings → Pages** bölümünü aç.
2. **Build and deployment → Source** alanında **Deploy from a branch** seç.
3. **Branch** alanında `main`, klasör alanında **/(root)** seç.
4. **Save** düğmesine bas.
5. **Actions** sekmesinde `pages build and deployment` çalışmasının yeşil tamamlanmasını bekle.
6. **Settings → Pages** sayfasına dön; yayınlanan adresi **Visit site** ile aç.

Beklenen adres: `https://GITHUB-KULLANICI-ADIN.github.io/lifecycle-intelligence-platform/`

Kurumsal hesap kullanıyorsan adresin başında kişisel kullanıcı adın yerine depo sahibi organizasyonun adı bulunur. Esas alınacak adres Pages ekranında gösterilendir.

Kaynaklar: [Depo ve giriş dosyası](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [Yayınlama kaynağı ayarları](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Beklenen sınırlar

Bu adım mevcut arayüzün yayınlanmasıdır. Canlı Cisco sorgusu yoktur; iki ürünlük referans verisi ve bunu açıklayan mevcut uyarı korunmuştur. Üretim arayüzü için metin temizliği ve canlı bağlantı sonraki aşamalardadır.

- `WS-C3850-48P-S` için yayınlanmış tarihler ve `C9300-48P-A` geçiş referansı görünür.
- `C9300-48P-A` için “No published EoX notice” görünür; “Active” sonucu çıkarılmaz.
- Başka bir PID, “Data not yet available” olarak görünür.
- CSV/TXT içe aktarma mevcut basit davranışıyla korunmuştur; Excel, miktar ve açıklama işleme henüz tamamlanmış değildir.
- E-posta düğmesi mevcut yer tutucu alıcıyla taslak açmayı dener; gerçek Ingram alıcısına gönderim için henüz hazır değildir.

## Basit test listesi

- [ ] Yayınlanan HTTPS adresi açılıyor; 404 görünmüyor.
- [ ] Logo veya yazı yedeği, mavi/beyaz tasarım ve üstteki arama alanı görünüyor.
- [ ] Başlangıçta 2 ürün ve 1 EoX kaydı görünüyor.
- [ ] `WS-C3850-48P-S` son destek tarihi `31.10.2025`; geçiş PID'si `C9300-48P-A`.
- [ ] `C9300-48P-A` “Active” olarak gösterilmiyor.
- [ ] Dört modül açılıyor; zaman çizelgesinde ürün detayları genişletilip kapanıyor.
- [ ] `TEST-UNKNOWN-PID` aranınca “Data not yet available” görünüyor.
- [ ] Reset sonuçları temizliyor; iki örnek PID tekrar girilip Analyze ile getirilebiliyor.
- [ ] Export CSV dosya indiriyor; dosyada ürünler ve tarihler var.
- [ ] Telefon genişliğinde arama ve modüller kullanılabiliyor.
- [ ] Alt kısımdaki Cihan Alaçamlı bağlantısı doğru LinkedIn sayfasını açıyor.

404 varsa önce Actions çalışmasının bittiğini, `index.html` adının küçük harfle yazıldığını ve dosyanın `main` dalının kökünde olduğunu kontrol et. Güncelleme görünmüyorsa Ctrl+F5 ile yenile.

Bu kontrollerden sonra Adım 2'yi doğrula. Canlı bağlantı ve Cloudflare çalışmasına bu pakette geçilmedi. Yayınlanan adres henüz bu çalışma sırasında doğrulanmadı.
