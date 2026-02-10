/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly VITE_WS_ENDPOINT: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_COMPANY_DASHBOARD_URL: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
