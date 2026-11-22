(function () {
    const SHARE_URL = 'https://nkusharoraa.github.io/';
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

    function renderHero(data) {
        const container = document.getElementById('heroContainer');
        if (!container || !data.hero) return;

        const socialHTML = renderSocialLinks(data.hero.social, '');
        container.innerHTML = `
            <img src="${escapeHtml(data.hero.profilePic)}" alt="Portrait of ${escapeHtml(data.hero.name)} Arora" class="profile-pic" width="220" height="220">
            <div class="header-left">
                <h1>Hi! I'm <span class="highlight-text">${escapeHtml(data.hero.name)}</span></h1>
                <p class="hero-tagline">${escapeHtml(data.hero.tagline)}</p>
                <div class="social-icons-beside">${socialHTML}</div>
            </div>
        `;
    }

    function renderAbout(data) {
        const container = document.getElementById('aboutIntroContent');
        if (!container || !data.about) return;

        const tagsHTML = data.about.interestTags.map(function (tag, index) {
            return `<button type="button" class="tag-box-main1" data-tag-index="${index}">` +
                `<span class="tag-box">${escapeHtml(tag.label)}</span>` +
                `</button>`;
        }).join('');

        container.innerHTML = `
            <p class="about-intro-text">${escapeHtml(data.about.intro)}</p>
            <p class="about-hint">Click any tag below to see what's behind each interest.</p>
            <div class="tag-list">${tagsHTML}</div>
        `;
    }

    function renderSkills(data) {
        const container = document.getElementById('skillsFrontContent');
        if (!container || !data.skills) return;

        const categoriesHTML = data.skills.categories.map(function (cat, i) {
            const divider = i < data.skills.categories.length - 1
                ? '<hr class="subproject-divider">' : '';
            return `
                <div class="project skills-category">
                    <div class="project-title">${escapeHtml(cat.title)}</div>
                    <div class="project-description">${escapeHtml(cat.items)}</div>
                </div>
                ${divider}
            `;
        }).join('');

        const tagsHTML = data.skills.skillTags.map(function (tag, index) {
            return `<button type="button" class="tag-box-main" data-tag-index="${index}">` +
                `<span class="tag-box">${escapeHtml(tag.label)}</span>` +
                `</button>`;
        }).join('');

        container.innerHTML = categoriesHTML + '<hr class="subproject-divider"><div class="tag-list">' + tagsHTML + '</div>';
    }

    function renderProjects(data) {
        const container = document.getElementById('projectsContent');
        if (!container || !data.projects) return;

        const categoryCounts = {};
        if (Array.isArray(data.projectCategories)) {
            data.projectCategories.forEach(function (cat) {
                categoryCounts[cat.id] = Array.isArray(cat.projects) ? cat.projects.length : 0;
            });
        }

        container.innerHTML = data.projects.map(function (group) {
            const cardsHTML = group.featured.map(function (proj) {
                return renderProjectCard(proj, '');
            }).join('');

            const catId = group.categoryId || (group.seeMoreUrl ? group.seeMoreUrl.split('#')[1] : '');
            const totalInCategory = categoryCounts[catId];
            const computedMore = typeof totalInCategory === 'number'
                ? Math.max(0, totalInCategory - group.featured.length)
                : group.moreCount;

            const seeMoreText = computedMore > 0 ? `+${computedMore} more` : 'See all';
            return `
                <div class="project-group">
                    <h3 class="project-category-title">${escapeHtml(group.category)}</h3>
                    ${cardsHTML}
                    <div class="see-more-link">
                        <a href="${escapeHtml(group.seeMoreUrl)}">${escapeHtml(seeMoreText)} &rarr;</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderExperience(data) {
        const container = document.getElementById('cvTimeline');
        if (!container || !data.experience) return;

        const exp = data.experience;

        function buildEntries(items, titleField, detailField) {
            return items.map(function (item, i) {
                const icon = item.hasLocationIcon ? 'media/location-icon.svg' : 'media/no-location.svg';
                const divider = i < items.length - 1 ? '<hr class="subproject-divider">' : '';
                const name = item[titleField];
                return `
                    <li>
                        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escapeHtml(name)} website">
                            <img src="${icon}" alt="" class="project-link-icon">
                        </a><strong>${escapeHtml(name)}, ${escapeHtml(item.location)}</strong>
                        <span class="time-period">[${escapeHtml(item.period)}]</span><br>
                        ${escapeHtml(item[detailField])}
                    </li>
                    ${divider}
                `;
            }).join('');
        }

        container.innerHTML = `
            <div class="timeline-item">
                <div class="timeline-icon"><img src="media/work-icon.svg" alt="" aria-hidden="true"></div>
                <div class="timeline-content">
                    <div class="skills">
                        <div class="project-title">Industry Experience</div>
                        <div class="project-description"><ul>${buildEntries(exp.industry, 'company', 'role')}</ul></div>
                    </div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-icon"><img src="media/research-icon.svg" alt="" aria-hidden="true"></div>
                <div class="timeline-content">
                    <div class="skills">
                        <div class="project-title">Research Experience</div>
                        <div class="project-description"><ul>${buildEntries(exp.research, 'institution', 'role')}</ul></div>
                    </div>
                </div>
            </div>
            <div class="timeline-item">
                <div class="timeline-icon"><img src="media/education-icon.svg" alt="" aria-hidden="true"></div>
                <div class="timeline-content">
                    <div class="skills">
                        <div class="project-title">Education</div>
                        <div class="project-description"><ul>${buildEntries(exp.education, 'institution', 'degree')}</ul></div>
                    </div>
                </div>
            </div>
            <p class="cv-download">
                <a href="${escapeHtml(exp.cvLinks.driveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View CV on Google Drive">
                    <img src="media/drive-icon.svg" alt="" class="project-link-icon">
                </a>
                <span>You can download my CV <span class="here-link"><a href="${escapeHtml(exp.cvLinks.downloadUrl)}" target="_blank" rel="noopener noreferrer">here</a></span>.</span>
            </p>
        `;
    }

    function renderAwards(data) {
        const container = document.getElementById('awardsTimeline');
        if (!container || !data.awards) return;

        container.innerHTML = data.awards.map(function (award) {
            const certsHTML = award.certificates.map(function (cert) {
                const certPeriod = cert.period
                    ? ` <span class="time-period">[${escapeHtml(cert.period)}]</span>` : '';
                const certName = cert.name
                    ? `: ${escapeHtml(cert.name)}<br>` : ' — ';
                const certLink = cert.url
                    ? `<a href="${escapeHtml(cert.url)}" target="_blank" rel="noopener noreferrer" aria-label="View certificate for ${escapeHtml(cert.code)}"><img src="media/certificate-icon.svg" alt="" class="project-link-icon"></a>`
                    : '';
                return `
                    <li>
                        ${certLink}
                        <span class="mini-heading">${escapeHtml(cert.code)}</span>${certName}
                        ${escapeHtml(cert.description)}${certPeriod}
                    </li>
                `;
            }).join('');

            const marksLink = award.marksUrl
                ? `<a href="${escapeHtml(award.marksUrl)}" target="_blank" rel="noopener noreferrer" aria-label="View credential record for ${escapeHtml(award.title)}"><img src="media/numbers-icon.svg" alt="" class="project-link-icon"></a> `
                : '';

            const periodBadge = award.period
                ? `<span class="time-period">[${escapeHtml(award.period)}]</span>` : '';

            const descHTML = award.description
                ? `<p>${marksLink}${escapeHtml(award.description)} ${periodBadge}</p>`
                : (periodBadge ? `<p>${periodBadge}</p>` : '');

            return `
                <div class="timeline-item">
                    <div class="timeline-icon"><img src="${escapeHtml(award.icon)}" alt="" aria-hidden="true"></div>
                    <div class="timeline-content">
                        <div class="skills">
                            <div class="project-title">
                                <span>${escapeHtml(award.title)}</span>
                                <a href="${escapeHtml(award.infoUrl)}" target="_blank" rel="noopener noreferrer" aria-label="More information about ${escapeHtml(award.title)}">
                                    <img src="media/info-icon.svg" alt="" class="project-link-icon">
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
    }

    function renderFooter(data) {
        const container = document.getElementById('footerSocial');
        if (!container || !data.hero) return;
        container.innerHTML = renderSocialLinks(data.hero.social, '');
    }

    function buildFlipBackHtml(tag) {
        return `
            <div class="project-title">
                <span>${escapeHtml(tag.backTitle)}</span>
                <button type="button" class="flip-back-btn" aria-label="Flip card back to front">&larr; Back</button>
            </div>
            <div class="project-description flip-back-body">
                <div class="flip-back-media">
                    <img src="${escapeHtml(tag.backImage)}" alt="${escapeHtml(tag.backImageAlt)}" class="inside-image" loading="lazy">
                    <div class="caption-back">${escapeHtml(tag.backCaption)}</div>
                </div>
                <p class="flip-back-text">${escapeHtml(tag.backDescription)}</p>
            </div>
        `;
    }

    function bindFlipCard(containerId, backSelector, backContentId, buttonSelector, tags) {
        const container = document.getElementById(containerId);
        const backFace = container ? container.querySelector(backSelector) : null;
        const frontFace = container ? container.querySelector('.front') : null;
        const backContent = document.getElementById(backContentId);
        if (!container || !backFace || !frontFace || !backContent) return;

        let lastTrigger = null;

        function setFlipped(flipped) {
            container.classList.toggle('flip', flipped);
            frontFace.setAttribute('aria-hidden', String(flipped));
            backFace.setAttribute('aria-hidden', String(!flipped));
            if (flipped) {
                const backBtn = backContent.querySelector('.flip-back-btn');
                if (backBtn) backBtn.focus();
            } else if (lastTrigger) {
                lastTrigger.focus();
            }
        }

        container.querySelectorAll(buttonSelector).forEach(function (tagBtn) {
            tagBtn.addEventListener('click', function () {
                const idx = Number(tagBtn.getAttribute('data-tag-index'));
                const tag = tags[idx];
                if (!tag) return;
                lastTrigger = tagBtn;
                backContent.innerHTML = buildFlipBackHtml(tag);
                setFlipped(true);
            });
        });

        backFace.addEventListener('click', function () {
            setFlipped(false);
        });

        container.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && container.classList.contains('flip')) {
                setFlipped(false);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initThemeToggle('media/');
        initShareButton(SHARE_URL);

        fetchPortfolioData('data.json', 'mainContent')
            .then(function (data) {
                renderHero(data);
                renderAbout(data);
                renderSkills(data);
                renderProjects(data);
                renderExperience(data);
                renderAwards(data);
                renderFooter(data);

                bindFlipCard('introContainer', '.intro-back', 'introbackContent', 'button.tag-box-main1', data.about.interestTags);
                bindFlipCard('skillsContainer', '.skill-back', 'backContent', 'button.tag-box-main', data.skills.skillTags);
                initNavigation();
                scrollToInitialHash();
            })
            .catch(function () {});
    });
})();
