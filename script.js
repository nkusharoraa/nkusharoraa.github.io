document.addEventListener('DOMContentLoaded', function() {
    const modeToggle = document.getElementById('mode-toggle');
    const modeIcon = document.getElementById('mode-icon');
    const currentMode = localStorage.getItem('theme');

    if (currentMode) {
        document.body.classList.add(currentMode);
        modeIcon.src = currentMode === 'dark-mode' ? 'toggle-light-icon.svg' : 'toggle-dark-icon.svg';
    }

    modeToggle.addEventListener('click', function() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        modeIcon.src = isDarkMode ? 'toggle-light-icon.svg' : 'toggle-dark-icon.svg';
        localStorage.setItem('theme', isDarkMode ? 'dark-mode' : 'light-mode');
    });
});
