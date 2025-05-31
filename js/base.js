const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(e) {
    if (e.matches) {
        document.body.classList.add('theme-dark');
    } else {
        document.body.classList.remove('theme-dark');
    }
}

// Initial check
applyTheme(prefersDark); // MediaQueryListener

// Listen for changes (e.g., user switches system theme)
prefersDark.addEventListener('change', applyTheme); // No need to pass the argument/parameter?