/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_HUME_API_KEY: string
  readonly VITE_HUME_SECRET_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}