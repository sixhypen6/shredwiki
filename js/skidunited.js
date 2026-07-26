let searchData = [];

// ═══════════════════════════════════════════
//   PATH DETECTOR (Supports nested folders)
// ═══════════════════════════════════════════

function getBasePath() {
    const path = window.location.pathname;
    const projectFolder = '/shredwiki/';
    const index = path.indexOf(projectFolder);

    // If hosted under /shredwiki/ on GitHub Pages
    if (index !== -1) {
        return path.substring(0, index + projectFolder.length);
    }

    // Dynamic relative fallback based on depth in structure
    if (path.includes('/pages/shreds/') || path.includes('/pages/tech/')) {
        return '../../';
    } else if (path.includes('/pages/')) {
        return '../';
    }
    return './';
}

// ═══════════════════════════════════════════
//   NAV INJECTION
// ═══════════════════════════════════════════

function buildNav() {
    const placeholder = document.getElementById('wiki-nav');
    if (!placeholder) return;

    const basePath = getBasePath();
    const p = window.location.pathname;

    const link = (href, label) => {
        const fullHref = basePath + href;
        const cls = (p === fullHref || p.endsWith(href)) ? ' class="active"' : '';
        return `<li><a href="${fullHref}"${cls}>${label}</a></li>`;
    };

    placeholder.outerHTML = `
        <nav class="navbar">
            <div class="logo"><h2 class="wiki-ambient-reflection">Plane Crazy Shredder and Tech wiki</h2></div>
            <ul class="nav-links">
                ${link('index.html', 'Home')}
                ${link('pages/shredderhub.html', 'ShredderHub')}
                ${link('pages/techmanifest.html', 'TechManifest')}
                <div class="search-container">
                    <input type="text" id="wiki-search" placeholder="Search for TECH..." autocomplete="off">
                    <div id="wiki-results" class="search-results-box"></div>
                </div>
            </ul>
        </nav>`;
}

// ═══════════════════════════════════════════
//   FOOTER INJECTION
// ═══════════════════════════════════════════

function buildFooter() {
    const el = document.getElementById('wiki-footer');
    if (!el) return;

    el.innerHTML = `<div class="credits-container">
    <!-- Main / Current Owner Section -->
    <div class="credit-category central-feature">
        <strong><span class="wiki-title-shimmer">Repository Owner:</span></strong>
        <div class="credit-member">
            <span class="member-name">gup (1200432068115578992)</span>
        </div>
    </div>

    <!-- Pre-Ownership Change Section -->
    <div class="credits-row" style="margin-top: 3.5rem; gap: 2rem;">
        <div class="credit-category">
            <strong>Original Creator/Owner:</strong>
            <div class="credit-member">
                <span class="member-name">platform2 (759825779974209616)</span>
                <small class="credit-note">Main coder, page writing, design.</small>
            </div>
            <div class="credit-member">
                <span class="member-name">peacekeepe_r (850394478895300629)</span>
                <small class="credit-note">Main writer, main design, minor coding.</small>
            </div>
        </div>

        <div class="credit-category">
            <strong>Writers (Pre Ownership Change):</strong>
            <div class="credit-member">
                <span class="member-name">kameon</span>
                <small class="credit-note">Writing, design assets, "beta testing" and major corrections.</small>
            </div>
            <div class="credit-member">
                <span class="member-name">peacekeepe_r</span>
                <small class="credit-note">Most of the shredder-side, rewriting</small>
            </div>
            <div class="credit-member">
                <span class="member-name">platform2</span>
                <small class="credit-note">Drafting and writing shredder pages.</small>
            </div>
            <div class="credit-member">
                <span class="member-name">goober</span>
                <small class="credit-note">Assistance with shredder writing.</small>
            </div>
        </div>

        <div class="credit-category">
            <strong>Contributors (Pre Ownership Change):</strong>
            <div class="credit-member">
                <span class="member-name">glitchedtm</span>
                <small class="credit-note">Natural Selection.</small>
            </div>
            <div class="credit-member">
                <span class="member-name">killer_meetball.</span>
                <small class="credit-note">Tech info, minor writing.</small>
            </div>
            <div class="credit-member">
                <span class="member-name">legallypvid</span>
                <small class="credit-note">Tech info, minor writing.</small>
            </div>
        </div>
    </div>
</div>

<hr style="margin-top: 3rem;">
<p style="text-align: center;">
    Originally made for the Neo Shredder Group, now for the 
    <a href="https://discord.gg/VFFgyCzu8m" target="_blank" rel="noopener noreferrer">Exploiter Community</a>
</p>`;
}

