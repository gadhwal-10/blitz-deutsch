const UI = {
    playAudio: (text, lang = 'de-DE') => {
        if (!window.speechSynthesis) return;
        const msg = new SpeechSynthesisUtterance();
        msg.text = text;
        msg.lang = lang;
        window.speechSynthesis.speak(msg);
    },
    
    renderBrowserFilters: () => {
        const levelSelect = document.getElementById('browser-level-select');
        levelSelect.innerHTML = '<option value="">All Levels</option>';
        Data.levels.forEach(l => {
            levelSelect.innerHTML += `<option value="${l}">${l}</option>`;
        });
        
        levelSelect.addEventListener('change', (e) => {
            const level = e.target.value;
            const chapterSelect = document.getElementById('browser-chapter-select');
            chapterSelect.innerHTML = '<option value="">All Chapters</option>';
            if (level) {
                chapterSelect.disabled = false;
                const chapters = Data.getChaptersByLevel(level);
                chapters.forEach(c => {
                    chapterSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
                });
            } else {
                chapterSelect.disabled = true;
            }
            UI.renderVocabList();
        });
        
        document.getElementById('browser-chapter-select').addEventListener('change', UI.renderVocabList);
    },
    
    renderVocabList: () => {
        const level = document.getElementById('browser-level-select').value;
        const chapter = document.getElementById('browser-chapter-select').value;
        const listDiv = document.getElementById('browser-list');
        listDiv.innerHTML = '';
        
        if (!level) {
            listDiv.innerHTML = '<p class="text-muted" style="text-align:center; margin-top:24px;">Select a level to view vocabulary.</p>';
            return;
        }
        
        const words = Data.getWords(level, chapter);
        if (words.length === 0) {
            listDiv.innerHTML = '<p class="text-muted" style="text-align:center; margin-top:24px;">No vocabulary found.</p>';
            return;
        }
        
        words.forEach(w => {
            const div = document.createElement('div');
            div.className = 'vocab-item';
            div.innerHTML = `
                <div class="vocab-info">
                    <h3>${w.german}</h3>
                    <p class="text-muted">${w.english}</p>
                </div>
                <div class="vocab-actions">
                    <button class="btn btn-secondary listen-de-btn" aria-label="Listen German">🇩🇪 🔊</button>
                    <button class="btn btn-secondary listen-en-btn" aria-label="Listen English">🇬🇧 🔊</button>
                </div>
            `;
            
            div.querySelector('.listen-de-btn').addEventListener('click', () => UI.playAudio(w.german, 'de-DE'));
            div.querySelector('.listen-en-btn').addEventListener('click', () => UI.playAudio(w.english, 'en-US'));
            listDiv.appendChild(div);
        });
    },

    renderDashboard: () => {
        const stats = Storage.getStats();
        
        const setStat = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.innerText = val;
        }
        
        const avgScore = stats.testsTaken ? Math.round(stats.totalTestScore / stats.testsTaken) + '%' : '0%';
        
        setStat('stat-words', stats.wordsReviewed);
        setStat('stat-tests', stats.testsTaken);
        setStat('stat-score', avgScore);
        setStat('stat-streak', `${stats.streakDays} days`);
        setStat('stat-sprechen', stats.sprechenEvaluated);
    },
    
    renderWOTD: () => {
        let wotd;
        const today = new Date().toDateString();
        const storedWotd = localStorage.getItem('blitz_wotd');
        
        if (storedWotd) {
            const parsed = JSON.parse(storedWotd);
            if (parsed.date === today) {
                wotd = parsed.data;
            }
        }
        
        if (!wotd) {
            wotd = Data.getRandomWord();
            if (wotd) {
                localStorage.setItem('blitz_wotd', JSON.stringify({ date: today, data: wotd }));
            }
        }
        
        if (!wotd) return;
        document.getElementById('wotd-level').innerText = wotd.level;
        document.getElementById('wotd-german').innerText = wotd.word.german;
        document.getElementById('wotd-article').innerText = ""; 
        document.getElementById('wotd-english').innerText = wotd.word.english;
        
        document.getElementById('wotd-listen').onclick = () => UI.playAudio(wotd.word.german, 'de-DE');
    }
};
window.UI = UI;
