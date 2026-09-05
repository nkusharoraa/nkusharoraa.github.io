const CONFIG = {
    shareUrl: 'https://nkusharoraa.github.io/',
    darkModeDelay: 800,
    notificationDuration: 3000,
    elements: {
        modeToggle: 'mode-toggle',
        modeIcon: 'mode-icon',
        shareButton: 'shareButton',
        shareButtonMob: 'shareButtonmob',
        copyNotification: 'copyNotification',
        skillsContainer: 'skillsContainer',
        introContainer: 'introContainer',
        introfrontContainer: 'introfrontContainer',
        skillscolumncontainer: 'skillscolumncontainer',
        backContent: 'backContent',
        introbackContent: 'introbackContent'
    },
    classes: {
        darkMode: 'dark-mode',
        flip: 'flip',
        show: 'show',
        active: 'active',
        activeIcon: 'active-icon',
        navItem: 'nav-item',
        navIcon: 'nav-icon',
        tagBoxMain: 'tag-box-main',
        tagBoxMain1: 'tag-box-main1',
        skillBack: 'skill-back',
        introBack: 'intro-back'
    },
    icons: {
        darkMode: 'media/toggle-dark-icon.svg',
        lightMode: 'media/toggle-light-icon.svg'
    },
    layout: {
        skillsColumnMargins: {
            default: '-374px',
            introFlipped: '-324px',
            skillsFlipped: '-286px',
            bothFlipped: '-276px'
        }
    },
    dataAttributes: {
        backContent: 'data-back-content',
        backValue: 'data-back-value'
    }
};

// ============================================================================
// RENDERING FROM DATA.JSON
// ============================================================================

function renderHero(data) {
    const container = document.getElementById('heroContainer');
    if (!container || !data.hero) return;

    const socialHTML = data.hero.social.map(s =>
        `<a href="${s.url}" target="_blank" class="social-icon">
            <img src="${s.icon}" alt="${s.name}">
        </a>`
    ).join('');

    container.innerHTML = `
        <img src="${data.hero.profilePic}" alt="Profile Picture" class="profile-pic">
        <div class="header-left">
            <h1>Hi! I'm <span class="highlight-text">${data.hero.name}</span></h1>
            <h3>${data.hero.tagline}</h3>
            <div class="social-icons-beside">${socialHTML}</div>
        </div>
    `;
}

function renderAbout(data) {
    const container = document.getElementById('aboutIntroContent');
    if (!container || !data.about) return;

    const tagsHTML = data.about.interestTags.map(tag =>
        `<div class="tag-box-main1" data-back-content="${tag.backTitle}" data-back-value="${tag.backContent}">
            <div class="tag-box">${tag.label}</div>
        </div>`
    ).join('');

    container.innerHTML = `
        <p>${data.about.intro}</p>
        <p>Click any tag below to see what's behind each interest.</p>
        ${tagsHTML}
        <br>
    `;
}

function renderSkills(data) {
    const container = document.getElementById('skillsFrontContent');
    if (!container || !data.skills) return;

    const categoriesHTML = data.skills.categories.map((cat, i) => {
        const divider = i < data.skills.categories.length - 1
            ? '<hr class="subproject-divider">' : '';
        return `
            <div class="project">
                <div class="project-title">${cat.title}</div>
                <div class="project-description">${cat.items}</div>
            </div>
            ${divider}
        `;
    }).join('');

    const tagsHTML = data.skills.skillTags.map(tag =>
        `<div class="tag-box-main" data-back-content="${tag.backTitle}" data-back-value="${tag.backContent}">
            <div class="tag-box">${tag.label}</div>
        </div>`
    ).join('');

    container.innerHTML = categoriesHTML + '<hr class="subproject-divider">' + tagsHTML;
}

