# Oturum Kapanış Protokolü

Bu dosyanın tüketicisi Opus'tur.

## Sıra

1. Değişen ve etkilenen tüm dosyalar taranır, tek kapsamlı kapanış promptu hazırlanır. Hatırlatma beklenmez.
2. CURRENT.md baştan YAZILIR (ekleme değil): milestone, son commit, sıradaki bir-üç iş, açık kararlar. Tarihçe git log'da yaşar.
3. `npm run doc-check` çalıştırılır, çıktısı kapanış promptuna girer. Betik uyarır, build'i kırmaz.

## HEAD satırı

CURRENT.md "## Durum" bölümünün ilk satırı `HEAD: <kısa hash> (<tarih> — <oturum adı>)` biçimiyle başlar. Yazılan hash, kapanış commit'inin EBEVEYNİ yani yazma anındaki HEAD'dir — çünkü kapanış commit'i CURRENT.md'ye dokunur ve "son commit" o olur. Bir önceki oturumun HEAD'ini yazmak bir kuşak kaydırır ve doc-check Denetim E kırmızı kalır.

## Diyet kuralı

Ölçüt satır sayısı DEĞİL, o an dokunulan modüldür.

- CURRENT.md yalnız içinde bulunulan modülün işini ve kararını taşır. Başka modüle ait olan her şey docs/IS-SIRASI.md Backlog bölümüne gider, o modüle girildiğinde geri akar.
- Kapanmış olduğu hâlde listede duran madde silinir; kaydı Milestone'da ve git log'da yaşar.
- İş olmayan madde — ders, protokol, kural — kendi ev dosyasına taşınır, açık iş listesinde durmaz.
- Milestone günlüğünde son on kayıt kalır; daha eskiler tek paragraflık özete iner.
- **KALICILIK KURALI, budama için de geçerlidir:** özete inen kaydın taşıdığı kararın özel ev dosyasında karşılığı yoksa, budamadan ÖNCE oraya taşınır. Evi hazır olmayan hiçbir madde budanmaz.
- **Bilinen yanlış bekletilmez:** doğrulanmamış olmak ile bilinen yanlış olmak aynı şey değildir. Başka modüle ait madde beklemeye alınır; ama içeriği BİLİNEN YANLIŞ ise modül dışı olsa da aynı turda düzeltilir. (18 Ağustos 2026 diyeti: KABUK-KARARLARI kodda dört olan ekran sayısını altı yazıyordu, hemen düzeltildi.)
- Mühürlü ve kilitli kararlar budanmaz.

## Git komut sözdizimi

Ebeveyn commit gösterimi `HEAD~1` ile yazılır, `HEAD^` KULLANILMAZ — Windows'ta cmd.exe satır sonundaki caret karakterini yutar, `HEAD^` sessizce `HEAD`'e dönüşür ve yanlış-negatif üretir.
