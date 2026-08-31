# Prompt ve Spec Biçimi

Bu dosyanın tüketicisi Opus'tur. Sonnet'e bakan kurallar CLAUDE.md'de kalır.

- Özellik = TEK kendi kendine yeten spec: hangi dosyalar, neyin kapsam dışı, sonda uçtan uca doğrulama adımı.
- Prompt SOHBET İÇİNDE tek kod bloğu olarak verilir. Dosya ya da indirme bağlantısı değil, satır içi düz metin değil; markdown dil etiketi yok, bölünmüş blok yok. Bloğun içine kullanıcının ayrıca yazması gereken talimat konmaz — blok tek başına yapıştırılabilir olmalı. Cevap tek kelimeyse blok gerekmez.
- Spec şunları taşır: başta iki satır sigorta ("CLAUDE.md'yi oku ve uygula; kapılar geçmeden commit yok"), `git checkout main && git pull origin main`, bir cümle amaç, ESKİ/YENİ blokları, kapsam dışı, işe özgü beklenenler, commit mesajı, sonda `git push origin main`. Kapı komutları spec'e kopyalanmaz; `run-gates.sh` çağrılır.
- **Maliyet tasarım kriteridir:** tam dosya Write yalnız YENİ dosya için. Mevcut dosyada değişen satır azsa cerrahi düzenleme yazılır.
- OKUNANLAR satırı sohbette, prompt bloğunun hemen üstünde yazılır; bloğun içine girmez.
- Spec `BRANCH YASAK: yeni dal açma.` satırını taşır, ve commit'ten hemen önce `git branch --show-current` ile aktif dal doğrulanır; çıktı `main` değilse durulur.
- Her `str_replace` çapası için "dosyada TEK kez geçiyor olmalı, geçmiyorsa ya da birden fazla geçiyorsa DUR" şartı spec'e yazılır. Çapa apostrof, akıllı tırnak ya da tire İÇERMEZ (CLAUDE.md); dosya adında tire varsa o satır çapa yapılamaz, başka bir çapa seçilir.
- **Kapı komutları spec'e KOPYALANMAZ.** `run-gates.sh` derlemeyi, denetlemeyi ve testleri kendisi koşar; spec'e ayrıca yazılırsa hepsi iki kez koşar. 25 Ağustos 2026'da yedi promptun yedisinde de bu oldu.
- **BEKLENENLER bölümü her dilim için SIFIRDAN yazılır; önceki prompttan taşınmaz.** Taşınan satır dilime uymadığında spec kendi içinde çelişir (31 Ağustos 2026, docs/protokol/DERSLER.md "Spec içi çelişki").
- **Test EKLEYEN ya da SİLEN dilimde `.claude/test-count` beklenen değişen-dosya listesine YAZILIR;** yazılmazsa kapı ile spec çarpışır.
- **Şemaya değen dilimde ilgili tablonun TÜM göç geçmişi taranır** (`grep -rn "<tablo_adi>" supabase/migrations/`), yalnız tabloyu yaratan göç YETMEZ.
- **str_replace çapası çoğaltılmış bir bloğun içinden alınmaz;** bloğu tekilleştiren dışarıdaki işaretten alınır.

## Onay haritası

Bir işin onay isteyip istemediği, işin EYLEM mi düşünme mi olduğuna bakılarak belirlenir.

**Engin onaylar** — yargı gerektirir, kapıya devredilemez:
- Tasarım kararı ve mimari çatal.
- Promptun yazılması. Düzeltme fark edildiğinde bile önce "yazayım mı" diye sorulur.
- Canlı şemaya değen SQL'in uygulanması. Onay, SQL okunup "kabul" denmesidir; kopyala-yapıştır yoktur.
- Bir maddenin ertelenmesi ya da kapsam dışı bırakılması.
- Teknik borç açılması.

**Kapı karar verir** — deterministik, kimseye sorulmaz:
- Aktif dal · sığ klon · damga varlığı · damga tazeliği · ASCII'ye düşmüş .md metni · tanımsız CSS token · test sayısı kaybı.
- `supabase db push` izin ekranına bağlıdır.

**Onay istemez** — Claude'un kendi işi:
- Okumak, dosya açmak, taze klon almak.
- Etki analizi, bağımlılık taraması, bayatlık taraması.
- Konum almak, karşı çıkmak, bir işin başka bir işe bağlı olduğunu söylemek.
- Push sonrası origin'den bağımsız doğrulama.

Sınır kuralı: onay EYLEMLERİ kapsar, düşünmeyi değil. Prompt yazmak, SQL koşmak ve commit izin ister; okumak ve analiz etmek istemez.
