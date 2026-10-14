// Global Theme Toggle Functionality
(function() {
    function getStoredTheme() {
        return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
            document.body.classList.remove('dark-mode');
        }
        updateToggleButtons(theme);
    }

    function updateToggleButtons(theme) {
        const toggles = document.querySelectorAll('.theme-toggle-btn, #themeToggle');
        toggles.forEach(btn => {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('.button-text');
            if (theme === 'dark') {
                if (icon) icon.className = 'bi bi-sun-fill';
                if (text) text.textContent = 'Light Mode';
                btn.setAttribute('title', 'Switch to Light Mode');
                btn.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                if (icon) icon.className = 'bi bi-moon-fill';
                if (text) text.textContent = 'Dark Mode';
                btn.setAttribute('title', 'Switch to Dark Mode');
                btn.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        });
    }

    // Apply stored theme immediately on script execution to prevent flash
    const initialTheme = getStoredTheme();
    if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        if (document.body) document.body.classList.add('dark-mode');
    }

    document.addEventListener('DOMContentLoaded', function() {
        applyTheme(getStoredTheme());

        // Event delegation for any theme toggle button
        document.addEventListener('click', function(e) {
            const toggle = e.target.closest('.theme-toggle-btn, #themeToggle');
            if (!toggle) return;
            e.preventDefault();
            const isDark = document.body.classList.contains('dark-mode');
            const newTheme = isDark ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    });
})();

