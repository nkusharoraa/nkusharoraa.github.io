(function () {
    const THEME_STORAGE_KEY = 'portfolio-theme';
    let notificationTimer = null;

    function escapeHtml(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getSavedTheme() {
        try {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved === 'dark' || saved === 'light') return saved;
        } catch (err) {
            // Storage unavailable
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (err) {
            // Storage unavailable
        }
    }

    function applyTheme(isDark, iconBasePath) {
        const modeToggle = document.getElementById('mode-toggle');
        const modeIcon = document.getElementById('mode-icon');

        document.body.classList.toggle('dark-mode', isDark);

        if (modeIcon) {
            modeIcon.src = isDark
                ? iconBasePath + 'toggle-light-icon.svg'
                : iconBasePath + 'toggle-dark-icon.svg';
        }
        if (modeToggle) {
            modeToggle.setAttribute('aria-pressed', String(isDark));
            modeToggle.setAttribute(
                'aria-label',
                isDark ? 'Switch to light mode' : 'Switch to dark mode'
            );
        }
    }

    function initThemeToggle(iconBasePath) {
        applyTheme(getSavedTheme() === 'dark', iconBasePath);

        const modeToggle = document.getElementById('mode-toggle');
        if (!modeToggle) return;

        modeToggle.addEventListener('click', function () {
            const nextIsDark = !document.body.classList.contains('dark-mode');
            applyTheme(nextIsDark, iconBasePath);
            saveTheme(nextIsDark ? 'dark' : 'light');
        });
    }

    function showNotification() {
        const notification = document.getElementById('copyNotification');
        if (!notification) return;

        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }
        notification.classList.remove('show');
        void notification.offsetWidth;
        notification.classList.add('show');

        notificationTimer = setTimeout(function () {
            notification.classList.remove('show');
            notificationTimer = null;
        }, 3000);
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            if (document.execCommand('copy')) {
                showNotification();
            }
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
    }

    function copyToClipboard(text) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(
            function () { showNotification(); },
            function () { fallbackCopyTextToClipboard(text); }
        );
    }

    function initShareButton(shareUrl) {
        const shareButton = document.getElementById('shareButton');
        if (!shareButton) return;

        shareButton.addEventListener('click', function (event) {
            event.preventDefault();
            copyToClipboard(shareUrl);
        });
    }

    function getNavOffset() {
        const navbar = document.querySelector('.navbar');
        return (navbar ? navbar.offsetHeight : 0) + 12;
    }

    function scrollToSection(section, behavior) {
        if (!section) return;
        const targetTop = section.getBoundingClientRect().top + window.scrollY - getNavOffset();
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: behavior || 'smooth'
        });
    }

    function scrollToInitialHash() {
        if (!window.location.hash) return;
        const targetId = decodeURIComponent(window.location.hash.slice(1));
        const target = document.getElementById(targetId);
        if (target) {
            requestAnimationFrame(function () {
                scrollToSection(target, 'auto');
            });
        }
    }

    function initNavigation() {
        const navItems = Array.from(document.querySelectorAll('.nav-item'));
        const navIcons = Array.from(document.querySelectorAll('.nav-icon'));
        const sections = Array.from(document.querySelectorAll('main section[id]'));
        if (!navItems.length || !sections.length) return;

        function setActive(sectionId) {
            navItems.forEach(function (item, index) {
                const isMatch = item.getAttribute('href') === '#' + sectionId;
                item.classList.toggle('active', isMatch);
                if (navIcons[index]) {
                    navIcons[index].classList.toggle('active-icon', isMatch);
                }
            });
        }

        function updateActiveSection() {
            const offset = getNavOffset() + 80;
            const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            let currentId = '';

            if (atBottom && sections.length) {
                currentId = sections[sections.length - 1].id;
            } else {
                sections.forEach(function (section) {
                    if (window.scrollY + offset >= section.offsetTop) {
                        currentId = section.id;
                    }
                });
            }
            setActive(currentId);
        }

        navItems.forEach(function (item) {
            item.addEventListener('click', function (event) {
                const href = item.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                const target = document.getElementById(href.slice(1));
                if (!target) return;
                event.preventDefault();
                scrollToSection(target, 'smooth');
                if (history.pushState) {
                    history.pushState(null, '', href);
                }
            });
        });

        window.addEventListener('scroll', updateActiveSection, { passive: true });
        updateActiveSection();
    }

    function renderSocialLinks(social, assetPrefix) {
        const prefix = assetPrefix || '';
        return social.map(function (item) {
            const isExternal = /^https?:\/\//i.test(item.url);
            const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
            return `<a href="${escapeHtml(item.url)}"${attrs} class="social-icon" aria-label="${escapeHtml(item.name)}">` +
                `<img src="${escapeHtml(prefix + item.icon)}" alt="" width="24" height="24">` +
                `</a>`;
        }).join('');
    }

    function renderProjectCard(proj, assetPrefix) {
        const prefix = assetPrefix || '';
        const bulletItems = proj.bullets.map(function (b) {
            if (typeof b === 'string') {
                return `<li><img src="${prefix}media/bullet.svg" alt="" aria-hidden="true" class="project-link-icon2">${escapeHtml(b)}</li>`;
            }
            const labelHtml = b.label ? `<strong>${escapeHtml(b.label)}:</strong> ` : '';
            return `<li><img src="${prefix}media/bullet.svg" alt="" aria-hidden="true" class="project-link-icon2">${labelHtml}${escapeHtml(b.text)}</li>`;
        }).join('');

        const tagsHtml = proj.tags.map(function (tag) {
            return `<span class="tag-box-main"><span class="tag-box">${escapeHtml(tag)}</span></span>`;
        }).join('');

        const links = [];
        if (proj.githubUrl) {
            links.push(
                `<a href="${escapeHtml(proj.githubUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHtml(proj.title)} on GitHub">` +
                `<img src="${prefix}media/github-icon.svg" alt="" class="project-link-icon">` +
                `</a>`
            );
        }
        if (proj.liveUrl) {
            links.push(
                `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Open live demo for ${escapeHtml(proj.title)}">` +
                `<img src="${prefix}media/external-link-icon.svg" alt="" class="project-link-icon">` +
                `</a>`
            );
        }
        const linksHtml = links.length ? `<span class="project-title-links">${links.join('')}</span>` : '';
        const periodHtml = proj.period ? `<div class="project-period">${escapeHtml(proj.period)}</div>` : '';

        return `
            <article class="project-box">
                <div class="project">
                    <div class="project-title">
                        <span>${escapeHtml(proj.title)}</span>
                        ${linksHtml}
                    </div>
                    ${periodHtml}
                    <div class="project-description"><ul>${bulletItems}</ul></div>
                    <div class="tag-list">${tagsHtml}</div>
                </div>
            </article>
        `;
    }

    function fetchPortfolioData(url, errorTargetId) {
        return fetch(url)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status + ' loading ' + url);
                }
                return response.json();
            })
            .catch(function (err) {
                console.error('Failed to load portfolio data:', err);
                const container = document.getElementById(errorTargetId);
                if (container) {
                    container.innerHTML =
                        '<div class="load-error" role="alert">Unable to load portfolio content right now. Please refresh the page or try again shortly.</div>';
                }
                throw err;
            });
    }

    window.Portfolio = {
        escapeHtml: escapeHtml,
        initThemeToggle: initThemeToggle,
        initShareButton: initShareButton,
        initNavigation: initNavigation,
        scrollToInitialHash: scrollToInitialHash,
        renderSocialLinks: renderSocialLinks,
        renderProjectCard: renderProjectCard,
        fetchPortfolioData: fetchPortfolioData
    };
})();
