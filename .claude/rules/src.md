---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Kod kuralları (src)

- SSOT Supabase. Client kopya; çakışmada Supabase kazanır.
- Sessiz hata YASAK: throw ya da kullanıcıya bildirim. Boş catch / sessiz return yok.
- Katman ayrımı: veri (Supabase) -> iş mantığı (saf fonksiyon) -> UI -> orkestrasyon.
- Supabase client tipsiz; sonuç cast `as unknown as X`. tsconfig noUnusedLocals + noUnusedParameters AÇIK, kullanılmayan import/değişken bırakma.
- İsim: DB snake_case, JS camelCase, dosya kebab-case.
- Tehlikeli kökler (gec / tip / durum / kat) kodda Türkçe KULLANILMAZ. Toplu değiştirme yasak; karşılıkları docs/GLOSSARY.md'de.
- `react-hooks/exhaustive-deps` uyarısı bağımlılık dizisi GENİŞLETİLEREK susturulmaz: kullanılan değer hook'un dışına çıkarılır (primitive bağımlılık). Nesnenin tamamı bağımlılık olur ancak gerçekten tamamı kullanılıyorsa. Gerekçe: her yenilemede yeni referansla doğan nesne hesabı boşuna tekrarlatır ve linter FAZLA bağımlılığı yakalamaz.
- CSS token'i `var(--x)` yazılırken tanımlı küme src/styles/*.css'tir; tanımsız token tarayıcıda sessizce yoksayılır ve commit kapısı bunu reddeder.
