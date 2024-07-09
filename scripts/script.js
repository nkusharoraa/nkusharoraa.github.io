document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.info-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            alert('More information about this project.');
        });
    });
});
