(function () {
    const SHARE_URL = 'https://nkusharoraa.github.io/projects/';
    const {
        escapeHtml,
        initThemeToggle,
        initShareButton,
        initNavigation,
        scrollToInitialHash,
        renderSocialLinks,
        renderProjectCard,
        fetchPortfolioData
    } = window.Portfolio;

    function renderNav(categories) {
        const desktopNav = document.getElementById('desktopNav');
        if (!desktopNav) return;

        desktopNav.innerHTML = categories.map(function (cat) {
            const label = cat.navLabel || cat.name;
            return `<li><span class="nav-icon"><a href="#${escapeHtml(cat.id)}" class="nav-item">` +
                `<img src="${escapeHtml(cat.icon)}" alt="" width="24" height="24">` +
                `<span class="navicon-name">${escapeHtml(label)}</span>` +
                `</a></span></li>`;
        }).join('');
    }

    function renderHeader(hero, categories) {
        const container = document.getElementById('headerContainer');
        if (!container) return;

        const socialHtml = renderSocialLinks(hero.social, '../');
        const tocHtml = categories.map(function (cat) {
            return `<li><a href="#${escapeHtml(cat.id)}">${escapeHtml(cat.name)}</a></li>`;
        }).join('');

        container.innerHTML = `
            <div class="header-left">
                <h1>Projects organized by <span class="highlight-text">AI domain</span></h1>
                <ol class="projects-toc">${tocHtml}</ol>
                <p class="projects-contact-hint">Reach me here for more information.</p>
                <div class="social-icons-beside">${socialHtml}</div>
            </div>
        `;
    }

    function renderProjectSections(categories) {
        const container = document.getElementById('projectSections');
        if (!container) return;

        container.innerHTML = categories.map(function (cat) {
            const projectsHtml = cat.projects.map(function (proj) {
                return renderProjectCard(proj, '../');
            }).join('');

            return `
                <section id="${escapeHtml(cat.id)}" class="projects">
                    <h2><span class="section-name">${escapeHtml(cat.name)}</span></h2>
                    <hr class="section-divider">
                    <div class="project-grid">${projectsHtml}</div>
                </section>
            `;
        }).join('');
    }

    function renderFooter(social) {
        const container = document.getElementById('footerSocial');
        if (!container) return;
        container.innerHTML = renderSocialLinks(social, '../');
    }

    document.addEventListener('DOMContentLoaded', function () {
        initThemeToggle('../media/');
        initShareButton(SHARE_URL);

        fetchPortfolioData('../data.json', 'projectSections')
            .then(function (data) {
                renderNav(data.projectCategories);
                renderHeader(data.hero, data.projectCategories);
                renderProjectSections(data.projectCategories);
                renderFooter(data.hero.social);

                initNavigation();
                scrollToInitialHash();
            })
            .catch(function () {});
    });
})();
