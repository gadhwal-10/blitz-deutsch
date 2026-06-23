const Storage = {
    getKey: (key, defaultValue = null) => {
        try {
            const val = localStorage.getItem(`blitz_${key}`);
            return val ? JSON.parse(val) : defaultValue;
        } catch(e) {
            return defaultValue;
        }
    },
    setKey: (key, value) => {
        try {
            localStorage.setItem(`blitz_${key}`, JSON.stringify(value));
        } catch(e) {
            console.error('Storage error', e);
        }
    },
    getStats: () => {
        return Storage.getKey('stats', {
            wordsReviewed: 0,
            testsTaken: 0,
            totalTestScore: 0,
            sprechenEvaluated: 0,
            streakDays: 0,
            lastActiveDate: null
        });
    },
    updateStats: (updates) => {
        const stats = Storage.getStats();
        // Check streak
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastActiveDate !== today) {
            if (stats.lastActiveDate) {
                const lastDate = new Date(stats.lastActiveDate);
                const diff = Math.floor((new Date(today) - lastDate) / (1000 * 60 * 60 * 24));
                if (diff === 1) stats.streakDays += 1;
                else if (diff > 1) stats.streakDays = 1;
            } else {
                stats.streakDays = 1;
            }
            stats.lastActiveDate = today;
        }
        
        // Merge updates (for additive updates, we handle them directly in calling code)
        Object.assign(stats, updates);
        Storage.setKey('stats', stats);
    },
    getSessionState: (feature) => {
        return Storage.getKey(`session_${feature}`, null);
    },
    setSessionState: (feature, state) => {
        Storage.setKey(`session_${feature}`, state);
    },
    clearSessionState: (feature) => {
        localStorage.removeItem(`blitz_session_${feature}`);
    },
    addWordReviewed: (count = 1) => {
        const stats = Storage.getStats();
        stats.wordsReviewed += count;
        Storage.updateStats(stats);
    },
    addTestResult: (score) => {
        const stats = Storage.getStats();
        stats.testsTaken += 1;
        stats.totalTestScore += score;
        Storage.updateStats(stats);
    },
    addSprechenEval: () => {
        const stats = Storage.getStats();
        stats.sprechenEvaluated += 1;
        Storage.updateStats(stats);
    },
    getRecentTestWords: () => {
        return Storage.getKey('recent_test_words', []);
    },
    addRecentTestWords: (words) => {
        let recent = Storage.getRecentTestWords();
        // Add new words
        recent = [...words.map(w => w.german), ...recent];
        // Keep only the last 100
        if (recent.length > 100) recent = recent.slice(0, 100);
        Storage.setKey('recent_test_words', recent);
    }
};
window.Storage = Storage;
