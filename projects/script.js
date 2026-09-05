document.addEventListener('DOMContentLoaded', function () {
    fetch('../data.json')
        .then(r => r.json())
        .then(data => {
            renderNav(data.projectCategories);
            renderHeader(data.hero);
            renderProjectSections(data.projectCategories);
            renderFooter(data.hero.social);
            initInteractivity();
        });
});

function renderNav(categories) {
    const mobileNav = document.getElementById('mobileNav');
    const desktopNav = document.getElementById('desktopNav');

    const mobileItems = categories.map(cat => {
        const label = cat.navLabel || cat.name;
        return `<li><span class="nav-icon1"><a href="#${cat.id}"><img src="${cat.icon}" alt="${cat.name}"> <br> ${label}</a></span></li>`;
    }).join('');
    mobileNav.innerHTML = mobileItems;

    const desktopItems = categories.map(cat => {
        const label = cat.navLabel || cat.name;
        return `<li><span class="nav-icon"><a href="#${cat.id}" class="nav-item"><img src="${cat.icon}" alt="${cat.name}"> <br><span class="navicon-name">${label}</span> </a></span></li>`;
    }).join('');
    desktopNav.innerHTML = desktopItems +
        `<li><span class="hidepp"><button id="shareButtonmob" class="share-btnmob"><a href="#"><img src="../media/share-icon.svg" alt="Share"> <br>Share </a></button></span></li>` +
        `<li><div id="copyNotification">Link copied</div></li>`;
}

function renderHeader(hero) {
    const container = document.getElementById('headerContainer');
    const socialHtml = hero.social.map(s =>
        `<a href="${s.url}" target="_blank" class="social-icon"><img src="../${s.icon}" alt="${s.name}"></a>`
    ).join('');
    container.innerHTML = `
        <div class="header-left">
            <h3>Projects organized by <span class="highlight-text">AI domain</span></h3>
            <p>1. LLM & Generative AI<br>2. ML Engineering & MLOps<br>3. Other Projects</p>
            <p>Reach me here for more information.</p>
            <div class="social-icons-beside">${socialHtml}</div>
        </div>`;
}

function renderProjectSections(categories) {
    const container = document.getElementById('projectSections');
    container.innerHTML = categories.map(cat => {
        const projectsHtml = cat.projects.map((proj, i) => {
            const linkHtml = (proj.githubUrl || proj.liveUrl) ? `
                <div class="project-link-class"><a href="${proj.githubUrl || proj.liveUrl}" target="_blank">
                    <img src="../media/github-icon.svg" alt="Project Link" class="project-link-icon">
                </a></div>
                <a href="${proj.githubUrl || proj.liveUrl}" target="_blank" class="project-box-link"></a>` : '';
            const bulletsHtml = proj.bullets.map(b =>
                `<li><img src="../media/bullet.svg" alt="Bullet" class="project-link-icon2">${b}</li>`
            ).join('');
            const tagsHtml = proj.tags.map(t =>
                `<div class="tag-box-main"><div class="tag-box">${t}</div></div>`
            ).join('');
            const divider = (i > 0 && i % 2 === 0) ? `<h2><span class="section-name-hidden"> Projects </span></h2><hr class="section-divider">` : '';
            return `${divider}${linkHtml}
                <div class="project-box"><div class="project">
                    <div class="project-title">${proj.title}</div>
                    <div class="project-description"><ul>${bulletsHtml}</ul></div>
                    ${tagsHtml}
                </div></div>`;
        }).join('');
        return `<section id="${cat.id}" class="projects">
            <h2><span class="section-name">${cat.name}</span></h2>
            <hr class="section-divider">
            ${projectsHtml}
        </section>`;
    }).join('');
}

function renderFooter(social) {
    const container = document.getElementById('footerSocial');
    container.innerHTML = social.map(s =>
        `<a href="${s.url}" target="_blank" class="social-icon"><img src="../${s.icon}" alt="${s.name}"></a>`
    ).join('');
}

function initInteractivity() {
    const modeToggle = document.getElementById('mode-toggle');
    const modeIcon = document.getElementById('mode-icon');

    modeToggle.addEventListener('click', function () {
        setTimeout(function () {
            document.body.classList.toggle('dark-mode');
            modeIcon.src = document.body.classList.contains('dark-mode')
                ? '../media/toggle-light-icon.svg'
                : '../media/toggle-dark-icon.svg';
        }, 800);
    });

    document.getElementById('shareButton').addEventListener('click', function () {
        copyTextToClipboard('https://nkusharoraa.github.io/projects');
    });
    const mobBtn = document.getElementById('shareButtonmob');
    if (mobBtn) {
        mobBtn.addEventListener('click', function () {
            copyTextToClipboard('https://nkusharoraa.github.io/projects');
        });
    }

    const navItems = document.querySelectorAll('.nav-item');
    const navIcons = document.querySelectorAll('.nav-icon');
    const sections = document.querySelectorAll('section');

    function setActiveNavItem(currentSectionId) {
        navItems.forEach((item, index) => {
            const sectionId = item.getAttribute('href').slice(1);
            if (sectionId === currentSectionId) {
                item.classList.add('active');
                if (navIcons[index]) navIcons[index].classList.add('active-icon');
            } else {
                item.classList.remove('active');
                if (navIcons[index]) navIcons[index].classList.remove('active-icon');
            }
        });
    }

    function checkNavItems() {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                currentSection = section.getAttribute('id');
            }
        });
        setActiveNavItem(currentSection);
    }

    window.addEventListener('scroll', checkNavItems);
    navIcons.forEach((icon, index) => {
        icon.addEventListener('click', function (event) {
            event.preventDefault();
            const sectionId = navItems[index].getAttribute('href').slice(1);
            const section = document.getElementById(sectionId);
            window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
        });
    });
    checkNavItems();
}

function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function () {
        showNotification();
    });
}

function showNotification() {
    var notification = document.getElementById('copyNotification');
    if (!notification) return;
    notification.className = 'show';
    setTimeout(function () { notification.className = notification.className.replace('show', ''); }, 3000);
}
