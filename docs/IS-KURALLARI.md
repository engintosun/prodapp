# IS-KURALLARI.md

Ekranlardan ve yetkiden bağımsız iş mantığı. Birden çok ekranı etkileyen kurallar burada tek evde tutulur (etki analizi için). Ekran dosyaları bu kuralları KOPYALAMAZ, sadece referans verir.

> Kapsam: onay zinciri, status geçişleri, reddet, split, dönem ve kapama, kategori sistemi, limitler, kiralama, avans, hot cost, vergi türleri, dijital imza, anomali motoru, şirket kuralları. Anomali motoru (§13) bu dosyanın bir bölümüdür — ayrı dosya değildir.

---

## 1. Onay zinciri
Saha fişi doğrudan submitted olarak girer (taslak yok) → Dept varsa (dept_pending → dept_approved / dept_rejected) → Dept yoksa adım atlanır (SK-AUTH-9, runtime kontrolü) → Muhasebe (acc_pending → acc_approved / acc_rejected / split) → dönem kapatma.
- submitted → dept_pending/acc_pending geçişinin nerede yapılacağı (trigger mı frontend mi) M2 planında kararlaştırılacak.
- Birden fazla dept kullanıcısı varsa herhangi biri onaylar (ilk gelen yapar, SK-AUTH-9).

## 2. Fiş status değerleri (8)
submitted · dept_pending · dept_approved · dept_rejected · acc_pending · acc_approved · acc_rejected · split

## 3. Reddet
Sahaya geri dönüş tek aksiyondur: **reddet**. Ayrı "iade" mekanizması yoktur.
- **Reddet:** sebep zorunlu (aşağıdaki sebeplerden + serbest metin). Reddedilen fiş **kanıt olarak donar** — düzenlenemez, silinemez, işaretli kalır, reddedilenler listesinde görünür.
- **Düzenleme sınırı = giriş anı.** Taslak yoktur; fiş doğrudan `submitted` girer. Gönder öncesi düzeltme yalnız tarama ekranında yapılır (lokal, sisteme kaydedilmez). Giriş sonrası saha fişi düzenleyemez/silemez — inceleme bütünlüğü korunur.
- **10 red sebebi (dropdown):** (1) Veri uyuşmazlığı [alan seçimi: tutar/tarih/KDV/işyeri] (2) Tutar hatalı (3) Tarih hatalı (4) KDV hatalı (5) İşyeri hatalı (6) Belge eklenmemiş (7) Mükerrer giriş (8) Kişisel harcama (9) Limit aşımı (10) Diğer [serbest metin].
- **Kategori hatası red sebebi DEĞİL:** dept/muhasebe tek tıkla kategoriyi düzeltir, reddetmez.
- **Küçük hatada reddetmek zorunlu değil:** muhasebe uyarı mesajı atıp onaylayabilir (iletişim açık). Mesaj statüyü değiştirmez, düzenleme penceresi açmaz.
- **Finansal gerçeği muhasebe sessizce düzeltmez** (tutar/tarih/KDV/işyeri). Fiş kanıttır; finansal hata varsa reddedilir.
- **Hatayı yapan düzeltir:** dept/muhasebe fişi düzeltmez, reddeder. Reddet hem dept hem muhasebe seviyesinde mümkün.
- **Tekrar giriş:** yalnız **muhasebe** izin verir (dept veremez). İzin verilirse orijinal reddedilen fiş donmuş kalır; düzeltme ona **bağlı yeni fiş** olarak doğar (`parent_receipt_id` — §4 split ile aynı yapı). Orijinal kayıt asla düzenlenmez. [UI M3]
- Muhasebe gerektiğinde düzeltmeye müdahale edebilir; müdahale **silinemez/işaretli** iz bırakır. [M3]
- Her red sebebi anomali motoruna sinyaldir (§13). Red logu: kullanıcı + sebep + (varsa alan) + tarih + tutar. Muhasebe dashboard'unda "red pattern analizi".

## 4. Kısmi onay (split)
Dept (½ Kısmi Onay) ve muhasebe (Split) yapabilir. split_amount belirlenir, fiş → split status. Ödenmeyen kısım için ayrı child receipt oluşturulur (parent-child ilişkisi, tek kayıtta alan tutulmaz). [G10 kararı]

