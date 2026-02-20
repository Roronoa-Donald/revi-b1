/* ═══════════════════════════════════════════════════
   RD MERISE — Exercise Engine
   ═══════════════════════════════════════════════════ */
(function () {
    'use strict';

    const STORAGE_KEY = 'rd_merise_exercises';

    /* ── State ── */
    let exercises = [];
    let currentFilter = 'all';
    let currentLevel = 'all';
    let revealedAnswers = new Set();

    function loadState() {
        try { revealedAnswers = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch { revealedAnswers = new Set(); }
    }
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...revealedAnswers]));
    }

    /* ── Render ── */
    function initExercises(exList) {
        exercises = exList;
        loadState();
        renderFilters();
        render();
    }

    function renderFilters() {
        const catSel = document.getElementById('ex-filter-cat');
        const lvlSel = document.getElementById('ex-filter-level');
        if (catSel) catSel.addEventListener('change', function () { currentFilter = this.value; render(); });
        if (lvlSel) lvlSel.addEventListener('change', function () { currentLevel = this.value; render(); });
    }

    function getFiltered() {
        return exercises.filter(ex => {
            if (currentFilter !== 'all' && ex.cat !== currentFilter) return false;
            if (currentLevel !== 'all' && ex.level !== currentLevel) return false;
            return true;
        });
    }

    function render() {
        const container = document.getElementById('exercises-container');
        if (!container) return;
        const filtered = getFiltered();
        document.getElementById('ex-count').textContent = `${filtered.length} exercice${filtered.length > 1 ? 's' : ''}`;

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Aucun exercice trouvé pour ces filtres.</p>';
            return;
        }

        container.innerHTML = filtered.map((ex, i) => {
            const globalIdx = exercises.indexOf(ex);
            const revealed = revealedAnswers.has(globalIdx);
            const levelBadge = ex.level === 'exam' ? '<span style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:.7rem;margin-left:.5rem">EXAMEN</span>' : '<span style="background:var(--accent);color:#fff;padding:2px 8px;border-radius:4px;font-size:.7rem;margin-left:.5rem">BASE</span>';
            const catLabels = { si: 'SI & MERISE', mcd: 'MCD', mld: 'MLD', ext: 'Extensions & Norm.', flux: 'Flux', mct: 'MCT' };
            return `
                <div class="ex-card" data-idx="${globalIdx}">
                    <div class="ex-header">
                        <span class="ex-num">Exercice ${i + 1}</span>
                        <span style="font-size:.75rem;color:var(--text-muted)">${catLabels[ex.cat] || ex.cat}</span>
                        ${levelBadge}
                    </div>
                    <div class="ex-body">
                        <p class="ex-question">${ex.q}</p>
                        ${ex.hint ? '<p class="ex-hint"><i class="fa-solid fa-lightbulb"></i> ' + ex.hint + '</p>' : ''}
                        <div class="ex-answer ${revealed ? 'visible' : ''}">
                            <div class="ex-answer-content">${ex.a}</div>
                        </div>
                        <button class="ex-toggle" data-idx="${globalIdx}">${revealed ? '<i class="fa-solid fa-eye-slash"></i> Masquer' : '<i class="fa-solid fa-eye"></i> Voir la correction'}</button>
                    </div>
                </div>`;
        }).join('');

        container.querySelectorAll('.ex-toggle').forEach(btn => {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.dataset.idx);
                if (revealedAnswers.has(idx)) revealedAnswers.delete(idx);
                else { revealedAnswers.add(idx); if (typeof window.RD_Gamification !== 'undefined') window.RD_Gamification.addXP(5); }
                saveState();
                render();
            });
        });
    }

    window.RD_Exercises = { init: initExercises };
})();
