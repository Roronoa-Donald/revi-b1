/* ============================================
   B1 COURS INTERACTIFS — Gamification Engine (shared)
   Configure per-course via GameEngine.configure({...})
   ============================================ */

const GameEngine = {
    storageKey: 'b1_default_progress',
    badges: [],
    levels: [
        { min: 0,   title: 'Débutant' },
        { min: 30,  title: 'Apprenti' },
        { min: 80,  title: 'Initié' },
        { min: 150, title: 'Confirmé' },
        { min: 250, title: 'Avancé' },
        { min: 400, title: 'Expert' },
        { min: 600, title: 'Maître' }
    ],
    tips: [],
    data: null,

    /**
     * Configure the engine for a specific course.
     * @param {Object} config
     * @param {string} config.storageKey - e.g. 'b1_algo_progress'
     * @param {Array}  config.badges     - [{id, name, icon, desc, xp}, ...]
     * @param {Array}  config.levels     - [{min, title}, ...]   (optional)
     * @param {Array}  config.tips       - [string, ...]
     */
    configure(config) {
        if (config.storageKey) this.storageKey = config.storageKey;
        if (config.badges) this.badges = config.badges;
        if (config.levels) this.levels = config.levels;
        if (config.tips) this.tips = config.tips;
    },

    load() {
        try {
            this.data = JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch(e) { this.data = {}; }
        if (!this.data.xp) this.data.xp = 0;
        if (!this.data.badges) this.data.badges = [];
        if (!this.data.streak) this.data.streak = { last: null, count: 0 };
        if (!this.data.stats) this.data.stats = { exercises: 0, quizCorrect: 0, perfect: 0, chaptersCompleted: [] };
    },

    save() {
        try { localStorage.setItem(this.storageKey, JSON.stringify(this.data)); } catch(e) {}
    },

    addXP(amount) {
        this.load();
        this.data.xp += amount;
        this.save();
        this.updateBar();
        this.checkMilestones();
    },

    getLevel() {
        this.load();
        let lvl = this.levels[0];
        for (const l of this.levels) {
            if (this.data.xp >= l.min) lvl = l;
        }
        return lvl;
    },

    getNextLevel() {
        this.load();
        for (const l of this.levels) {
            if (this.data.xp < l.min) return l;
        }
        return null;
    },

    updateBar() {
        const level = this.getLevel();
        const next  = this.getNextLevel();
        const levelEl = document.querySelector('.xp-level');
        const fillEl  = document.querySelector('.xp-bar-fill');
        const textEl  = document.querySelector('.xp-text');
        if (levelEl) levelEl.textContent = level.title;
        if (next && fillEl) {
            const pct = ((this.data.xp - level.min) / (next.min - level.min)) * 100;
            fillEl.style.width = Math.min(pct, 100) + '%';
        } else if (fillEl) {
            fillEl.style.width = '100%';
        }
        if (textEl) textEl.textContent = this.data.xp + ' XP';
    },

    unlockBadge(badgeId) {
        this.load();
        if (this.data.badges.includes(badgeId)) return;
        const badge = this.badges.find(b => b.id === badgeId);
        if (!badge) return;
        this.data.badges.push(badgeId);
        this.data.xp += badge.xp;
        this.save();
        this.updateBar();
        this.showToast(badge);
    },

    showToast(badge) {
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;bottom:4rem;right:1rem;background:var(--bg-primary);border:2px solid var(--accent);border-radius:14px;padding:1rem 1.5rem;z-index:9999;display:flex;align-items:center;gap:.8rem;box-shadow:0 8px 30px var(--accent-glow);animation:fadeUp .4s ease;font-size:.9rem;max-width:340px;';
        t.innerHTML = `<span style="font-size:1.8rem">${badge.icon}</span><div><strong style="color:var(--accent)">${badge.name}</strong><br><small style="color:var(--text-muted)">${badge.desc} — +${badge.xp} XP</small></div>`;
        document.body.appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transition = 'opacity .4s';
            setTimeout(() => t.remove(), 400);
        }, 3000);
    },

    completeExercise(correct) {
        this.load();
        this.data.stats.exercises++;
        if (correct) this.data.stats.quizCorrect++;
        this.addXP(correct ? 5 : 1);
        // Generic milestones
        if (this.data.stats.exercises === 1) this.unlockBadge('first_step');
        if (this.data.stats.exercises >= 10) this.unlockBadge('explorer');
        if (this.data.stats.quizCorrect >= 50) this.unlockBadge('quiz_king');
        this.updateStreak();
        this.save();
    },

    completeChapter(num) {
        this.load();
        if (!this.data.stats.chaptersCompleted.includes(num)) {
            this.data.stats.chaptersCompleted.push(num);
            this.addXP(20);
            // Look for a chapter-specific badge
            const chBadge = this.badges.find(b => b.id === `ch${num}`);
            if (chBadge) this.unlockBadge(`ch${num}`);
            // Half-way & legend auto-detection
            const totalCh = this.badges.filter(b => b.id.startsWith('ch')).length || 8;
            if (this.data.stats.chaptersCompleted.length >= Math.ceil(totalCh / 2)) {
                this.unlockBadge('half_way');
            }
            if (this.data.stats.chaptersCompleted.length >= totalCh) {
                this.unlockBadge('legend');
            }
        }
        this.save();
    },

    updateStreak() {
        const today = new Date().toDateString();
        if (this.data.streak.last === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (this.data.streak.last === yesterday) {
            this.data.streak.count++;
        } else {
            this.data.streak.count = 1;
        }
        this.data.streak.last = today;
        if (this.data.streak.count >= 3) this.unlockBadge('streak_3');
        if (this.data.streak.count >= 7) this.unlockBadge('streak_7');
    },

    checkMilestones() {
        if (this.data.stats.perfect >= 10) this.unlockBadge('perfectionist');
    },

    showTip() {
        if (!this.tips.length) return '';
        return this.tips[Math.floor(Math.random() * this.tips.length)];
    },

    init() {
        this.load();
        this.updateBar();
    }
};

document.addEventListener('DOMContentLoaded', () => GameEngine.init());