## 5. Dönem ve kapama
- **Departman bazlı kapama:** tek dönem açılır, kapama departman bazlı takip edilir. Kademeli zincir: saha kapaması → dept kapaması → muhasebe onayı (period_closings level alanı).
- **Kapama takvimi:** muhasebe dönem açarken üç deadline belirler — saha / dept / muhasebe kapama tarihi. Aşım is_late olarak işaretlenir.
- **Sıkı kapanış:** açık dönem varken yeni dönem açılamaz.
- **Dönem statüleri:** open → partially_closed → closed → permanently_closed. period_closings seviyesinde: open · submitted · approved · disputed · closed_by_override · reopened.
- **Zorla kapama:** "closed_by_override" terminolojisi (endüstri standardı). override_reason ZORUNLU.
- **Tekrar açma:** reopened, reopen_reason ZORUNLU.
- **Kural dondurma:** dönem kapanınca o anki kurallar periods.rules_snapshot (JSONB) olarak dondurulur. Kural değişikliği kapanmış döneme geriye dönük uygulanmaz.
- **Pasif onay (7 gün):** bekleyen fiş 7 gün işlem görmezse otomatik onaylanmış sayılır (approval_log action=auto_approved). Amaç: işini bekleten muhasebenin fişi süresiz kilitlememesi — sorumluluk muhasebededir, fiş sahibi cezalandırılmaz. **Şüpheli/anomali bayrağı auto-approve sonrası fişin üstünde kalır** (sessiz aklama değildir, §13). Kiralama bu kuraldan istisna. 7 gün varsayılandır; gerekirse proje bazında yapılandırılır (Faz 2 project_rules, §14).
- **Dönem kapanış grace'i:** Dönem otomatik kapanmaz. Amaç adalettir, gevşeklik değil: sahanın kusuru olmayan geç fişler (konsinye mal, iş bitince çıkan gerçek tutar, geç düzenlenen/unutulan fiş — dept ve muhasebe bilgisi dahilinde olağan durumlar) saha'ya haksız yansımasın diye giriş penceresi bir süre açık tutulur.
  - **Akış:** Muhasebe kapamayı **ilan eder** ve fiş girişine son tarihi (grace penceresi) kendisi belirler; istisnalar tamamlanmışsa "uzatmaya gerek yok" deyip hemen kapatabilir. Varsayılan otomatik DEĞİLDİR — muhasebe bilinçli karar verir. Muhasebe ilanı/kararı ihmal ederse sistem emniyet olarak kısa bir grace açar (3 gün) ve sonunda kapatır.
  - **Şema temsili:** `periods.status`'e **`closing`** safhası eklenir (open → partially_closed → closing → closed → permanently_closed). `closing` = muhasebe genel kapanışı ilan etti, dönem henüz kapanmadı; `partially_closed`'tan farklıdır (o departman-bazlı kapama; `closing` onun üstündeki muhasebe-ilan safhası). İki tarih: `close_declared_at` (ilan anı) + `grace_until` (girişin açık kalacağı son an — muhasebe verir, vermezse +3 gün). `closing → closed` dönüşü `grace_until`'a bağlıdır.
  - **Giriş:** Grace penceresinde döneme **her fiş** girilebilir (yalnız bekleyenler değil) — RLS fiş insert/delete'i `status IN ('open','closing')` döneme açar. Gecikme caydırıcılığı girişi fiziksel kısıtlayarak değil, grace'in kısalığı + her geç fişin anomali sinyali sayılması (§13) + dept/muhasebe görünürlüğü ile sağlanır. Grace bittikten sonra gelen fiş: kapı kapanır, ancak muhasebe tek-seferlik `late_entry` izni (bu bölümün "İstisna izin tipleri" maddesi) verirse girilebilir. İki katman: grace = herkese açık kısa pencere; izin = pencere kapandıktan sonra muhasebenin tek tek açtığı kapı.
  - **Kapanış anında bekleyenler:** Açık dönemde çözülmemiş bekleyen temiz fişler kapanışta `auto_approved` sayılır; pasif onayın 7 günlük saatini beklemeye gerek YOKTUR (saha "dönemi kapatıyorum, başka fişim yok" diye bilinçli onay verdiğinden — period_closings level=saha). Şüpheli/anomali bayrağı olan fiş sessizce aklanmaz: onaylanır ama bayrağıyla işaretli kapanır, denetçi görür (§13). Pasif onay (yukarıdaki madde) ayrı mekanizmadır — grace giriş penceresini, pasif onay onay-tarafını korur.
