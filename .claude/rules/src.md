---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Kod kuralları (src)

> Yükleme etiketi `paths:` olarak yazılır. `globs:` yazımı D2a'da ÖLÇÜLDÜ (22 Ağustos 2026) ve kapsamı UYGULAMIYOR: kapsamı dışındaki oturumda da açılışta yükleniyor. Hata vermez, kapı yakalamaz — yeni kural dosyası açılırken bu satır okunsun.

- SSOT Supabase. Client kopya; çakışmada Supabase kazanır.
- Sessiz hata YASAK: throw ya da kullanıcıya bildirim. Boş catch / sessiz return yok.
- Katman ayrımı: veri (Supabase) -> iş mantığı (saf fonksiyon) -> UI -> orkestrasyon.
- Supabase client tipsiz; sonuç cast `as unknown as X`. tsconfig noUnusedLocals + noUnusedParameters AÇIK, kullanılmayan import/değişken bırakma.
- İsim: DB snake_case, JS camelCase, dosya kebab-case.
- Tehlikeli kökler (gec / tip / durum / kat) kodda Türkçe KULLANILMAZ. Toplu değiştirme yasak; karşılıkları docs/GLOSSARY.md'de.
- `react-hooks/exhaustive-deps` uyarısı bağımlılık dizisi GENİŞLETİLEREK susturulmaz: kullanılan değer hook'un dışına çıkarılır (primitive bağımlılık). Nesnenin tamamı bağımlılık olur ancak gerçekten tamamı kullanılıyorsa. Gerekçe: her yenilemede yeni referansla doğan nesne hesabı boşuna tekrarlatır ve linter FAZLA bağımlılığı yakalamaz.
- CSS token'i `var(--x)` yazılırken tanımlı küme src/styles/*.css'tir; tanımsız token tarayıcıda sessizce yoksayılır ve commit kapısı bunu reddeder.
- Kullanıcıya MESAJ OLARAK gösterilen metin TAM Türkçe karakterli yazılır: JSX metni, `placeholder`, `title`, `aria-label`, `setError()` içeriği ve Supabase hatasını kullanıcıya taşıyan `error.message` zincirinin kaynağı (SQL `raise exception` metinleri). ASCII'ye düşürme YASAK. Ölçüt konum değil GÖRÜNÜRLÜKTÜR: motorun kendi iç şart hataları (`src/shared/cfe/` içindeki `throw new Error`), `console.warn` metinleri ve test kurgusundaki metinler kullanıcıya mesaj olarak çıkmaz — ASCII kalırlar. Kod tarafı da ASCII kalır: değişken adı, kolon anahtarı, rota yolu, enum değeri, test id. Hiçbir kapı bunu denetlemez (kapılar build + eslint + test sayısıdır); kural elle uygulanır, prompt yazarken de uygulanır. Kaynak: TD-32 — prompt ASCII yazıldığı için ekrana ASCII metin çıkmıştı.
