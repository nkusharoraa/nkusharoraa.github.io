// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Central configuration object for the portfolio website
 * All hardcoded values are stored here for easy modification
 */
const CONFIG = {
    // URLs
    shareUrl: 'https://nkusharoraa.github.io/',

    // Animation timings (in milliseconds)
    darkModeDelay: 800,
    notificationDuration: 3000,

    // Element IDs
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

    // CSS classes
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

    // Icon paths
    icons: {
        darkMode: 'media/toggle-dark-icon.svg',
        lightMode: 'media/toggle-light-icon.svg'
    },

    // Layout adjustments
    layout: {
        skillsColumnMargins: {
            default: '-374px',
            introFlipped: '-324px',
            skillsFlipped: '-286px',
            bothFlipped: '-276px'
        }
    },

    // Data attributes
    dataAttributes: {
        backContent: 'data-back-content',
        backValue: 'data-back-value'
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Copies text to clipboard with fallback for older browsers
 * @param {string} text - The text to copy to clipboard
 * @returns {Promise<void>}
 */
function copyToClipboard(text) {
    if (!navigator.clipboard) {
        return fallbackCopyTextToClipboard(text);
    }

    return navigator.clipboard.writeText(text).then(
        function () {
            console.log('Async: Copying to clipboard was successful!');
            showNotification();
        },
        function (err) {
            console.error('Async: Could not copy text: ', err);
        }
    );
}

/**
 * Fallback method for copying text to clipboard (for older browsers)
 * @param {string} text - The text to copy
 */
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'successful' : 'unsuccessful';
        console.log('Fallback: Copying text command was ' + msg);
        if (successful) {
            showNotification();
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

/**
 * Shows the copy notification for a specified duration
 */
function showNotification() {
    const notification = document.getElementById(CONFIG.elements.copyNotification);
    notification.className = CONFIG.classes.show;
    setTimeout(function () {
        notification.className = notification.className.replace(CONFIG.classes.show, '');
    }, CONFIG.notificationDuration);
}

/**
 * Updates the skills column margin based on flip states
 * @param {boolean} isIntroFlipped - Whether intro container is flipped
 * @param {boolean} isSkillsFlipped - Whether skills container is flipped
 */
function updateSkillsColumnMargin(isIntroFlipped, isSkillsFlipped) {
    const skillsColumn = document.getElementById(CONFIG.elements.skillscolumncontainer);
    const margins = CONFIG.layout.skillsColumnMargins;

    if (isIntroFlipped && isSkillsFlipped) {
        skillsColumn.style.marginTop = margins.bothFlipped;
    } else if (isIntroFlipped) {
        skillsColumn.style.marginTop = margins.introFlipped;
    } else if (isSkillsFlipped) {
        skillsColumn.style.marginTop = margins.skillsFlipped;
    } else {
        skillsColumn.style.marginTop = margins.default;
    }
}

/**
 * Creates HTML content for flip card back
 * @param {string} title - The title content
 * @param {string} description - The description content
 * @returns {string} HTML string
 */
function createFlipCardBackContent(title, description) {
    return `
        <div class="project-title">${title}</div>
        <div class="project-description">${description}</div>
    `;
}

// ============================================================================
// DARK MODE FUNCTIONALITY
// ============================================================================

/**
 * Initializes dark mode toggle functionality
 */
function initializeDarkMode() {
    const modeToggle = document.getElementById(CONFIG.elements.modeToggle);
    const modeIcon = document.getElementById(CONFIG.elements.modeIcon);

    modeToggle.addEventListener('click', function () {
        // Add a delay before toggling dark mode for smooth transition
        setTimeout(function () {
            document.body.classList.toggle(CONFIG.classes.darkMode);

            // Update icon based on current mode
            if (document.body.classList.contains(CONFIG.classes.darkMode)) {
                modeIcon.src = CONFIG.icons.lightMode;
            } else {
                modeIcon.src = CONFIG.icons.darkMode;
            }
        }, CONFIG.darkModeDelay);
    });
}

// ============================================================================
// FLIP CARD INTERACTIONS
// ============================================================================

/**
 * Initializes flip card functionality for skills and intro sections
 */
function initializeFlipCards() {
    const skillsContainer = document.getElementById(CONFIG.elements.skillsContainer);
    const introContainer = document.getElementById(CONFIG.elements.introContainer);
    const introfrontContainer = document.getElementById(CONFIG.elements.introfrontContainer);
    const skillscolumncontainer = document.getElementById(CONFIG.elements.skillscolumncontainer);
    const backContentElement = document.getElementById(CONFIG.elements.backContent);
    const introbackContentElement = document.getElementById(CONFIG.elements.introbackContent);

    // Initialize skills tag box interactions
    document.querySelectorAll('.' + CONFIG.classes.tagBoxMain).forEach(tagBox => {
        tagBox.addEventListener('click', () => {
            const backContent = tagBox.getAttribute(CONFIG.dataAttributes.backContent);
            const backValue = tagBox.getAttribute(CONFIG.dataAttributes.backValue);

            // Update back content
            backContentElement.innerHTML = createFlipCardBackContent(backContent, backValue);

            // Toggle flip class
            skillsContainer.classList.toggle(CONFIG.classes.flip);
            backContentElement.style.display = skillsContainer.classList.contains(CONFIG.classes.flip) ? 'block' : 'none';

            // Update margin if intro is also flipped
            if (introContainer.classList.contains(CONFIG.classes.flip)) {
                skillscolumncontainer.style.marginTop = CONFIG.layout.skillsColumnMargins.bothFlipped;
            }
        });
    });

    // Initialize intro tag box interactions
    document.querySelectorAll('.' + CONFIG.classes.tagBoxMain1).forEach(tagBox => {
        tagBox.addEventListener('click', () => {
            const backContent = tagBox.getAttribute(CONFIG.dataAttributes.backContent);
            const backValue = tagBox.getAttribute(CONFIG.dataAttributes.backValue);

            // Update back content
            introbackContentElement.innerHTML = createFlipCardBackContent(backContent, backValue);

            // Toggle flip class
            introContainer.classList.toggle(CONFIG.classes.flip);
            introfrontContainer.style.display = 'none';
            introbackContentElement.style.display = introContainer.classList.contains(CONFIG.classes.flip) ? 'block' : 'none';

            // Update margin based on skills flip state
            skillscolumncontainer.style.marginTop = skillsContainer.classList.contains(CONFIG.classes.flip)
                ? CONFIG.layout.skillsColumnMargins.skillsFlipped
                : CONFIG.layout.skillsColumnMargins.introFlipped;
        });
    });

    // Click to flip back - Skills
    document.querySelector('.' + CONFIG.classes.skillBack).addEventListener('click', () => {
        skillsContainer.classList.remove(CONFIG.classes.flip);
        backContentElement.style.display = 'none';

        if (introContainer.classList.contains(CONFIG.classes.flip)) {
            skillscolumncontainer.style.marginTop = CONFIG.layout.skillsColumnMargins.introFlipped;
        }
    });

    // Click to flip back - Intro
    document.querySelector('.' + CONFIG.classes.introBack).addEventListener('click', () => {
        introContainer.classList.remove(CONFIG.classes.flip);
        introbackContentElement.style.display = 'none';
        introfrontContainer.style.display = 'block';
        skillscolumncontainer.style.marginTop = CONFIG.layout.skillsColumnMargins.default;
    });
}

// ============================================================================
// SHARE FUNCTIONALITY
// ============================================================================

/**
 * Initializes share button functionality
 */
function initializeShareButtons() {
    // Desktop share button
    document.getElementById(CONFIG.elements.shareButton).addEventListener('click', function () {
        copyToClipboard(CONFIG.shareUrl);
    });

    // Mobile share button
    document.getElementById(CONFIG.elements.shareButtonMob).addEventListener('click', function () {
        copyToClipboard(CONFIG.shareUrl);
    });
}

// ============================================================================
// NAVIGATION FUNCTIONALITY
// ============================================================================

/**
 * Sets the active navigation item based on current section
 * @param {string} currentSectionId - The ID of the current section
 * @param {NodeList} navItems - List of navigation item elements
 * @param {NodeList} navIcons - List of navigation icon elements
 */
function setActiveNavItem(currentSectionId, navItems, navIcons) {
    navItems.forEach((item, index) => {
        const sectionId = item.getAttribute("href").slice(1); // Remove '#'
        if (sectionId === currentSectionId) {
            item.classList.add(CONFIG.classes.active);
            navIcons[index].classList.add(CONFIG.classes.activeIcon);
        } else {
            item.classList.remove(CONFIG.classes.active);
            navIcons[index].classList.remove(CONFIG.classes.activeIcon);
        }
    });
}

/**
 * Checks which section is currently in view and updates navigation
 * @param {NodeList} sections - List of section elements
 * @param {NodeList} navItems - List of navigation item elements
 * @param {NodeList} navIcons - List of navigation icon elements
 */
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

/**
 * Initializes navigation highlighting and smooth scrolling
 */
function initializeNavigation() {
    const navItems = document.querySelectorAll("." + CONFIG.classes.navItem);
    const navIcons = document.querySelectorAll("." + CONFIG.classes.navIcon);
    const sections = document.querySelectorAll("section");

    // Scroll event listener
    window.addEventListener("scroll", () => checkNavItems(sections, navItems, navIcons));

    // Click event for nav icons - smooth scroll
    navIcons.forEach((icon, index) => {
        icon.addEventListener("click", function (event) {
            event.preventDefault();

            const sectionId = navItems[index].getAttribute("href").slice(1);
            const section = document.getElementById(sectionId);
            const offsetTop = section.offsetTop;

            window.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            });
        });
    });

    // Initial check on page load
    checkNavItems(sections, navItems, navIcons);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main initialization function
 * Called when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeDarkMode();
    initializeFlipCards();
    initializeShareButtons();
    initializeNavigation();

    console.log('Portfolio website initialized successfully');
});
