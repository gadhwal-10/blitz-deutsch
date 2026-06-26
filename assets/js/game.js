const Game = {
    words: [],
    currentIndex: 0,
    score: 0,
    cleanGerman: "",
    cleanEnglish: "",
    currentScrambled: [],
    currentPlaced: [],
    isLocked: false,

    init: () => {
        Game.renderSelectors();

        const startBtn = document.getElementById('game-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', Game.startSession);
        }

        const undoBtn = document.getElementById('game-undo-btn');
        if (undoBtn) undoBtn.addEventListener('click', Game.handleUndo);

        const hintBtn = document.getElementById('game-hint-btn');
        if (hintBtn) hintBtn.addEventListener('click', Game.revealHint);

        const skipBtn = document.getElementById('game-skip-btn');
        if (skipBtn) skipBtn.addEventListener('click', Game.skipWord);

        const playAgainBtn = document.getElementById('game-play-again-btn');
        if (playAgainBtn) playAgainBtn.addEventListener('click', () => {
            document.getElementById('game-result-area').classList.add('hidden');
            document.getElementById('game-setup-area').classList.remove('hidden');
        });

        // Check session recovery
        const saved = Storage.getSessionState('game');
        if (saved && saved.words && saved.words.length > 0 && saved.currentIndex < saved.words.length) {
            Game.words = saved.words;
            Game.currentIndex = saved.currentIndex;
            Game.score = saved.score || 0;
            document.getElementById('game-setup-area').classList.add('hidden');
            document.getElementById('game-play-area').classList.remove('hidden');
            Game.nextWord();
        }
    },

    renderSelectors: () => {
        const levelSelect = document.getElementById('game-level-select');
        const chapterSelect = document.getElementById('game-chapter-select');
        if (!levelSelect || !chapterSelect || !window.Data || !Data.vocab) return;

        levelSelect.innerHTML = '<option value="ALL">Full A1-C1 Curriculum</option>';
        Data.vocab.forEach(lvl => {
            const opt = document.createElement('option');
            opt.value = lvl.level;
            opt.innerText = `Level ${lvl.level}`;
            levelSelect.appendChild(opt);
        });

        levelSelect.addEventListener('change', () => {
            const selLvl = levelSelect.value;
            chapterSelect.innerHTML = '<option value="ALL">All Chapters</option>';
            if (selLvl === 'ALL') {
                chapterSelect.disabled = true;
                return;
            }
            chapterSelect.disabled = false;
            const lvlObj = Data.vocab.find(l => l.level === selLvl);
            if (lvlObj && lvlObj.chapters) {
                lvlObj.chapters.forEach((c, idx) => {
                    const opt = document.createElement('option');
                    opt.value = c.name;
                    opt.innerText = `${idx + 1}. ${c.name}`;
                    chapterSelect.appendChild(opt);
                });
            }
        });
    },

    cleanWordText: (str) => {
        return str.replace(/\([^)]*\)/g, '').trim();
    },

    startSession: () => {
        const levelSelect = document.getElementById('game-level-select');
        const chapterSelect = document.getElementById('game-chapter-select');
        if (!levelSelect || !chapterSelect || !window.Data) return;

        const selLvl = levelSelect.value;
        const selChap = chapterSelect.value;

        let pool = [];
        Data.vocab.forEach(lvl => {
            if (selLvl !== 'ALL' && lvl.level !== selLvl) return;
            lvl.chapters.forEach(chap => {
                if (selLvl !== 'ALL' && selChap !== 'ALL' && chap.name !== selChap) return;
                chap.vocab.forEach(w => {
                    // Pick single words without hyphens/spaces <= 12 chars for best jumble UX
                    const cleanDe = Game.cleanWordText(w.german).replace(/^(der|die|das)\s+/i, '');
                    if (!/\s/.test(cleanDe) && cleanDe.length >= 3 && cleanDe.length <= 13) {
                        pool.push(w);
                    }
                });
            });
        });

        if (pool.length === 0) {
            alert("No suitable single vocabulary words found for this selection.");
            return;
        }

        // Shuffle and pick 10
        pool = pool.sort(() => 0.5 - Math.random());
        Game.words = pool.slice(0, 10);
        Game.currentIndex = 0;
        Game.score = 0;

        Storage.setSessionState('game', {
            words: Game.words,
            currentIndex: Game.currentIndex,
            score: Game.score
        });

        document.getElementById('game-setup-area').classList.add('hidden');
        document.getElementById('game-result-area').classList.add('hidden');
        document.getElementById('game-play-area').classList.remove('hidden');

        Game.nextWord();
    },

    nextWord: () => {
        if (Game.currentIndex >= Game.words.length) {
            Game.endGame();
            return;
        }

        Game.isLocked = false;
        const w = Game.words[Game.currentIndex];

        // Clean German (strip article & comments)
        let rawDe = Game.cleanWordText(w.german);
        let articlePrefix = "";
        const artMatch = rawDe.match(/^(der|die|das)\s+(.*)/i);
        if (artMatch) {
            articlePrefix = artMatch[1].toLowerCase();
            rawDe = artMatch[2];
        }

        Game.cleanGerman = rawDe.toUpperCase();
        Game.cleanEnglish = Game.cleanWordText(w.english);

        // Scramble letters
        const letters = Game.cleanGerman.split('');
        let shuffled = [...letters].sort(() => 0.5 - Math.random());
        // Ensure it's actually scrambled if length > 3
        if (letters.length > 3 && shuffled.join('') === Game.cleanGerman) {
            shuffled.reverse();
        }

        Game.currentScrambled = shuffled.map((char, idx) => ({
            id: idx,
            char: char,
            placed: false
        }));

        Game.currentPlaced = new Array(Game.cleanGerman.length).fill(null);

        // Render UI
        document.getElementById('game-progress-text').innerText = `Word ${Game.currentIndex + 1} of ${Game.words.length}`;
        document.getElementById('game-score-text').innerText = `${Game.score} pts`;
        
        const articleBadgeEl = document.getElementById('game-article-badge');
        if (articlePrefix) {
            articleBadgeEl.style.display = 'inline-block';
            let bg = '#3b82f6';
            if (articlePrefix === 'die') bg = '#ec4899';
            if (articlePrefix === 'das') bg = '#10b981';
            articleBadgeEl.style.background = bg;
            articleBadgeEl.innerText = articlePrefix;
        } else {
            articleBadgeEl.style.display = 'none';
        }

        document.getElementById('game-clue-text').innerText = Game.cleanEnglish;
        document.getElementById('game-feedback-msg').innerText = '';
        document.getElementById('game-feedback-msg').className = 'game-msg mt-3';

        Game.renderTilesAndSlots();
    },

    renderTilesAndSlots: () => {
        const slotsContainer = document.getElementById('game-answer-slots');
        const tilesContainer = document.getElementById('game-letter-tiles');
        if (!slotsContainer || !tilesContainer) return;

        slotsContainer.innerHTML = '';
        tilesContainer.innerHTML = '';

        // Render slots
        Game.currentPlaced.forEach((tile, idx) => {
            const slot = document.createElement('div');
            slot.className = 'answer-slot' + (tile ? ' filled' : '');
            slot.innerText = tile ? tile.char : '';
            if (tile) {
                slot.addEventListener('click', () => {
                    if (Game.isLocked) return;
                    tile.placed = false;
                    Game.currentPlaced[idx] = null;
                    Game.renderTilesAndSlots();
                });
            }
            slotsContainer.appendChild(slot);
        });

        // Render available tile pool
        Game.currentScrambled.forEach(tile => {
            const btn = document.createElement('button');
            btn.className = 'game-tile btn' + (tile.placed ? ' placed hidden-tile' : '');
            btn.innerText = tile.char;
            btn.disabled = tile.placed || Game.isLocked;
            btn.addEventListener('click', () => Game.handleLetterClick(tile.id));
            tilesContainer.appendChild(btn);
        });

        Game.checkCompletion();
    },

    handleLetterClick: (tileId) => {
        if (Game.isLocked) return;
        const tile = Game.currentScrambled.find(t => t.id === tileId);
        if (!tile || tile.placed) return;

        const emptyIdx = Game.currentPlaced.findIndex(s => s === null);
        if (emptyIdx === -1) return;

        tile.placed = true;
        Game.currentPlaced[emptyIdx] = tile;
        Game.renderTilesAndSlots();
    },

    handleUndo: () => {
        if (Game.isLocked) return;
        // Find last placed tile
        for (let i = Game.currentPlaced.length - 1; i >= 0; i--) {
            const tile = Game.currentPlaced[i];
            if (tile !== null) {
                tile.placed = false;
                Game.currentPlaced[i] = null;
                Game.renderTilesAndSlots();
                break;
            }
        }
    },

    revealHint: () => {
        if (Game.isLocked) return;
        // Find first slot that doesn't match cleanGerman
        for (let i = 0; i < Game.cleanGerman.length; i++) {
            const targetChar = Game.cleanGerman[i];
            const currentSlotTile = Game.currentPlaced[i];

            if (!currentSlotTile || currentSlotTile.char !== targetChar) {
                // Return whatever is currently in this slot if any
                if (currentSlotTile) currentSlotTile.placed = false;

                // Find an unplaced tile matching targetChar (or steal from another wrong slot)
                let matchingTile = Game.currentScrambled.find(t => !t.placed && t.char === targetChar);
                if (!matchingTile) {
                    // Find it in another slot j > i
                    for (let j = i + 1; j < Game.currentPlaced.length; j++) {
                        if (Game.currentPlaced[j] && Game.currentPlaced[j].char === targetChar) {
                            matchingTile = Game.currentPlaced[j];
                            Game.currentPlaced[j] = null;
                            break;
                        }
                    }
                }

                if (matchingTile) {
                    matchingTile.placed = true;
                    Game.currentPlaced[i] = matchingTile;
                    Game.score = Math.max(0, Game.score - 2); // 2 pt penalty
                    document.getElementById('game-score-text').innerText = `${Game.score} pts`;
                    Game.renderTilesAndSlots();
                }
                break;
            }
        }
    },

    skipWord: () => {
        if (Game.isLocked) return;
        Game.currentIndex++;
        Storage.setSessionState('game', {
            words: Game.words,
            currentIndex: Game.currentIndex,
            score: Game.score
        });
        Game.nextWord();
    },

    checkCompletion: () => {
        const isFull = Game.currentPlaced.every(s => s !== null);
        if (!isFull) return;

        const guess = Game.currentPlaced.map(t => t.char).join('');
        const feedbackEl = document.getElementById('game-feedback-msg');

        if (guess === Game.cleanGerman) {
            Game.isLocked = true;
            Game.score += 10;
            document.getElementById('game-score-text').innerText = `${Game.score} pts`;
            
            feedbackEl.innerText = '🎉 Richtig! Wunderbar!';
            feedbackEl.className = 'game-msg success-text mt-3';

            const w = Game.words[Game.currentIndex];
            if (window.UI) UI.playAudio(w.german, 'de-DE');

            Storage.setSessionState('game', {
                words: Game.words,
                currentIndex: Game.currentIndex + 1,
                score: Game.score
            });

            setTimeout(() => {
                Game.currentIndex++;
                Game.nextWord();
            }, 1200);
        } else {
            feedbackEl.innerText = '❌ Nicht ganz richtig! Try rearranging.';
            feedbackEl.className = 'game-msg error-text mt-3 shake-anim';
        }
    },

    endGame: () => {
        document.getElementById('game-play-area').classList.add('hidden');
        document.getElementById('game-result-area').classList.remove('hidden');

        document.getElementById('game-final-score').innerText = `${Game.score}`;
        document.getElementById('game-total-possible').innerText = `${Game.words.length * 10}`;

        Storage.addWordReviewed(Game.words.length);
        Storage.recordActivity();
        Storage.clearSessionState('game');
    }
};

window.Game = Game;
