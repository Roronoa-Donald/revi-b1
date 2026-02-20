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
            <div class="exercise-tabs">
                <button class="ex-tab active" data-panel="guided"><i class="fas fa-hand-pointer"></i> Guidés (${data.guided?.length || 0})</button>
                <button class="ex-tab" data-panel="quiz"><i class="fas fa-question-circle"></i> Quiz (${data.quiz?.length || 0})</button>
                <button class="ex-tab" data-panel="dragdrop"><i class="fas fa-arrows-alt"></i> Glisser-Déposer (${data.dragdrop?.length || 0})</button>
            </div>
            <div class="ex-panel active" id="panel-guided"></div>
            <div class="ex-panel" id="panel-quiz"></div>
            <div class="ex-panel" id="panel-dragdrop"></div>
        `;

        renderGuided(data.guided || []);
        renderQuiz(data.quiz || []);
        renderDragDrop(data.dragdrop || []);

        // Tab switching
        container.querySelectorAll('.ex-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.ex-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.ex-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.panel)?.classList.add('active');
            });
        });
    }

    /* ── Guided ── */
    function renderGuided(items) {
        const panel = document.getElementById('panel-guided');
        if (!panel || !items.length) { if (panel) panel.innerHTML = '<p class="text-muted">Aucun exercice guidé.</p>'; return; }
        panel.innerHTML = items.map((ex, i) => `
            <div class="guided-exercise" data-idx="${i}">
                <p class="guided-q"><strong>Q${i+1}.</strong> ${ex.q}</p>
                <div class="guided-hints">
                    ${(ex.hints || []).map((h, hi) => `
                        <button class="hint-btn" data-hint="${hi}">💡 Indice ${hi+1}</button>
                        <span class="hint-text" id="hint-${i}-${hi}">${h}</span>
                    `).join('')}
                </div>
                <div class="guided-answer-zone">
                    <input class="guided-input" id="guided-input-${i}" placeholder="Ta réponse…" autocomplete="off">
                    <button class="guided-check-btn" data-idx="${i}">Vérifier</button>
                </div>
                <div class="guided-feedback" id="guided-fb-${i}"></div>
            </div>
        `).join('');

        // Hints
        panel.querySelectorAll('.hint-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const parentEx = btn.closest('.guided-exercise');
                const i = parentEx.dataset.idx;
                const hi = btn.dataset.hint;
                const el = document.getElementById(`hint-${i}-${hi}`);
                if (el) el.classList.toggle('visible');
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
                return `<div class="quiz-question" data-idx="${i}">
                    <p><strong>Q${i+1}.</strong> ${q.q}</p>
                    <div class="mcq-options">
                        ${q.options.map((opt, oi) => `<button class="mcq-btn" data-qi="${i}" data-oi="${oi}">${opt}</button>`).join('')}
                    </div>
                    <div class="quiz-feedback" id="quiz-fb-${i}"></div>
                </div>`;
            } else {
                return `<div class="quiz-question" data-idx="${i}">
                    <p><strong>Q${i+1}.</strong> ${q.q}</p>
                    <div class="qa-zone">
                        <input class="qa-input" id="qa-input-${i}" placeholder="Réponse…" autocomplete="off">
                        <button class="qa-check-btn" data-idx="${i}">OK</button>
                    </div>
                    <div class="quiz-feedback" id="quiz-fb-${i}"></div>
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
                    if (parseInt(b.dataset.oi) === q.correct) b.classList.add('correct');
                });
                if (!isCorrect) btn.classList.add('incorrect');

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
            return `<div class="dd-exercise" data-di="${di}">
                <p>${dd.instruction}</p>
                <div class="dd-pool" id="dd-pool-${di}">
                    ${shuffled.map((val, vi) => `<div class="dd-item" data-value="${val}" draggable="true">${val}</div>`).join('')}
                </div>
                <div class="dd-targets">
                    ${dd.pairs.map((p, pi) => `
                        <div class="dd-row">
                            <div class="dd-key">${p[0]}</div>
                            <div class="dd-dropzone" data-expected="${p[1]}" data-di="${di}" data-pi="${pi}">Déposer ici</div>
                        </div>
                    `).join('')}
                </div>
                <button class="dd-check-btn" data-di="${di}">Vérifier</button>
                <div class="dd-feedback" id="dd-fb-${di}"></div>
            </div>`;
        }).join('');

        // D&D logic (click-based for mobile + drag for desktop)
        let selected = null;

        panel.addEventListener('click', e => {
            const item = e.target.closest('.dd-item');
            const zone = e.target.closest('.dd-dropzone');

            if (item) {
                panel.querySelectorAll('.dd-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
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
