document.addEventListener('DOMContentLoaded', function() {
    const modeToggle = document.getElementById('mode-toggle');
    
    modeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

    // Smooth scrolling for navbar links
    const navbarLinks = document.querySelectorAll('.navbar a');
    
    navbarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            window.scrollTo({
                top: targetElement.offsetTop - 60,
                behavior: 'smooth'
            });
        });
    });
});
