document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.info-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            alert('More information about this project.');
        });
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
