# IS-KURALLARI.md

Ekranlardan ve yetkiden bağımsız iş mantığı. Birden çok ekranı etkileyen kurallar burada tek evde tutulur (etki analizi için). Ekran dosyaları bu kuralları KOPYALAMAZ, sadece referans verir.

> Kapsam: onay zinciri, status geçişleri, reddet, split, dönem ve kapama, kategori sistemi, limitler, kiralama, avans, hot cost, vergi türleri, dijital imza, anomali motoru, şirket kuralları. Anomali motoru (§13) bu dosyanın bir bölümüdür — ayrı dosya değildir.

---

## 1. Onay zinciri
Saha (draft → submitted) → Dept varsa (dept_pending → dept_approved / dept_rejected) → Dept yoksa adım atlanır (SK-AUTH-9, runtime kontrolü) → Muhasebe (acc_pending → acc_approved / acc_rejected / split) → dönem kapatma.
- submitted → dept_pending/acc_pending geçişinin nerede yapılacağı (trigger mı frontend mi) M2 planında kararlaştırılacak.
- Birden fazla dept kullanıcısı varsa herhangi biri onaylar (ilk gelen yapar, SK-AUTH-9).

## 2. Fiş status değerleri (9)
draft · submitted · dept_pending · dept_approved · dept_rejected · acc_pending · acc_approved · acc_rejected · split

## 3. Reddet
Sahaya geri dönüş tek aksiyondur: **reddet**. Ayrı "iade" mekanizması yoktur.
- **Reddet:** sebep zorunlu (aşağıdaki sebeplerden + serbest metin). Reddedilen fiş **kanıt olarak donar** — düzenlenemez, silinemez, işaretli kalır, reddedilenler listesinde görünür.
- **Düzenleme sınırı = submit anı.** Fiş `draft` iken saha serbestçe düzenler/siler. Submit sonrası (dept_pending/acc_pending) saha dokunamaz — inceleme bütünlüğü korunur.
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
- **Pasif onay (7 gün):** bekleyen fiş 7 gün içinde işlem görmezse otomatik onaylanmış sayılır (approval_log action=auto_approved, muhasebe sorumlu). Kiralama bu kuraldan istisna. [G3 kararına bağlı]
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

---

## AÇIK KARARLAR (kod öncesi netleşmeli)
- **G2:** dijital imza kesin tanımı (canvas yönünde)
- **G3:** auto_approved / 7 gün pasif onay Faz 1'de var mı
- **G10:** split child receipt mekanizması detayı
- Kategori/ulaşım limit değerleri (şirket kuralı yapılandırması, §14)
- Kiralama dönem-kapanış istisnası teyidi

> Offline kuyruk (G8) bir mimari karardır → ARCHITECTURE 5.7 (PWA). Burada değil.