function renderProjects(data) {
    const container = document.getElementById('projects');
    if (!container || !data.projects) return;

    const html = data.projects.map((proj, i) => {
        const bulletItems = proj.bullets.map(b => {
            const labelHTML = b.label ? `<strong>${b.label}:</strong> ` : '';
            return `<li>
                <img src="media/bullet.svg" alt="Bullet" class="project-link-icon2">
                ${labelHTML}${b.text}
            </li>`;
        }).join('');

        const tagsHTML = proj.tags.map(t =>
            `<div class="tag-box-main"><div class="tag-box">${t}</div></div>`
        ).join('');

        let linkHTML = '';
        if (proj.githubUrl) {
            linkHTML = `
                <div class="project-link-class">
                    <a href="${proj.githubUrl}" target="_blank">
                        <img src="media/github-icon.svg" alt="Project Link" class="project-link-icon">
                    </a>
                </div>
                <a href="${proj.liveUrl || proj.githubUrl}" target="_blank" class="project-box-link"></a>
            `;
        }

        const separator = (i > 0 && i % 2 === 0)
            ? '<h2><span class="section-name-hidden"> Projects </span></h2><hr class="section-divider">'
            : '';

        return `
            ${separator}
            ${linkHTML}
            <div class="project-box">
                <div class="project">
                    <div class="project-title">${proj.title}</div>
                    <div class="project-description"><ul>${bulletItems}</ul></div>
                    ${tagsHTML}
                </div>
            </div>
        `;
    }).join('');

    container.insertAdjacentHTML('beforeend', html);
}

function renderExperience(data) {
    const container = document.getElementById('cvTimeline');
    if (!container || !data.experience) return;

    const exp = data.experience;

    const industryItems = exp.industry.map((job, i) => {
        const icon = job.hasLocationIcon ? 'media/location-icon.svg' : 'media/no-location.svg';
        const divider = i < exp.industry.length - 1 ? '<hr class="subproject-divider">' : '';
        return `
            <li>
                <a href="${job.url}" target="_blank">
                    <img src="${icon}" alt="Location Link" class="project-link-icon">
                </a><b>${job.company}, ${job.location}</b>
                <span class="time-period">[${job.period}]</span><br>
                ${job.role}
            </li>
            ${divider}
        `;
    }).join('');

    const researchItems = exp.research.map((r, i) => {
        const icon = r.hasLocationIcon ? 'media/location-icon.svg' : 'media/no-location.svg';
        const divider = i < exp.research.length - 1 ? '<hr class="subproject-divider">' : '';
        return `
            <li>
                <a href="${r.url}" target="_blank">
                    <img src="${icon}" alt="Location Link" class="project-link-icon">
                </a><b>${r.institution}, ${r.location}</b>
                <span class="time-period">[${r.period}]</span><br>
                ${r.role}
            </li>
            ${divider}
        `;
    }).join('');

    const educationItems = exp.education.map((e, i) => {
        const icon = e.hasLocationIcon ? 'media/location-icon.svg' : 'media/no-location.svg';
        const divider = i < exp.education.length - 1 ? '<hr class="subproject-divider">' : '';
        return `
            <li>
                <a href="${e.url}" target="_blank">
                    <img src="${icon}" alt="Location Link" class="project-link-icon">
                </a><b>${e.institution}, ${e.location}</b>
                <span class="time-period">[${e.period}]</span><br>
                ${e.degree}
            </li>
            ${divider}
        `;
    }).join('');

    container.innerHTML = `
        <div class="timeline-item">
            <div class="timeline-icon"><img src="media/work-icon.svg" alt="Work Experience Icon"></div>
            <div class="timeline-content">
                <div class="skills">
                    <div class="project-title">Industry Experience</div>
                    <div class="project-description"><ul>${industryItems}</ul></div>
                </div>
            </div>
        </div>
        <div class="timeline-item">
            <div class="timeline-icon"><img src="media/research-icon.svg" alt="Research Experience Icon"></div>
            <div class="timeline-content">
                <div class="skills">
                    <div class="project-title">Research Experience</div>
                    <div class="project-description"><ul>${researchItems}</ul></div>
                </div>
            </div>
        </div>
        <div class="timeline-item">
            <div class="timeline-icon"><img src="media/education-icon.svg" alt="Education Icon"></div>
            <div class="timeline-content">
                <div class="skills">
                    <div class="project-title">Education</div>
                    <div class="project-description"><ul>${educationItems}</ul></div>
                </div>
            </div>
        </div>
        <p><span class="cv-drive-icon">
            <a href="${exp.cvLinks.driveUrl}" target="_blank">
                <img src="media/drive-icon.svg" alt="CV Link" class="project-link-icon">
            </a> You can download my CV <span class="here-link"><a href="${exp.cvLinks.downloadUrl}" target="_blank">here</a>.</span>
        </span></p>
    `;
}

