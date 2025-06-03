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

// Adding class desktop-mode If the user is at the desktop mode!
function checkDesktopMode() {
    const body = document.body;
    if (window.innerWidth >= 1024) {
      body.classList.add("desktop-mode");
    } else {
      body.classList.remove("desktop-mode");
    }
  }

  // Initial check
  checkDesktopMode();

  // Re-check on resize
  window.addEventListener("resize", checkDesktopMode);