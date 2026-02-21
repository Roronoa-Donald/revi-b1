/* ============================================
   B1 COURS INTERACTIFS — Chapter Exercises Engine (shared)
   Renders Guided · Quiz · Drag-and-Drop from JSON data
   Usage: ChapterExercises.init(exerciseData.chapitreX)
   ============================================ */

const ChapterExercises = (() => {
    'use strict';

    let data = null;

    function init(chData) {
        if (!chData) return;
        data = chData;
        const container = document.getElementById('chapter-exercises');
        if (!container) return;

        container.innerHTML = `
            <div class="exercise-tabs" role="tablist" aria-label="Types d'exercices">
                <button class="ex-tab active" data-panel="guided" role="tab" aria-selected="true" aria-controls="panel-guided" id="tab-guided"><i class="fas fa-hand-pointer"></i> Guidés (${data.guided?.length || 0})</button>
                <button class="ex-tab" data-panel="quiz" role="tab" aria-selected="false" aria-controls="panel-quiz" id="tab-quiz"><i class="fas fa-question-circle"></i> Quiz (${data.quiz?.length || 0})</button>
                <button class="ex-tab" data-panel="dragdrop" role="tab" aria-selected="false" aria-controls="panel-dragdrop" id="tab-dragdrop"><i class="fas fa-arrows-alt"></i> Glisser-Déposer (${data.dragdrop?.length || 0})</button>
            </div>
            <div class="ex-panel active" id="panel-guided" role="tabpanel" aria-labelledby="tab-guided"></div>
            <div class="ex-panel" id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz"></div>
            <div class="ex-panel" id="panel-dragdrop" role="tabpanel" aria-labelledby="tab-dragdrop"></div>
        `;

        renderGuided(data.guided || []);
        renderQuiz(data.quiz || []);
        renderDragDrop(data.dragdrop || []);

        // Tab switching
        container.querySelectorAll('.ex-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.ex-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); t.setAttribute('tabindex', '-1'); });
                container.querySelectorAll('.ex-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                tab.setAttribute('tabindex', '0');
                document.getElementById('panel-' + tab.dataset.panel)?.classList.add('active');
            });
            // Keyboard navigation for tabs
            tab.addEventListener('keydown', e => {
                const tabs = Array.from(container.querySelectorAll('.ex-tab'));
                const idx = tabs.indexOf(tab);
                let next = -1;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = (idx + 1) % tabs.length; }
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = (idx - 1 + tabs.length) % tabs.length; }
                if (next >= 0) { e.preventDefault(); tabs[next].click(); tabs[next].focus(); }
            });
        });
    }

    /* ── Guided ── */
    function renderGuided(items) {
        const panel = document.getElementById('panel-guided');
        if (!panel || !items.length) { if (panel) panel.innerHTML = '<p class="text-muted">Aucun exercice guidé.</p>'; return; }
        panel.innerHTML = items.map((ex, i) => `
            <div class="guided-exercise" data-idx="${i}" role="group" aria-label="Exercice guidé ${i+1}">
                <p class="guided-q" id="guided-label-${i}"><strong>Q${i+1}.</strong> ${ex.q}</p>
                <div class="guided-hints">
                    ${(ex.hints || []).map((h, hi) => `
                        <button class="hint-btn" data-hint="${hi}" aria-expanded="false" aria-controls="hint-${i}-${hi}">💡 Indice ${hi+1}</button>
                        <span class="hint-text" id="hint-${i}-${hi}" role="note">${h}</span>
                    `).join('')}
                </div>
                <div class="guided-answer-zone">
                    <input class="guided-input" id="guided-input-${i}" placeholder="Ta réponse…" autocomplete="off" aria-labelledby="guided-label-${i}" aria-describedby="guided-fb-${i}">
                    <button class="guided-check-btn" data-idx="${i}" aria-label="Vérifier la réponse ${i+1}">Vérifier</button>
                </div>
                <div class="guided-feedback" id="guided-fb-${i}" aria-live="polite" role="status"></div>
            </div>
        `).join('');

        // Hints
        panel.querySelectorAll('.hint-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const parentEx = btn.closest('.guided-exercise');
                const i = parentEx.dataset.idx;
                const hi = btn.dataset.hint;
                const el = document.getElementById(`hint-${i}-${hi}`);
                if (el) {
                    el.classList.toggle('visible');
                    btn.setAttribute('aria-expanded', el.classList.contains('visible'));
                }
            });
        });

        // Check answers
        panel.querySelectorAll('.guided-check-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.idx);
                const input = document.getElementById(`guided-input-${i}`);
                const fb = document.getElementById(`guided-fb-${i}`);
                if (!input || !fb) return;
                const answer = input.value.trim().toLowerCase();
                const correct = items[i].answer.toLowerCase();
                const isCorrect = answer === correct || correct.split('|').some(a => answer === a.trim().toLowerCase());
                fb.className = 'guided-feedback ' + (isCorrect ? 'correct' : 'incorrect');
                fb.innerHTML = isCorrect
                    ? '<i class="fas fa-check-circle"></i> Correct ! Bravo !'
                    : `<i class="fas fa-times-circle"></i> Pas tout à fait… La réponse est : <strong>${items[i].answer}</strong>`;
                if (typeof GameEngine !== 'undefined') GameEngine.completeExercise(isCorrect);
            });
        });

        // Enter key submit
        panel.querySelectorAll('.guided-input').forEach(input => {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const btn = input.closest('.guided-answer-zone')?.querySelector('.guided-check-btn');
                    if (btn) btn.click();
                }
            });
        });
    }

    /* ── Quiz ── */
    function renderQuiz(items) {
        const panel = document.getElementById('panel-quiz');
        if (!panel || !items.length) { if (panel) panel.innerHTML = '<p class="text-muted">Aucun quiz.</p>'; return; }
        panel.innerHTML = items.map((q, i) => {
            if (q.type === 'mcq') {
                return `<div class="quiz-question" data-idx="${i}" role="group" aria-label="Question ${i+1}">
                    <p id="quiz-label-${i}"><strong>Q${i+1}.</strong> ${q.q}</p>
                    <div class="mcq-options" role="radiogroup" aria-labelledby="quiz-label-${i}">
                        ${q.options.map((opt, oi) => `<button class="mcq-btn" data-qi="${i}" data-oi="${oi}" role="radio" aria-checked="false" aria-label="${opt}">${opt}</button>`).join('')}
                    </div>
                    <div class="quiz-feedback" id="quiz-fb-${i}" aria-live="polite" role="status"></div>
                </div>`;
            } else {
                return `<div class="quiz-question" data-idx="${i}" role="group" aria-label="Question ${i+1}">
                    <p id="quiz-label-${i}"><strong>Q${i+1}.</strong> ${q.q}</p>
                    <div class="qa-zone">
                        <input class="qa-input" id="qa-input-${i}" placeholder="Réponse…" autocomplete="off" aria-labelledby="quiz-label-${i}" aria-describedby="quiz-fb-${i}">
                        <button class="qa-check-btn" data-idx="${i}" aria-label="Vérifier la réponse ${i+1}">OK</button>
                    </div>
                    <div class="quiz-feedback" id="quiz-fb-${i}" aria-live="polite" role="status"></div>
                </div>`;
            }
        }).join('');

        // MCQ
        panel.querySelectorAll('.mcq-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const qi = parseInt(btn.dataset.qi);
                const oi = parseInt(btn.dataset.oi);
                const q = items[qi];
                const fb = document.getElementById(`quiz-fb-${qi}`);
                const parent = btn.closest('.quiz-question');
                const isCorrect = oi === q.correct;

                parent.querySelectorAll('.mcq-btn').forEach(b => {
                    b.disabled = true;
                    b.setAttribute('aria-disabled', 'true');
                    if (parseInt(b.dataset.oi) === q.correct) { b.classList.add('correct'); b.setAttribute('aria-checked', 'true'); }
                });
                if (!isCorrect) { btn.classList.add('incorrect'); }
                btn.setAttribute('aria-checked', 'true');

                fb.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
                fb.innerHTML = isCorrect
                    ? '<i class="fas fa-check-circle"></i> Bonne réponse !'
                    : '<i class="fas fa-times-circle"></i> Mauvaise réponse.';
                if (typeof GameEngine !== 'undefined') GameEngine.completeExercise(isCorrect);
            });
        });

        // QA
        panel.querySelectorAll('.qa-check-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.idx);
                const input = document.getElementById(`qa-input-${i}`);
                const fb = document.getElementById(`quiz-fb-${i}`);
                if (!input || !fb) return;
                const q = items[i];
                const val = input.value.trim().toLowerCase();
                const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
                const isCorrect = answers.some(a => val === a.toLowerCase());
                fb.className = 'quiz-feedback ' + (isCorrect ? 'correct' : 'incorrect');
                fb.innerHTML = isCorrect
                    ? '<i class="fas fa-check-circle"></i> Bonne réponse !'
                    : `<i class="fas fa-times-circle"></i> Réponse attendue : <strong>${answers[0]}</strong>`;
                if (typeof GameEngine !== 'undefined') GameEngine.completeExercise(isCorrect);
            });
        });

        // Enter key
        panel.querySelectorAll('.qa-input').forEach(input => {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    const btn = input.closest('.qa-zone')?.querySelector('.qa-check-btn');
                    if (btn) btn.click();
                }
            });
        });
    }

    /* ── Drag & Drop ── */
    function renderDragDrop(items) {
        const panel = document.getElementById('panel-dragdrop');
        if (!panel || !items.length) { if (panel) panel.innerHTML = '<p class="text-muted">Aucun exercice glisser-déposer.</p>'; return; }

        panel.innerHTML = items.map((dd, di) => {
            const shuffled = [...dd.pairs.map(p => p[1])].sort(() => Math.random() - 0.5);
            return `<div class="dd-exercise" data-di="${di}" role="group" aria-label="Exercice glisser-déposer ${di+1}">
                <p>${dd.instruction}</p>
                <div class="dd-pool" id="dd-pool-${di}" aria-label="Éléments à placer">
                    ${shuffled.map((val, vi) => `<div class="dd-item" data-value="${val}" draggable="true" role="option" aria-grabbed="false" tabindex="0">${val}</div>`).join('')}
                </div>
                <div class="dd-targets" aria-label="Zones de dépôt">
                    ${dd.pairs.map((p, pi) => `
                        <div class="dd-row">
                            <div class="dd-key" id="dd-key-${di}-${pi}">${p[0]}</div>
                            <div class="dd-dropzone" data-expected="${p[1]}" data-di="${di}" data-pi="${pi}" aria-labelledby="dd-key-${di}-${pi}" aria-dropeffect="move">Déposer ici</div>
                        </div>
                    `).join('')}
                </div>
                <button class="dd-check-btn" data-di="${di}" aria-label="Vérifier glisser-déposer ${di+1}">Vérifier</button>
                <div class="dd-feedback" id="dd-fb-${di}" aria-live="polite" role="status"></div>
            </div>`;
        }).join('');

        // D&D logic (click-based for mobile + drag for desktop)
        let selected = null;

        panel.addEventListener('click', e => {
            const item = e.target.closest('.dd-item');
            const zone = e.target.closest('.dd-dropzone');

            if (item) {
                panel.querySelectorAll('.dd-item').forEach(i => { i.classList.remove('selected'); i.setAttribute('aria-grabbed', 'false'); });
                item.classList.add('selected');
                item.setAttribute('aria-grabbed', 'true');
                selected = item;
                return;
            }
            if (zone && selected) {
                // If zone already has an item, move it back to pool
                if (zone.querySelector('.dd-item')) {
                    const existing = zone.querySelector('.dd-item');
                    const pool = document.getElementById(`dd-pool-${zone.dataset.di}`);
                    if (pool) pool.appendChild(existing);
                }
                zone.textContent = '';
                zone.appendChild(selected);
                selected.classList.remove('selected');
                selected = null;
            }
        });

        // Native drag & drop
        panel.querySelectorAll('.dd-item').forEach(item => {
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', '');
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
        });

        panel.querySelectorAll('.dd-dropzone').forEach(zone => {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const dragging = panel.querySelector('.dd-item.dragging');
                if (!dragging) return;
                if (zone.querySelector('.dd-item')) {
                    const pool = document.getElementById(`dd-pool-${zone.dataset.di}`);
                    if (pool) pool.appendChild(zone.querySelector('.dd-item'));
                }
                zone.textContent = '';
                zone.appendChild(dragging);
            });
        });

        // Check
        panel.querySelectorAll('.dd-check-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const di = parseInt(btn.dataset.di);
                const exercise = panel.querySelector(`.dd-exercise[data-di="${di}"]`);
                const zones = exercise.querySelectorAll('.dd-dropzone');
                let correct = 0;
                zones.forEach(zone => {
                    const item = zone.querySelector('.dd-item');
                    const expected = zone.dataset.expected;
                    if (item && item.dataset.value === expected) {
                        zone.classList.add('dd-correct');
                        zone.classList.remove('dd-incorrect');
                        correct++;
                    } else {
                        zone.classList.add('dd-incorrect');
                        zone.classList.remove('dd-correct');
                    }
                });
                const fb = document.getElementById(`dd-fb-${di}`);
                const total = zones.length;
                const allCorrect = correct === total;
                if (fb) {
                    fb.className = 'dd-feedback ' + (allCorrect ? 'correct' : 'incorrect');
                    fb.innerHTML = allCorrect
                        ? '<i class="fas fa-check-circle"></i> Parfait ! Tout est correct !'
                        : `<i class="fas fa-times-circle"></i> ${correct}/${total} correct${correct > 1 ? 's' : ''}. Réessaie !`;
                }
                if (typeof GameEngine !== 'undefined') GameEngine.completeExercise(allCorrect);
            });
        });
    }

    return { init };
})();
