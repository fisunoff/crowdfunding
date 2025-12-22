import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    vue(),

    // 1) Авто-регистрация компонентов из src/components
    Components({
      dirs: ['src/components'],
      dts: 'src/components.d.ts',
    }),

    // 2) Авто-импорты функций/хуков/сторов/API
    AutoImport({
      imports: ['vue', 'pinia', 'vue-router'],
      dirs: [
        'src/api',     // чтобы вызывать api без import
        'src/stores',  // чтобы useAuthStore() тоже был без import
        'src/composables',
      ],
      dts: 'src/auto-imports.d.ts',
      vueTemplate: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