- **İstisna izleme:** her geç giriş / tekrar açma / zorla kapama sistemde işaretlenir, denetçi görür.
- **İstisna izin tipleri (Faz 1):** late_entry (geç giriş) · reopen (tekrar açma) · limit_override (limit aşımı). Yetki: saha giremez, dept kendi departmanı için, muhasebe tümü. Kayıt: granted_by, reason, expires_at.

## 6. Kategori sistemi
- **İki katmanlı:** genel fiş kategorisi (tüm departmanlar ortak) + departman alt kategorisi (örn sanat → dekor/aksesuar/marangoz).
- **8 genel kategori:** Yakıt · Yiyecek · Ekipman · Sanat · Ulaşım · Konaklama · Kiralama · Diğer.
- Faz 1: serbest/sabit. Faz 2: yapılandırılmış yönetim.
- Sistem kategorileri (is_system) silinemez.

## 7. Bütçe ve limitler
- Limitler proje/dönem bazlı (period_budgets, dept_budgets).
- Eşik: sarı ≥%80 · kırmızı ≥%100.
- Tam limit değerleri proje bazlı yapılandırılır (şirket kuralı, §14) → AÇIK SLOT.

## 8. Ulaşım limitleri (form + anomali)
- Şehiriçi: km başı üst limit (örn 15₺/km). Şehirdışı: daha yüksek (örn 25₺/km).
- Km başı aşım anomali motoruna sinyal (§13). Kesin değerler şirket kuralından → AÇIK.

## 9. Kiralama
- **Gecikme cezası formülü:** gecikme günü × günlük ücret. (Örn: 42 gün × ₺1.300 = ₺54.600 olası ceza.)
- **Durumlar:** returned (iade edildi) · overdue (gecikmiş) · upcoming (yaklaşan).
- **Dönem kapanışı:** kiralama bekleyenler kapanmayı engellemez, uyarı verir (istisna). [Teyit edilecek.]
- **İhtilaf:** ihtilaf flag + not.
- Muhasebe tüm departmanların kiralamasını; dept kendi departmanınkini görür.

## 10. Avans
- **Saha:** talep (tutar + gerekçe + dönem), durum takibi (pending/approved/rejected/settled), bakiye (avans − harcama).
- **Zincir:** Saha talep → Dept "Onayla → Muhasebe" → Muhasebe "Onayla & Aktar" → paid.
- **Nakit avans akışı:** dept açar → otomatik aktif (muhasebe ön onayı YOK) → muhasebe bildirim + itiraz hakkı (itiraz halinde dondurulur) → fiziksel teslim sistem dışı → dept "nakit verildi" → saha "nakit alındı" → çift taraflı teyit.
- **Dekont:** Supabase Storage `advances` bucket (RLS: proje üyeleri; saha sadece kendi avansının dekontu). Doğrulama: OCR ile IBAN/tutar kontrolü — uyuşmazlıkta uyarı verir, engellemez, nihai karar muhasebede.
- **Dekont yükleme yetkisi:** saha + dept. Dept yüklerse muhasebeye bildirim, muhasebe onaylar/reddeder.
- **Kilitleme:** dekont + muhasebe onay sonrası avans kilitlenir.
- **Kilit açma:** sadece muhasebe, audit log'a sebep ile yazılır.
- **Saha itiraz:** kendi avans ekranında "Dekonta İtiraz Et" + kısa açıklama → muhasebeye bildirim.

## 11. Hot cost
- **Zamanlama:** set wrap saatine bağlı (takvim günü değil). Wrap + 2 saat içinde otomatik tetiklenir. Dept kapatmazsa sistem zorla kapatır. Dept "set bitti" diyerek manuel override yapabilir (gece çekimi).
- **İçerik:** tek ekranda rapor formatı — toplam harcanan / bütçeden kalan / departman bazlı dağılım / bütçe sapma yüzdesi. Export edilebilir.
- **Görüntüleme yetkisi:** muhasebe tüm projeyi, dept yalnızca kendi departmanını, saha göremez. Yapımcı rolü Faz 2 (tam yetki).

## 12. Vergi özel türleri
Tevkifat · stopaj · self-billing. Faz 1: takip/sayaç (dönem ekranında özel belge sayacı). Faz 2: özel alanlar (ozelTip / ozelOran / ozelKesinti) + OCR anahtar kelime tespiti ile işaretleme.

## 13. Anomali motoru
> **UYARI — TAMAMLANMAMIŞTIR.** Aşağıdaki kurallar bilinen başlangıç noktasıdır, TAM SET DEĞİLDİR. Kural seti + eşikler + şirket kuralı entegrasyonu AYRI BİR OTURUMDA sıfırdan detaylı tasarlanacaktır.

