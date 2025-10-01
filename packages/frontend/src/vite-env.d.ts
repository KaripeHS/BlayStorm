/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_STRIPE_PUBLIC_KEY?: string
  readonly VITE_ENABLE_MULTIPLAYER?: string
  readonly VITE_ENABLE_AI_TUTOR?: string
  readonly VITE_ENABLE_PAYMENTS?: string
  readonly VITE_APP_ENV?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
