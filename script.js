document.addEventListener('DOMContentLoaded', function() {
    const modeToggle = document.getElementById('mode-toggle');
    const modeIcon = document.getElementById('mode-icon');
    
    modeToggle.addEventListener('click', function() {
        // Add a delay before toggling dark mode
        setTimeout(function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                modeIcon.src = 'toggle-light-icon.svg';
            } else {
                modeIcon.src = 'toggle-dark-icon.svg';
            }
        }, 300); // Adjust delay in milliseconds (300ms in this example)
    });
});
