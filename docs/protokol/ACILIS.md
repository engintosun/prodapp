# Oturum Açılış Protokolü

Bu dosyanın tüketicisi Opus'tur. Claude Code oturumları bu protokolü yürütmez.

## Sıra

1. Repoyu GitHub'dan taze klonla (engintosun/prodapp, main). **Sığ klon yasak** — `--depth` kullanılmaz; sığ klonda tarihe dayanan her denetim yanlış sonuç verir.
2. Git kimliğini kontrol et; tanımlı değilse `--local` olarak `Claude <noreply@anthropic.com>` ayarla. Hangi bilgisayar olduğu önemli değil, bu soru sorulmaz.
3. Açılış üçlüsünü oku: CLAUDE.md + CURRENT.md + INDEX.md bölüm 4. INDEX'in bölüm 2 ve 7'si açılışta okunmaz, arandığında açılır.
4. Dört-beş satırlık durum raporu ver. Engin onaylamadan iş başlamaz.

## Durum raporunun taşıdıkları

- **Hiçbir iş çıplak sunulmaz:** önerilen her işin yanında neye bağlı olduğu ve neyi bloke ettiği yazılır.
- **Bağımlılık taranmadan menü sunulmaz** — "hangisinden başlayalım" demeden önce taranır.
- **Bayatlık taraması:** o oturumda çalışılacak konunun kendi karar dosyası ile CURRENT.md birbirini tutuyor mu, tek satırla söylenir. Genel tarama değil, yalnız o günkü konu. Taranmadıysa "taranmadı" denir.
- Önceki oturumda alınan kararlar CURRENT.md Milestone günlüğünün son kaydında GÖZDEN GEÇİRİLECEK KARARLAR başlığıyla duruyorsa, madde madde sunulur.

## Okuma kuralları

- **Okuma teyitli olmalı:** bir araç içerik yerine boş çıktı ya da URL dönerse bu "okundu" değil DUR sinyalidir. Gerçek içerik görülmeden "okundu" denmez.
- Tam dosya ve tüm tarihçe okuması YOK — ama bu kural İLGİSİZ dosyalar içindir. Dokunulacak dosyanın dokunulacak bölümü her zaman baştan sona okunur; maliyetli olması mazeret değildir.
- Bir tabloya ya da listeye kayıt eklenecekse tablonun TAMAMI ve varsa sayaç satırları okunur. Boş numara aramak okumak değildir.
- Grep dosyayı ya da satırı BULMAK içindir; içeriği anlamak için yetersizdir.
- Jeton bütçesi gereksiz iş yapmamak ve döngüye girmemek içindir, okumamak için değil.
- Çelişkide sıra: repo > CURRENT.md > INDEX.md.
- OKUNANLAR satırı sohbette, prompt bloğunun hemen üstünde yazılır — bloğun içine girmez, çünkü Sonnet'e hitap etmez. Denetim Engin'dedir: hangi dosya, hangi satır aralığı.
