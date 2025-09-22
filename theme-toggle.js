// Handles theme toggling and persistence across pages.
(function() {
    const storageKey = 'pb-theme';
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');

    if (!toggle || !root) {
        return;
    }

    const readStoredTheme = () => {
        try {
            return localStorage.getItem(storageKey);
        } catch (error) {
            return null;
        }
    };

    const persistTheme = (theme) => {
        try {
            localStorage.setItem(storageKey, theme);
        } catch (error) {
            /* ignore write failures */
        }
    };

    const getCurrentTheme = () => {
        const theme = root.getAttribute('data-theme');
        return theme === 'dark' ? 'dark' : 'light';
    };

    const updateControlState = (theme) => {
        const isDark = theme === 'dark';
        toggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
        toggle.setAttribute('aria-pressed', String(isDark));
    };

    const applyTheme = (theme, shouldPersist = false) => {
        root.setAttribute('data-theme', theme);
        updateControlState(theme);
        if (shouldPersist) {
            persistTheme(theme);
        }
    };

    const storedTheme = readStoredTheme();
    if (storedTheme) {
        applyTheme(storedTheme);
    } else {
        updateControlState(getCurrentTheme());
    }

    toggle.addEventListener('click', () => {
        const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, true);
    });

    toggle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle.click();
        }
    });

    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handlePreferenceChange = (event) => {
        const stored = readStoredTheme();
        if (stored) {
            return;
        }
        applyTheme(event.matches ? 'dark' : 'light');
    };

    if (mediaQuery) {
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handlePreferenceChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handlePreferenceChange);
        }
    }
})();
