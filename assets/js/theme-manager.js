/* ============================================================================
   Theme Configuration and Loader
   
   This file defines available themes and provides the theme loading system.
   ============================================================================ */

window.ThemeManager = (function() {
    // Use hardcoded base URL for reliable path resolution
    const baseUrl = '/mcs-labs';

    const THEME_FAMILIES = {
        'rich': {
            name: 'Rich',
            file: baseUrl + '/assets/css/themes/theme-rich.css',
            description: 'Colorful, engaging design with gradients and rich colors'
        },
        'minimal': {
            name: 'Minimal',
            file: baseUrl + '/assets/css/themes/theme-minimal.css',
            description: 'Clean, minimal blog-style design focused on content'
        }
    };

    const DEFAULT_THEME_FAMILY = 'rich';
    const DEFAULT_MODE = 'light';
    
    let currentThemeFamily = DEFAULT_THEME_FAMILY;
    let currentMode = DEFAULT_MODE;
    let loadedThemeLink = null;

    // Get theme preference from localStorage
    function getStoredTheme() {
        const stored = localStorage.getItem('theme-family');
        return stored || DEFAULT_THEME_FAMILY;
    }

    function getStoredMode() {
        const stored = localStorage.getItem('theme-mode');
        return stored || DEFAULT_MODE;
    }

    // Store theme preference in localStorage
    function storeTheme(themeFamily, mode) {
        localStorage.setItem('theme-family', themeFamily);
        localStorage.setItem('theme-mode', mode);
    }

    // Load theme CSS file
    function loadThemeCSS(themePath) {
        return new Promise((resolve, reject) => {
            // Remove existing theme CSS if present
            if (loadedThemeLink) {
                loadedThemeLink.remove();
                loadedThemeLink = null;
            }

            // Create and load new theme CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = themePath;
            link.onload = () => {
                loadedThemeLink = link;
                resolve();
            };
            link.onerror = reject;
            
            // Insert before the main stylesheet to allow overrides
            const mainStylesheet = document.querySelector('link[href*="style.css"]');
            if (mainStylesheet) {
                mainStylesheet.parentNode.insertBefore(link, mainStylesheet.nextSibling);
            } else {
                document.head.appendChild(link);
            }
        });
    }

    // Apply theme
    async function applyTheme(themeFamily, mode) {
        const themeConfig = THEME_FAMILIES[themeFamily];
        if (!themeConfig) {
            console.warn(`Theme family "${themeFamily}" not found, falling back to default`);
            themeFamily = DEFAULT_THEME_FAMILY;
        }

        try {
            // Load theme CSS
            await loadThemeCSS(themeConfig.file);
            
            // Set data-theme attribute for light/dark mode
            document.documentElement.setAttribute('data-theme', mode);
            
            // Set data-theme-family attribute for theme-specific styling
            document.documentElement.setAttribute('data-theme-family', themeFamily);
            
            // Update current state
            currentThemeFamily = themeFamily;
            currentMode = mode;
            
            // Store preference
            storeTheme(themeFamily, mode);
            
            // Dispatch theme change event
            window.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { themeFamily, mode, theme: themeConfig }
            }));
            
            return true;
        } catch (error) {
            console.error(`Failed to load theme "${themeFamily}":`, error);
            return false;
        }
    }

    // Toggle between light and dark mode
    function toggleMode() {
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        return applyTheme(currentThemeFamily, newMode);
    }

    // Change theme family
    function changeThemeFamily(themeFamily) {
        return applyTheme(themeFamily, currentMode);
    }

    // Sync internal state with externally applied theme (for pre-loaded themes)
    function syncState(themeFamily, mode) {
        const themeConfig = THEME_FAMILIES[themeFamily];
        if (!themeConfig) {
            console.warn(`Theme family "${themeFamily}" not found during sync`);
            return;
        }
        
        // Update internal state to match what's already applied
        currentThemeFamily = themeFamily;
        currentMode = mode;
        
        // Find the existing theme link that was pre-loaded
        const existingLink = document.getElementById('active-theme-css');
        if (existingLink) {
            loadedThemeLink = existingLink;
        }
        
        // Store preference
        storeTheme(themeFamily, mode);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { themeFamily, mode, theme: themeConfig }
        }));
    }

    // Initialize theme system with FOUC protection
    function init() {
        // Safety timeout to ensure page is always visible, even if theme loading fails
        setTimeout(() => {
            if (!document.documentElement.hasAttribute('data-theme')) {
                console.warn('Theme loading timeout - showing page with default styling');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        }, 1000); // 1 second timeout

        const savedThemeFamily = getStoredTheme();
        const savedMode = getStoredMode();
        applyTheme(savedThemeFamily, savedMode);
    }

    // Public API
    return {
        themeFamilies: THEME_FAMILIES,
        getCurrentThemeFamily: () => currentThemeFamily,
        getCurrentMode: () => currentMode,
        getCurrentThemeInfo: () => ({
            family: currentThemeFamily,
            mode: currentMode,
            config: THEME_FAMILIES[currentThemeFamily]
        }),
        applyTheme,
        changeThemeFamily,
        toggleMode,
        init,
        syncState,
        
        // Backward compatibility
        get: () => `${currentThemeFamily}-${currentMode}`,
        set: (value) => {
            // Handle old theme format
            if (value.includes('-')) {
                const [family, mode] = value.split('-');
                return applyTheme(family, mode);
            }
            return changeThemeFamily(value);
        },
        toggle: toggleMode,
        cycleTheme: toggleMode // For backward compatibility
    };
})();