# Prompt ve Spec Biçimi

Bu dosyanın tüketicisi Opus'tur. Sonnet'e bakan kurallar CLAUDE.md'de kalır.

- Özellik = TEK kendi kendine yeten spec: hangi dosyalar, neyin kapsam dışı, sonda uçtan uca doğrulama adımı.
- Prompt SOHBET İÇİNDE tek kod bloğu olarak verilir. Dosya ya da indirme bağlantısı değil, satır içi düz metin değil; markdown dil etiketi yok, bölünmüş blok yok. Bloğun içine kullanıcının ayrıca yazması gereken talimat konmaz — blok tek başına yapıştırılabilir olmalı. Cevap tek kelimeyse blok gerekmez.
- Spec şunları taşır: başta iki satır sigorta ("CLAUDE.md'yi oku ve uygula; kapılar geçmeden commit yok"), `git checkout main && git pull origin main`, bir cümle amaç, ESKİ/YENİ blokları, kapsam dışı, işe özgü beklenenler, commit mesajı, sonda `git push origin main`. Kapı komutları spec'e kopyalanmaz; `run-gates.sh` çağrılır.
- **Maliyet tasarım kriteridir:** tam dosya Write yalnız YENİ dosya için. Mevcut dosyada değişen satır azsa cerrahi düzenleme yazılır.
- OKUNANLAR satırı sohbette, prompt bloğunun hemen üstünde yazılır; bloğun içine girmez.
