# Süreç Dersleri — Tekrar Eden Kusur Sınıfları

Bu dosyanın tüketicisi Opus'tur. Açılışta okunmaz; yeni bir kusur çıktığında "bu sınıf daha önce oldu mu, kapıya bağlanabilir mi" diye bakılır.

Kayıt anlatı değil SINIFTIR: ne oldu değil, hangi tür hata kaç kez tekrarladı ve bugün onu ne tutuyor. Olayların hikâyesi git log'da ve Milestone kayıtlarında yaşar.

## Kapıya bağlanmış sınıflar

**Sığ klon** — 8 kez (12-19 Ağustos 2026 arası yedi kez, 22 Ağustos'ta sekizinci). 18 Ağustos'ta yapısal sebep bulundu: kural CLAUDE.md'ye taşınmıştı ama klonlamak, CLAUDE.md'yi okumanın ÖNKOŞULU — kuralın yeni evi ihlali önleyemezdi. **Bugün `gate.sh` commit anında reddediyor.**

**Test sayısı kaybı** — `npm test` sekiz test silindiğinde bile exit 0 dönüyordu; koruma CLAUDE.md'de düz yazıydı ve beklenen sayıyı CURRENT.md'de arattırıyordu. **Bugün `run-gates.sh` sayacı `.claude/test-count` ile karşılaştırıyor.**

**ASCII'ye düşmüş .md metni** — TD-32'nin kökü: prompt ASCII yazılmıştı. 22 Ağustos'ta aynı hata üç kez daha yapıldı. **Bugün `gate.sh` reddediyor** ve fiilen üç kez yakaladı.

**Tanımsız CSS token** — TD-25; tarayıcı sessizce yoksayıyor, build ve eslint görmüyordu. **Bugün `gate.sh` stage'lenmiş dosyalarda reddediyor.**

## Kapısı olmayan sınıflar (açık)

**Desen ile bütünlük iddiası.** En sık tekrar eden sınıf. Grep bulur, BÜTÜNLÜK iddiası üretemez. Kayıtlı örnekler: INDEX bayatlık listesi grep'le çıkarıldı ve dört madde kaçtı (18 Ağustos); push doğrulamasında grep deseni yanlış pozitif üretti, yerinde duran madde "düşürüldü" sanıldı (17 Ağustos); silme tablo listesi metin taramasıyla çıkarıldı ve DROP TABLE satırlarını görmedi, canlıda olmayan tablo listeye girdi (22 Ağustos); optimizasyon turunda geçici tarayıcılar üç kez yanlış alarm verdi (22 Ağustos). Karşılığı CLAUDE.md'deki "çıktı mühürlemeden önce kaynağa dön" kuralıdır, kapı değildir.

**Yokluk iddiası desen eşleşmesiyle** — bir oturumda beş kez (18 Ağustos): "karara bağlanmamış" denen dört sorunun ikisi dosyada yazılıydı. Kural CLAUDE.md'ye kondu; kapısı yok.

**Ölçülmemiş sayı.** Tablo sayısı üç kez değişti (16 → 37 → 36 → 34+1), doğrusu ancak canlı katalogdan geldi (22 Ağustos). CLAUDE.md tavanı 8 KB olarak ölçülmeden kondu ve iki kez DUR'a takıldı (22 Ağustos). Ders: sayı, üretildiği kaynaktan alınır; yuvarlak sayı bir ölçüm değildir.

**Kapsamı yanlış soruyla ölçmek** — "bu fonksiyonu kim çağırıyor" ölçüldü, "bu tipi kim sıfırdan kuruyor" ölçülmedi; dosya sayısı kapısı çaldı (19 Ağustos).

**Düşürülen parça.** Bir iş "ayrı mesajda vereceğim" denip düşürüldüğünde geri gelmiyor: rol süzgeci düşürüldü ve Engin'in ekranında canlı kusur olarak kaldı (22 Ağustos); optimizasyon turunda TECH-DEBT sayımı ve iki plan maddesi aynı şekilde düştü, Engin sorunca geri kondu (22 Ağustos).

**Doğrulanmamış varsayımı gerçek saymak.** "SQL'i Sonnet uygulamaz, parola Engin'de" denildi, CLAUDE.md tersini söylüyordu (19 Ağustos). Optimizasyon turunda bir bilgisayar adı kişi sanıldı ve beş tur boyunca onun üzerinden akıl yürütüldü, plana madde olarak girdi (22 Ağustos).

## Ters yönde bir kayıt

Sonnet'in DUR'ları üç kez haklı çıktı ve üçünde de canlıyı korudu: canlıda olmayan tablo zincire konmak üzereydi, ölü bir fonksiyon overload'ı taban alınmıştı, zorunlu alan eklemek kapsam dışı bir testi kırıyordu. Sonnet'in RAPORU doğrulama değildir ama DUR'u sinyaldir; incelenmeden geçilmez.
