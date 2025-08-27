/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SMARTLEAD_API_KEY: string
    readonly VITE_SMARTLEAD_BASE_URL: string
    readonly VITE_CLIENT_NAME: string
    readonly VITE_AGENCY_LOGO_URL?: string
    readonly VITE_BRAND_PRIMARY_COLOR: string
    readonly VITE_BRAND_SECONDARY_COLOR: string
    readonly VITE_DASHBOARD_PASSWORD?: string
    readonly VITE_APP_URL?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
