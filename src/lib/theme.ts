/**
 * Theme configuration utility
 * Converts environment variables to CSS custom properties for dynamic theming
 */

// Convert hex color to HSL values for CSS custom properties
export const hexToHsl = (hex: string): string => {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse hex values
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Get theme configuration from environment variables
export const getThemeConfig = () => {
    const primaryColor = import.meta.env.VITE_BRAND_PRIMARY_COLOR || '#10B981';
    const secondaryColor = import.meta.env.VITE_BRAND_SECONDARY_COLOR || '#059669';
    const backgroundColor = import.meta.env.VITE_BACKGROUND_COLOR || '#FAFAFA';
    const foregroundColor = import.meta.env.VITE_FOREGROUND_COLOR || '#0A0A0A';
    const cardBackgroundColor = import.meta.env.VITE_CARD_BACKGROUND_COLOR || '#FFFFFF';
    const cardForegroundColor = import.meta.env.VITE_CARD_FOREGROUND_COLOR || '#0A0A0A';

    return {
        primary: hexToHsl(primaryColor),
        secondary: hexToHsl(secondaryColor),
        background: hexToHsl(backgroundColor),
        foreground: hexToHsl(foregroundColor),
        card: hexToHsl(cardBackgroundColor),
        cardForeground: hexToHsl(cardForegroundColor),
    };
};

// Apply theme to CSS custom properties
export const applyTheme = () => {
    const theme = getThemeConfig();
    const root = document.documentElement;

    // Set brand colors
    root.style.setProperty('--brand-primary', theme.primary);
    root.style.setProperty('--brand-secondary', theme.secondary);

    // Set background and foreground colors
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--card-foreground', theme.cardForeground);
    root.style.setProperty('--dashboard-bg', theme.background);

    // Update derived colors
    root.style.setProperty('--primary', `hsl(${theme.primary})`);
    root.style.setProperty('--accent', `hsl(${theme.primary})`);
    root.style.setProperty('--ring', `hsl(${theme.primary})`);
    root.style.setProperty('--chart-primary', theme.primary);
    root.style.setProperty('--sidebar-ring', theme.primary);
};

// Initialize theme on app startup
export const initializeTheme = () => {
    // Apply theme immediately
    applyTheme();

    // Also apply on window load to ensure DOM is ready
    if (typeof window !== 'undefined') {
        window.addEventListener('load', applyTheme);
    }
};
