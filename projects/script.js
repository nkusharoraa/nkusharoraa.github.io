document.addEventListener('DOMContentLoaded', function() {
    const modeToggle = document.getElementById('mode-toggle');
    const modeIcon = document.getElementById('mode-icon');
    const shareBtn = document.getElementById('share-btn');
    
    modeToggle.addEventListener('click', function() {
        // Add a delay before toggling dark mode
        setTimeout(function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                modeIcon.src = '../media/toggle-light-icon.svg';
            } else {
                modeIcon.src = '../media/toggle-dark-icon.svg';
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
    copyTextToClipboard('https://nkusharoraa.github.io/projects');
});
document.getElementById('shareButtonmob').addEventListener('click', function() {
    copyTextToClipboard('https://nkusharoraa.github.io/projects');
});

document.addEventListener("DOMContentLoaded", function () {
    const navItems = document.querySelectorAll(".nav-item");
    const navIcons = document.querySelectorAll(".nav-icon");
    const sections = document.querySelectorAll("section");

    function setActiveNavItem(currentSectionId) {
        navItems.forEach((item, index) => {
            const sectionId = item.getAttribute("href").slice(1); // Remove '#'
            if (sectionId === currentSectionId) {
                item.classList.add("active");
                navIcons[index].classList.add("active-icon");
            } else {
                item.classList.remove("active");
                navIcons[index].classList.remove("active-icon");
            }
        });
    }

    function checkNavItems() {
        let currentSection = "";

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                currentSection = section.getAttribute("id");
            }
        });

        setActiveNavItem(currentSection);
    }

    window.addEventListener("scroll", checkNavItems);

    // Click event for nav-icons
    navIcons.forEach((icon, index) => {
        icon.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default action

            const sectionId = navItems[index].getAttribute("href").slice(1); // Remove '#'
            const section = document.getElementById(sectionId);
            const offsetTop = section.offsetTop;

            window.scrollTo({
                top: offsetTop,
                behavior: "smooth" // Smooth scroll
            });
        });
    });

    // Initial check on page load
    checkNavItems();
});
