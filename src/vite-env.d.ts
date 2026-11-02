/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_AUTHOR_FACEBOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
