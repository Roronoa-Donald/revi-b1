/* ============================================
   RD MERISE — main.js
   Modules : ThemeManager · MobileNav · ReadingProgress
             ScrollReveal · ActiveNavLink · ChapterTracker
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ---- Theme Manager ---- */
    const ThemeManager = (() => {
        const KEY = 'rd_merise_theme';
        const html = document.documentElement;
        const btn  = document.getElementById('theme-toggle');
        const apply = (dark) => {
            html.classList.toggle('dark', dark);
            if (btn) {
                btn.innerHTML = dark
                    ? '<i class="fa-solid fa-sun"></i>'
                    : '<i class="fa-solid fa-moon"></i>';
                btn.setAttribute('aria-label', dark ? 'Mode clair' : 'Mode sombre');
            }
        };
        const saved = (() => { try { return localStorage.getItem(KEY); } catch(e) { return null; } })();
        const prefersDark = saved ? saved === 'dark'
                           : window.matchMedia('(prefers-color-scheme:dark)').matches;
        apply(prefersDark);
        if (btn) btn.addEventListener('click', () => {
            const dark = !html.classList.contains('dark');
            apply(dark);
            try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch(e) {}
        });
    })();

    /* ---- Mobile Nav ---- */
    const MobileNav = (() => {
        const btn     = document.getElementById('hamburger-btn');
        const panel   = document.getElementById('mobile-nav');
        const overlay = document.getElementById('mobile-nav-overlay');
        const close   = document.getElementById('mobile-nav-close');
        if (!btn || !panel) return;
        const toggle = (open) => {
            panel.classList.toggle('active', open);
            if (overlay) overlay.classList.toggle('active', open);
        };
        btn.addEventListener('click', () => toggle(true));
        if (close) close.addEventListener('click', () => toggle(false));
        if (overlay) overlay.addEventListener('click', () => toggle(false));
    })();

    /* ---- Reading Progress ---- */
    const ReadingProgress = (() => {
        const bar = document.getElementById('reading-progress');
        if (!bar) return;
        const update = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0%';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    })();

    /* ---- Scroll Reveal ---- */
    const ScrollReveal = (() => {
        const els = document.querySelectorAll('.reveal-on-scroll');
        if (!els.length) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
        }, { threshold: 0.12 });
        els.forEach(el => obs.observe(el));
    })();

    /* ---- Active Nav Link ---- */
    const ActiveNavLink = (() => {
        const links = document.querySelectorAll('.nav-links a, .mobile-nav-panel a');
        const current = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach(a => {
            const href = a.getAttribute('href')?.split('/').pop();
            if (href === current) a.classList.add('active');
        });
    })();

    /* ---- Chapter Tracker ---- */
    const ChapterTracker = (() => {
        const KEY = 'rd_merise_completed';
        const m = window.location.pathname.match(/chapitre(\d+)/);
        if (!m) return;
        const chNum = parseInt(m[1], 10);
        let scrolled85 = false;

        const markDone = () => {
            if (scrolled85) return;
            const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            if (pct >= 0.85) {
                scrolled85 = true;
                const done = JSON.parse((() => { try { return localStorage.getItem(KEY); } catch(e) { return null; } })() || '[]');
                if (!done.includes(chNum)) {
                    done.push(chNum);
                    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch(e) {}
                    if (typeof GameEngine !== 'undefined') GameEngine.completeChapter(chNum);
                }
            }
        };
        window.addEventListener('scroll', markDone, { passive: true });
    })();
});