- **Yöntem:** kural bazlı (istatistiksel/ML değil — ARCHITECTURE 2.2 ile tutarlı).
- **Çalışma yeri:** Edge Function (sunucu tarafı, client'ta manipüle edilemez — ARCHITECTURE 5.5).
- **Sonuç:** tespit → muhasebe "Şüpheli" tab'ı + bildirim + denetçi görür. Durum akışı: Beklemede → İnceleniyor → Temizle (temize çıkar) / Reddet.
- **Şirket kuralı bağımlılığı (KRİTİK):** kuralların bir kısmı şirket kurallarından beslenir (km limiti, kişi başı yemek eşiği, konaklama gece/kişi, kategori bütçe limiti). Motor bu değerleri şirket kuralları yapılandırmasından (§14) okur. Anomali motoru ile şirket kuralları BİRLİKTE tasarlanmalıdır.
- **Bilinen kurallar (eksik):**
  1. Km başı limit aşımı (şehiriçi limitin katı, örn 2.5×)
  2. Belgesiz + kategori açıklaması yok
  3. Belgesiz ulaşım harcaması
  4. Kişi başı yüksek yemek (eşik üstü)
  5. Mükerrer fiş
- **Domain pattern adayları (Engin'in saha tecrübesi — kurala dönüştürülecek):** mükerrer fişler · şişirilmiş lokasyon/catering komisyonu · sarf malzeme şişirme · aşırı küçük ulaşım fişi yığını.
- Her red sebebi (§3) de anomali sinyalidir.

## 14. Şirket kuralları (Project Rules Engine)
- Faz 1: sabit varsayılanlar. Faz 2: yapılandırılabilir (project_rules tablosu — şemada placeholder).
- Kapsam (Faz 2): takvim kuralları, harcama limitleri, yaptırım kuralları, kategori tanımları, istisna kuralları, onay eşikleri. Muhasebe kontrolünde.
- Anomali motoru (§13) ve form limitleri (§7, §8) bu kuralları okuyacak.

## 15. Dijital imza
Canvas imza + zaman damgası (örn 29.05.2026 01:34:40) + "Temizle" + "İmzalanmadı/İmzalandı" durumu. Kesin tanım G2 — bu yönde.

## 16. QR / OCR akış kuralı
Kamera QR tespit ederse GİB API'ye istek (3 sn hard timeout), OCR atlanır. QR yoksa/okunamazsa OCR tetiklenir, timeout aşımında sessizce OCR'a fallback. (Ekran tarafı: EKRAN-SAHA §3-4. OCR Edge Function: ayrı, M3.) [G9]

## 17. Zaman / tarih (timezone)
**Karar (30 Mayıs 2026):** Saklama UTC; tüm gün/tarih hesabı ve gösterimi `Europe/Istanbul`.
- **Sakla:** tüm zaman damgaları `timestamptz`, UTC (`now()` zaten UTC döner — dokunma).
- **Hesapla / karşılaştır / göster:** "gün" gereken her yerde önce `... AT TIME ZONE 'Europe/Istanbul'` ile TR'ye çevir, sonra güne yuvarla. Sebep: set "günü" = TR takvim günü; UTC günü TR'den 3 saat geride başlar, sınır kayarsa süre hesabı saha lehine/aleyhine bir gün oynar.
- **TR offset'ini elle gömme** (+3 yazma yok). Türkiye UTC+3 sabit (yaz saati yok), ama `AT TIME ZONE` / tarih kütüphanesi doğrusunu zaten yapar.
- **Kapsam:** dönem sınırları + grace bitişi + pasif onay 7/3 gün dolumu (§5), anomali zaman pencereleri (§13), rapor/ekran tarih gösterimi. "Gün" dilindeki süre kuralları TR gününe göre işler (örn. grace_until = ilan anının TR günü + N → o günün TR-günsonu).
- **Ekran:** kullanıcıya tarih/saat daima TR saatinde gösterilir.

---

## AÇIK KARARLAR (kod öncesi netleşmeli)
- **G2:** dijital imza kesin tanımı (canvas yönünde)
- **G10:** split child receipt mekanizması detayı
- Kategori/ulaşım limit değerleri (şirket kuralı yapılandırması, §14)
- Kiralama dönem-kapanış istisnası teyidi

> Offline kuyruk (G8) bir mimari karardır → ARCHITECTURE 5.7 (PWA). Burada değil.
