/* ============================================
   B1 — Spaced Repetition Engine for Flashcards
   Enhances existing cartes.html pages with SM-2
   ============================================ */

const SpacedRepetition = {
    storageKey: 'b1_default_flashcards',
    cardStates: {},
    reviewMode: false,
    reviewQueue: [],
    reviewIndex: 0,

    configure(key) {
        this.storageKey = key + '_flashcards';
        this.load();
    },

    load() {
        try {
            this.cardStates = JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch(e) { this.cardStates = {}; }
    },

    save() {
        try { localStorage.setItem(this.storageKey, JSON.stringify(this.cardStates)); } catch(e) {}
    },

    /* Get or create state for a card (by index) */
    getState(idx) {
        if (!this.cardStates[idx]) {
            this.cardStates[idx] = {
                ef: 2.5,       // easiness factor
                interval: 0,   // days until next review
                reps: 0,       // consecutive correct
                nextReview: 0, // timestamp
                lastRating: null
            };
        }
        return this.cardStates[idx];
    },

    /* SM-2 inspired rating: 0=again, 1=hard, 2=good, 3=easy */
    rate(idx, quality) {
        const s = this.getState(idx);
        const now = Date.now();

        if (quality < 1) {
            // Again: reset
            s.reps = 0;
            s.interval = 0;
            s.nextReview = now; // review again immediately
        } else {
            if (s.reps === 0) {
                s.interval = 1;
            } else if (s.reps === 1) {
                s.interval = quality === 3 ? 4 : (quality === 2 ? 3 : 2);
            } else {
                s.interval = Math.round(s.interval * s.ef);
            }
            // Adjust ease factor
            s.ef = s.ef + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02));
            if (s.ef < 1.3) s.ef = 1.3;
            s.reps++;
            s.nextReview = now + s.interval * 86400000;
        }

        s.lastRating = quality;
        this.save();
    },

    /* How many cards are due for review */
    getDueCount(totalCards) {
        const now = Date.now();
        let due = 0;
        for (let i = 0; i < totalCards; i++) {
            const s = this.cardStates[i];
            if (!s || now >= s.nextReview) due++;
        }
        return due;
    },

    /* Get categories */
    getStats(totalCards) {
        const now = Date.now();
        let newCards = 0, learning = 0, mastered = 0, due = 0;
        for (let i = 0; i < totalCards; i++) {
            const s = this.cardStates[i];
            if (!s || s.reps === 0) {
                newCards++;
                due++;
            } else if (s.interval < 7) {
                learning++;
                if (now >= s.nextReview) due++;
            } else {
                mastered++;
                if (now >= s.nextReview) due++;
            }
        }
        return { newCards, learning, mastered, due };
    },

    /* Build queue of due card indices */
    buildReviewQueue(totalCards) {
        const now = Date.now();
        this.reviewQueue = [];
        for (let i = 0; i < totalCards; i++) {
            const s = this.cardStates[i];
            if (!s || now >= s.nextReview) {
                this.reviewQueue.push(i);
            }
        }
        // Shuffle the queue for variety
        for (let i = this.reviewQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.reviewQueue[i], this.reviewQueue[j]] = [this.reviewQueue[j], this.reviewQueue[i]];
        }
        this.reviewIndex = 0;
        return this.reviewQueue.length;
    },

    /* Get card difficulty color indicator */
    getDifficultyTag(idx) {
        const s = this.cardStates[idx];
        if (!s || s.reps === 0) return { text: 'Nouveau', color: '#64748b', bg: 'rgba(100,116,139,0.15)' };
        if (s.interval < 3) return { text: 'En cours', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
        if (s.interval < 7) return { text: 'Appris', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' };
        return { text: 'Maîtrisé', color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
    },

    /* Inject UI enhancements into existing cartes.html */
    enhance() {
        if (typeof cards === 'undefined' || !cards.length) return;

        const totalCards = cards.length;
        const stats = this.getStats(totalCards);
        const self = this;

        // -- 1. Stats bar above card --
        const statsHtml = document.createElement('div');
        statsHtml.id = 'sr-stats';
        statsHtml.style.cssText = 'display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin:0 auto 1rem;max-width:600px;font-size:0.78rem;';
        statsHtml.innerHTML =
            '<span style="display:flex;align-items:center;gap:0.3rem;color:#64748b"><i class="fas fa-circle" style="font-size:0.5rem;color:#64748b"></i> ' + stats.newCards + ' nouvelles</span>' +
            '<span style="display:flex;align-items:center;gap:0.3rem;color:#f59e0b"><i class="fas fa-circle" style="font-size:0.5rem;color:#f59e0b"></i> ' + stats.learning + ' en cours</span>' +
            '<span style="display:flex;align-items:center;gap:0.3rem;color:#10b981"><i class="fas fa-circle" style="font-size:0.5rem;color:#10b981"></i> ' + stats.mastered + ' maîtrisées</span>' +
            '<span style="display:flex;align-items:center;gap:0.3rem;color:var(--accent)"><i class="fas fa-clock"></i> ' + stats.due + ' à revoir</span>';

        const progressEl = document.getElementById('fc-progress');
        if (progressEl) progressEl.parentNode.insertBefore(statsHtml, progressEl);

        // -- 2. Difficulty tag on card --
        const tagEl = document.createElement('div');
        tagEl.id = 'sr-tag';
        tagEl.style.cssText = 'position:absolute;top:12px;right:12px;font-size:0.65rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:100px;z-index:2;pointer-events:none;';
        const fcFront = document.querySelector('.flashcard-front');
        if (fcFront) {
            fcFront.style.position = 'relative';
            fcFront.appendChild(tagEl);
        }

        // -- 3. Rating buttons (shown after flip) --
        const ratingDiv = document.createElement('div');
        ratingDiv.id = 'sr-rating';
        ratingDiv.style.cssText = 'display:none;justify-content:center;gap:0.6rem;margin:0.8rem auto;max-width:600px;flex-wrap:wrap;';
        ratingDiv.innerHTML =
            '<span style="font-size:0.78rem;color:var(--text-muted);width:100%;text-align:center;margin-bottom:0.3rem">Comment était cette carte ?</span>' +
            '<button class="sr-btn" data-q="0" style="--sr-c:#ef4444"><i class="fas fa-redo"></i> À revoir</button>' +
            '<button class="sr-btn" data-q="1" style="--sr-c:#f59e0b"><i class="fas fa-brain"></i> Difficile</button>' +
            '<button class="sr-btn" data-q="2" style="--sr-c:#06b6d4"><i class="fas fa-check"></i> Bien</button>' +
            '<button class="sr-btn" data-q="3" style="--sr-c:#10b981"><i class="fas fa-bolt"></i> Facile</button>';

        const controls = document.querySelector('.fc-controls');
        if (controls) controls.parentNode.insertBefore(ratingDiv, controls.nextSibling);

        // Style for rating buttons
        const styleEl = document.createElement('style');
        styleEl.textContent =
            '.sr-btn{padding:0.5rem 1rem;border-radius:0.5rem;border:1px solid var(--sr-c,var(--border));background:color-mix(in srgb,var(--sr-c) 12%,var(--card-bg,#111827));color:var(--sr-c);cursor:pointer;font-size:0.85rem;font-weight:600;transition:0.2s;display:flex;align-items:center;gap:0.4rem}' +
            '.sr-btn:hover{background:var(--sr-c);color:#fff}' +
            '#sr-review-toggle{padding:0.5rem 1rem;border-radius:0.5rem;border:1px solid var(--accent);background:transparent;color:var(--accent);cursor:pointer;font-size:0.85rem;font-weight:600;transition:0.2s;display:flex;align-items:center;gap:0.4rem}' +
            '#sr-review-toggle:hover,#sr-review-toggle.active{background:var(--accent);color:#fff}';
        document.head.appendChild(styleEl);

        // -- 4. Review mode toggle --
        const reviewBtn = document.createElement('button');
        reviewBtn.id = 'sr-review-toggle';
        reviewBtn.innerHTML = '<i class="fas fa-clock-rotate-left"></i> Mode Révision (' + stats.due + ')';
        if (controls) {
            controls.appendChild(reviewBtn);
        }

        // -- Wire up rating buttons --
        ratingDiv.querySelectorAll('.sr-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const q = parseInt(this.dataset.q);
                const cardIdx = self.reviewMode ? self.reviewQueue[self.reviewIndex] : ci;
                self.rate(cardIdx, q);
                ratingDiv.style.display = 'none';

                // Auto-advance
                if (self.reviewMode) {
                    self.reviewIndex++;
                    if (self.reviewIndex >= self.reviewQueue.length) {
                        // Review session complete
                        alert('Bravo ! Session de révision terminée ! 🎉');
                        self.exitReviewMode();
                    } else {
                        ci = self.reviewQueue[self.reviewIndex];
                        render();
                        self.updateTag();
                        self.updateProgress();
                    }
                } else {
                    nextCard();
                    self.updateTag();
                }

                // Refresh stats display
                self.refreshStats(totalCards);

                // XP for rating
                if (typeof GameEngine !== 'undefined') {
                    GameEngine.addXP(q >= 2 ? 3 : 1);
                }
            });
        });

        // -- Show ratings after flip --
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            const observer = new MutationObserver(function() {
                if (flashcard.classList.contains('flipped')) {
                    ratingDiv.style.display = 'flex';
                } else {
                    ratingDiv.style.display = 'none';
                }
            });
            observer.observe(flashcard, { attributes: true, attributeFilter: ['class'] });
        }

        // -- Review mode toggle --
        reviewBtn.addEventListener('click', function() {
            if (self.reviewMode) {
                self.exitReviewMode();
            } else {
                const count = self.buildReviewQueue(totalCards);
                if (count === 0) {
                    alert('Aucune carte à revoir ! Revenez plus tard.');
                    return;
                }
                self.reviewMode = true;
                self.reviewIndex = 0;
                ci = self.reviewQueue[0];
                render();
                self.updateTag();
                self.updateProgress();
                reviewBtn.classList.add('active');
                reviewBtn.innerHTML = '<i class="fas fa-times"></i> Quitter Révision (' + count + ')';
            }
        });

        // -- Initial tag update --
        this.updateTag();

        // -- Override render to update tag --
        const origRender = window.render;
        window.render = function() {
            origRender();
            self.updateTag();
            if (self.reviewMode) self.updateProgress();
        };
    },

    updateTag() {
        const tagEl = document.getElementById('sr-tag');
        if (!tagEl) return;
        const idx = this.reviewMode ? this.reviewQueue[this.reviewIndex] : ci;
        const diff = this.getDifficultyTag(idx);
        tagEl.textContent = diff.text;
        tagEl.style.background = diff.bg;
        tagEl.style.color = diff.color;
    },

    updateProgress() {
        const progressEl = document.getElementById('fc-progress');
        if (!progressEl || !this.reviewMode) return;
        progressEl.textContent = 'Révision ' + (this.reviewIndex + 1) + ' / ' + this.reviewQueue.length;
    },

    exitReviewMode() {
        this.reviewMode = false;
        this.reviewIndex = 0;
        ci = 0;
        render();
        const btn = document.getElementById('sr-review-toggle');
        if (btn) {
            btn.classList.remove('active');
            const stats = this.getStats(cards.length);
            btn.innerHTML = '<i class="fas fa-clock-rotate-left"></i> Mode Révision (' + stats.due + ')';
        }
    },

    refreshStats(totalCards) {
        const stats = this.getStats(totalCards);
        const el = document.getElementById('sr-stats');
        if (el) {
            el.innerHTML =
                '<span style="display:flex;align-items:center;gap:0.3rem;color:#64748b"><i class="fas fa-circle" style="font-size:0.5rem;color:#64748b"></i> ' + stats.newCards + ' nouvelles</span>' +
                '<span style="display:flex;align-items:center;gap:0.3rem;color:#f59e0b"><i class="fas fa-circle" style="font-size:0.5rem;color:#f59e0b"></i> ' + stats.learning + ' en cours</span>' +
                '<span style="display:flex;align-items:center;gap:0.3rem;color:#10b981"><i class="fas fa-circle" style="font-size:0.5rem;color:#10b981"></i> ' + stats.mastered + ' maîtrisées</span>' +
                '<span style="display:flex;align-items:center;gap:0.3rem;color:var(--accent)"><i class="fas fa-clock"></i> ' + stats.due + ' à revoir</span>';
        }
        // Update review toggle count
        const btn = document.getElementById('sr-review-toggle');
        if (btn && !this.reviewMode) {
            btn.innerHTML = '<i class="fas fa-clock-rotate-left"></i> Mode Révision (' + stats.due + ')';
        }
    }
};
