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
                console.log('Link copied to clipboard: ' + linkToCopy);
                alert('Link copied to clipboard: ' + linkToCopy);
            }).catch(function(err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy text: ' + err);
            });
        } else {
            // Fallback for older browsers
            console.log('Clipboard API not supported, using fallback.');
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
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
  
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
        showNotification();
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
}

function showNotification() {
    var notification = document.getElementById('copyNotification');
    notification.className = 'show';
    setTimeout(function() { notification.className = notification.className.replace('show', ''); }, 3000);
}

document.getElementById('shareButton').addEventListener('click', function() {
    copyTextToClipboard('https://nkusharoraa.github.io/');
});

document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('scroll', function() {
        var scrollPosition = window.scrollY;

        // Adjust this value to determine when the effect triggers
        var triggerOffset = 100; // Adjust as needed

        var navIconLinks = document.querySelectorAll('.navbar .nav-icon-link, .navbar1 .nav-icon-link');

        navIconLinks.forEach(function(link) {
            var sectionId = link.getAttribute('href').substring(1); // Get section ID from href

            // Get the corresponding section's offset top
            var section = document.getElementById(sectionId);
            var sectionOffset = section.offsetTop;

            // Add a class if scrolled past the section's top offset
            if (scrollPosition >= sectionOffset - triggerOffset) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
            }
        });
    });
});

