document.addEventListener('DOMContentLoaded', function() {
    const modeToggle = document.getElementById('mode-toggle');
    const modeIcon = document.getElementById('mode-icon');
    const shareBtn = document.getElementById('share-btn');
    
    modeToggle.addEventListener('click', function() {
        // Add a delay before toggling dark mode
        setTimeout(function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                modeIcon.src = 'toggle-light-icon.svg';
            } else {
                modeIcon.src = 'toggle-dark-icon.svg';
            }
        }, 800); // Adjust delay in milliseconds (800ms in this example for slower effect)
    });
    
    shareBtn.addEventListener('click', function(event) {
        event.preventDefault();
        
        const linkToCopy = 'https://nkusharoraa.github.io/';
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(linkToCopy).then(function() {
                alert('Link copied to clipboard: ' + linkToCopy);
            }).catch(function(err) {
                console.error('Failed to copy text: ', err);
            });
        } else {
            // Fallback for older browsers
            const dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.value = linkToCopy;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            alert('Link copied to clipboard: ' + linkToCopy);
        }
    });
});
