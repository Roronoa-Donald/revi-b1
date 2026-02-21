/* ============================================
   B1 — Error Tracking Engine for Simulateurs
   Tracks weak areas and offers targeted review
   ============================================ */

const ErrorTracker = {
    storageKey: 'b1_default_errors',
    errors: {},

    configure(key) {
        this.storageKey = key + '_errors';
        this.load();
    },

    load() {
        try {
            this.errors = JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch(e) { this.errors = {}; }
    },

    save() {
        try { localStorage.setItem(this.storageKey, JSON.stringify(this.errors)); } catch(e) {}
    },

    /* Hash a question for tracking */
    hash(q) {
        let h = 0;
        const s = q.substring(0, 60);
        for (let i = 0; i < s.length; i++) {
            h = ((h << 5) - h) + s.charCodeAt(i);
            h |= 0;
        }
        return 'q' + Math.abs(h);
    },

    /* Record exam results */
    recordExam(questions, answers) {
        questions.forEach((q, i) => {
            const id = this.hash(q.q);
            if (!this.errors[id]) {
                this.errors[id] = { q: q.q, ch: q.ch || 0, wrong: 0, total: 0, lastSeen: 0 };
            }
            this.errors[id].total++;
            this.errors[id].lastSeen = Date.now();
            if (answers[i] !== q.c) {
                this.errors[id].wrong++;
            }
        });
        this.save();
    },

    /* Get weak chapters sorted by error rate */
    getWeakChapters() {
        const chapters = {};
        Object.values(this.errors).forEach(e => {
            const ch = e.ch || 0;
            if (!chapters[ch]) chapters[ch] = { wrong: 0, total: 0 };
            chapters[ch].wrong += e.wrong;
            chapters[ch].total += e.total;
        });
        return Object.entries(chapters)
            .map(([ch, data]) => ({
                chapter: parseInt(ch),
                errorRate: data.total > 0 ? Math.round((data.wrong / data.total) * 100) : 0,
                wrong: data.wrong,
                total: data.total
            }))
            .filter(c => c.total >= 2)
            .sort((a, b) => b.errorRate - a.errorRate);
    },

    /* Get most missed questions */
    getMostMissed(limit) {
        limit = limit || 5;
        return Object.entries(this.errors)
            .map(([id, e]) => ({ id, ...e, errorRate: e.total > 0 ? e.wrong / e.total : 0 }))
            .filter(e => e.wrong > 0 && e.total >= 2)
            .sort((a, b) => b.errorRate - a.errorRate)
            .slice(0, limit);
    },

    /* Get questions the user struggles with (for targeted review) */
    getWeakQuestionTexts() {
        return Object.values(this.errors)
            .filter(e => e.wrong > 0 && e.total >= 1)
            .map(e => e.q);
    },

    /* Build weak areas bank from master bank */
    buildWeakBank(bank) {
        const weakQs = new Set(this.getWeakQuestionTexts());
        return bank.filter(q => weakQs.has(q.q));
    },

    /* Enhance the simulateur page */
    enhance() {
        if (typeof bank === 'undefined' || !bank.length) return;
        const self = this;

        // 1. Add "Revoir mes erreurs" button to setup
        const setup = document.getElementById('sim-setup');
        if (setup) {
            const weakBank = this.buildWeakBank(bank);
            if (weakBank.length >= 3) {
                const revDiv = document.createElement('div');
                revDiv.style.cssText = 'margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border);';
                revDiv.innerHTML =
                    '<p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:0.8rem"><i class="fas fa-crosshairs" style="color:#ef4444;margin-right:0.4rem"></i>' + weakBank.length + ' questions posant problème</p>' +
                    '<button onclick="startWeakExam()" style="padding:.7rem 1.5rem;border-radius:.5rem;border:1px solid #ef4444;background:rgba(239,68,68,0.1);color:#f87171;cursor:pointer;font-weight:600;font-size:1rem;transition:0.2s" onmouseover="this.style.background=\'#ef4444\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'rgba(239,68,68,0.1)\';this.style.color=\'#f87171\'"><i class="fas fa-bullseye"></i> Revoir mes erreurs</button>';
                setup.appendChild(revDiv);
            }

            // --- Stats summary if user has history ---
            const weakCh = this.getWeakChapters();
            if (weakCh.length > 0) {
                const statsDiv = document.createElement('div');
                statsDiv.style.cssText = 'margin-top:1rem;text-align:left;max-width:400px;margin-left:auto;margin-right:auto;';
                let statsHtml = '<p style="font-size:0.82rem;font-weight:700;color:var(--text-muted);margin-bottom:0.5rem"><i class="fas fa-chart-bar" style="margin-right:0.3rem"></i> Points faibles par chapitre</p>';
                weakCh.slice(0, 5).forEach(ch => {
                    const pct = ch.errorRate;
                    const barColor = pct > 50 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#10b981';
                    statsHtml +=
                        '<div style="margin-bottom:0.5rem">' +
                        '<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.2rem">' +
                        '<span>Ch. ' + ch.chapter + '</span>' +
                        '<span style="color:' + barColor + '">' + pct + '% erreurs</span></div>' +
                        '<div style="height:6px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden">' +
                        '<div style="height:100%;width:' + pct + '%;background:' + barColor + ';border-radius:100px;transition:width 0.5s"></div>' +
                        '</div></div>';
                });
                setup.appendChild(statsDiv);
            }
        }

        // 2. Hook into finishExam to record errors and show analysis
        const origFinish = window.finishExam;
        window.finishExam = function() {
            // Record before showing results
            self.recordExam(questions, answers);
            // Call original
            origFinish.apply(this, arguments);
            // Append weak areas analysis to review
            self.appendAnalysis();
        };

        // 3. Expose startWeakExam globally
        window.startWeakExam = function() {
            const weakBank = self.buildWeakBank(bank);
            if (weakBank.length < 3) {
                alert('Pas assez de questions faibles. Faites plus de tests !');
                return;
            }
            const count = Math.min(weakBank.length, 20);
            const mins = +document.getElementById('sim-time').value;

            questions = shuffle([...weakBank]).slice(0, count);
            answers = new Array(count).fill(-1);
            ci = 0;

            document.getElementById('sim-setup').classList.add('hidden');
            document.getElementById('sim-exam').classList.remove('hidden');

            if (mins > 0) {
                timeLeft = mins * 60;
                timer = setInterval(tick, 1000);
                tick();
            } else {
                document.getElementById('sim-timer').textContent = 'Révision ciblée — Illimité';
            }
            if (document.getElementById('sim-timer') && mins > 0) {
                // leave as is
            } else if (document.getElementById('sim-timer')) {
                document.getElementById('sim-timer').innerHTML = '<i class="fas fa-bullseye" style="color:#ef4444;margin-right:0.5rem"></i>Mode Révision des Erreurs';
            }
            renderQ();
        };
    },

    appendAnalysis() {
        const review = document.getElementById('sim-review');
        if (!review) return;

        const weakCh = this.getWeakChapters();
        const missed = this.getMostMissed(5);

        if (weakCh.length === 0 && missed.length === 0) return;

        let html = '<div style="margin-top:2rem;padding-top:1.5rem;border-top:2px solid var(--border)">';
        html += '<h3 style="color:var(--accent);margin-bottom:1rem"><i class="fas fa-crosshairs" style="margin-right:0.5rem"></i>Analyse des Points Faibles</h3>';

        if (weakCh.length > 0) {
            html += '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem"><strong>Chapitres à réviser en priorité :</strong></p>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:0.6rem;margin-bottom:1.5rem">';
            weakCh.forEach(ch => {
                const pct = ch.errorRate;
                const color = pct > 50 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#10b981';
                html += '<span style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.8rem;border-radius:0.5rem;background:color-mix(in srgb,' + color + ' 12%,var(--card-bg,#111827));border:1px solid ' + color + '33;font-size:0.8rem;font-weight:600">';
                html += '<span style="color:' + color + '">Ch.' + ch.chapter + '</span>';
                html += '<span style="color:var(--text-muted)">' + pct + '% erreurs</span>';
                html += '</span>';
            });
            html += '</div>';
        }

        if (missed.length > 0) {
            html += '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem"><strong>Questions les plus ratées :</strong></p>';
            missed.forEach(m => {
                const pct = Math.round(m.errorRate * 100);
                html += '<div style="padding:0.6rem 1rem;margin-bottom:0.5rem;border-radius:0.5rem;background:rgba(239,68,68,0.06);border-left:3px solid #ef4444;font-size:0.82rem">';
                html += '<span style="color:#f87171;font-weight:600">' + pct + '% raté</span> — ' + m.q;
                html += '</div>';
            });
        }

        html += '</div>';
        review.insertAdjacentHTML('beforeend', html);
    }
};