function renderAwards(data) {
    const container = document.getElementById('awardsTimeline');
    if (!container || !data.awards) return;

    const html = data.awards.map(award => {
        const certsHTML = award.certificates.map(cert => {
            const certPeriod = cert.period
                ? ` <span class="time-period">[${cert.period}]</span>` : '';
            const certName = cert.name
                ? `: ${cert.name} <br>` : '';
            return `
                <li>
                    <a href="${cert.url}" target="_blank">
                        <img src="media/certificate-icon.svg" alt="Certificate Link" class="project-link-icon">
                    </a>
                    <span class="mini-heading">${cert.code}</span>${certName}
                    ${cert.description}${certPeriod}
                </li>
            `;
        }).join('');

        const descHTML = award.description
            ? `${award.marksUrl ? `<a href="${award.marksUrl}" target="_blank"><img src="media/numbers-icon.svg" alt="Marks Link" class="project-link-icon"></a> ` : ''}${award.description} ${award.period ? `<span class="time-period">[${award.period}]</span>` : ''}`
            : (award.period ? `<span class="time-period">[${award.period}]</span>` : '');

        return `
            <div class="timeline-item">
                <div class="timeline-icon"><img src="${award.icon}" alt="Award Icon"></div>
                <div class="timeline-content">
                    <div class="skills">
                        <div class="project-title">
                            ${award.title}
                            <a href="${award.infoUrl}" target="_blank">
                                <img src="media/info-icon.svg" alt="Information Link" class="project-link-icon">
                            </a>
                        </div>
                        <div class="project-description">
                            ${descHTML}
                            <ul>${certsHTML}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function renderFooter(data) {
    const container = document.getElementById('footerSocial');
    if (!container || !data.hero) return;

    container.innerHTML = data.hero.social.map(s =>
        `<a href="${s.url}" target="_blank" class="social-icon">
            <img src="${s.icon}" alt="${s.name}">
        </a>`
    ).join('');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function copyToClipboard(text) {
    if (!navigator.clipboard) {
        return fallbackCopyTextToClipboard(text);
    }
    return navigator.clipboard.writeText(text).then(
        function () { showNotification(); },
        function (err) { console.error('Could not copy text: ', err); }
    );
}

function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) showNotification();
    } catch (err) {
        console.error('Fallback: Unable to copy', err);
    }
    document.body.removeChild(textArea);
}

function showNotification() {
    const notification = document.getElementById(CONFIG.elements.copyNotification);
    notification.className = CONFIG.classes.show;
    setTimeout(function () {
        notification.className = notification.className.replace(CONFIG.classes.show, '');
    }, CONFIG.notificationDuration);
}

function createFlipCardBackContent(title, description) {
    return `
        <div class="project-title">${title}</div>
        <div class="project-description">${description}</div>
    `;
}

// ============================================================================
// DARK MODE
// ============================================================================

function initializeDarkMode() {
    const modeToggle = document.getElementById(CONFIG.elements.modeToggle);
    const modeIcon = document.getElementById(CONFIG.elements.modeIcon);
    modeToggle.addEventListener('click', function () {
        setTimeout(function () {
            document.body.classList.toggle(CONFIG.classes.darkMode);
            modeIcon.src = document.body.classList.contains(CONFIG.classes.darkMode)
                ? CONFIG.icons.lightMode : CONFIG.icons.darkMode;
        }, CONFIG.darkModeDelay);
    });
}

// ============================================================================
// FLIP CARD INTERACTIONS
// ============================================================================

function isMobile() {
    return window.innerWidth <= 840;
}

function initializeFlipCards() {
    const skillsContainer = document.getElementById(CONFIG.elements.skillsContainer);
    const introContainer = document.getElementById(CONFIG.elements.introContainer);
    const introfrontContainer = document.getElementById(CONFIG.elements.introfrontContainer);
    const skillscolumncontainer = document.getElementById(CONFIG.elements.skillscolumncontainer);
    const backContentElement = document.getElementById(CONFIG.elements.backContent);
    const introbackContentElement = document.getElementById(CONFIG.elements.introbackContent);

    document.querySelectorAll('#about .' + CONFIG.classes.tagBoxMain).forEach(tagBox => {
        tagBox.addEventListener('click', () => {
            const backContent = tagBox.getAttribute(CONFIG.dataAttributes.backContent);
            const backValue = tagBox.getAttribute(CONFIG.dataAttributes.backValue);
            backContentElement.innerHTML = createFlipCardBackContent(backContent, backValue);
            skillsContainer.classList.toggle(CONFIG.classes.flip);
            backContentElement.style.display = skillsContainer.classList.contains(CONFIG.classes.flip) ? 'block' : 'none';
            if (isMobile() && introContainer.classList.contains(CONFIG.classes.flip)) {
                skillscolumncontainer.style.marginTop = CONFIG.layout.skillsColumnMargins.bothFlipped;
            }
        });
    });

    document.querySelectorAll('#about .' + CONFIG.classes.tagBoxMain1).forEach(tagBox => {
        tagBox.addEventListener('click', () => {
            const backContent = tagBox.getAttribute(CONFIG.dataAttributes.backContent);
            const backValue = tagBox.getAttribute(CONFIG.dataAttributes.backValue);
            introbackContentElement.innerHTML = createFlipCardBackContent(backContent, backValue);
            introContainer.classList.toggle(CONFIG.classes.flip);
            introfrontContainer.style.display = 'none';
            introbackContentElement.style.display = introContainer.classList.contains(CONFIG.classes.flip) ? 'block' : 'none';
            if (isMobile()) {
                skillscolumncontainer.style.marginTop = skillsContainer.classList.contains(CONFIG.classes.flip)
                    ? CONFIG.layout.skillsColumnMargins.skillsFlipped
                    : CONFIG.layout.skillsColumnMargins.introFlipped;
            }
        });
    });

    document.querySelector('.' + CONFIG.classes.skillBack).addEventListener('click', () => {
        skillsContainer.classList.remove(CONFIG.classes.flip);
        backContentElement.style.display = 'none';
        if (isMobile() && introContainer.classList.contains(CONFIG.classes.flip)) {
            skillscolumncontainer.style.marginTop = CONFIG.layout.skillsColumnMargins.introFlipped;
        }
    });

    document.querySelector('.' + CONFIG.classes.introBack).addEventListener('click', () => {
        introContainer.classList.remove(CONFIG.classes.flip);
        introbackContentElement.style.display = 'none';
        introfrontContainer.style.display = 'block';
        if (isMobile()) {
            skillscolumncontainer.style.marginTop = CONFIG.layout.skillsColumnMargins.default;
        }
    });
}

// ============================================================================
// SHARE & NAVIGATION
// ============================================================================

function initializeShareButtons() {
    document.getElementById(CONFIG.elements.shareButton).addEventListener('click', function () {
        copyToClipboard(CONFIG.shareUrl);
    });
    document.getElementById(CONFIG.elements.shareButtonMob).addEventListener('click', function () {
        copyToClipboard(CONFIG.shareUrl);
    });
}

function setActiveNavItem(currentSectionId, navItems, navIcons) {
    navItems.forEach((item, index) => {
        const sectionId = item.getAttribute("href").slice(1);
        if (sectionId === currentSectionId) {
            item.classList.add(CONFIG.classes.active);
            navIcons[index].classList.add(CONFIG.classes.activeIcon);
        } else {
            item.classList.remove(CONFIG.classes.active);
            navIcons[index].classList.remove(CONFIG.classes.activeIcon);
        }
    });
}

function checkNavItems(sections, navItems, navIcons) {
    let currentSection = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            currentSection = section.getAttribute("id");
        }
    });
    setActiveNavItem(currentSection, navItems, navIcons);
}

function initializeNavigation() {
    const navItems = document.querySelectorAll("." + CONFIG.classes.navItem);
    const navIcons = document.querySelectorAll("." + CONFIG.classes.navIcon);
    const sections = document.querySelectorAll("section");
    window.addEventListener("scroll", () => checkNavItems(sections, navItems, navIcons));
    navIcons.forEach((icon, index) => {
        icon.addEventListener("click", function (event) {
            event.preventDefault();
            const sectionId = navItems[index].getAttribute("href").slice(1);
            const section = document.getElementById(sectionId);
            window.scrollTo({ top: section.offsetTop, behavior: "smooth" });
        });
    });
    checkNavItems(sections, navItems, navIcons);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function () {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderHero(data);
            renderAbout(data);
            renderSkills(data);
            renderProjects(data);
            renderExperience(data);
            renderAwards(data);
            renderFooter(data);

            initializeDarkMode();
            initializeFlipCards();
            initializeShareButtons();
            initializeNavigation();
        })
        .catch(err => console.error('Failed to load data.json:', err));
});