// ═══════════════════════════════════════════
//   SEARCH
// ═══════════════════════════════════════════

function initWikiSearch() {
    const basePath = getBasePath();

    fetch(basePath + 'search-index.json')
        .then(r => {
            if (!r.ok) throw new Error('Could not load search index: ' + r.status);
            return r.json();
        })
        .then(data => {
            searchData = data;
            console.log('[wiki-search] loaded', searchData.length, 'pages');
        })
        .catch(err => console.error('[wiki-search] fetch failed:', err));

    const searchInput = document.getElementById('wiki-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', runWikiSearch);
    searchInput.addEventListener('focus', runWikiSearch);

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.search-container')) {
            const box = document.getElementById('wiki-results');
            if (box) box.innerHTML = '';
        }
    });
}

function runWikiSearch() {
    const input = document.getElementById('wiki-search');
    const resultsContainer = document.getElementById('wiki-results');
    if (!input || !resultsContainer) return;

    const query = input.value.trim().toLowerCase();

    if (!searchData.length) {
        resultsContainer.innerHTML = '<div style="padding:10px;">Loading…</div>';
        return;
    }

    const results = query === ''
        ? searchData.slice(0, 8)
        : searchData.filter(page => {
            const matchesTitle   = page.title ? page.title.toLowerCase().includes(query) : false;
            const matchesSnippet = String(page.snippet ?? '').toLowerCase().includes(query);
            const matchesTags    = page.tags ? page.tags.some(tag => tag.toLowerCase().includes(query)) : false;
            return matchesTitle || matchesSnippet || matchesTags;
        });

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:10px; font-size:12px; color:#999;">No pages found</div>';
        return;
    }

    const basePath = getBasePath();

    resultsContainer.innerHTML = results.map(page => {
        const cleanUrl = page.url.startsWith('/') ? page.url.substring(1) : page.url;
        const catHtml = page.categories?.length
            ? `<div class="wiki-categories">${page.categories.map(c => `<span class="wiki-cat">${c}</span>`).join('')}</div>`
            : '';
        return `<a href="${basePath}${cleanUrl}" class="search-item">
            <strong>${page.title}</strong>
            <span>${String(page.snippet ?? '')}</span>
            ${catHtml}
        </a>`;
    }).join('');
}

// ═══════════════════════════════════════════
//   INIT & LAZY LOAD
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    buildNav();
    buildFooter();
    initWikiSearch();

    const lazyVideos = document.querySelectorAll('video.lazy-video');
    if (lazyVideos.length) {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        const src = video.getAttribute('data-src');
                        if (src) {
                            video.src = src;
                            video.removeAttribute('data-src');
                        }
                        observer.unobserve(video);
                    }
                });
            }, { rootMargin: '200px' });

            lazyVideos.forEach(v => observer.observe(v));
        } else {
            lazyVideos.forEach(function (video) {
                const src = video.getAttribute('data-src');
                if (src) {
                    video.src = src;
                    video.removeAttribute('data-src');
                }
            });
        }
    }
});

// ═══════════════════════════════════════════
//   EASTER EGG
// ═══════════════════════════════════════════

let typedKeys = '';
const secretWord = 'duckless';
let secretAudio = null;

document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    const path = window.location.pathname;
    const isHomePage = path.endsWith('index.html') || path.endsWith('/') || path.endsWith('shredwiki/');

    if (!isHomePage) return;
    if (e.key.length !== 1) return;

    typedKeys += e.key.toLowerCase();
    if (typedKeys.length > secretWord.length) {
        typedKeys = typedKeys.substring(typedKeys.length - secretWord.length);
    }

    if (typedKeys === secretWord) {
        const basePath = getBasePath();
        if (!secretAudio) {
            secretAudio = new Audio(basePath + 'assests/secretmusic.mp3');
        }
        secretAudio.currentTime = 0;
        secretAudio.play().catch(err => console.error('Error playing secret music:', err));
        typedKeys = '';
    }
});
