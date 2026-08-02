import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // TD-23: jsdom GENEL ortam DEGIL. Saf fonksiyon testleri node ortaminda kalir
    // (ARCHITECTURE 3.5, saflik siniri); ekran testi dosyasi kendi basindaki
    // docblock ile jsdom acar.
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
